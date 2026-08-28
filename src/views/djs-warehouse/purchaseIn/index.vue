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
      :dict-types="['djs_buy_class']"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="220"
      row-key="productId"
      perm-prefix="djs:warehouse:purchaseIn"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #cell-productThumb="{ row }">
        <ImagePreview v-if="row.imageUrl" :width="40" :height="40" :src="row.imageUrl" :preview-src-list="[row.imageUrl]" />
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:purchaseIn:list']" link type="primary" icon="View" @click="handleView(row)">
          {{ t('common.view') }}
        </el-button>
        <el-button v-hasPermi="['djs:warehouse:product:edit']" link type="primary" icon="Download" @click="handleInbound(row)">
          {{ t('djs.warehouse.purchaseIn.inbound') }}
        </el-button>
      </template>
    </BizTable>

    <ProductView ref="productViewRef" />
    <ProductInboundForm
      ref="inboundFormRef"
      :hide-unit="true"
      :purchase-in-context="true"
      :quantity-label="t('djs.warehouse.purchaseIn.inboundQuantity')"
      @success="loadList"
    />
  </div>
</template>

<script setup name="PurchaseIn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import ProductView from '../product/components/ProductView.vue';
import ProductInboundForm from '../product/components/ProductInboundForm.vue';
import { listPurchaseInProduct } from '@/api/djs-warehouse/purchaseIn';
import type { PurchaseInProductQuery, PurchaseInProductVO } from '@/api/djs-warehouse/purchaseIn/types';
import { listSupplier } from '@/api/djs-common/supplier';
import { listLocation } from '@/api/djs-warehouse/location';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PurchaseInProductVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 供应商 / 存储仓库 下拉项（ID 全 string） */
const supplierOptions = ref<Array<{ label: string; value: string }>>([]);
const locationOptions = ref<Array<{ label: string; value: string }>>([]);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  buyClass: [],
  supplierId: [],
  storeLocationId: []
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('djs.warehouse.purchaseIn.productName'), type: 'input' },
  { field: 'buyClass', label: t('djs.warehouse.purchaseIn.buyClass'), type: 'select', dictType: 'djs_buy_class', multiple: true },
  { field: 'supplierId', label: t('djs.warehouse.purchaseIn.supplier'), type: 'select', options: supplierOptions.value, multiple: true },
  { field: 'storeLocationId', label: t('djs.warehouse.purchaseIn.storeLocation'), type: 'select', options: locationOptions.value, multiple: true }
]);

/** BigDecimal→string 数量列渲染：Number() 防 "100.0001.000" 拼接，NaN/空兜底为 — */
function fmtAmount(v?: string | number | null): string {
  if (v === undefined || v === null || v === '') return '—';
  const n = Number(v);
  return Number.isNaN(n) ? '—' : String(n);
}

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productThumb', label: t('djs.warehouse.purchaseIn.productThumb'), width: 80, align: 'center' },
  { prop: 'productCode', label: t('djs.warehouse.purchaseIn.productCode'), width: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('djs.warehouse.purchaseIn.productName'), minWidth: 160, showOverflowTooltip: true },
  // row66：商品名称后新增「商品类别」列（字典 djs_buy_class）
  { prop: 'buyClass', label: t('djs.warehouse.purchaseIn.buyClass'), width: 120, align: 'center', dictType: 'djs_buy_class' },
  { prop: 'productSpec', label: t('djs.warehouse.purchaseIn.productSpec'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'storeLocationName', label: t('djs.warehouse.purchaseIn.storeLocation'), width: 140, align: 'center', showOverflowTooltip: true },
  // row66：当前库存列移到单位列前面
  {
    prop: 'currentStock',
    label: t('djs.warehouse.purchaseIn.currentStock'),
    width: 110,
    align: 'center',
    formatter: (row) => fmtAmount(row.currentStock)
  },
  { prop: 'productUnit', label: t('djs.warehouse.purchaseIn.unit'), width: 80, align: 'center' },
  // row66：当月累计采购量列移到单位列后面
  {
    prop: 'monthInTotal',
    label: t('djs.warehouse.purchaseIn.monthInTotal'),
    width: 130,
    align: 'center',
    formatter: (row) => fmtAmount(row.monthInTotal)
  },
  // row23：当前库存后新增供应商列（取商品配置的供应商）
  { prop: 'supplierName', label: t('djs.warehouse.purchaseIn.supplier'), width: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'lastInTime', label: t('djs.warehouse.purchaseIn.lastInTime'), width: 170, align: 'center' },
  { prop: 'lastPurchaserName', label: t('djs.warehouse.purchaseIn.lastPurchaser'), width: 110, align: 'center', showOverflowTooltip: true }
]);

function buildQuery(): Omit<PurchaseInProductQuery, 'pageNum' | 'pageSize'> {
  return {
    productName: searchModel.productName || undefined,
    buyClasses: Array.isArray(searchModel.buyClass) && searchModel.buyClass.length ? searchModel.buyClass : undefined,
    supplierIds:
      Array.isArray(searchModel.supplierId) && searchModel.supplierId.length ? searchModel.supplierId.map((v: any) => String(v)) : undefined,
    storeLocationIds:
      Array.isArray(searchModel.storeLocationId) && searchModel.storeLocationId.length
        ? searchModel.storeLocationId.map((v: any) => String(v))
        : undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const params: PurchaseInProductQuery = {
      ...buildQuery(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPurchaseInProduct(params);
    list.value = ((res as any).rows ?? []) as PurchaseInProductVO[];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

/** 导出（商品维度，按当前搜索条件）。 */
function handleExport() {
  proxy?.download('djs/warehouse/purchaseIn/productExport', buildQuery(), `采购入库_${Date.now()}.xlsx`);
}

// ---- 行操作 ----
const productViewRef = ref<{ open: (id: number | string, productType?: number) => void }>();
const inboundFormRef = ref<{
  open: (row: {
    id: number | string;
    productName?: string;
    productUnit?: string;
    storeLocationId?: string | number;
    buyClass?: string;
    supplierId?: string | number;
    supplierName?: string;
  }) => void;
}>();

function handleView(row: BizRow) {
  // 外购商品 productType 固定 2（业务流水 tab）
  productViewRef.value?.open(row.productId, 2);
}

function handleInbound(row: BizRow) {
  inboundFormRef.value?.open({
    id: row.productId,
    productName: row.productName,
    productUnit: row.productUnit,
    storeLocationId: row.storeLocationId,
    buyClass: row.buyClass,
    // row141：带上 supplierId，弹框里预选商品配置的供应商（可改）
    supplierId: row.supplierId,
    supplierName: row.supplierName
  });
}

// ---- 下拉数据 ----
async function loadSupplierOptions() {
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 500 });
    const rows = ((res as any).rows ?? (res as any).data ?? []) as Array<{ id: number | string; supplierName: string }>;
    supplierOptions.value = rows.map((r) => ({ label: r.supplierName, value: String(r.id) }));
  } catch (e) {
    console.warn('[PurchaseIn] listSupplier failed', e);
    supplierOptions.value = [];
  }
}

async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
    const rows = ((res as any).rows ?? (res as any).data ?? []) as Array<{ id: number | string; locationName: string }>;
    locationOptions.value = rows.map((r) => ({ label: r.locationName, value: String(r.id) }));
  } catch (e) {
    console.warn('[PurchaseIn] listLocation failed', e);
    locationOptions.value = [];
  }
}

onMounted(() => {
  loadSupplierOptions();
  loadLocationOptions();
  loadList();
});
</script>
