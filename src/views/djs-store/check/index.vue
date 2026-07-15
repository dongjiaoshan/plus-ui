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
      :action-min-width="160"
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
        <!-- 操作两个按钮不换行：整块 nowrap，配合 action-min-width 让操作列与数据列等宽分配 -->
        <div class="action-cell">
          <el-button v-hasPermi="['djs:store:check:query']" link type="primary" icon="View" @click="openDetail(row)">
            {{ t('storeLedger.action.detail') }}
          </el-button>
          <el-button v-hasPermi="['djs:store:check:add']" link type="primary" icon="Edit" @click="openEdit(row)">
            {{ t('storeLedger.action.edit') }}
          </el-button>
        </div>
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
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storeContext = useStoreContextStore();
// 当前门店来自顶部全局选择器（StoreSwitcher），切换由 navbar 统一控制
const { currentStoreId } = storeToRefs(storeContext);

interface LedgerRow extends StoreLedgerHeaderVO {
  rowKey: string;
}

const tableRef = ref<BizTableExpose>();
const entryRef = ref<{ open: (editCtx?: { ledgerDate: string }) => void }>();
const detailRef = ref<{ open: (storeId: string, ledgerDate: string) => void }>();

const list = ref<LedgerRow[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 盘点日期改为日期范围搜索，默认近 10 天（含今天，共 10 天）。
const fmtDate = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const defaultDateRange = (): [string, string] => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 9);
  return [fmtDate(start), fmtDate(end)];
};

const searchModel = reactive<Record<string, unknown>>({
  ledgerRange: defaultDateRange()
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'ledgerRange', label: t('storeLedger.column.ledgerDate'), type: 'daterange' }
]);

// 三列等宽：统一用 minWidth 让 el-table 均分表格剩余宽度，避免某列（盘点人）被拉伸得过宽。
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'ledgerDate', label: t('storeLedger.column.ledgerDate'), minWidth: 160, align: 'center' },
  { prop: 'operatorName', label: t('storeLedger.column.operatorName'), minWidth: 160, align: 'center' },
  { prop: 'checkTime', label: t('storeLedger.column.checkTime'), minWidth: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    // daterange 回写 [from, to]（YYYY-MM-DD），拆成后端已支持的 ledgerDateFrom / ledgerDateTo。
    const range = searchModel.ledgerRange as [string, string] | undefined;
    const query: StoreLedgerQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ledgerDateFrom: range?.[0] || undefined,
      ledgerDateTo: range?.[1] || undefined
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
// 新增当日盘点前先校验：当前门店今天已有盘点记录则拦截（DENGBO-R13：同一天不能重复盘点，改用「修改」更正）。
async function handleAddEntry() {
  if (currentStoreId.value) {
    const today = fmtDate(new Date());
    const res = await listStoreLedger({
      storeId: currentStoreId.value,
      ledgerDateFrom: today,
      ledgerDateTo: today,
      pageNum: 1,
      pageSize: 1
    });
    const existRows = (res.rows ?? res.data ?? []) as StoreLedgerHeaderVO[];
    if ((res.total ?? existRows.length) > 0) {
      proxy?.$modal.msgWarning(t('storeLedger.action.todayExists'));
      return;
    }
  }
  entryRef.value?.open();
}
function openDetail(row: BizRow) {
  const r = row as unknown as LedgerRow;
  detailRef.value?.open(String(r.storeId), String(r.ledgerDate));
}
// 修改：对已盘记录更正（DENGBO-R13），开抽屉锁定该盘点日期、叠加已保存值。
function openEdit(row: BizRow) {
  const r = row as unknown as LedgerRow;
  entryRef.value?.open({ ledgerDate: String(r.ledgerDate) });
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
/* 操作列两个按钮同一行不换行 */
.action-cell {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
</style>
