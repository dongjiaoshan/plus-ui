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
      :action-min-width="160"
      row-key="statMonth"
      perm-prefix="djs:warehouse:stockMonthly"
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 操作列：查看当月库存明细 -->
      <template #action="{ row }">
        <el-button
          v-hasPermi="['djs:warehouse:stockMonthly:query']"
          link
          type="primary"
          size="small"
          @click="handleDetail(row as StockOverviewMonthlyVO)"
        >
          {{ t('stockMonthly.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <StockMonthlyDetailDialog ref="detailDialogRef" />
  </div>
</template>

<script setup name="StockMonthly" lang="ts">
/**
 * 库存月汇总（admin row190）。
 *
 * 与「库存日汇总」同构：compute-on-read 回放 t_warehouse_stock_flow，不建汇总表、不加跑批
 * ——「当月结束后数据不再变化」因此天然成立。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StockMonthlyDetailDialog from './components/StockMonthlyDetailDialog.vue';
import { listStockMonthly, type StockOverviewMonthlyVO } from '@/api/djs-warehouse/stockOverview';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const detailDialogRef = ref<{ open: (monthStart: string) => void }>();

/** 后端一次返回全量月汇总（行数极小），前端客户端分页。 */
const fullList = ref<StockOverviewMonthlyVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/**
 * 搜索条件 = 单个月份（甲方原文「搜索条件为月份搜索，可以按月份进行搜索，查看对应月份的数据」）。
 *
 * 不选月份时列出全部月份（每月一条），选了就只看那一个月 —— 两种诉求都满足，
 * 也不必为此给 BizTable 新造 monthrange 类型。
 */
const searchModel = reactive<Record<string, any>>({
  statMonth: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'statMonth', label: t('stockMonthly.field.statMonth'), type: 'month' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statMonth', label: t('stockMonthly.column.statMonth'), minWidth: 160, align: 'center' },
  {
    prop: 'productCount',
    label: t('stockMonthly.column.productCount'),
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
    // month 选择器回写 'YYYY-MM'，后端要月首日 → 补 -01；起止同月即锁定该月
    const m = searchModel.statMonth as string | undefined;
    const res = await listStockMonthly({
      monthFrom: m ? `${m}-01` : undefined,
      monthTo: m ? `${m}-01` : undefined
    });
    fullList.value = (res.data ?? []) as StockOverviewMonthlyVO[];
  } finally {
    loading.value = false;
  }
}

/** 列表给的是 yyyy-MM，明细端点要月首日 → 补 -01。 */
function handleDetail(row: StockOverviewMonthlyVO) {
  detailDialogRef.value?.open(`${row.statMonth}-01`);
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  searchModel.statMonth = undefined;
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
