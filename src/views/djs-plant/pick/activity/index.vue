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
      :page-num="pageNum"
      :page-size="pageSize"
      perm-prefix="djs:plant:pick:activity"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-todayPickWeight="{ row }">{{ row.todayPickWeight != null ? `${Number(row.todayPickWeight).toFixed(2)} kg` : '-' }}</template>
      <template #cell-expectedYield="{ row }">{{ row.expectedYield != null ? `${Number(row.expectedYield).toFixed(2)} kg` : '-' }}</template>
      <template #cell-cumulativePickWeight="{ row }">
        {{ row.cumulativePickWeight != null ? `${Number(row.cumulativePickWeight).toFixed(2)} kg` : '-' }}
      </template>
    </BizTable>
  </div>
</template>

<script setup name="PickActivityIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPickActivity } from '@/api/djs-plant/pick';
import type { PickActivityQuery, PickActivityVO } from '@/api/djs-plant/pick/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PickActivityVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  activityDateRange: undefined,
  cropName: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'activityDateRange', label: t('pickActivity.field.activityDate'), type: 'daterange' },
  { field: 'cropName', label: t('pickActivity.field.cropName'), type: 'input', placeholder: t('pickActivity.placeholder.cropName') }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'activityDate', label: t('pickActivity.column.activityDate'), minWidth: 140, align: 'center' },
  { prop: 'cropName', label: t('pickActivity.column.cropName'), minWidth: 130, showOverflowTooltip: true, align: 'center' },
  { prop: 'plotCount', label: t('pickActivity.column.plotCount'), minWidth: 120, align: 'center' },
  { prop: 'todayPickWeight', label: t('pickActivity.column.todayPickWeight'), minWidth: 150, align: 'right' },
  { prop: 'expectedYield', label: t('pickActivity.column.expectedYield'), minWidth: 150, align: 'right' },
  { prop: 'cumulativePickWeight', label: t('pickActivity.column.cumulativePickWeight'), minWidth: 150, align: 'right' }
]);

/** daterange 字段绑成 [start, end] 数组，拆成 beginDate / endDate 传后端。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

function buildQuery(): PickActivityQuery {
  const { begin, end } = rangeOf(searchModel.activityDateRange);
  return {
    cropName: searchModel.cropName || undefined,
    beginDate: begin,
    endDate: end,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickActivity(buildQuery());
    const r = res as unknown as { rows?: PickActivityVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
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
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  const { begin, end } = rangeOf(searchModel.activityDateRange);
  proxy?.download(
    'djs/plant/pick/activity/export',
    { cropName: searchModel.cropName || undefined, beginDate: begin, endDate: end },
    `${t('pickActivity.pageTitle')}_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadList();
});
</script>
