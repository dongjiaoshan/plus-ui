<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="farm-records-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="t(tab.labelKey)" :name="tab.name" />
    </el-tabs>

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
 * 5 Tab 与 farm_work_type 字典值分组（互斥，覆盖全 12 类）。
 *
 * 不直接按 entity 的 farm_type 阶段（empty/grow/disaster）切，因 grow 阶段同时含多类农事；
 * 改按 farm_work_type 12 类字典分 5 大组（PLT-WORK-002 prompt §1.1 推荐方案 a，见 _open-issues PLT-WORK-002-A）。
 */
const TAB_WORK_TYPES: Record<string, string[]> = {
  tillage: ['tillage_break', 'tillage_prepare', 'rotation', 'transplant', 'harvest_activity'],
  irrigate: ['irrigation', 'water_fertilize'],
  fertilize: ['fertilize'],
  weed: ['weed', 'pest_control', 'pruning'],
  disaster: ['disaster']
};

const tabs = [
  { name: 'tillage', labelKey: 'plantWork.tab.tillage' },
  { name: 'irrigate', labelKey: 'plantWork.tab.irrigate' },
  { name: 'fertilize', labelKey: 'plantWork.tab.fertilize' },
  { name: 'weed', labelKey: 'plantWork.tab.weed' },
  { name: 'disaster', labelKey: 'plantWork.tab.disaster' }
];

const activeTab = ref('tillage');

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

const searchModel = reactive<Record<string, any>>({
  recordNo: undefined,
  farmDate: undefined,
  plotId: undefined,
  farmBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'recordNo', label: t('plantWork.field.recordNo'), type: 'input' },
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

function buildQuery(): FarmRecordQuery {
  const range = searchModel.farmDate;
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    farmWorkTypes: TAB_WORK_TYPES[activeTab.value],
    recordNo: searchModel.recordNo || undefined,
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

function handleTabChange() {
  pageNum.value = 1;
  fetchList();
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
      farmWorkTypes: TAB_WORK_TYPES[activeTab.value],
      recordNo: searchModel.recordNo || undefined,
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
