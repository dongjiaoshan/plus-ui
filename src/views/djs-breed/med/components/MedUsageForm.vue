<template>
  <el-dialog v-model="visible" :title="t('medUsage.title.add')" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item :label="t('medUsage.field.batchId')" prop="batchId">
            <el-select
              v-model="form.batchId"
              filterable
              remote
              clearable
              :remote-method="searchBatches"
              :loading="batchLoading"
              :placeholder="t('medUsage.placeholder.batchId')"
              @change="onBatchChange"
            >
              <el-option v-for="b in batchOptions" :key="b.id" :label="`${b.batchNo} ｜ 库存 ${b.quantity}`" :value="b.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medUsage.field.usageType')" prop="usageType">
            <el-radio-group v-model="form.usageType">
              <el-radio-button value="use">{{ t('medUsage.type.use') }}</el-radio-button>
              <el-radio-button value="return">{{ t('medUsage.type.return') }}</el-radio-button>
              <el-radio-button value="loss">{{ t('medUsage.type.loss') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medUsage.field.usageQty')" prop="usageQty">
            <el-input-number v-model="form.usageQty" :min="0.001" :precision="3" :step="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medUsage.field.useDate')" prop="useDate">
            <el-date-picker
              v-model="form.useDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('medUsage.placeholder.useDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medUsage.field.pigId')" prop="pigId">
            <el-input-number v-model="form.pigId as any" :min="0" :precision="0" :controls="false" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('medUsage.field.relatedPenId')" prop="relatedPenId">
            <el-input-number v-model="form.relatedPenId as any" :min="0" :precision="0" :controls="false" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('medUsage.field.remark')" prop="remark">
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
import { addMedUsage, listMedBatch } from '@/api/djs-breed/med';
import type { MedBatchVO, MedUsageForm, MedUsageType } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const batchOptions = ref<MedBatchVO[]>([]);
const batchLoading = ref(false);

const defaultForm = (): MedUsageForm => ({
  batchId: '' as unknown as number,
  medicineId: '' as unknown as number,
  usageType: 'use' as MedUsageType,
  usageQty: 1,
  useDate: new Date().toISOString().slice(0, 10),
  pigId: undefined,
  relatedPenId: undefined,
  scheduleId: undefined,
  remark: undefined
});

const form = ref<MedUsageForm>(defaultForm());

const rules = computed(() => ({
  batchId: [{ required: true, message: t('medUsage.rule.batchId.required'), trigger: 'change' }],
  usageType: [{ required: true, message: t('medUsage.rule.usageType.required'), trigger: 'change' }],
  usageQty: [{ required: true, message: t('medUsage.rule.usageQty.required'), trigger: 'blur' }],
  useDate: [{ required: true, message: t('medUsage.rule.useDate.required'), trigger: 'change' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

async function searchBatches(keyword?: string) {
  batchLoading.value = true;
  try {
    const res = await listMedBatch({ pageNum: 1, pageSize: 50, batchNo: keyword || undefined });
    batchOptions.value = (res.rows ?? res.data ?? []) as MedBatchVO[];
  } finally {
    batchLoading.value = false;
  }
}

function onBatchChange(batchId: number | string) {
  const found = batchOptions.value.find((b) => String(b.id) === String(batchId));
  if (found) {
    form.value.medicineId = found.medicineId;
  }
}

const openCreate = () => {
  form.value = defaultForm();
  batchOptions.value = [];
  searchBatches();
  visible.value = true;
};

defineExpose({ openCreate });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (!form.value.medicineId) {
      proxy?.$modal.msgWarning(t('medUsage.rule.batchId.required'));
      return;
    }
    submitting.value = true;
    try {
      await addMedUsage(form.value);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
