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
      :dict-types="['djs_disaster_type', 'djs_plot_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:plant:farm:disaster"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-isWarning="{ row }">
        <el-tag v-if="row.isWarning === 1" type="danger" effect="dark">{{ t('plantDisaster.tag.warning') }}</el-tag>
        <el-tag v-else type="info">{{ t('plantDisaster.tag.normal') }}</el-tag>
      </template>
      <template #cell-lossRate="{ row }">
        <span>{{ row.lossRate != null ? `${row.lossRate}%` : '-' }}</span>
      </template>
      <template #cell-lossYield="{ row }">
        <span>{{ row.lossYield != null ? `${row.lossYield} kg` : '-' }}</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:farm:disaster:list']" link type="primary" @click="handleViewDetail(row)">
          {{ t('plantDisaster.action.detail') }}
        </el-button>
      </template>
      <template #empty>
        <el-empty :description="t('plantDisaster.empty')" :image-size="80" />
      </template>
    </BizTable>

    <DisasterDetailDrawer v-model:visible="detailVisible" :id="currentId" />
  </div>
</template>

<script setup name="PlantDisasterIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DisasterDetailDrawer from './components/DisasterDetailDrawer.vue';
import { listDisaster } from '@/api/djs-plant/farm-records';
import { listPlot } from '@/api/djs-plant/plot';
import { listAllTeam } from '@/api/djs-plant/team';
import type { DisasterRecordQuery, DisasterRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const list = ref<DisasterRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const detailVisible = ref(false);
const currentId = ref<string>('');

const plotOptions = ref<Array<{ label: string; value: string }>>([]);
const teamOptions = ref<Array<{ label: string; value: string }>>([]);

const searchModel = reactive<Record<string, any>>({
  farmDate: undefined,
  plotId: undefined,
  disasterType: undefined,
  cropName: undefined,
  farmBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'farmDate', label: t('plantDisaster.field.dateRange'), type: 'daterange' },
  { field: 'plotId', label: t('plantDisaster.field.plot'), type: 'select', options: plotOptions.value },
  { field: 'cropName', label: t('plantDisaster.field.crop'), type: 'input', placeholder: t('plantDisaster.placeholder.crop') },
  { field: 'disasterType', label: t('plantDisaster.field.disasterType'), type: 'select', dictType: 'djs_disaster_type' },
  // 记录班组：复用 listAllTeam（参照 records 页 farmBy）；后端 FarmRecordsQuery.farmBy 已支持 eq 过滤
  { field: 'farmBy', label: t('plantDisaster.field.team'), type: 'select', options: teamOptions.value, placeholder: t('plantDisaster.placeholder.team') }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'recordNo', label: t('plantDisaster.column.recordNo'), width: 150, showOverflowTooltip: true },
  { prop: 'farmDate', label: t('plantDisaster.column.farmDate'), width: 120, align: 'center' },
  { prop: 'disasterType', label: t('plantDisaster.column.disasterType'), width: 100, align: 'center', dictType: 'djs_disaster_type' },
  // 地块编号列对齐原型「地块编号」（如 A-D-001）；plotCode 由后端 FarmRecordsVo service enrich 返回
  { prop: 'plotCode', label: t('plantDisaster.column.plotCode'), width: 120, showOverflowTooltip: true },
  { prop: 'plotName', label: t('plantDisaster.column.plotName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'cropName', label: t('plantDisaster.column.cropName'), width: 120, showOverflowTooltip: true },
  { prop: 'lossRate', label: t('plantDisaster.column.lossRate'), width: 100, align: 'right' },
  { prop: 'lossYield', label: t('plantDisaster.column.lossYield'), width: 120, align: 'right' },
  { prop: 'isWarning', label: t('plantDisaster.column.isWarning'), width: 90, align: 'center' },
  { prop: 'teamName', label: t('plantDisaster.column.teamName'), width: 120, showOverflowTooltip: true },
  { prop: 'createTime', label: t('plantDisaster.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

function buildQuery(): DisasterRecordQuery {
  const range = searchModel.farmDate;
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    plotId: searchModel.plotId || undefined,
    disasterType: searchModel.disasterType || undefined,
    // cropName 文本筛选：后端 FarmRecordsQuery 目前仅支持 cropId(eq)，缺 crop_name like —— 见 _open-issues 后端依赖项，
    // 后端补 crop_name like 过滤前此参数不生效（已传不影响其余筛选）。
    cropName: searchModel.cropName || undefined,
    farmBy: searchModel.farmBy ? Number(searchModel.farmBy) : undefined,
    farmDateBegin: Array.isArray(range) && range[0] ? range[0] : undefined,
    farmDateEnd: Array.isArray(range) && range[1] ? range[1] : undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listDisaster(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as DisasterRecordVO[];
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
    console.warn('[Disaster] listPlot failed', e);
    plotOptions.value = [];
  }
}

async function loadTeamOptions() {
  try {
    const res = await listAllTeam();
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: string | number; teamName: string }>;
    teamOptions.value = rows.map((g) => ({ label: g.teamName, value: String(g.id) }));
  } catch (e) {
    console.warn('[Disaster] listAllTeam failed', e);
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
    'djs/plant/farm/disaster/export',
    {
      plotId: searchModel.plotId || undefined,
      disasterType: searchModel.disasterType || undefined,
      cropName: searchModel.cropName || undefined,
      farmBy: searchModel.farmBy ? Number(searchModel.farmBy) : undefined,
      farmDateBegin: Array.isArray(range) && range[0] ? range[0] : undefined,
      farmDateEnd: Array.isArray(range) && range[1] ? range[1] : undefined
    },
    `disaster_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadPlotOptions();
  loadTeamOptions();
  fetchList();
});
</script>
