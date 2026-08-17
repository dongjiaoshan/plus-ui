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
      perm-prefix="djs:plant:pick:detail"
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

<script setup name="PickDetailIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPickDetail } from '@/api/djs-warehouse/vegHandle';
import type { PickDetailQuery, PickDetailVO } from '@/api/djs-warehouse/vegHandle/types';
import { listAllTeam } from '@/api/djs-plant/team';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PickDetailVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 采摘班组筛选下拉数据。 */
const teamOptions = ref<Array<{ label: string; value: string | number }>>([]);

/** 统计来源筛选下拉：1=毛菜处理间 2=采摘活动（row44）。 */
const statSourceOptions = computed<Array<{ label: string; value: string }>>(() => [
  { label: t('pickDetail.option.statSourceVeg'), value: '1' },
  { label: t('pickDetail.option.statSourceActivity'), value: '2' }
]);

/** 统计来源 code → 中文文案。 */
function statSourceLabel(v: unknown): string {
  const code = v != null ? String(v) : '';
  const hit = statSourceOptions.value.find((it) => it.value === code);
  return hit ? hit.label : '-';
}

const searchModel = reactive<Record<string, unknown>>({
  pickDateRange: undefined,
  cropName: undefined,
  teamId: undefined,
  statSource: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'pickDateRange', label: t('pickDetail.field.pickDate'), type: 'daterange' },
  { field: 'cropName', label: t('pickDetail.field.cropName'), type: 'input', placeholder: t('pickDetail.placeholder.cropName') },
  { field: 'statSource', label: t('pickDetail.column.statSource'), type: 'select', clearable: true, options: statSourceOptions.value, placeholder: t('pickDetail.placeholder.statSource') },
  { field: 'teamId', label: t('pickDetail.field.team'), type: 'select', clearable: true, options: teamOptions.value, placeholder: t('pickDetail.placeholder.team') }
]);

const columns = computed<BizTableColumn[]>(() => [
  {
    prop: 'pickDate',
    label: t('pickDetail.column.pickDate'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.pickDate != null ? String(r.pickDate) : '-')
  },
  {
    prop: 'cropName',
    label: t('pickDetail.column.cropName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.cropName != null && r.cropName !== '' ? String(r.cropName) : '-')
  },
  {
    // V6 row19：作物右边跟产品名 = 该条毛菜间过磅记录选定的产品；采摘活动来源没有产品维度，显 '-'
    prop: 'productName',
    label: t('pickDetail.column.productName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.productName != null && r.productName !== '' ? String(r.productName) : '-')
  },
  {
    prop: 'statSource',
    label: t('pickDetail.column.statSource'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => statSourceLabel(r.statSource)
  },
  {
    prop: 'plotCode',
    label: t('pickDetail.column.plotCode'),
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.plotCode != null && r.plotCode !== '' ? String(r.plotCode) : '-')
  },
  {
    prop: 'pickWeight',
    label: t('pickDetail.column.pickWeight'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.pickWeight != null ? `${Number(r.pickWeight).toFixed(3)} ${t('pickDetail.unit.kg')}` : '-')
  },
  {
    // V6 row106：采摘量右边跟录入时填的绩效百分比；采摘活动来源没有这个维度，显 '-'
    prop: 'perfPercent',
    label: t('pickDetail.column.perfPercent'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => (r.perfPercent != null ? `${Number(r.perfPercent)}%` : '-')
  },
  {
    prop: 'remark',
    label: t('pickDetail.column.remark'),
    minWidth: 150,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.remark != null && r.remark !== '' ? String(r.remark) : '-')
  },
  {
    prop: 'teamName',
    label: t('pickDetail.column.teamName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => (r.teamName != null && r.teamName !== '' ? String(r.teamName) : '-')
  }
]);

/** daterange 字段绑成 [start, end] 数组，拆成 pickDateBegin / pickDateEnd 传后端。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

function buildQuery(): PickDetailQuery {
  const { begin, end } = rangeOf(searchModel.pickDateRange);
  return {
    pickDateBegin: begin,
    pickDateEnd: end,
    cropName: (searchModel.cropName as string | undefined) || undefined,
    teamId: (searchModel.teamId as string | number | undefined) ?? undefined,
    statSource: (searchModel.statSource as string | undefined) || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickDetail(buildQuery());
    const r = res as unknown as { rows?: PickDetailVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  const teamRes = await listAllTeam();
  teamOptions.value = (teamRes.data || []).map((it) => ({ label: it.teamName, value: it.id }));
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
  const { begin, end } = rangeOf(searchModel.pickDateRange);
  proxy?.download(
    'djs/warehouse/vegHandle/pickDetail/export',
    {
      pickDateBegin: begin,
      pickDateEnd: end,
      cropName: (searchModel.cropName as string | undefined) || undefined,
      teamId: (searchModel.teamId as string | number | undefined) ?? undefined,
      statSource: (searchModel.statSource as string | undefined) || undefined
    },
    `${t('pickDetail.pageTitle')}_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadOptions();
  loadList();
});
</script>
