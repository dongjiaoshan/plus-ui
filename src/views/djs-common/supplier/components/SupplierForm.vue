<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="720px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.supplierName')" prop="supplierName">
            <el-input v-model="form.supplierName" :placeholder="t('supplier.placeholder.supplierName')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.supplierType')" prop="supplierType">
            <el-select v-model="form.supplierType" :placeholder="t('supplier.placeholder.supplierType')" clearable>
              <el-option v-for="dict in djs_supplier_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.contactName')" prop="contactName">
            <el-input v-model="form.contactName" :placeholder="t('supplier.placeholder.contactName')" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.contactPhone')" prop="contactPhone">
            <el-input v-model="form.contactPhone" :placeholder="t('supplier.placeholder.contactPhone')" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('supplier.field.address')" prop="address">
            <el-input v-model="form.address" :placeholder="t('supplier.placeholder.address')" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.businessStatus')" prop="businessStatus">
            <el-radio-group v-model="form.businessStatus">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="Number(dict.value)">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.settleType')" prop="settleType">
            <el-input v-model="form.settleType" :placeholder="t('supplier.placeholder.settleType')" maxlength="16" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.bankName')" prop="bankName">
            <el-input v-model="form.bankName" :placeholder="t('supplier.placeholder.bankName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.bankAccount')" prop="bankAccount">
            <el-input v-model="form.bankAccount" :placeholder="t('supplier.placeholder.bankAccount')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('supplier.field.remark')" prop="remark">
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
import { addSupplier, getSupplier, updateSupplier } from '@/api/djs-common/supplier';
import type { SupplierForm } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_supplier_type, sys_normal_disable } = toRefs<any>(proxy?.useDict('djs_supplier_type', 'sys_normal_disable'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): SupplierForm => ({
  id: undefined,
  supplierName: '',
  supplierType: '',
  contactName: undefined,
  contactPhone: undefined,
  address: undefined,
  businessStatus: 1,
  settleType: undefined,
  bankAccount: undefined,
  bankName: undefined,
  remark: undefined
});

const form = ref<SupplierForm>(defaultForm());

const rules = computed(() => ({
  supplierName: [{ required: true, message: t('supplier.rule.supplierName.required'), trigger: 'blur' }],
  supplierType: [{ required: true, message: t('supplier.rule.supplierType.required'), trigger: 'change' }],
  businessStatus: [{ required: true, message: t('supplier.rule.businessStatus.required'), trigger: 'change' }],
  contactPhone: [
    {
      pattern: /^$|^[0-9+\-\s]{6,20}$/,
      message: t('supplier.rule.contactPhone.pattern'),
      trigger: 'blur'
    }
  ]
}));

const dialogTitle = computed(() => (form.value.id ? t('supplier.title.edit') : t('supplier.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 外部调：新增 */
const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

/** 外部调：编辑 */
const openEdit = async (id: number | string) => {
  const res = await getSupplier(id);
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
        await updateSupplier(form.value);
      } else {
        await addSupplier(form.value);
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
