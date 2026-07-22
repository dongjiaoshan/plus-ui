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
import { listAllTeam } from '@/api/djs-plant/team';
import { listAllZone } from '@/api/djs-plant/zone';
import type { FarmRecordQuery, FarmRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * 农事记录页只列「农事」类（灾害记录 / 采摘活动有独立页，不在此页）。
 * 默认 farm_work_type 范围 = 全部农事类排除 disaster（灾害）+ harvest_activity（游客采摘活动）。
 * 顶部农事类型搜索下拉同此排除集（farmTypeOptions）；选中某类则收窄到该单类。
 * 注意：harvest（普通采收 is_pick=2，AppletPickServiceImpl 写入）属本页应显示的农事类，必须在默认集内，
 * 否则采收记录在不选筛选时列表 + 导出都看不到（与下拉可选集自相矛盾）。
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
  'pruning',
  'harvest'
];

const tableRef = ref<BizTableExpose>();
const list = ref<FarmRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const detailVisible = ref(false);
const currentId = ref<string>('');

const teamOptions = ref<Array<{ label: string; value: string }>>([]);
const zoneOptions = ref<Array<{ label: string; value: string }>>([]);

// 农事类型下拉（djs_farm_work_type 排除灾害 + 采摘活动 —— 这两类有独立页）
const { djs_farm_work_type } = toRefs<any>(proxy?.useDict('djs_farm_work_type'));
const farmTypeOptions = computed<Array<{ label: string; value: string }>>(() =>
  (djs_farm_work_type?.value ?? []).filter((d: any) => !EXCLUDED_WORK_TYPES.includes(d.value)).map((d: any) => ({ label: d.label, value: d.value }))
);

const searchModel = reactive<Record<string, any>>({
  farmType: undefined,
  farmDate: undefined,
  cropName: undefined,
  zoneId: undefined,
  plotCode: undefined,
  plotName: undefined,
  farmBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'farmType', label: t('plantWork.field.farmType'), type: 'select', options: farmTypeOptions.value },
  { field: 'farmDate', label: t('plantWork.field.dateRange'), type: 'daterange' },
  { field: 'cropName', label: t('plantWork.field.crop'), type: 'input' },
  { field: 'zoneId', label: t('plantWork.field.plotZone'), type: 'select', options: zoneOptions.value },
  { field: 'plotCode', label: t('plantWork.field.plotCode'), type: 'input' },
  { field: 'plotName', label: t('plantWork.field.plot'), type: 'input' },
  { field: 'farmBy', label: t('plantWork.field.team'), type: 'select', options: teamOptions.value }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'recordNo', label: t('plantWork.column.recordNo'), minWidth: 150, showOverflowTooltip: true },
  { prop: 'farmDate', label: t('plantWork.column.farmDate'), width: 120, align: 'center' },
  { prop: 'farmType', label: t('plantWork.column.farmType'), minWidth: 110, align: 'center', dictType: 'djs_farm_work_type' },
  // 地块所属片区（plotZoneName 由后端 enrichRefs 每行 enrich 返回），列在地块编号之前
  { prop: 'plotZoneName', label: t('plantWork.column.plotZone'), minWidth: 130, showOverflowTooltip: true },
  // 地块编号列对齐原型「地块编号」（如 A-D-001）；plotCode 由后端 FarmRecordsVo service enrich 返回
  { prop: 'plotCode', label: t('plantWork.column.plotCode'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'plotName', label: t('plantWork.column.plotName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'cropName', label: t('plantWork.column.cropName'), minWidth: 130, showOverflowTooltip: true },
  {
    prop: 'teamName',
    label: t('plantWork.column.teamName'),
    minWidth: 130,
    showOverflowTooltip: true,
    formatter: (row: BizRow) => {
      const r = row as unknown as { teamNames?: string[]; teamName?: string };
      return r.teamNames && r.teamNames.length ? r.teamNames.join('、') : (r.teamName ?? '-');
    }
  },
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
    cropName: searchModel.cropName || undefined,
    zoneId: searchModel.zoneId || undefined,
    plotCode: searchModel.plotCode || undefined,
    plotName: searchModel.plotName || undefined,
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

async function loadZoneOptions() {
  try {
    const res = await listAllZone();
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: string | number; zoneName: string }>;
    zoneOptions.value = rows.map((z) => ({ label: z.zoneName, value: String(z.id) }));
  } catch (e) {
    console.warn('[FarmRecord] listAllZone failed', e);
    zoneOptions.value = [];
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
      cropName: searchModel.cropName || undefined,
      zoneId: searchModel.zoneId || undefined,
      plotCode: searchModel.plotCode || undefined,
      plotName: searchModel.plotName || undefined,
      farmBy: searchModel.farmBy || undefined,
      farmDateBegin: Array.isArray(range) && range[0] ? range[0] : undefined,
      farmDateEnd: Array.isArray(range) && range[1] ? range[1] : undefined
    },
    `farm_records_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadTeamOptions();
  loadZoneOptions();
  fetchList();
});
</script>
