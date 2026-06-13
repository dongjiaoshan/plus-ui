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
      :dict-types="['djs_flow_type', 'djs_stock_out_dest']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:flowOut"
      show-export
      :show-add="false"
      :show-batch-del="false"
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
  flowType: undefined,
  warehouseId: undefined,
  stockOutDest: undefined,
  operatorName: undefined,
  blockNo: undefined,
  earNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.flowOut.flowDate'), type: 'daterange' },
  { field: 'productName', label: t('djs.warehouse.flowOut.productName'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.flowOut.outMode'), type: 'select', dictType: 'djs_flow_type' },
  { field: 'warehouseId', label: t('djs.warehouse.flowOut.location'), type: 'select', options: locationOptions.value },
  { field: 'stockOutDest', label: t('djs.warehouse.flowOut.stockOutDest'), type: 'select', dictType: 'djs_stock_out_dest' },
  { field: 'operatorName', label: t('djs.warehouse.flowOut.operator'), type: 'input' },
  { field: 'blockNo', label: t('djs.warehouse.flowOut.blockNo'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowOut.earNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowDate', label: t('djs.warehouse.flowOut.flowDate'), minWidth: 160, formatter: 'datetime' },
  { prop: 'flowNo', label: t('djs.warehouse.flowOut.flowNo'), minWidth: 160 },
  { prop: 'productCode', label: t('djs.warehouse.flowOut.productCode'), minWidth: 110 },
  { prop: 'productName', label: t('djs.warehouse.flowOut.productName'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.flowOut.outMode'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'locationName', label: t('djs.warehouse.flowOut.location'), minWidth: 120 },
  { prop: 'changeQuantity', label: t('djs.warehouse.flowOut.changeQuantity'), minWidth: 110 },
  { prop: 'productUnit', label: t('djs.warehouse.flowOut.productUnit'), minWidth: 80 },
  { prop: 'blockNo', label: t('djs.warehouse.flowOut.blockNo'), minWidth: 110 },
  { prop: 'earNo', label: t('djs.warehouse.flowOut.earNo'), minWidth: 120 },
  { prop: 'operatorName', label: t('djs.warehouse.flowOut.operator'), minWidth: 100 },
  { prop: 'createTime', label: t('djs.warehouse.flowOut.createTime'), minWidth: 160, formatter: 'datetime' }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串归一 undefined） */
function buildQuery(): StockFlowQuery {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    productId: drillProductId.value || undefined,
    productName: searchModel.productName || undefined,
    flowType: searchModel.flowType || undefined,
    warehouseId: searchModel.warehouseId ?? undefined,
    stockOutDest: searchModel.stockOutDest || undefined,
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
