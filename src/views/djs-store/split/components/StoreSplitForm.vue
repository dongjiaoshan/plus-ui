<template>
  <el-dialog v-model="visible" :title="t('storeSplit.form.title')" destroy-on-close append-to-body width="480px" @closed="handleClosed">
    <el-alert :title="t('storeSplit.form.hint')" type="info" :closable="false" show-icon class="mb-3" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('storeSplit.form.cutPart')" prop="cutPart">
        <el-select v-model="form.cutPart" :placeholder="t('storeSplit.form.cutPartPlaceholder')" style="width: 100%">
          <el-option v-for="d in djs_pig_cut_part" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('storeSplit.form.productWeight')" prop="productWeight">
        <el-input-number v-model="form.productWeight" :min="0.001" :precision="3" :step="0.5" controls-position="right" style="width: 100%" />
        <span class="ml-2 text-gray-400">kg</span>
      </el-form-item>
      <el-form-item :label="t('storeSplit.form.location')" prop="locationId">
        <el-select v-model="form.locationId" filterable clearable :placeholder="t('storeSplit.form.locationPlaceholder')" style="width: 100%">
          <el-option v-for="l in locationOptions" :key="String(l.id)" :label="l.locationName" :value="String(l.id)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('storeSplit.form.whiteBarId')" prop="whiteBarId">
        <el-input v-model="form.whiteBarId" clearable :placeholder="t('storeSplit.form.whiteBarIdPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('storeSplit.form.remark')">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('storeSplit.form.submit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="StoreSplitForm" lang="ts">
import { addSplit } from '@/api/djs-store/split';
import type { StoreSplitForm } from '@/api/djs-store/split/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{ success: [] }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_cut_part } = toRefs<any>(proxy?.useDict('djs_pig_cut_part'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const locationOptions = ref<LocationInfoVO[]>([]);

const defaultForm = (): StoreSplitForm => ({
  cutPart: '',
  productWeight: 1,
  locationId: undefined,
  whiteBarId: undefined,
  remark: ''
});
const form = reactive<StoreSplitForm>(defaultForm());

const rules: FormRules = {
  cutPart: [{ required: true, message: t('storeSplit.form.cutPartRequired'), trigger: 'change' }],
  productWeight: [{ required: true, message: t('storeSplit.form.productWeightRequired'), trigger: 'change' }]
};

async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 200 });
    locationOptions.value = ((res as unknown as { rows?: LocationInfoVO[]; data?: LocationInfoVO[] }).rows ?? []) as LocationInfoVO[];
  } catch (e) {
    console.warn('[StoreSplitForm] loadLocationOptions failed', e);
    locationOptions.value = [];
  }
}

async function open() {
  Object.assign(form, defaultForm());
  visible.value = true;
  if (locationOptions.value.length === 0) await loadLocationOptions();
}

function handleClosed() {
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await addSplit({ ...form });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>
