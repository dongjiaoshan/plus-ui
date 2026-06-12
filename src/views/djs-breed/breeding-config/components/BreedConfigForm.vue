<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.motherCode')" prop="motherCode">
            <el-select v-model="form.motherCode" :placeholder="t('breeding.placeholder.motherCode')" filterable clearable>
              <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.column.motherName')">
            <el-input :model-value="motherName" readonly :placeholder="t('breeding.placeholder.autoFillName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.fatherCode')" prop="fatherCode">
            <el-select v-model="form.fatherCode" :placeholder="t('breeding.placeholder.fatherCode')" filterable clearable>
              <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.column.fatherName')">
            <el-input :model-value="fatherName" readonly :placeholder="t('breeding.placeholder.autoFillName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.cubCode')" prop="cubCode">
            <el-select v-model="form.cubCode" :placeholder="t('breeding.placeholder.cubCode')" filterable clearable>
              <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <div class="text-xs text-gray-400 mt-1">{{ t('breeding.tip.cubMustExistFirst') }}</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.column.offspringName')">
            <el-input :model-value="cubName" readonly :placeholder="t('breeding.placeholder.autoFillName')" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('breeding.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
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
import { addBreedConfig, getBreedConfig, listBreedInfo, updateBreedConfig } from '@/api/djs-breed/breeding';
import type { BreedConfigForm as BreedConfigFormType, BreedInfoVO } from '@/api/djs-breed/breeding/types';
import { useI18n } from 'vue-i18n';

/**
 * BreedConfig 新增 / 编辑表单。
 *
 * <p>breedStrain 由父页面（mate-strain.vue / mate-line.vue）通过 openCreate(breedStrain) 锁定，
 * 不再在表单内提供切换控件。三个 code 下拉只显示同 strain 范畴的 breed_info。</p>
 */
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (breedStrain = 1): BreedConfigFormType => ({
  id: undefined,
  breedStrain,
  motherCode: '',
  fatherCode: '',
  cubCode: '',
  remark: undefined
});

const form = ref<BreedConfigFormType>(defaultForm());

/** 同 breedStrain 范畴下的候选品种/品系下拉（name 用于选码后的名称只读框回显） */
const candidateOptions = ref<Array<{ label: string; value: string; name: string }>>([]);

/** code → name 反查（候选源里取，找不到返回空串） */
const nameOf = (code: string): string => candidateOptions.value.find((o) => o.value === code)?.name ?? '';

/** 名称只读框联动：选中 code 后自动带出名称，仅展示不提交 */
const motherName = computed(() => nameOf(form.value.motherCode));
const fatherName = computed(() => nameOf(form.value.fatherCode));
const cubName = computed(() => nameOf(form.value.cubCode));

const rules = computed(() => ({
  motherCode: [{ required: true, message: t('breeding.rule.motherCode.required'), trigger: 'change' }],
  fatherCode: [{ required: true, message: t('breeding.rule.fatherCode.required'), trigger: 'change' }],
  cubCode: [{ required: true, message: t('breeding.rule.cubCode.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => {
  if (form.value.id) {
    return form.value.breedStrain === 2 ? t('breeding.title.editStrainConfig') : t('breeding.title.editTypeConfig');
  }
  return form.value.breedStrain === 2 ? t('breeding.title.addStrainConfig') : t('breeding.title.addTypeConfig');
});

const emit = defineEmits<{ (e: 'success'): void }>();

async function loadCandidates(breedStrain: number) {
  const res = await listBreedInfo({ pageNum: 1, pageSize: 999, breedStrain });
  const rows = (res.rows ?? res.data ?? []) as BreedInfoVO[];
  candidateOptions.value = rows.map((r) => ({
    label: `${r.breedStrainName} (${r.breedStrainCode})`,
    value: r.breedStrainCode,
    name: r.breedStrainName
  }));
}

/** 外部调：新增 */
const openCreate = async (breedStrain: number) => {
  form.value = defaultForm(breedStrain);
  await loadCandidates(breedStrain);
  visible.value = true;
};

/** 外部调：编辑 */
const openEdit = async (id: number | string) => {
  const res = await getBreedConfig(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
  await loadCandidates(form.value.breedStrain);
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
        await updateBreedConfig(form.value);
      } else {
        await addBreedConfig(form.value);
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
