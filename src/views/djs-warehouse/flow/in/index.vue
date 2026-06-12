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
      :dict-types="['djs_flow_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:flowIn"
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

<script setup name="WarehouseFlowIn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listFlowIn } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowQuery, StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<StockFlowVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 入库仓库下拉（库位主数据），onMounted 拉一次 */
const locationOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchModel = reactive<Record<string, any>>({
  dateRange: undefined,
  productName: undefined,
  flowType: undefined,
  warehouseId: undefined,
  operatorName: undefined,
  blockNo: undefined,
  earNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.flowIn.flowDate'), type: 'daterange' },
  { field: 'productName', label: t('djs.warehouse.flowIn.productName'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.flowIn.inMode'), type: 'select', dictType: 'djs_flow_type' },
  { field: 'warehouseId', label: t('djs.warehouse.flowIn.location'), type: 'select', options: locationOptions.value },
  { field: 'operatorName', label: t('djs.warehouse.flowIn.operator'), type: 'input' },
  { field: 'blockNo', label: t('djs.warehouse.flowIn.blockNo'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowIn.earNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowDate', label: t('djs.warehouse.flowIn.flowDate'), minWidth: 160, formatter: 'date' },
  { prop: 'flowNo', label: t('djs.warehouse.flowIn.flowNo'), minWidth: 160 },
  { prop: 'productCode', label: t('djs.warehouse.flowIn.productCode'), minWidth: 110 },
  { prop: 'productName', label: t('djs.warehouse.flowIn.productName'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.flowIn.inMode'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'locationName', label: t('djs.warehouse.flowIn.location'), minWidth: 120 },
  { prop: 'changeQuantity', label: t('djs.warehouse.flowIn.changeQuantity'), minWidth: 110 },
  { prop: 'productUnit', label: t('djs.warehouse.flowIn.productUnit'), minWidth: 80 },
  { prop: 'blockNo', label: t('djs.warehouse.flowIn.blockNo'), minWidth: 110 },
  { prop: 'earNo', label: t('djs.warehouse.flowIn.earNo'), minWidth: 120 },
  { prop: 'operatorName', label: t('djs.warehouse.flowIn.operator'), minWidth: 100 },
  { prop: 'createTime', label: t('djs.warehouse.flowIn.createTime'), minWidth: 160, formatter: 'datetime' }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串归一 undefined） */
function buildQuery(): StockFlowQuery {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    productName: searchModel.productName || undefined,
    flowType: searchModel.flowType || undefined,
    warehouseId: searchModel.warehouseId ?? undefined,
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
    const res = await listFlowIn(buildQuery());
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
  proxy?.download('/djs/warehouse/stockFlow/in/export', buildQuery(), `入库记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadLocations();
  loadList();
});
</script>
