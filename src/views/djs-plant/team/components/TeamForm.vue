<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="560px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item :label="t('plantTeam.field.teamName')" prop="teamName">
            <el-input v-model="form.teamName" :placeholder="t('plantTeam.placeholder.teamName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantTeam.field.teamStatus')" prop="teamStatus">
            <el-radio-group v-model="form.teamStatus">
              <el-radio v-for="dict in djs_common_status" :key="dict.value" :value="Number(dict.value)">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantTeam.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" :placeholder="t('plantTeam.placeholder.remark')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 班组新增/编辑表单（PLT-MD-002）。
 *
 * 不在此表单中切换 leader — 走"成员管理弹窗 → 设为负责人"统一双轨写。
 */
import { addTeam, getTeam, updateTeam } from '@/api/djs-plant/team';
import type { PlantWorkTeamForm, PlantWorkTeamVO } from '@/api/djs-plant/team/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_common_status } = toRefs<any>(proxy?.useDict('djs_common_status'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): PlantWorkTeamForm => ({
  id: undefined,
  teamName: '',
  teamStatus: 1,
  remark: undefined
});

const form = ref<PlantWorkTeamForm>(defaultForm());

const rules = computed(() => ({
  teamName: [{ required: true, message: t('plantTeam.rule.teamName.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('plantTeam.title.edit') : t('plantTeam.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (row: PlantWorkTeamVO) => {
  // 优先用 row 的字段；若调用方需要最新字段可改 getTeam(row.id)
  const res = await getTeam(row.id);
  const remote = res.data;
  form.value = {
    id: remote.id,
    teamName: remote.teamName,
    teamStatus: remote.teamStatus,
    remark: remote.remark
  };
  visible.value = true;
};

defineExpose({ openCreate, openEdit });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (form.value.id) {
        await updateTeam(form.value);
      } else {
        await addTeam(form.value);
      }
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
