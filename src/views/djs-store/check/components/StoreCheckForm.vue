<template>
  <el-dialog v-model="visible" :title="t('storeCheck.form.title')" destroy-on-close append-to-body width="480px" @closed="handleClosed">
    <el-alert :title="t('storeCheck.form.lockHint')" type="warning" :closable="false" show-icon class="mb-3" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('storeCheck.form.store')" prop="storeId">
        <el-select v-model="form.storeId" filterable :placeholder="t('storeCheck.form.storePlaceholder')" style="width: 100%">
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('storeCheck.form.checkDate')" prop="checkDate">
        <el-date-picker
          v-model="form.checkDate"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          :placeholder="t('storeCheck.form.checkDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('storeCheck.form.remark')">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('storeCheck.form.submit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="StoreCheckForm" lang="ts">
import { addStoreCheck } from '@/api/djs-store/check';
import type { StoreCheckCreateForm, StoreCheckHeaderVO } from '@/api/djs-store/check/types';
import type { StoreVO } from '@/api/djs-common/store/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ storeOptions: StoreVO[] }>();
const emit = defineEmits<{ success: [headerId: string, row: StoreCheckHeaderVO] }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const defaultForm = (): StoreCheckCreateForm => ({
  storeId: '',
  checkDate: '',
  remark: ''
});
const form = reactive<StoreCheckCreateForm>(defaultForm());

const rules: FormRules = {
  storeId: [{ required: true, message: t('storeCheck.form.storeRequired'), trigger: 'change' }],
  checkDate: [{ required: true, message: t('storeCheck.form.checkDateRequired'), trigger: 'change' }]
};

function openCreate() {
  Object.assign(form, defaultForm());
  // 默认盘点日期 = 当前时间
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  form.checkDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  visible.value = true;
}

function handleClosed() {
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    const res = await addStoreCheck({ ...form });
    const headerId = String(res.data ?? '');
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    const store = props.storeOptions.find((s) => String(s.id) === String(form.storeId));
    const row: StoreCheckHeaderVO = {
      id: headerId,
      checkId: '',
      storeId: form.storeId,
      storeName: store?.storeName,
      checkDate: form.checkDate,
      checkStatus: 'in_progress',
      lineCount: 0,
      diffSum: 0
    };
    emit('success', headerId, row);
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate });
</script>
