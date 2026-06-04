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
      :dict-types="['djs_flow_type', 'djs_inout_type', 'djs_stock_out_dest']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:mat:pack"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 包材页只读，无行级操作 -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="MatPack" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listMatPack } from '@/api/djs-warehouse/matPack';
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
  inoutType: undefined,
  productCode: undefined,
  stockOutDest: undefined,
  dateFrom: undefined,
  dateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'flowNo', label: t('djs.warehouse.stockFlow.flowNo'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.stockFlow.flowType'), type: 'select', dictType: 'djs_flow_type' },
  { field: 'inoutType', label: t('djs.warehouse.stockFlow.inoutType'), type: 'select', dictType: 'djs_inout_type' },
  { field: 'productCode', label: t('djs.warehouse.stockFlow.productCode'), type: 'input' },
  { field: 'stockOutDest', label: t('djs.warehouse.stockFlow.stockOutDest'), type: 'select', dictType: 'djs_stock_out_dest' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowNo', label: t('djs.warehouse.stockFlow.flowNo'), minWidth: 160 },
  { prop: 'flowDate', label: t('djs.warehouse.stockFlow.flowDate'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.stockFlow.flowType'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'inoutType', label: t('djs.warehouse.stockFlow.inoutType'), dictType: 'djs_inout_type', minWidth: 80 },
  { prop: 'productName', label: t('djs.warehouse.stockFlow.productName'), minWidth: 160 },
  { prop: 'changeQuantity', label: t('djs.warehouse.stockFlow.changeQuantity'), minWidth: 100 },
  { prop: 'productUnit', label: t('djs.warehouse.stockFlow.productUnit'), minWidth: 80 },
  { prop: 'locationName', label: t('djs.warehouse.stockFlow.location'), minWidth: 120 },
  { prop: 'stockOutDest', label: t('djs.warehouse.stockFlow.stockOutDest'), dictType: 'djs_stock_out_dest', minWidth: 110 },
  { prop: 'operatorName', label: t('djs.warehouse.stockFlow.operator'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.stockFlow.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: StockFlowQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listMatPack(params);
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
  proxy?.download('/djs/warehouse/mat/pack/export', { ...searchModel }, `包材流水_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
