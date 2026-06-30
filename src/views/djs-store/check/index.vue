<template>
  <div class="p-2">
    <!-- 门店盘点列表（盘点单 = 门店 + 盘点日期）。点查看详情开只读抽屉；新增当日盘点开宽抽屉录入 -->
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

    <!-- 门店由顶部全局选择器（StoreSwitcher）统一控制，作为 prop 固定传入新增抽屉 -->
    <CheckEntryDrawer ref="entryRef" :store-id="currentStoreId || ''" @saved="fetchList" />
    <CheckDetailDrawer ref="detailRef" />
  </div>
</template>

<script setup name="StoreCheckList" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import CheckEntryDrawer from './CheckEntryDrawer.vue';
import CheckDetailDrawer from './CheckDetailDrawer.vue';
import { listStoreLedger } from '@/api/djs-store/ledger';
import type { StoreLedgerHeaderVO, StoreLedgerQuery } from '@/api/djs-store/ledger/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const storeContext = useStoreContextStore();
// 当前门店来自顶部全局选择器（StoreSwitcher），切换由 navbar 统一控制
const { currentStoreId } = storeToRefs(storeContext);

interface LedgerRow extends StoreLedgerHeaderVO {
  rowKey: string;
}

const tableRef = ref<BizTableExpose>();
const entryRef = ref<{ open: () => void }>();
const detailRef = ref<{ open: (storeId: string, ledgerDate: string) => void }>();

const list = ref<LedgerRow[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// docx：盘点列表默认仅展示当日盘点数据（用户可手动改期/清空看历史）。
const todayStr = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const searchModel = reactive<Record<string, unknown>>({
  ledgerDate: todayStr()
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'ledgerDate', label: t('storeLedger.column.ledgerDate'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'ledgerDate', label: t('storeLedger.column.ledgerDate'), width: 160, align: 'center' },
  { prop: 'operatorName', label: t('storeLedger.column.operatorName'), minWidth: 140, align: 'center' },
  { prop: 'checkTime', label: t('storeLedger.column.checkTime'), width: 180, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreLedgerQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ledgerDate: (searchModel.ledgerDate as string) || undefined
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
  entryRef.value?.open();
}
function openDetail(row: BizRow) {
  const r = row as unknown as LedgerRow;
  detailRef.value?.open(String(r.storeId), String(r.ledgerDate));
}

onMounted(() => {
  fetchList();
});
</script>
