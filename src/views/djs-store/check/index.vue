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
      row-key="id"
      :selectable="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-export="true"
      perm-prefix="djs:store:check"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-checkStatus="{ row }">
        <dict-tag :options="djs_check_status" :value="row.checkStatus" />
      </template>
      <template #cell-diffSum="{ row }">
        <span :class="diffClass(row.diffSum)">{{ formatDiff(row.diffSum) }}</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:store:check:query']" link type="primary" icon="View" @click="openDetail(row)">
          {{ t('storeCheck.action.detail') }}
        </el-button>
        <el-button
          v-if="row.checkStatus === 'in_progress'"
          v-hasPermi="['djs:store:check:complete']"
          link
          type="success"
          icon="CircleCheck"
          @click="handleComplete(row)"
        >
          {{ t('storeCheck.action.complete') }}
        </el-button>
        <el-button
          v-if="row.checkStatus === 'in_progress'"
          v-hasPermi="['djs:store:check:cancel']"
          link
          type="warning"
          icon="CircleClose"
          @click="handleCancel(row)"
        >
          {{ t('storeCheck.action.cancel') }}
        </el-button>
      </template>
    </BizTable>

    <StoreCheckForm ref="formRef" :store-options="storeOptions" @success="onCreated" />

    <StoreCheckDetail ref="detailRef" @changed="fetchList" />
  </div>
</template>

<script setup name="StoreCheck" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreCheckForm from './components/StoreCheckForm.vue';
import StoreCheckDetail from './components/StoreCheckDetail.vue';
import { listStoreCheck, completeStoreCheck, cancelStoreCheck } from '@/api/djs-store/check';
import type { StoreCheckHeaderVO, StoreCheckQuery } from '@/api/djs-store/check/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_check_status } = toRefs<any>(proxy?.useDict('djs_check_status'));

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void }>();
const detailRef = ref<{ open: (row: StoreCheckHeaderVO) => void }>();

const list = ref<StoreCheckHeaderVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const storeOptions = ref<StoreVO[]>([]);

const searchModel = reactive<Record<string, unknown>>({
  checkId: undefined,
  storeId: undefined,
  checkStatus: undefined,
  checkDateFrom: undefined,
  checkDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'checkId', label: t('storeCheck.field.checkId'), type: 'input' },
  {
    field: 'storeId',
    label: t('storeCheck.field.store'),
    type: 'select',
    options: storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) }))
  },
  { field: 'checkStatus', label: t('storeCheck.field.checkStatus'), type: 'select', dictType: 'djs_check_status' },
  { field: 'checkDateFrom', label: t('storeCheck.field.checkDateFrom'), type: 'date' },
  { field: 'checkDateTo', label: t('storeCheck.field.checkDateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'checkId', label: t('storeCheck.column.checkId'), width: 160, showOverflowTooltip: true },
  { prop: 'storeName', label: t('storeCheck.column.storeName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'checkDate', label: t('storeCheck.column.checkDate'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'checkStatus', label: t('storeCheck.column.checkStatus'), width: 100, align: 'center' },
  { prop: 'lineCount', label: t('storeCheck.column.lineCount'), width: 90, align: 'right' },
  { prop: 'diffSum', label: t('storeCheck.column.diffSum'), width: 110, align: 'right' },
  { prop: 'createTime', label: t('storeCheck.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

function formatDiff(v: number | string | undefined): string {
  const n = Number(v ?? 0);
  if (Number.isNaN(n) || n === 0) return '0';
  return n > 0 ? `+${n}` : String(n);
}
function diffClass(v: number | string | undefined): string {
  const n = Number(v ?? 0);
  if (n > 0) return 'text-green-600';
  if (n < 0) return 'text-red-500';
  return '';
}

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreCheck] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreCheckQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      checkId: (searchModel.checkId as string) || undefined,
      storeId: (searchModel.storeId as string) || undefined,
      checkStatus: (searchModel.checkStatus as string) || undefined,
      checkDateFrom: (searchModel.checkDateFrom as string) || undefined,
      checkDateTo: (searchModel.checkDateTo as string) || undefined
    };
    const res = await listStoreCheck(query);
    list.value = (res.rows ?? res.data ?? []) as StoreCheckHeaderVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
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
function handleAdd() {
  formRef.value?.openCreate();
}
function handleExport(query?: Record<string, unknown>) {
  proxy?.download('djs/store/check/export', { ...(query ?? {}) }, `store_check_${new Date().getTime()}.xlsx`);
}
function openDetail(row: BizRow) {
  detailRef.value?.open(row as unknown as StoreCheckHeaderVO);
}
function onCreated(headerId: string, row: StoreCheckHeaderVO) {
  fetchList();
  // 新建后直接打开详情录实盘
  if (row) detailRef.value?.open(row);
}

async function handleComplete(row: BizRow) {
  await proxy?.$modal.confirm(t('storeCheck.confirm.complete', { id: row.checkId }));
  await completeStoreCheck(String(row.id));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
async function handleCancel(row: BizRow) {
  await proxy?.$modal.confirm(t('storeCheck.confirm.cancel', { id: row.checkId }));
  await cancelStoreCheck(String(row.id));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

onMounted(async () => {
  await loadStoreOptions();
  fetchList();
});
</script>
