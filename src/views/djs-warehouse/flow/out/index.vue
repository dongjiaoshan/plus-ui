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
      :dict-types="['djs_flow_type', 'djs_stock_out_dest', 'djs_product_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:flowOut"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    />
  </div>
</template>

<script setup name="WarehouseFlowOut" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listFlowOut } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowQuery, StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

/** djs_flow_type 是出入合并字典，出库方式下拉只保留出库方向的值（按 value 白名单过滤，不动字典 seed） */
const FLOW_TYPE_OUT_VALUES = [
  'pick_out',
  // 领用按来源拆分 + 盘点异常出库（FIX-WMS-FLOWDICT-001）
  'dept_pick_out',
  'prod_pick_out',
  'feed_out',
  // 'loss'（领用后损耗）不计为出库 —— 后端 queryOutList 已排除，下拉也不提供（R72）
  'cut_out',
  'slaughter_burn',
  'ship_out',
  'check_out',
  'check_abnormal_out',
  'pack_consume',
  'backstage_out',
  'other'
];
const { djs_flow_type } = toRefs<Record<string, any>>(proxy?.useDict('djs_flow_type'));
const outModeOptions = computed(() =>
  (djs_flow_type.value ?? [])
    .filter((d: any) => FLOW_TYPE_OUT_VALUES.includes(String(d.value)))
    .map((d: any) => ({ label: d.label, value: d.value }))
);

/** 库存查询行钻取带入的 productId 预过滤（route query，仅本次进入生效） */
const drillProductId = ref<string | undefined>(undefined);

const tableRef = ref<BizTableExpose>();

const list = ref<StockFlowVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 出库仓库下拉（库位主数据），onMounted 拉一次 */
const locationOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchModel = reactive<Record<string, any>>({
  dateRange: undefined,
  productName: undefined,
  productType: [],
  flowType: [],
  warehouseId: [],
  stockOutDest: [],
  operatorName: undefined,
  blockNo: undefined,
  earNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.flowOut.flowDate'), type: 'daterange' },
  { field: 'productName', label: t('djs.warehouse.flowOut.productName'), type: 'input' },
  { field: 'productType', label: t('djs.warehouse.flowOut.productType'), type: 'select', multiple: true, dictType: 'djs_product_type' },
  { field: 'flowType', label: t('djs.warehouse.flowOut.outMode'), type: 'select', multiple: true, options: outModeOptions.value },
  { field: 'warehouseId', label: t('djs.warehouse.flowOut.location'), type: 'select', multiple: true, options: locationOptions.value },
  { field: 'stockOutDest', label: t('djs.warehouse.flowOut.stockOutDest'), type: 'select', multiple: true, dictType: 'djs_stock_out_dest' },
  { field: 'operatorName', label: t('djs.warehouse.flowOut.operator'), type: 'input' },
  { field: 'blockNo', label: t('djs.warehouse.flowOut.blockNo'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowOut.earNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowDate', label: t('djs.warehouse.flowOut.flowDate'), minWidth: 160, align: 'center', formatter: (row: any) => proxy?.parseTime?.(row.flowDate, '{y}-{m}-{d} {h}:{i}') },
  { prop: 'flowNo', label: t('djs.warehouse.flowOut.flowNo'), minWidth: 160, align: 'center' },
  { prop: 'productType', label: t('djs.warehouse.flowOut.productType'), dictType: 'djs_product_type', minWidth: 100, align: 'center' },
  { prop: 'productCode', label: t('djs.warehouse.flowOut.productCode'), minWidth: 110, align: 'center' },
  { prop: 'productName', label: t('djs.warehouse.flowOut.productName'), minWidth: 160, align: 'center' },
  { prop: 'flowType', label: t('djs.warehouse.flowOut.outMode'), dictType: 'djs_flow_type', minWidth: 110, align: 'center' },
  { prop: 'stockOutDest', label: t('djs.warehouse.flowOut.stockOutDest'), dictType: 'djs_stock_out_dest', minWidth: 110, align: 'center' },
  { prop: 'locationName', label: t('djs.warehouse.flowOut.location'), minWidth: 120, align: 'center' },
  { prop: 'changeQuantity', label: t('djs.warehouse.flowOut.changeQuantity'), minWidth: 110, align: 'center' },
  { prop: 'productUnit', label: t('djs.warehouse.flowOut.productUnit'), minWidth: 80, align: 'center' },
  { prop: 'blockNo', label: t('djs.warehouse.flowOut.blockNo'), minWidth: 110, align: 'center' },
  { prop: 'earNo', label: t('djs.warehouse.flowOut.earNo'), minWidth: 120, align: 'center' },
  { prop: 'operatorName', label: t('djs.warehouse.flowOut.operator'), minWidth: 100, align: 'center' }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串归一 undefined） */
function buildQuery(): StockFlowQuery {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    productId: drillProductId.value || undefined,
    productName: searchModel.productName || undefined,
    productTypes:
      Array.isArray(searchModel.productType) && searchModel.productType.length ? searchModel.productType.map((v: any) => Number(v)) : undefined,
    flowTypes: Array.isArray(searchModel.flowType) && searchModel.flowType.length ? searchModel.flowType : undefined,
    warehouseIds: Array.isArray(searchModel.warehouseId) && searchModel.warehouseId.length ? searchModel.warehouseId : undefined,
    stockOutDests: Array.isArray(searchModel.stockOutDest) && searchModel.stockOutDest.length ? searchModel.stockOutDest : undefined,
    operatorName: searchModel.operatorName || undefined,
    blockNo: searchModel.blockNo || undefined,
    earNo: searchModel.earNo || undefined,
    dateFrom: from || undefined,
    dateTo: to || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listFlowOut(buildQuery());
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadLocations() {
  const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
  const rows = (res as any).rows ?? (res as any).data ?? [];
  locationOptions.value = rows.map((r: any) => ({ label: r.locationName, value: r.id }));
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
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/stockFlow/out/export', buildQuery(), `出库记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  const pid = route.query.productId;
  drillProductId.value = typeof pid === 'string' && pid ? pid : undefined;
  loadLocations();
  loadList();
});
</script>
