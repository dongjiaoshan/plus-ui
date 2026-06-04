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
      :dict-types="['djs_flow_type', 'djs_belong_type', 'djs_mat_type', 'djs_stock_out_dest']"
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<StockFlowVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  flowNo: undefined,
  flowType: undefined,
  matType: undefined,
  stockOutDest: undefined,
  productCode: undefined,
  earNo: undefined,
  dateFrom: undefined,
  dateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'flowNo', label: t('djs.warehouse.flowOut.flowNo'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.flowOut.flowType'), type: 'select', dictType: 'djs_flow_type' },
  { field: 'stockOutDest', label: t('djs.warehouse.flowOut.stockOutDest'), type: 'select', dictType: 'djs_stock_out_dest' },
  { field: 'matType', label: t('djs.warehouse.flowOut.matType'), type: 'select', dictType: 'djs_mat_type' },
  { field: 'productCode', label: t('djs.warehouse.flowOut.productCode'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowOut.earNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowNo', label: t('djs.warehouse.flowOut.flowNo'), minWidth: 160 },
  { prop: 'flowDate', label: t('djs.warehouse.flowOut.flowDate'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.flowOut.flowType'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'productName', label: t('djs.warehouse.flowOut.productName'), minWidth: 160 },
  { prop: 'belongType', label: t('djs.warehouse.flowOut.belongType'), dictType: 'djs_belong_type', minWidth: 100 },
  { prop: 'changeQuantity', label: t('djs.warehouse.flowOut.changeQuantity'), minWidth: 100 },
  { prop: 'productUnit', label: t('djs.warehouse.flowOut.productUnit'), minWidth: 80 },
  { prop: 'stockOutDest', label: t('djs.warehouse.flowOut.stockOutDest'), dictType: 'djs_stock_out_dest', minWidth: 110 },
  { prop: 'locationName', label: t('djs.warehouse.flowOut.location'), minWidth: 120 },
  { prop: 'earNo', label: t('djs.warehouse.flowOut.earNo'), minWidth: 120 },
  { prop: 'operatorName', label: t('djs.warehouse.flowOut.operator'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.flowOut.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: StockFlowQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listFlowOut(params);
    list.value = (res as any).rows ?? [];
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
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/stockFlow/out/export', { ...searchModel }, `出库记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
