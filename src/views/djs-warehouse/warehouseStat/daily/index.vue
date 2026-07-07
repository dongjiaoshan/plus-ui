<template>
  <div class="p-2">
    <BizTable
      :data="pagedList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="statDate"
      perm-prefix="djs:warehouse:stat"
      :show-add="false"
      :show-batch-del="false"
      :show-action="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup name="WarehouseStatDaily" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listWarehouseDaily, type WarehouseDailyVO } from '@/api/djs-warehouse/warehouseStat';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fullList = ref<WarehouseDailyVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const searchModel = reactive<Record<string, any>>({ dateRange: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'dateRange', label: t('warehouseStat.field.dateRange'), type: 'daterange' }]);

const num = (v: unknown) => (v === null || v === undefined || v === '' ? '-' : v + '');
const k = (key: string) => t(`warehouseStat.daily.${key}`);
const col = (prop: string, w = 120): BizTableColumn => ({ prop, label: k(prop), minWidth: w, align: 'center', formatter: (row: BizRow) => num(row[prop]) });

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statDate', label: k('statDate'), minWidth: 120, align: 'center', fixed: 'left' },
  col('slaughterCount'),
  col('slaughterWeight'),
  col('avgSlaughterWeight'),
  col('arriveWeight'),
  col('slaughterRate'),
  col('barTotalWeight'),
  col('avgBarWeight'),
  col('barYieldRate'),
  col('cutBarCount'),
  col('precoolLoss'),
  col('cutProductWeight'),
  col('cutBarWeight'),
  col('cutRate'),
  col('cutLoss'),
  col('vegWeighWeight'),
  col('vegLoss'),
  col('vegLossRate'),
  col('sendPlatformWeight'),
  col('receivePlatformWeight'),
  col('transportLossRate'),
  col('prodPickWeight'),
  col('prodLossWeight'),
  col('netVegLossRate')
]);

const total = computed(() => fullList.value.length);
const pagedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  return fullList.value.slice(start, start + pageSize.value);
});

async function fetchList() {
  loading.value = true;
  try {
    const range = (searchModel.dateRange as string[] | undefined) ?? [];
    const res = await listWarehouseDaily({ dateFrom: range[0] || undefined, dateTo: range[1] || undefined });
    fullList.value = (res.data ?? []) as WarehouseDailyVO[];
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
  searchModel.dateRange = undefined;
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
}

onMounted(fetchList);
</script>
