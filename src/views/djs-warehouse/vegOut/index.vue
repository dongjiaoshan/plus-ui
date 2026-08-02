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
      @search="handleSearch"
      @reset="handleReset"
      @add="handleCreate"
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
const detailRef = ref<{ open: (batchNo: string) => void }>();

const list = ref<VegOutBatchVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 出库日期默认查近一个月（甲方 row187 明确「默认为查询近一个月的数据」）。 */
function defaultDateRange(): string[] {
  const end = new Date();
  const begin = new Date();
  begin.setMonth(begin.getMonth() - 1);
  return [begin.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
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

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'outDate', label: t('vegOut.column.outDate'), width: 120, align: 'center', formatter: 'date' },
  { prop: 'outDest', label: t('vegOut.column.outDest'), minWidth: 130, align: 'center', dictType: 'djs_stock_out_dest' },
  { prop: 'productKinds', label: t('vegOut.column.productKinds'), width: 140, align: 'center' },
  {
    prop: 'totalWeight',
    label: t('vegOut.column.totalWeight'),
    width: 150,
    align: 'center',
    formatter: (row: BizRow) => fmtKg(row.totalWeight)
  },
  { prop: 'operatorName', label: t('vegOut.column.operator'), minWidth: 110, align: 'center' }
]);

function fmtKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${formatQtyByUnit(n, 'kg')}kg`;
}

/** daterange → 后端 beginDate / endDate；止端补 23:59:59 才包得住当天（后端用 ≤）。 */
function buildQuery(): VegOutQuery {
  const range = searchModel.outDate as string[] | undefined;
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    beginDate: Array.isArray(range) && range[0] ? `${range[0]} 00:00:00` : undefined,
    endDate: Array.isArray(range) && range[1] ? `${range[1]} 23:59:59` : undefined,
    outDest: searchModel.outDest || undefined,
    operatorId: searchModel.operatorId || undefined
  };
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
  detailRef.value?.open(row.batchNo);
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

onMounted(() => {
  loadOperators();
  fetchList();
});
</script>
