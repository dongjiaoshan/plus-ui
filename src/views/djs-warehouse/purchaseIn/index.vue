<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:purchaseIn"
      show-export
      :show-add="true"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="openAddDialog"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 流水只读，无行级操作 -->
      <template #action><span /></template>
    </BizTable>

    <el-dialog
      v-model="dialogVisible"
      :title="t('djs.warehouse.purchaseIn.dialogTitle')"
      destroy-on-close
      append-to-body
      width="560px"
      @closed="handleDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('djs.warehouse.purchaseIn.product')" prop="productId">
          <el-select
            v-model="form.productId"
            :placeholder="t('djs.warehouse.purchaseIn.productPlaceholder')"
            filterable
            clearable
            :loading="productLoading"
            style="width: 100%"
          >
            <el-option v-for="p in productOptions" :key="String(p.id)" :label="`${p.productId} - ${p.productName}`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.purchaseIn.location')" prop="locationId">
          <el-select
            v-model="form.locationId"
            :placeholder="t('djs.warehouse.purchaseIn.locationPlaceholder')"
            filterable
            clearable
            :loading="locationLoading"
            style="width: 100%"
          >
            <el-option v-for="l in locationOptions" :key="String(l.id)" :label="`${l.locationCode} - ${l.locationName}`" :value="l.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.purchaseIn.quantity')" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 100%" />
          <span v-if="selectedProductUnit" class="ml-2 text-gray-500">{{ selectedProductUnit }}</span>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.purchaseIn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ t('common.confirm') }}
          </el-button>
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PurchaseIn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { exportPurchaseIn, listPurchaseIn, submitPurchaseIn } from '@/api/djs-warehouse/purchaseIn';
import type { PurchaseInBo, PurchaseInQuery, PurchaseInRecordVO } from '@/api/djs-warehouse/purchaseIn/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

// ---- 列表 ----
const list = ref<PurchaseInRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productId: undefined,
  locationId: undefined,
  dateFrom: undefined,
  dateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productId', label: t('djs.warehouse.purchaseIn.product'), type: 'input' },
  { field: 'locationId', label: t('djs.warehouse.purchaseIn.location'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowNo', label: t('djs.warehouse.purchaseIn.flowNo'), minWidth: 160 },
  { prop: 'flowDate', label: t('djs.warehouse.purchaseIn.flowDate'), minWidth: 160 },
  { prop: 'productName', label: t('djs.warehouse.purchaseIn.product'), minWidth: 160 },
  { prop: 'locationName', label: t('djs.warehouse.purchaseIn.location'), minWidth: 140 },
  { prop: 'changeQuantity', label: t('djs.warehouse.purchaseIn.quantity'), minWidth: 100 },
  { prop: 'productUnit', label: t('djs.warehouse.purchaseIn.unit'), minWidth: 80 },
  { prop: 'operatorName', label: t('djs.warehouse.purchaseIn.operator'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.purchaseIn.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PurchaseInQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPurchaseIn(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/purchaseIn/export', { ...searchModel }, `采购入库_${new Date().getTime()}.xlsx`);
}

// ---- 新增 dialog ----
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

// 表单层 quantity 用 number（el-input-number 契约）；提交时 BO.quantity 再宽容到 number|string
interface PurchaseInFormShape {
  productId: number | string | '';
  locationId: number | string | '';
  quantity: number | undefined;
  remark: string | undefined;
}

const defaultForm = (): PurchaseInFormShape => ({
  productId: '',
  locationId: '',
  quantity: undefined,
  remark: undefined
});

const form = ref<PurchaseInFormShape>(defaultForm());

const rules = computed(() => ({
  productId: [{ required: true, message: t('djs.warehouse.purchaseIn.productRequired'), trigger: 'change' }],
  locationId: [{ required: true, message: t('djs.warehouse.purchaseIn.locationRequired'), trigger: 'change' }],
  quantity: [{ required: true, message: t('djs.warehouse.purchaseIn.quantityRequired'), trigger: 'blur' }]
}));

const productOptions = ref<ProductInfoVO[]>([]);
const productLoading = ref(false);
const locationOptions = ref<LocationInfoVO[]>([]);
const locationLoading = ref(false);

const selectedProductUnit = computed<string>(() => {
  if (form.value.productId === '' || form.value.productId == null) {
    return '';
  }
  const p = productOptions.value.find((x) => String(x.id) === String(form.value.productId));
  return p?.productUnit ?? '';
});

async function loadProducts() {
  if (productOptions.value.length > 0) return;
  productLoading.value = true;
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    productOptions.value = ((res as any).rows ?? []) as ProductInfoVO[];
  } finally {
    productLoading.value = false;
  }
}

async function loadLocations() {
  if (locationOptions.value.length > 0) return;
  locationLoading.value = true;
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 500 });
    locationOptions.value = ((res as any).rows ?? []) as LocationInfoVO[];
  } finally {
    locationLoading.value = false;
  }
}

async function openAddDialog() {
  form.value = defaultForm();
  dialogVisible.value = true;
  await Promise.all([loadProducts(), loadLocations()]);
}

function handleDialogClosed() {
  formRef.value?.resetFields();
  form.value = defaultForm();
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const bo: PurchaseInBo = {
        productId: form.value.productId as number | string,
        locationId: form.value.locationId as number | string,
        quantity: form.value.quantity as number,
        remark: form.value.remark
      };
      await submitPurchaseIn(bo);
      ElMessage.success(t('djs.warehouse.purchaseIn.submitSuccess'));
      dialogVisible.value = false;
      loadList();
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  loadList();
});
</script>
