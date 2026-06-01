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
      :dict-types="['djs_flow_type', 'djs_belong_type', 'djs_mat_type']"
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
  productCode: undefined,
  earNo: undefined,
  dateFrom: undefined,
  dateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'flowNo', label: t('djs.warehouse.flowIn.flowNo'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.flowIn.flowType'), type: 'select', dictType: 'djs_flow_type' },
  { field: 'matType', label: t('djs.warehouse.flowIn.matType'), type: 'select', dictType: 'djs_mat_type' },
  { field: 'productCode', label: t('djs.warehouse.flowIn.productCode'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowIn.earNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowNo', label: t('djs.warehouse.flowIn.flowNo'), minWidth: 160 },
  { prop: 'flowDate', label: t('djs.warehouse.flowIn.flowDate'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.flowIn.flowType'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'productName', label: t('djs.warehouse.flowIn.productName'), minWidth: 160 },
  { prop: 'belongType', label: t('djs.warehouse.flowIn.belongType'), dictType: 'djs_belong_type', minWidth: 100 },
  { prop: 'changeQuantity', label: t('djs.warehouse.flowIn.changeQuantity'), minWidth: 100 },
  { prop: 'productUnit', label: t('djs.warehouse.flowIn.productUnit'), minWidth: 80 },
  { prop: 'locationName', label: t('djs.warehouse.flowIn.location'), minWidth: 120 },
  { prop: 'earNo', label: t('djs.warehouse.flowIn.earNo'), minWidth: 120 },
  { prop: 'operatorName', label: t('djs.warehouse.flowIn.operator'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.flowIn.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: StockFlowQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listFlowIn(params);
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
  proxy?.download('/djs/warehouse/stockFlow/in/export', { ...searchModel }, `入库记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
