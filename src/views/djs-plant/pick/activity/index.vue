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
import { listCrop } from '@/api/djs-plant/crop';
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
  activityDate: undefined,
  cropId: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'activityDate', label: t('pickActivity.field.activityDate'), type: 'date', placeholder: t('pickActivity.placeholder.activityDate') },
  { field: 'cropId', label: t('pickActivity.field.cropName'), type: 'select', options: cropOptions.value, placeholder: t('pickActivity.placeholder.crop') }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'activityDate', label: t('pickActivity.column.activityDate'), width: 140, align: 'center' },
  { prop: 'cropName', label: t('pickActivity.column.cropName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'plotCount', label: t('pickActivity.column.plotCount'), width: 120, align: 'center' },
  { prop: 'todayPickWeight', label: t('pickActivity.column.todayPickWeight'), width: 150, align: 'right' },
  { prop: 'expectedYield', label: t('pickActivity.column.expectedYield'), width: 150, align: 'right' },
  { prop: 'cumulativePickWeight', label: t('pickActivity.column.cumulativePickWeight'), width: 150, align: 'right' }
]);

const cropOptions = ref<Array<{ label: string; value: string }>>([]);

async function loadCrops() {
  const res = await listCrop({ pageNum: 1, pageSize: 100 });
  const rows = ((res as { rows?: unknown[] }).rows ?? []) as Array<{ id: string; cropName: string }>;
  cropOptions.value = rows.map((c) => ({ value: String(c.id), label: c.cropName }));
}

function buildQuery(): PickActivityQuery {
  return {
    activityDate: searchModel.activityDate || undefined,
    cropId: searchModel.cropId || undefined,
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
  proxy?.download(
    'djs/plant/pick/activity/export',
    { activityDate: searchModel.activityDate || undefined, cropId: searchModel.cropId || undefined },
    `${t('pickActivity.pageTitle')}_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadCrops();
  loadList();
});
</script>
