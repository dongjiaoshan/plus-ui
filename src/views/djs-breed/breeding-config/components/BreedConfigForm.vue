<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.breedStrain')" prop="breedStrain">
            <el-radio-group v-model="form.breedStrain" :disabled="lockStrain" @change="handleStrainChange">
              <el-radio :value="1">{{ t('breeding.option.type') }}</el-radio>
              <el-radio :value="2">{{ t('breeding.option.strain') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" />
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.motherCode')" prop="motherCode">
            <el-select v-model="form.motherCode" :placeholder="t('breeding.placeholder.motherCode')" filterable clearable>
              <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
          <el-form-item :label="t('breeding.field.cubCode')" prop="cubCode">
            <el-select v-model="form.cubCode" :placeholder="t('breeding.placeholder.cubCode')" filterable clearable>
              <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <div class="text-xs text-gray-400 mt-1">{{ t('breeding.tip.cubMustExistFirst') }}</div>
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

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const lockStrain = ref(false);
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

/** 同 breedStrain 范畴下的候选品种/品系下拉 */
const candidateOptions = ref<Array<{ label: string; value: string }>>([]);

const rules = computed(() => ({
  breedStrain: [{ required: true, message: t('breeding.rule.breedStrain.required'), trigger: 'change' }],
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
  // 拉同 strain 范畴下的所有 breed_info 给三个 select 用
  const res = await listBreedInfo({ pageNum: 1, pageSize: 999, breedStrain });
  const rows = (res.rows ?? res.data ?? []) as BreedInfoVO[];
  candidateOptions.value = rows.map((r) => ({
    label: `${r.breedStrainName} (${r.breedStrainCode})`,
    value: r.breedStrainCode
  }));
}

function handleStrainChange(value: string | number | boolean | undefined) {
  // 切换 strain 时重置三个 code 选项并重新拉
  form.value.motherCode = '';
  form.value.fatherCode = '';
  form.value.cubCode = '';
  loadCandidates(Number(value));
}

/** 外部调：新增 */
const openCreate = async (breedStrain: number) => {
  form.value = defaultForm(breedStrain);
  lockStrain.value = true;
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
  lockStrain.value = true;
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
