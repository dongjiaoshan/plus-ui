<template>
  <el-dialog v-model="visible" :title="t('farm.title.editContact')" destroy-on-close append-to-body width="560px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('farm.field.contactName')" prop="contactName">
        <el-input v-model="form.contactName" :placeholder="t('farm.placeholder.contactName')" maxlength="32" />
      </el-form-item>
      <el-form-item :label="t('farm.field.contactPhone')" prop="contactPhone">
        <el-input v-model="form.contactPhone" :placeholder="t('farm.placeholder.contactPhone')" maxlength="20" />
      </el-form-item>
      <el-form-item :label="t('farm.field.address')" prop="address">
        <el-input v-model="form.address" type="textarea" :rows="2" maxlength="255" />
      </el-form-item>
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
import { updateFarmContact } from '@/api/djs-breed/farm';
import type { FarmContactForm as FarmContactFormType, FarmInfoVO } from '@/api/djs-breed/farm/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): FarmContactFormType => ({
  id: 1001,
  contactName: undefined,
  contactPhone: undefined,
  address: undefined
});

const form = ref<FarmContactFormType>(defaultForm());

const rules = computed(() => ({
  contactPhone: [{ pattern: /^$|^1[3-9]\d{9}$/, message: t('farm.rule.contactPhone.pattern'), trigger: 'blur' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

const openEdit = (farm: FarmInfoVO) => {
  form.value = {
    id: farm.id,
    contactName: farm.contactName,
    contactPhone: farm.contactPhone,
    address: farm.address
  };
  visible.value = true;
};

defineExpose({ openEdit });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await updateFarmContact(form.value);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
