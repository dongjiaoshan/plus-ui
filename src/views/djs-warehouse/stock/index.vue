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
      :dict-types="['djs_yes_no', 'djs_check_result']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:stock"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 覆盖默认行级操作 slot 为空：库存查询只读，无 edit / del 入口 -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="Stock" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStock } from '@/api/djs-warehouse/stock';
import type { LocationStockQuery, LocationStockVO } from '@/api/djs-warehouse/stock/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<LocationStockVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  earNo: undefined,
  isEnd: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('stock.field.productName'), type: 'input' },
  { field: 'earNo', label: t('stock.field.earNo'), type: 'input' },
  { field: 'isEnd', label: t('stock.field.isEnd'), type: 'select', dictType: 'djs_yes_no' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'locationName', label: t('stock.column.locationName'), width: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('stock.column.productName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'productStock', label: t('stock.column.productStock'), width: 110, align: 'right' },
  { prop: 'productUnit', label: t('stock.column.productUnit'), width: 80, align: 'center' },
  { prop: 'earNo', label: t('stock.column.earNo'), width: 140, align: 'center' },
  { prop: 'isEnd', label: t('stock.column.isEnd'), width: 90, align: 'center', dictType: 'djs_yes_no' },
  { prop: 'latestCheckTime', label: t('stock.column.latestCheckTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'checkResult', label: t('stock.column.checkResult'), width: 90, align: 'center', dictType: 'djs_check_result' },
  { prop: 'operatorName', label: t('stock.column.operatorName'), width: 100, align: 'center' },
  { prop: 'createTime', label: t('stock.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: LocationStockQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchModel.productName || undefined,
      earNo: searchModel.earNo || undefined,
      isEnd: searchModel.isEnd === undefined || searchModel.isEnd === '' ? undefined : Number(searchModel.isEnd)
    };
    const res = await listStock(query);
    list.value = (res.rows ?? res.data ?? []) as LocationStockVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/warehouse/stock/export',
    {
      productName: searchModel.productName || undefined,
      earNo: searchModel.earNo || undefined,
      isEnd: searchModel.isEnd === undefined || searchModel.isEnd === '' ? undefined : Number(searchModel.isEnd)
    },
    `stock_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
