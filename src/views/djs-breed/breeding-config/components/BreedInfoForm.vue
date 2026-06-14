<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="codeLabel" prop="breedStrainCode">
            <el-input v-model="form.breedStrainCode" :placeholder="codePlaceholder" :disabled="!!form.id" :maxlength="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="nameLabel" prop="breedStrainName">
            <el-input v-model="form.breedStrainName" :placeholder="namePlaceholder" maxlength="64" />
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

/**
 * BreedInfo 新增 / 编辑表单。
 *
 * <p>父组件按 breedStrain 维度拆 4 个独立页面（strain.vue / line.vue / mate-strain.vue / mate-line.vue）后，
 * 表单不再展示 breedStrain radio —— 通过 openCreate(breedStrain) 入参锁定，编辑时按 row.breedStrain 还原。</p>
 *
 * <p>字段显示策略：</p>
 * <ul>
 *   <li>品种（breedStrain=1）：仅 breedStrainCode + breedStrainName</li>
 *   <li>品系（breedStrain=2）：breedStrainCode + breedStrainName + parentCode（归属品种）</li>
 * </ul>
 */
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
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

// 编码 / 名称 label 与 placeholder 按 breedStrain 维度区分：品系（=2）显示「品系编码 / 品系名称」，品种（=1）显示「品种编码 / 品种名称」。
const isStrainForm = computed(() => form.value.breedStrain === 2);
const codeLabel = computed(() => (isStrainForm.value ? t('breeding.field.lineCode') : t('breeding.field.typeCode')));
const codePlaceholder = computed(() => (isStrainForm.value ? t('breeding.placeholder.lineCode') : t('breeding.placeholder.typeCode')));
const nameLabel = computed(() => (isStrainForm.value ? t('breeding.field.lineName') : t('breeding.field.typeName')));
const namePlaceholder = computed(() => (isStrainForm.value ? t('breeding.placeholder.lineName') : t('breeding.placeholder.typeName')));

const rules = computed(() => {
  // 编码 = 耳号位码（ADR-0011 §2.1）：品种（breedStrain=1）恰好 2 位纯数字。
  const isStrain = form.value.breedStrain === 2;
  return {
    breedStrainCode: [
      { required: true, message: t('breeding.rule.breedStrainCode.required'), trigger: 'blur' },
      isStrain
        ? { pattern: /^\d{1,2}$/, message: t('breeding.rule.breedStrainCode.len1to2'), trigger: 'blur' }
        : { pattern: /^\d{2}$/, message: t('breeding.rule.breedStrainCode.len2'), trigger: 'blur' }
    ],
    breedStrainName: [{ required: true, message: t('breeding.rule.breedStrainName.required'), trigger: 'blur' }]
  };
});

const dialogTitle = computed(() => {
  if (form.value.id) {
    return form.value.breedStrain === 2 ? t('breeding.title.editStrain') : t('breeding.title.editType');
  }
  return form.value.breedStrain === 2 ? t('breeding.title.addStrain') : t('breeding.title.addType');
});

const emit = defineEmits<{ (e: 'success'): void }>();

/** 外部调：新增（breedStrain 由父页面决定，不再可切） */
const openCreate = (breedStrain: number) => {
  form.value = defaultForm(breedStrain);
  visible.value = true;
};

/** 外部调：编辑（breedStrain 跟随 row.breedStrain 还原，不可切） */
const openEdit = async (id: number | string) => {
  const res = await getBreedInfo(id);
  form.value = {
    ...defaultForm(),
    ...res.data
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
