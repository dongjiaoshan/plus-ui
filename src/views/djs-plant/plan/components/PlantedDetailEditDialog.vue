<template>
  <el-dialog v-model="visible" :title="t('plantPlan.adjust.title')" width="520px" append-to-body destroy-on-close @open="onOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <!-- 第一行：种植状态（默认已种植，可改待种植；改待种植时后两行整体隐藏） -->
      <el-form-item :label="t('plantPlan.adjust.field.plantState')" prop="plantState">
        <el-radio-group v-model="form.plantState">
          <el-radio value="planted">{{ t('plantPlan.adjust.state.planted') }}</el-radio>
          <el-radio value="pending">{{ t('plantPlan.adjust.state.pending') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="form.plantState === 'planted'">
        <!-- 第二行：种植日期 -->
        <el-form-item :label="t('plantPlan.adjust.field.plantDate')" prop="beginActualdate">
          <el-date-picker
            v-model="form.beginActualdate"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="t('plantPlan.adjust.placeholder.plantDate')"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 第三行：种植班组（多选） -->
        <el-form-item :label="t('plantPlan.adjust.field.plantBy')" prop="plantByIds">
          <el-select
            v-model="form.plantByIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            filterable
            :placeholder="t('plantPlan.placeholder.team')"
            style="width: 100%"
          >
            <el-option v-for="tm in teamOptions" :key="tm.id" :label="tm.teamName" :value="tm.id" />
          </el-select>
        </el-form-item>
      </template>

      <el-alert v-else type="warning" :closable="false" show-icon class="mb-0">
        {{ t('plantPlan.adjust.pendingTip') }}
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="PlantedDetailEditDialog" lang="ts">
/**
 * 已种植地块后台调整弹框（V6-R36）。
 *
 * 三行按甲方给定顺序：种植状态 → 种植日期 → 种植班组（多选）。
 * 选「待种植」时第二三行整体隐藏，保存后由后端把该地块回退成待种植、清计划采摘日期、
 * 清种植记录（种植日期 + 班组），并记 change_type=后台调整。
 *
 * 「哪个分支」由后端按实际差异判定（改日期 / 仅改班组 / 无变化不处理），
 * 前端只负责如实提交当前表单值，不自作主张分流。
 */
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { adjustPlantedDetail } from '@/api/djs-plant/plan';
import type { PlantDetailAdjustForm, PlantDetailsVO } from '@/api/djs-plant/plan/types';
import { listAllTeam } from '@/api/djs-plant/team';

const props = defineProps<{
  modelValue: boolean;
  detail: PlantDetailsVO | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  /** 保存成功（真的写了库）后触发，父级重拉详情。 */
  (e: 'saved'): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});

const formRef = ref<FormInstance>();
const saving = ref(false);
const teamOptions = ref<Array<{ id: string; teamName: string }>>([]);

const form = reactive<{ plantState: 'planted' | 'pending'; beginActualdate?: string; plantByIds: string[] }>({
  plantState: 'planted',
  beginActualdate: undefined,
  plantByIds: []
});

const rules = computed<FormRules>(() => ({
  plantState: [{ required: true, message: t('plantPlan.adjust.rule.plantState'), trigger: 'change' }],
  beginActualdate: [
    {
      required: true,
      message: t('plantPlan.adjust.rule.plantDate'),
      trigger: 'change',
      // 仅「已种植」分支要求必填；回退待种植时该项不渲染也不校验
      validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
        if (form.plantState === 'pending' || value) {
          callback();
          return;
        }
        callback(new Error(t('plantPlan.adjust.rule.plantDate')));
      }
    }
  ]
}));

/** 打开时按当前行回填：状态恒为「已种植」，日期 = 当前种植日期，班组 = 当前种植班组全集。 */
async function onOpen() {
  form.plantState = 'planted';
  form.beginActualdate = props.detail?.beginActualdate ?? undefined;
  const ids = props.detail?.plantByIds?.length ? props.detail.plantByIds : props.detail?.plantBy ? [props.detail.plantBy] : [];
  form.plantByIds = ids.map(String);
  await loadTeams();
}

async function loadTeams() {
  if (teamOptions.value.length) return;
  try {
    const res: any = await listAllTeam({ teamStatus: 1 });
    const rows = (res?.data ?? res?.rows ?? []) as Array<{ id: string; teamName: string }>;
    teamOptions.value = rows.map((r) => ({ id: String(r.id), teamName: r.teamName }));
  } catch {
    teamOptions.value = [];
  }
}

async function onSubmit() {
  if (!props.detail) return;
  try {
    await formRef.value?.validate();
  } catch {
    return; // 校验未过：el-form 已在字段下方标红，不再额外弹错、也不提交
  }
  const body: PlantDetailAdjustForm = {
    detailId: props.detail.id,
    plantState: form.plantState
  };
  if (form.plantState === 'planted') {
    body.beginActualdate = form.beginActualdate;
    body.plantByIds = form.plantByIds;
  }
  saving.value = true;
  try {
    const res = await adjustPlantedDetail(body);
    // 后端返 0 = 状态/日期/班组三项都没变，未做任何处理（甲方第 5 点）——如实告诉用户，不假装成功
    if (Number(res.data) === 0) {
      ElMessage.info(t('plantPlan.adjust.noChange'));
      visible.value = false;
      return;
    }
    ElMessage.success(t('plantPlan.adjust.success'));
    visible.value = false;
    emit('saved');
  } finally {
    saving.value = false;
  }
}
</script>
