<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.breedStrain')" prop="breedStrain">
            <el-radio-group v-model="form.breedStrain" :disabled="lockStrain">
              <el-radio :value="1">{{ t('breeding.option.type') }}</el-radio>
              <el-radio :value="2">{{ t('breeding.option.strain') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.breedStrainCode')" prop="breedStrainCode">
            <el-input v-model="form.breedStrainCode" :placeholder="t('breeding.placeholder.breedStrainCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.breedStrainName')" prop="breedStrainName">
            <el-input v-model="form.breedStrainName" :placeholder="t('breeding.placeholder.breedStrainName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('breeding.field.parentCode')" prop="parentCode">
            <el-input v-model="form.parentCode" :placeholder="t('breeding.placeholder.parentCode')" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('breeding.field.description')" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="2" maxlength="255" />
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
import { addBreedInfo, getBreedInfo, updateBreedInfo } from '@/api/djs-breed/breeding';
import type { BreedInfoForm as BreedInfoFormType } from '@/api/djs-breed/breeding/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const lockStrain = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (breedStrain = 1): BreedInfoFormType => ({
  id: undefined,
  breedStrain,
  breedStrainCode: '',
  breedStrainName: '',
  parentCode: undefined,
  description: undefined,
  remark: undefined
});

const form = ref<BreedInfoFormType>(defaultForm());

const rules = computed(() => ({
  breedStrain: [{ required: true, message: t('breeding.rule.breedStrain.required'), trigger: 'change' }],
  breedStrainCode: [
    { required: true, message: t('breeding.rule.breedStrainCode.required'), trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: t('breeding.rule.breedStrainCode.pattern'), trigger: 'blur' }
  ],
  breedStrainName: [{ required: true, message: t('breeding.rule.breedStrainName.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => {
  if (form.value.id) {
    return form.value.breedStrain === 2 ? t('breeding.title.editStrain') : t('breeding.title.editType');
  }
  return form.value.breedStrain === 2 ? t('breeding.title.addStrain') : t('breeding.title.addType');
});

const emit = defineEmits<{ (e: 'success'): void }>();

/** 外部调：新增（lockStrain 时 radio 锁定，与 tab 一致） */
const openCreate = (breedStrain: number) => {
  form.value = defaultForm(breedStrain);
  lockStrain.value = true;
  visible.value = true;
};

/** 外部调：编辑 */
const openEdit = async (id: number | string) => {
  const res = await getBreedInfo(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
  lockStrain.value = true;
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
        await updateBreedInfo(form.value);
      } else {
        await addBreedInfo(form.value);
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
