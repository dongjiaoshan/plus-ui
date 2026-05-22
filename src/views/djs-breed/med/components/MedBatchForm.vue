<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item :label="t('medBatch.field.medicineId')" prop="medicineId">
            <el-select
              v-model="form.medicineId"
              filterable
              remote
              clearable
              :remote-method="searchMedicines"
              :loading="medicineLoading"
              :disabled="!!form.id"
              :placeholder="t('medBatch.placeholder.medicineId')"
            >
              <el-option v-for="m in medicineOptions" :key="m.id" :label="`${m.medicineName}（${m.medicineCode}）`" :value="m.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('medBatch.field.batchNo')" prop="batchNo">
            <el-input v-model="form.batchNo" :placeholder="t('medBatch.placeholder.batchNo')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medBatch.field.productionDate')" prop="productionDate">
            <el-date-picker
              v-model="form.productionDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('medBatch.placeholder.productionDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medBatch.field.expiryDate')" prop="expiryDate">
            <el-date-picker
              v-model="form.expiryDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('medBatch.placeholder.expiryDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medBatch.field.quantity')" prop="quantity">
            <el-input-number
              v-model="form.quantity"
              :min="0"
              :precision="3"
              :step="1"
              :placeholder="t('medBatch.placeholder.quantity')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medBatch.field.unitPrice')" prop="unitPrice">
            <el-input-number
              v-model="form.unitPrice"
              :min="0"
              :precision="2"
              :step="0.1"
              :placeholder="t('medBatch.placeholder.unitPrice')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('medBatch.field.remark')" prop="remark">
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
import { addMedBatch, getMedBatch, updateMedBatch, listMedicine, getMedicine } from '@/api/djs-breed/med';
import type { MedBatchForm, MedicineVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const medicineOptions = ref<MedicineVO[]>([]);
const medicineLoading = ref(false);

const defaultForm = (): MedBatchForm => ({
  id: undefined,
  medicineId: '' as unknown as number,
  batchNo: '',
  productionDate: undefined,
  expiryDate: undefined,
  quantity: 0,
  unitPrice: undefined,
  remark: undefined
});

const form = ref<MedBatchForm>(defaultForm());

const rules = computed(() => ({
  medicineId: [{ required: true, message: t('medBatch.rule.medicineId.required'), trigger: 'change' }],
  batchNo: [{ required: true, message: t('medBatch.rule.batchNo.required'), trigger: 'blur' }],
  quantity: [{ required: true, message: t('medBatch.rule.quantity.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('medBatch.title.edit') : t('medBatch.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

async function searchMedicines(keyword?: string) {
  medicineLoading.value = true;
  try {
    const res = await listMedicine({ pageNum: 1, pageSize: 50, medicineName: keyword || undefined });
    medicineOptions.value = (res.rows ?? res.data ?? []) as MedicineVO[];
  } finally {
    medicineLoading.value = false;
  }
}

const openCreate = () => {
  form.value = defaultForm();
  medicineOptions.value = [];
  searchMedicines();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getMedBatch(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
  if (form.value.medicineId) {
    try {
      const m = await getMedicine(form.value.medicineId);
      medicineOptions.value = [m.data as MedicineVO];
    } catch {
      medicineOptions.value = [];
    }
  } else {
    medicineOptions.value = [];
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
        await updateMedBatch(form.value);
      } else {
        await addMedBatch(form.value);
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
