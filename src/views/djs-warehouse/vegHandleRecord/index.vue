<template>
  <div class="p-2">
    <BizTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      :dict-types="['djs_pick_dest']"
      perm-prefix="djs:warehouse:vegHandleRecord"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup name="VegHandleRecordIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listVegHandleRecord } from '@/api/djs-warehouse/vegHandleRecord';
import type { VegHandleRecordQuery, VegHandleRecordVO } from '@/api/djs-warehouse/vegHandleRecord/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const list = ref<VegHandleRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 统计来源筛选下拉：1=毛菜处理间 2=采摘活动（与「采摘明细」页同码值）。 */
const statSourceOptions = computed<Array<{ label: string; value: string }>>(() => [
  { label: t('vegHandleRecord.option.statSourceVeg'), value: '1' },
  { label: t('vegHandleRecord.option.statSourceActivity'), value: '2' }
]);

/** 统计来源 code → 中文文案。 */
function statSourceLabel(v: unknown): string {
  const code = v != null ? String(v) : '';
  const hit = statSourceOptions.value.find((it) => it.value === code);
  return hit ? hit.label : '-';
}

const searchModel = reactive<Record<string, unknown>>({
  handleDateRange: undefined,
  cropName: undefined,
  statSource: undefined,
  handleMethod: undefined,
  plotCode: undefined,
  recorderName: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'handleDateRange', label: t('vegHandleRecord.field.handleDate'), type: 'daterange' },
  { field: 'cropName', label: t('vegHandleRecord.field.cropName'), type: 'input', placeholder: t('vegHandleRecord.placeholder.cropName') },
  {
    field: 'statSource',
    label: t('vegHandleRecord.field.statSource'),
    type: 'select',
    clearable: true,
    options: statSourceOptions.value,
    placeholder: t('vegHandleRecord.placeholder.statSource')
  },
  {
    field: 'handleMethod',
    label: t('vegHandleRecord.field.handleMethod'),
    type: 'select',
    clearable: true,
    dictType: 'djs_pick_dest',
    placeholder: t('vegHandleRecord.placeholder.handleMethod')
  },
  { field: 'plotCode', label: t('vegHandleRecord.field.plotCode'), type: 'input', placeholder: t('vegHandleRecord.placeholder.plotCode') },
  { field: 'recorderName', label: t('vegHandleRecord.field.recorder'), type: 'input', placeholder: t('vegHandleRecord.placeholder.recorder') }
]);

const columns = computed<BizTableColumn[]>(() => [
  {
    prop: 'handleDate',
    label: t('vegHandleRecord.column.handleDate'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.handleDate != null && r.handleDate !== '' ? String(r.handleDate) : '-')
  },
  {
    prop: 'cropName',
    label: t('vegHandleRecord.column.cropName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.cropName != null && r.cropName !== '' ? String(r.cropName) : '-')
  },
  {
    // V6 row49：产品名称紧跟作物名称右侧。结算损耗行 / 采摘活动行无产品维度，显 '-'
    prop: 'productName',
    label: t('vegHandleRecord.column.productName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.productName != null && r.productName !== '' ? String(r.productName) : '-')
  },
  {
    prop: 'statSource',
    label: t('vegHandleRecord.column.statSource'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => statSourceLabel(r.statSource)
  },
  {
    prop: 'handleMethod',
    label: t('vegHandleRecord.column.handleMethod'),
    minWidth: 120,
    align: 'center',
    dictType: 'djs_pick_dest'
  },
  {
    prop: 'plotCode',
    label: t('vegHandleRecord.column.plotCode'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.plotCode != null && r.plotCode !== '' ? String(r.plotCode) : '-')
  },
  {
    prop: 'handleWeight',
    label: t('vegHandleRecord.column.handleWeight'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.handleWeight != null ? `${Number(r.handleWeight).toFixed(3)} ${t('vegHandleRecord.unit.kg')}` : '-')
  },
  {
    prop: 'recorderName',
    label: t('vegHandleRecord.column.recorder'),
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.recorderName != null && r.recorderName !== '' ? String(r.recorderName) : '-')
  }
]);

/** daterange 字段绑成 [start, end] 数组，拆成 dateFrom / dateTo 传后端。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

/** 搜索条件（不含分页），列表与导出共用。 */
function buildFilter(): VegHandleRecordQuery {
  const { begin, end } = rangeOf(searchModel.handleDateRange);
  return {
    dateFrom: begin,
    dateTo: end,
    cropName: (searchModel.cropName as string | undefined) || undefined,
    statSource: (searchModel.statSource as string | undefined) || undefined,
    handleMethod: (searchModel.handleMethod as string | undefined) || undefined,
    plotCode: (searchModel.plotCode as string | undefined) || undefined,
    recorderName: (searchModel.recorderName as string | undefined) || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listVegHandleRecord({ ...buildFilter(), pageNum: pageNum.value, pageSize: pageSize.value });
    const r = res as unknown as { rows?: VegHandleRecordVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
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
  proxy?.download('djs/warehouse/vegHandleRecord/export', { ...buildFilter() }, `${t('vegHandleRecord.pageTitle')}_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
