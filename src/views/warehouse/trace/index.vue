<template>
  <div class="p-2">
    <!-- 3 套按 code_type 分（tab 标签来自字典 djs_trace_code_type，礼盒 V1 置灰占位） -->
    <el-tabs v-model="activeType" class="trace-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-for="opt in codeTypeTabs" :key="opt.value" :label="opt.label" :name="opt.value" :disabled="opt.value === GIFT_TYPE" />
    </el-tabs>

    <!-- 礼盒 tab 占位（V1 预留，无数据无子码下钻） -->
    <el-alert v-if="activeType === GIFT_TYPE" :title="t('warehouseTrace.giftPlaceholder')" type="info" :closable="false" show-icon class="mb-2" />

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
      :selectable="true"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      :show-export="true"
      perm-prefix="djs:warehouse:trace"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <template #toolbar-extra>
        <el-button
          v-hasPermi="['djs:warehouse:trace:print']"
          type="primary"
          icon="Printer"
          :disabled="selectedIds.length === 0"
          :loading="printing"
          @click="handleBatchPrint"
        >
          {{ t('warehouseTrace.action.batchPrint') }}
        </el-button>
      </template>
      <template #cell-codeType="{ row }">
        <dict-tag :options="djs_trace_code_type" :value="row.codeType" />
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:trace:query']" link type="primary" icon="View" @click="openDetail(row)">
          {{ t('warehouseTrace.action.detail') }}
        </el-button>
        <el-button v-hasPermi="['djs:warehouse:trace:print']" link type="success" icon="Printer" @click="handleSinglePrint(row)">
          {{ t('warehouseTrace.action.print') }}
        </el-button>
      </template>
    </BizTable>

    <TraceDetailDrawer ref="detailRef" />
  </div>
</template>

<script setup name="WarehouseTrace" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import TraceDetailDrawer from './components/TraceDetailDrawer.vue';
import { listTrace, batchTraceDetail } from '@/api/warehouse/trace';
import type { TraceCodeQuery, TraceCodeVO } from '@/api/warehouse/trace/types';
import { buildTracePdf, type TracePdfLabels } from './utils/tracePdf';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_trace_code_type } = toRefs<any>(proxy?.useDict('djs_trace_code_type'));

/** 礼盒类型（V1 置灰占位，无数据无子码下钻）。 */
const GIFT_TYPE = 'gift';

const tableRef = ref<BizTableExpose>();
const detailRef = ref<{ open: (id: string) => void }>();

const list = ref<TraceCodeVO[]>([]);
const total = ref(0);
const loading = ref(false);
const printing = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const activeType = ref('pork');
const selectedIds = ref<string[]>([]);

/** tab 列表（字典 driven，不硬编码 tab 文案）；字典空时兜底 pork/veg/gift。 */
const codeTypeTabs = computed<Array<{ value: string; label: string }>>(() => {
  const opts = (djs_trace_code_type.value ?? []) as Array<{ value: string; label: string }>;
  if (opts.length) {
    return opts.map((o) => ({ value: o.value, label: o.label }));
  }
  return [
    { value: 'pork', label: t('warehouseTrace.tab.pork') },
    { value: 'veg', label: t('warehouseTrace.tab.veg') },
    { value: 'gift', label: t('warehouseTrace.tab.gift') }
  ];
});

const searchModel = reactive<Record<string, unknown>>({
  produceCode: undefined,
  productName: undefined,
  pigEarNo: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'produceCode', label: t('warehouseTrace.field.produceCode'), type: 'input' },
  { field: 'productName', label: t('warehouseTrace.field.productName'), type: 'input' },
  { field: 'pigEarNo', label: t('warehouseTrace.field.pigEarNo'), type: 'input' },
  { field: 'beginDate', label: t('warehouseTrace.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('warehouseTrace.field.endDate'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceCode', label: t('warehouseTrace.column.produceCode'), width: 200, showOverflowTooltip: true },
  { prop: 'codeType', label: t('warehouseTrace.column.codeType'), width: 90, align: 'center' },
  { prop: 'productName', label: t('warehouseTrace.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'pigEarNo', label: t('warehouseTrace.column.pigEarNo'), width: 130, showOverflowTooltip: true },
  { prop: 'storeName', label: t('warehouseTrace.column.storeName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'farmName', label: t('warehouseTrace.column.farmName'), width: 120, showOverflowTooltip: true },
  { prop: 'creatorName', label: t('warehouseTrace.column.creatorName'), width: 100, align: 'center' },
  { prop: 'createTime', label: t('warehouseTrace.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

function buildQuery(): TraceCodeQuery {
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    codeType: activeType.value,
    produceCode: (searchModel.produceCode as string) || undefined,
    productName: (searchModel.productName as string) || undefined,
    pigEarNo: (searchModel.pigEarNo as string) || undefined,
    beginDate: (searchModel.beginDate as string) || undefined,
    endDate: (searchModel.endDate as string) || undefined
  };
}

async function fetchList() {
  // 礼盒 tab V1 占位：不发请求，直接清空（无数据无子码下钻）
  if (activeType.value === GIFT_TYPE) {
    list.value = [];
    total.value = 0;
    selectedIds.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listTrace(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as TraceCodeVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  pageNum.value = 1;
  selectedIds.value = [];
  tableRef.value?.clearSelection();
  fetchList();
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
function handleSelectionChange(rows: BizRow[]) {
  selectedIds.value = rows.map((r) => String(r.id));
}
function handleExport(query?: Record<string, unknown>) {
  proxy?.download('djs/warehouse/trace/export', { ...buildQuery(), ...(query ?? {}) }, `trace_${activeType.value}_${new Date().getTime()}.xlsx`);
}
function openDetail(row: BizRow) {
  detailRef.value?.open(String(row.id));
}

function pdfLabels(): TracePdfLabels {
  return {
    title: t('warehouseTrace.pdf.title'),
    serialNo: t('warehouseTrace.pdf.serialNo'),
    produceCode: t('warehouseTrace.field.produceCode'),
    productName: t('warehouseTrace.field.productName'),
    productSpec: t('warehouseTrace.field.productSpec'),
    pigEarNo: t('warehouseTrace.field.pigEarNo'),
    plotName: t('warehouseTrace.field.plotName'),
    farmName: t('warehouseTrace.field.farmName'),
    storeName: t('warehouseTrace.field.storeName'),
    harvestDate: t('warehouseTrace.field.harvestDate'),
    fileName: `trace_print_${new Date().getTime()}.pdf`
  };
}

async function printByIds(ids: string[]) {
  if (ids.length === 0) {
    return;
  }
  printing.value = true;
  try {
    const res = await batchTraceDetail(ids);
    const codes = res.data ?? [];
    if (codes.length === 0) {
      proxy?.$modal.msgWarning(t('warehouseTrace.print.empty'));
      return;
    }
    await buildTracePdf(codes, pdfLabels());
  } catch (e) {
    console.error('[WarehouseTrace] batch print failed', e);
    proxy?.$modal.msgError(t('warehouseTrace.print.failed'));
  } finally {
    printing.value = false;
  }
}

function handleBatchPrint() {
  printByIds(selectedIds.value);
}
function handleSinglePrint(row: BizRow) {
  printByIds([String(row.id)]);
}

onMounted(() => fetchList());
// keep-alive 兜底：被缓存的页二次 activate 时重新拉数据（D12 afe67c5/7c6b1bc 同款 bug）
onActivated(() => fetchList());
</script>

<style lang="scss" scoped>
.trace-tabs {
  margin-bottom: 8px;
}
</style>
