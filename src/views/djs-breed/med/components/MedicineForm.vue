<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="820px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.medicineCode')" prop="medicineCode">
            <el-input v-model="form.medicineCode" :placeholder="t('medicine.placeholder.medicineCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.medicineName')" prop="medicineName">
            <el-input v-model="form.medicineName" :placeholder="t('medicine.placeholder.medicineName')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.medicineType')" prop="medicineType">
            <el-select v-model="form.medicineType" :placeholder="t('medicine.placeholder.medicineType')" clearable>
              <el-option v-for="dict in djs_med_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.supplierId')" prop="supplierId">
            <el-select
              v-model="form.supplierId"
              filterable
              remote
              clearable
              :remote-method="searchSuppliers"
              :loading="supplierLoading"
              :placeholder="t('medicine.placeholder.supplierId')"
            >
              <el-option v-for="s in supplierOptions" :key="s.id" :label="`${s.supplierName}（${s.supplierCode}）`" :value="s.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.unit')" prop="unit">
            <el-input v-model="form.unit" :placeholder="t('medicine.placeholder.unit')" maxlength="16" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.spec')" prop="spec">
            <el-input v-model="form.spec" :placeholder="t('medicine.placeholder.spec')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.manufacturer')" prop="manufacturer">
            <el-input v-model="form.manufacturer" :placeholder="t('medicine.placeholder.manufacturer')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.approvalNo')" prop="approvalNo">
            <el-input v-model="form.approvalNo" :placeholder="t('medicine.placeholder.approvalNo')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.batchNo')" prop="batchNo">
            <el-input v-model="form.batchNo" :placeholder="t('medicine.placeholder.batchNo')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.expireDate')" prop="expireDate">
            <el-date-picker
              v-model="form.expireDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('medicine.placeholder.expireDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.withdrawDays')" prop="withdrawDays">
            <el-input-number
              v-model="form.withdrawDays"
              :min="0"
              :max="365"
              :placeholder="t('medicine.placeholder.withdrawDays')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.currentStock')" prop="currentStock">
            <el-input-number
              v-model="form.currentStock"
              :min="0"
              :precision="2"
              :step="1"
              :placeholder="t('medicine.placeholder.currentStock')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('medicine.field.storageCondition')" prop="storageCondition">
            <el-input v-model="form.storageCondition" :placeholder="t('medicine.placeholder.storageCondition')" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medicine.field.medStatus')" prop="medStatus">
            <el-radio-group v-model="form.medStatus">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="Number(dict.value)">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('medicine.field.remark')" prop="remark">
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
import { addMedicine, getMedicine, updateMedicine } from '@/api/djs-breed/med';
import { listSupplier, getSupplier } from '@/api/djs-common/supplier';
import type { MedicineForm } from '@/api/djs-breed/med/types';
import type { SupplierVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_med_type, sys_normal_disable } = toRefs<any>(proxy?.useDict('djs_med_type', 'sys_normal_disable'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const supplierOptions = ref<SupplierVO[]>([]);
const supplierLoading = ref(false);

const defaultForm = (): MedicineForm => ({
  id: undefined,
  medicineCode: '',
  medicineName: '',
  medicineType: '',
  supplierId: undefined,
  approvalNo: undefined,
  batchNo: undefined,
  expireDate: undefined,
  withdrawDays: undefined,
  unit: undefined,
  currentStock: undefined,
  spec: undefined,
  manufacturer: undefined,
  storageCondition: undefined,
  medStatus: 1,
  remark: undefined
});

const form = ref<MedicineForm>(defaultForm());

const rules = computed(() => ({
  medicineCode: [{ required: true, message: t('medicine.rule.medicineCode.required'), trigger: 'blur' }],
  medicineName: [{ required: true, message: t('medicine.rule.medicineName.required'), trigger: 'blur' }],
  medicineType: [{ required: true, message: t('medicine.rule.medicineType.required'), trigger: 'change' }],
  medStatus: [{ required: true, message: t('medicine.rule.medStatus.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('medicine.title.edit') : t('medicine.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 远程搜索供应商（联动 SYS-MD-003） */
async function searchSuppliers(keyword?: string) {
  supplierLoading.value = true;
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 50, supplierName: keyword || undefined });
    supplierOptions.value = (res.rows ?? res.data ?? []) as SupplierVO[];
  } finally {
    supplierLoading.value = false;
  }
}

const openCreate = () => {
  form.value = defaultForm();
  supplierOptions.value = [];
  searchSuppliers();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getMedicine(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
  // 编辑场景下，supplierId 已存在的话先把它的 supplier 拉来填进 options，避免下拉显示 id 不显示 name
  if (form.value.supplierId) {
    try {
      const supRes = await getSupplier(form.value.supplierId);
      supplierOptions.value = [supRes.data as SupplierVO];
    } catch {
      supplierOptions.value = [];
    }
  } else {
    supplierOptions.value = [];
  }
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
        await updateMedicine(form.value);
      } else {
        await addMedicine(form.value);
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
