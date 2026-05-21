<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('store.field.storeName')" prop="storeName">
            <el-input v-model="form.storeName" :placeholder="t('store.placeholder.storeName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.storeType')" prop="storeType">
            <el-select v-model="form.storeType" :placeholder="t('store.placeholder.storeType')" clearable>
              <el-option :label="t('store.option.direct')" value="direct" />
              <el-option :label="t('store.option.franchise')" value="franchise" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.businessStatus')" prop="businessStatus">
            <el-radio-group v-model="form.businessStatus">
              <el-radio :value="1">{{ t('store.option.cooperating') }}</el-radio>
              <el-radio :value="0">{{ t('store.option.terminated') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.contactName')" prop="contactName">
            <el-input v-model="form.contactName" :placeholder="t('store.placeholder.contactName')" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.contactPhone')" prop="contactPhone">
            <el-input v-model="form.contactPhone" :placeholder="t('store.placeholder.contactPhone')" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('store.field.address')" prop="address">
            <el-input v-model="form.address" :placeholder="t('store.placeholder.address')" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('store.field.remark')" prop="remark">
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
import { addStore, getStore, updateStore } from '@/api/djs-common/store';
import type { StoreForm } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): StoreForm => ({
  id: undefined,
  storeName: '',
  storeType: 'direct',
  businessStatus: 1,
  address: undefined,
  contactName: undefined,
  contactPhone: undefined,
  remark: undefined
});

const form = ref<StoreForm>(defaultForm());

const rules = computed(() => ({
  storeName: [{ required: true, message: t('store.rule.storeName.required'), trigger: 'blur' }],
  businessStatus: [{ required: true, message: t('store.rule.businessStatus.required'), trigger: 'change' }],
  contactPhone: [{ pattern: /^$|^1[3-9]\d{9}$/, message: t('store.rule.contactPhone.pattern'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('store.title.edit') : t('store.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 外部调：新增 */
const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

/** 外部调：编辑 */
const openEdit = async (id: number | string) => {
  const res = await getStore(id);
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
        await updateStore(form.value);
      } else {
        await addStore(form.value);
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
