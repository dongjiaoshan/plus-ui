<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="pagedList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="120"
      row-key="statDate"
      perm-prefix="djs:warehouse:stockOverview"
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 操作列：查看当日库存明细 -->
      <template #action="{ row }">
        <el-button
          v-hasPermi="['djs:warehouse:stockOverview:query']"
          link
          type="primary"
          size="small"
          @click="handleDetail(row as StockOverviewDailyVO)"
        >
          {{ t('stockOverview.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <StockOverviewDetailDialog ref="detailDialogRef" />
  </div>
</template>

<script setup name="StockOverview" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StockOverviewDetailDialog from './components/StockOverviewDetailDialog.vue';
import { listStockOverview, type StockOverviewDailyVO } from '@/api/djs-warehouse/stockOverview';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const detailDialogRef = ref<{ open: (date: string) => void }>();

/** 后端一次返回全量每日汇总（行数小），前端客户端分页。 */
const fullList = ref<StockOverviewDailyVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  dateRange: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'dateRange', label: t('stockOverview.field.dateRange'), type: 'daterange' }]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statDate', label: t('stockOverview.column.statDate'), minWidth: 160, align: 'center' },
  {
    prop: 'productCount',
    label: t('stockOverview.column.productCount'),
    minWidth: 160,
    align: 'center',
    formatter: (row: BizRow) => (row.productCount ?? 0) + ''
  }
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
    const res = await listStockOverview({
      dateFrom: range[0] || undefined,
      dateTo: range[1] || undefined
    });
    fullList.value = (res.data ?? []) as StockOverviewDailyVO[];
  } finally {
    loading.value = false;
  }
}

function handleDetail(row: StockOverviewDailyVO) {
  detailDialogRef.value?.open(row.statDate);
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

onMounted(() => {
  fetchList();
});
</script>
