<template>
  <el-dialog v-model="visible" :title="t('djs.warehouse.check.createTitle')" destroy-on-close append-to-body width="520px" @closed="handleClosed">
    <el-alert type="warning" :title="t('djs.warehouse.check.lockHint')" :closable="false" class="mb-3" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('djs.warehouse.check.locationName')" prop="locationId">
        <el-select v-model="form.locationId" filterable clearable :placeholder="t('djs.warehouse.check.locationPlaceholder')" style="width: 100%">
          <el-option v-for="l in locationOptions" :key="String(l.id)" :label="`${l.locationName}（${l.locationCode}）`" :value="String(l.id)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('djs.warehouse.check.checkDate')" prop="checkDate">
        <el-date-picker
          v-model="form.checkDate"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          :placeholder="t('djs.warehouse.check.checkDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('djs.warehouse.check.remark')" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addCheck } from '@/api/djs-warehouse/check';
import type { StockCheckCreateForm } from '@/api/djs-warehouse/check/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = defineModel<boolean>({ required: true });
const emit = defineEmits<{ success: [] }>();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const form = reactive<StockCheckCreateForm>({
  locationId: undefined,
  checkDate: undefined,
  remark: undefined
});

const rules: FormRules = {
  locationId: [{ required: true, message: t('djs.warehouse.check.locationRequired'), trigger: 'change' }],
  checkDate: [{ required: true, message: t('djs.warehouse.check.checkDateRequired'), trigger: 'change' }]
};

const locationOptions = ref<LocationInfoVO[]>([]);
async function loadLocations() {
  const res: any = await listLocation({ pageNum: 1, pageSize: 500 });
  locationOptions.value = res.rows ?? [];
}

function handleClosed() {
  formRef.value?.resetFields();
  form.locationId = undefined;
  form.checkDate = undefined;
  form.remark = undefined;
}

async function handleSubmit() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    await addCheck(form);
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

watch(visible, (v) => {
  if (v && locationOptions.value.length === 0) {
    loadLocations();
  }
});
</script>
