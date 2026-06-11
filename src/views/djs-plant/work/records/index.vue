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
      :dict-types="['djs_farm_work_type', 'djs_plot_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:plant:farm"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:farm:list']" link type="primary" @click="handleViewDetail(row)">
          {{ t('plantWork.action.detail') }}
        </el-button>
      </template>
      <template #empty>
        <el-empty :description="t('plantWork.empty')" :image-size="80" />
      </template>
    </BizTable>

    <RecordDetailDrawer v-model:visible="detailVisible" :id="currentId" />
  </div>
</template>

<script setup name="PlantFarmRecordsIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import RecordDetailDrawer from './components/RecordDetailDrawer.vue';
import { listFarmRecords } from '@/api/djs-plant/farm-records';
import { listPlot } from '@/api/djs-plant/plot';
import { listAllTeam } from '@/api/djs-plant/team';
import type { FarmRecordQuery, FarmRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * 农事记录页只列「农事」类（灾害记录 / 采摘活动有独立页，不在此页）。
 * 默认 farm_work_type 范围 = 全 12 类排除 disaster（灾害）+ harvest_activity（采摘活动）。
 * 顶部农事类型搜索下拉同此排除集；选中某类则收窄到该单类。
 */
const EXCLUDED_WORK_TYPES = ['disaster', 'harvest_activity'];
const DEFAULT_WORK_TYPES = [
  'tillage_break',
  'tillage_prepare',
  'rotation',
  'transplant',
  'water_fertilize',
  'irrigation',
  'fertilize',
  'weed',
  'pest_control',
  'pruning'
];

const tableRef = ref<BizTableExpose>();
const list = ref<FarmRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const detailVisible = ref(false);
const currentId = ref<string>('');

const plotOptions = ref<Array<{ label: string; value: string }>>([]);
const teamOptions = ref<Array<{ label: string; value: string }>>([]);

// 农事类型下拉（djs_farm_work_type 排除灾害 + 采摘活动 —— 这两类有独立页）
const { djs_farm_work_type } = toRefs<any>(proxy?.useDict('djs_farm_work_type'));
const farmTypeOptions = computed<Array<{ label: string; value: string }>>(() =>
  (djs_farm_work_type?.value ?? []).filter((d: any) => !EXCLUDED_WORK_TYPES.includes(d.value)).map((d: any) => ({ label: d.label, value: d.value }))
);

const searchModel = reactive<Record<string, any>>({
  farmType: undefined,
  farmDate: undefined,
  plotId: undefined,
  farmBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'farmType', label: t('plantWork.field.farmType'), type: 'select', options: farmTypeOptions.value },
  { field: 'farmDate', label: t('plantWork.field.dateRange'), type: 'daterange' },
  { field: 'plotId', label: t('plantWork.field.plot'), type: 'select', options: plotOptions.value },
  { field: 'farmBy', label: t('plantWork.field.team'), type: 'select', options: teamOptions.value }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'recordNo', label: t('plantWork.column.recordNo'), width: 150, showOverflowTooltip: true },
  { prop: 'farmDate', label: t('plantWork.column.farmDate'), width: 120, align: 'center' },
  { prop: 'farmType', label: t('plantWork.column.farmType'), width: 110, align: 'center', dictType: 'djs_farm_work_type' },
  { prop: 'plotName', label: t('plantWork.column.plotName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'cropName', label: t('plantWork.column.cropName'), width: 120, showOverflowTooltip: true },
  { prop: 'teamName', label: t('plantWork.column.teamName'), width: 120, showOverflowTooltip: true },
  { prop: 'remark', label: t('plantWork.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('plantWork.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

// 选了农事类型 → 单类；否则默认全部农事类（排除灾害 + 采摘活动）
function resolveWorkTypes(): string[] {
  return searchModel.farmType ? [searchModel.farmType] : DEFAULT_WORK_TYPES;
}

function buildQuery(): FarmRecordQuery {
  const range = searchModel.farmDate;
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    farmWorkTypes: resolveWorkTypes(),
    plotId: searchModel.plotId || undefined,
    farmBy: searchModel.farmBy || undefined,
    farmDateBegin: Array.isArray(range) && range[0] ? range[0] : undefined,
    farmDateEnd: Array.isArray(range) && range[1] ? range[1] : undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listFarmRecords(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as FarmRecordVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadPlotOptions() {
  try {
    const res = await listPlot({ pageNum: 1, pageSize: 999 });
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: string | number; plotName: string }>;
    plotOptions.value = rows.map((p) => ({ label: p.plotName, value: String(p.id) }));
  } catch (e) {
    console.warn('[FarmRecord] listPlot failed', e);
    plotOptions.value = [];
  }
}

async function loadTeamOptions() {
  try {
    const res = await listAllTeam();
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: string | number; teamName: string }>;
    teamOptions.value = rows.map((g) => ({ label: g.teamName, value: String(g.id) }));
  } catch (e) {
    console.warn('[FarmRecord] listAllTeam failed', e);
    teamOptions.value = [];
  }
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
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
function handleViewDetail(row: BizRow) {
  currentId.value = String(row.id);
  detailVisible.value = true;
}
function handleExport() {
  const range = searchModel.farmDate;
  proxy?.download(
    'djs/plant/farm/export',
    {
      farmWorkTypes: resolveWorkTypes(),
      plotId: searchModel.plotId || undefined,
      farmBy: searchModel.farmBy || undefined,
      farmDateBegin: Array.isArray(range) && range[0] ? range[0] : undefined,
      farmDateEnd: Array.isArray(range) && range[1] ? range[1] : undefined
    },
    `farm_records_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadPlotOptions();
  loadTeamOptions();
  fetchList();
});
</script>
