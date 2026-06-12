<template>
  <div class="p-2">
    <!-- 门店经营流水盘点列表（盘点单 = 门店 + 盘点日期）。点查看进只读详情；新增当日盘点进整表录入页 -->
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
      row-key="rowKey"
      :selectable="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-add="false"
      :show-export="false"
      perm-prefix="djs:store:check"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #toolbar-extra>
        <el-button v-hasPermi="['djs:store:check:add']" type="primary" icon="Plus" @click="handleAddEntry">
          {{ t('storeLedger.action.newEntry') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:store:check:query']" link type="primary" icon="View" @click="openDetail(row)">
          {{ t('storeLedger.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <LedgerDetail ref="detailRef" />
  </div>
</template>

<script setup name="StoreLedgerList" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import LedgerDetail from './detail/index.vue';
import { listStoreLedger } from '@/api/djs-store/ledger';
import type { StoreLedgerHeaderVO, StoreLedgerQuery } from '@/api/djs-store/ledger/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

interface LedgerRow extends StoreLedgerHeaderVO {
  rowKey: string;
}

const tableRef = ref<BizTableExpose>();
const detailRef = ref<{ open: (storeId: string, ledgerDate: string) => void }>();

const list = ref<LedgerRow[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const storeOptions = ref<StoreVO[]>([]);

const searchModel = reactive<Record<string, unknown>>({
  storeId: undefined,
  ledgerDateFrom: undefined,
  ledgerDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'storeId',
    label: t('storeLedger.field.store'),
    type: 'select',
    options: storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) }))
  },
  { field: 'ledgerDateFrom', label: t('storeLedger.field.dateFrom'), type: 'date' },
  { field: 'ledgerDateTo', label: t('storeLedger.field.dateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'storeName', label: t('storeLedger.column.storeName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'ledgerDate', label: t('storeLedger.column.ledgerDate'), width: 140, align: 'center' },
  { prop: 'lineCount', label: t('storeLedger.column.lineCount'), width: 100, align: 'right' },
  { prop: 'operatorName', label: t('storeLedger.column.operatorName'), width: 120, align: 'center' },
  { prop: 'checkTime', label: t('storeLedger.column.checkTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreLedgerList] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreLedgerQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      storeId: (searchModel.storeId as string) || undefined,
      ledgerDateFrom: (searchModel.ledgerDateFrom as string) || undefined,
      ledgerDateTo: (searchModel.ledgerDateTo as string) || undefined
    };
    const res = await listStoreLedger(query);
    const rows = (res.rows ?? res.data ?? []) as StoreLedgerHeaderVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: `${r.storeId}_${r.ledgerDate}` }));
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
function handleAddEntry() {
  router.push({ path: '/djs-store/store-mgmt/check-entry' });
}
function openDetail(row: BizRow) {
  const r = row as unknown as LedgerRow;
  detailRef.value?.open(String(r.storeId), String(r.ledgerDate));
}

onMounted(async () => {
  await loadStoreOptions();
  fetchList();
});
</script>
