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
      :dict-types="['djs_stock_out_dest']"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="120"
      row-key="batchNo"
      perm-prefix="djs:warehouse:vegOut"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @add="handleCreate"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button link type="primary" size="small" @click="handleDetail(row as VegOutBatchVO)">
          {{ t('vegOut.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <VegOutCreateDrawer ref="createRef" @success="fetchList" />
    <VegOutDetailDialog ref="detailRef" />
  </div>
</template>

<script setup name="VegOut" lang="ts">
import { todayYmd, ymdOf } from '@/utils/date';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import VegOutCreateDrawer from './components/VegOutCreateDrawer.vue';
import VegOutDetailDialog from './components/VegOutDetailDialog.vue';
import { listVegOutBatch } from '@/api/djs-warehouse/vegOut';
import type { VegOutBatchVO, VegOutQuery } from '@/api/djs-warehouse/vegOut/types';
import { listUser } from '@/api/system/user';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const createRef = ref<{ open: () => void }>();
const detailRef = ref<{ open: (row: VegOutBatchVO, destLabel: string) => void }>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

/** 出库去向 code → 中文（打印单「客户名称」用），未命中回落原 code。 */
function destLabel(code: string): string {
  return (djs_stock_out_dest.value ?? []).find((d: any) => d.value === code)?.label ?? code;
}

const list = ref<VegOutBatchVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 出库日期默认查近一个月（甲方 row187 明确「默认为查询近一个月的数据」）。按本地时区算，见 utils/date。 */
function defaultDateRange(): string[] {
  const begin = new Date();
  begin.setMonth(begin.getMonth() - 1);
  return [ymdOf(begin), todayYmd()];
}

const searchModel = reactive<Record<string, any>>({
  outDate: defaultDateRange(),
  outDest: undefined,
  operatorId: undefined
});

/** 操作人下拉（取系统用户，供按操作人筛） */
const operatorOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'outDate', label: t('vegOut.field.outDate'), type: 'daterange' },
  { field: 'outDest', label: t('vegOut.field.outDest'), type: 'select', dictType: 'djs_stock_out_dest', clearable: true },
  { field: 'operatorId', label: t('vegOut.field.operator'), type: 'select', options: operatorOptions.value, clearable: true }
]);

// row192：① 出库日期前加「出库单号」；② 出库重量后加「出库金额」；③ 各列同宽（统一 minWidth，
// el-table 按比例均分剩余宽度，不再混用 width/minWidth 导致宽窄不一）。
const COL_MIN_WIDTH = 130;
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'batchNo', label: t('vegOut.column.batchNo'), minWidth: COL_MIN_WIDTH, align: 'center' },
  { prop: 'outDate', label: t('vegOut.column.outDate'), minWidth: COL_MIN_WIDTH, align: 'center', formatter: 'date' },
  { prop: 'outDest', label: t('vegOut.column.outDest'), minWidth: COL_MIN_WIDTH, align: 'center', dictType: 'djs_stock_out_dest' },
  { prop: 'productKinds', label: t('vegOut.column.productKinds'), minWidth: COL_MIN_WIDTH, align: 'center' },
  {
    prop: 'totalWeight',
    label: t('vegOut.column.totalWeight'),
    minWidth: COL_MIN_WIDTH,
    align: 'center',
    formatter: (row: BizRow) => fmtKg(row.totalWeight)
  },
  {
    prop: 'totalAmount',
    label: t('vegOut.column.totalAmount'),
    minWidth: COL_MIN_WIDTH,
    align: 'center',
    formatter: (row: BizRow) => fmtMoney(row.totalAmount)
  },
  { prop: 'operatorName', label: t('vegOut.column.operator'), minWidth: COL_MIN_WIDTH, align: 'center' }
]);

/** 金额展示：后端 BigDecimal 序列化成 string，统一 Number 强转保两位小数 + ¥ 前缀。 */
function fmtMoney(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `¥${n.toFixed(2)}`;
}

function fmtKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${formatQtyByUnit(n, 'kg')}kg`;
}

/**
 * 搜索条件（不含分页）：daterange → 后端 beginDate / endDate；
 * 止端补 23:59:59 才包得住当天（后端用 ≤）。
 */
function buildFilter(): Omit<VegOutQuery, 'pageNum' | 'pageSize'> {
  const range = searchModel.outDate as string[] | undefined;
  return {
    beginDate: Array.isArray(range) && range[0] ? `${range[0]} 00:00:00` : undefined,
    endDate: Array.isArray(range) && range[1] ? `${range[1]} 23:59:59` : undefined,
    outDest: searchModel.outDest || undefined,
    operatorId: searchModel.operatorId || undefined
  };
}

function buildQuery(): VegOutQuery {
  return { pageNum: pageNum.value, pageSize: pageSize.value, ...buildFilter() };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listVegOutBatch(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as VegOutBatchVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadOperators() {
  try {
    const res: any = await listUser({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ userId: string | number; nickName: string }>;
    operatorOptions.value = rows.map((u) => ({ label: u.nickName, value: u.userId }));
  } catch {
    operatorOptions.value = [];
  }
}

function handleCreate() {
  createRef.value?.open();
}

function handleDetail(row: VegOutBatchVO) {
  detailRef.value?.open(row, destLabel(row.outDest));
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}

function handleReset() {
  Object.assign(searchModel, { outDate: defaultDateRange(), outDest: undefined, operatorId: undefined });
  pageNum.value = 1;
  fetchList();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}

/**
 * V6 row31：按当前筛选条件导出出库单列表（全量，不受分页影响）。
 *
 * 用 buildFilter() 而不是 BizTable 透传的表单快照：导出必须跟屏幕上这张表严格对得上
 * （甲方拿它对账），而表格数据来自最后一次「搜索」应用的 searchModel。
 */
function handleExport() {
  proxy?.download('djs/warehouse/veg-out/export', { ...buildFilter() }, `${t('vegOut.pageTitle')}_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadOperators();
  fetchList();
});
</script>
