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
      row-key="lossDate"
      perm-prefix="djs:warehouse:loss:overview"
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 操作列：查看当日损耗明细 -->
      <template #action="{ row }">
        <el-button
          v-hasPermi="['djs:warehouse:loss:overview:query']"
          link
          type="primary"
          size="small"
          @click="handleDetail(row as LossOverviewDailyVO)"
        >
          {{ t('lossOverview.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <LossDetailDialog ref="detailDialogRef" />
  </div>
</template>

<script setup name="LossOverview" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import LossDetailDialog from './components/LossDetailDialog.vue';
import { listLossOverview, type LossOverviewDailyVO } from '@/api/djs-warehouse/lossOverview';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const detailDialogRef = ref<{ open: (date: string) => void }>();

/** 后端一次返回全量每日汇总（行数小），前端客户端分页。 */
const fullList = ref<LossOverviewDailyVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  dateRange: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'dateRange', label: t('lossOverview.field.dateRange'), type: 'daterange' }]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'lossDate', label: t('lossOverview.column.lossDate'), minWidth: 160, align: 'center' },
  {
    prop: 'productCount',
    label: t('lossOverview.column.productCount'),
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
    const res = await listLossOverview({
      dateFrom: range[0] || undefined,
      dateTo: range[1] || undefined
    });
    fullList.value = (res.data ?? []) as LossOverviewDailyVO[];
  } finally {
    loading.value = false;
  }
}

function handleDetail(row: LossOverviewDailyVO) {
  detailDialogRef.value?.open(row.lossDate);
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
