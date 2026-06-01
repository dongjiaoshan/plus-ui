<template>
  <el-dialog v-model="visible" :title="t('storeOperation.sale.form.title')" destroy-on-close append-to-body width="560px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="t('storeOperation.sale.form.store')" prop="storeId">
        <el-select
          v-model="form.storeId"
          filterable
          :placeholder="t('storeOperation.sale.storePlaceholder')"
          style="width: 100%"
          @change="onStoreChange"
        >
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.product')" prop="productId">
        <el-select
          v-model="form.productId"
          filterable
          :placeholder="productPlaceholder"
          :disabled="!form.storeId"
          style="width: 100%"
          @change="onProductChange"
        >
          <el-option v-for="p in productOptions" :key="String(p.productId)" :label="p.productName" :value="String(p.productId)" />
        </el-select>
        <div v-if="form.storeId && productOptions.length === 0" class="mt-1 text-xs text-orange-500">
          {{ t('storeOperation.sale.form.noRelation') }}
        </div>
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.unit')">
        <el-input v-model="saleUnit" disabled :placeholder="t('storeOperation.sale.form.unitAuto')" />
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.saleDate')" prop="saleDate">
        <el-date-picker v-model="form.saleDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.saleQty')" prop="saleQty">
        <el-input-number v-model="form.saleQty" :precision="3" :min="0" :step="1" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.saleAmount')" prop="saleAmount">
        <el-input-number v-model="form.saleAmount" :precision="2" :min="0" :step="1" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="t('storeOperation.sale.form.remark')">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="SaleRecordForm" lang="ts">
import { listStoreRelation } from '@/api/djs-store/operation/relation';
import { addStoreSale } from '@/api/djs-store/operation/sale';
import type { StoreProductRelationVO, StoreSaleRecordForm } from '@/api/djs-store/operation/types';
import type { StoreVO } from '@/api/djs-common/store/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ storeOptions: StoreVO[] }>();
const emit = defineEmits<{ success: [] }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const productOptions = ref<StoreProductRelationVO[]>([]);

const defaultForm = (): StoreSaleRecordForm => ({
  storeId: '',
  productId: '',
  saleDate: '',
  saleQty: 0,
  saleAmount: 0,
  remark: ''
});
const form = reactive<StoreSaleRecordForm>(defaultForm());

const saleUnit = computed(() => {
  const p = productOptions.value.find((o) => String(o.productId) === String(form.productId));
  return p?.productUnit ?? '';
});
const productPlaceholder = computed(() =>
  form.storeId ? t('storeOperation.sale.form.productPlaceholder') : t('storeOperation.sale.form.selectStoreFirst')
);

const rules: FormRules = {
  storeId: [{ required: true, message: t('storeOperation.sale.form.storeRequired'), trigger: 'change' }],
  productId: [{ required: true, message: t('storeOperation.sale.form.productRequired'), trigger: 'change' }],
  saleDate: [{ required: true, message: t('storeOperation.sale.form.saleDateRequired'), trigger: 'change' }],
  saleQty: [{ required: true, message: t('storeOperation.sale.form.saleQtyRequired'), trigger: 'blur' }],
  saleAmount: [{ required: true, message: t('storeOperation.sale.form.saleAmountRequired'), trigger: 'blur' }]
};

async function loadProductOptions() {
  if (!form.storeId) {
    productOptions.value = [];
    return;
  }
  try {
    const res = await listStoreRelation(form.storeId);
    productOptions.value = (res.data ?? []) as StoreProductRelationVO[];
  } catch (e) {
    console.warn('[SaleRecordForm] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

function onStoreChange() {
  form.productId = '';
  loadProductOptions();
}
function onProductChange() {
  // saleUnit 由 computed 自动带出，无需额外处理
}

function openCreate() {
  Object.assign(form, defaultForm());
  productOptions.value = [];
  visible.value = true;
}

function handleClosed() {
  formRef.value?.resetFields();
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    await addStoreSale({ ...form });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate });
</script>
