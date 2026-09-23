<template>
  <div class="p-2">
    <!-- 顶部状态统计版块：五档计数，顺序按甲方点名的档位序（临近采摘期在最前） -->
    <div class="status-kpi-row">
      <el-card v-for="card in statusCards" :key="card.code" shadow="hover" class="status-kpi-card">
        <div class="status-kpi-label">{{ card.label }}</div>
        <div class="status-kpi-value">{{ card.value ?? '-' }}</div>
      </el-card>
    </div>

    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="1"
      :page-size="list.length || 10"
      row-key="rowKey"
      perm-prefix="djs:plant:pick"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    >
      <template #cell-cropImageUrl="{ row }">
        <ImagePreview
          v-if="row.cropImageUrl"
          :width="40"
          :height="40"
          :src="row.cropImageUrl"
          :preview-src-list="[row.cropImageUrl]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <!-- 作物采摘期状态：后端按最早/最晚采摘日期与当天现算，只回状态码，中文走 i18n；甲方点名「临近采摘期」（upcoming）用红字 -->
      <template #cell-pickStatus="{ row }">
        <span v-if="row.pickStatus" :class="{ 'pick-status-danger': row.pickStatus === 'upcoming' }">
          {{ t(`pickPlan.status.${row.pickStatus}`) }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #cell-totalAcreage="{ row }">{{ row.totalAcreage != null ? `${row.totalAcreage} 亩` : '-' }}</template>
      <template #cell-currentPlantedArea="{ row }">{{ row.currentPlantedArea != null ? `${row.currentPlantedArea} 亩` : '-' }}</template>
      <!-- row185：预计产量列展示已扣灾害损失的净值（后端 netExpectedYield = max(0, 预计产量 − 预计灾害损失量)）；
           后端无 netExpectedYield 时回退原 expectedYield，避免老数据空白 -->
      <template #cell-expectedYield="{ row }">{{
        (row.netExpectedYield ?? row.expectedYield) != null ? `${Number(row.netExpectedYield ?? row.expectedYield).toFixed(3)} kg` : '-'
      }}</template>
      <template #cell-actualYield="{ row }">{{ row.actualYield != null ? `${Number(row.actualYield).toFixed(3)} kg` : '-' }}</template>
      <template #cell-disasterLoss="{ row }">{{ row.disasterLoss != null ? `${Number(row.disasterLoss).toFixed(3)} kg` : '-' }}</template>
      <template #cell-activityPlotCount="{ row }">
        <el-tag v-if="row.activityPlotCount > 0" type="warning" size="small">{{ row.activityPlotCount }}</el-tag>
        <span v-else>-</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:pick:adjust']" link type="primary" size="small" @click="handleAdjust(row as PlanRow)">
          {{ t('pickPlan.action.adjust') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 采摘计划调整抽屉（§6.13：详情/录入走 drawer，不做整页路由页） -->
    <PickAdjustDrawer ref="adjustDrawerRef" />
  </div>
</template>

<script setup name="PickPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import PickAdjustDrawer from './components/PickAdjustDrawer.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { getPickPlanStatusStat, listPickPlan } from '@/api/djs-plant/pick';
import type { PickPlanGroupVO, PickPlanQuery } from '@/api/djs-plant/pick/types';
import type { DateWindowStatusCode, DateWindowStatusStatVO } from '@/api/djs-plant/common/types';
import { DATE_WINDOW_STATUS_ORDER, dateWindowStatCount, dateWindowStatusOptions } from '@/api/djs-plant/common/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const adjustDrawerRef = ref<InstanceType<typeof PickAdjustDrawer>>();

interface PlanRow extends PickPlanGroupVO {
  rowKey: string;
}

const list = ref<PlanRow[]>([]);
const total = ref(0);
const loading = ref(false);
const statusStat = ref<DateWindowStatusStatVO | null>(null);

const searchModel = reactive<Record<string, any>>({
  cropName: undefined,
  earliestRange: undefined,
  pickStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'cropName',
    label: t('pickPlan.field.cropName'),
    type: 'input',
    placeholder: t('pickPlan.placeholder.cropNameInput')
  },
  {
    field: 'earliestRange',
    label: t('pickPlan.column.planEarliest'),
    type: 'daterange'
  },
  {
    // 甲方原话「数据通过采摘列表里的状态进行去重加载」：只列当前结果集里真有数据的档（D-0104）。
    // 去重基准是统计版块那份计数，而它忽略状态条件本身 —— 所以选中一档后其余几档仍在，改选不会被锁死。
    field: 'pickStatus',
    label: t('pickPlan.field.pickStatus'),
    type: 'select',
    placeholder: t('pickPlan.placeholder.pickStatus'),
    options: dateWindowStatusOptions(statusStat.value, (code) => t(`pickPlan.status.${code}`))
  }
]);

/** 顶部统计卡：五档 label 直接复用状态 i18n，不另建一套文案。 */
const statusCards = computed<Array<{ code: DateWindowStatusCode; label: string; value: number | undefined }>>(() =>
  DATE_WINDOW_STATUS_ORDER.map((code) => ({
    code,
    label: t(`pickPlan.status.${code}`),
    value: dateWindowStatCount(statusStat.value, code)
  }))
);

// 列序：作物图片 / 作物名称 / 作物采摘期状态 / 最早开始 / 最晚截止 / 计划种植亩数 / 当前已种植亩数 /
// 预计产量 / 当年已采摘量 / 当年种植地块总数 / 预计灾害损失量 / 采摘活动地块数 / 操作
// 「作物采摘期状态」插在作物名称右侧（甲方截图里红框压在作物名称与最早采摘日期两列之间），不是放到表格最右
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropImageUrl', label: t('pickPlan.column.cropImage'), width: 80, align: 'center' },
  { prop: 'cropName', label: t('pickPlan.column.cropName'), minWidth: 120, showOverflowTooltip: true, align: 'center' },
  { prop: 'pickStatus', label: t('pickPlan.column.pickStatus'), minWidth: 140, align: 'center' },
  { prop: 'planEarliest', label: t('pickPlan.column.planEarliest'), minWidth: 120, align: 'center' },
  { prop: 'planLatest', label: t('pickPlan.column.planLatest'), minWidth: 120, align: 'center' },
  { prop: 'totalAcreage', label: t('pickPlan.column.planPlantArea'), minWidth: 130, align: 'center' },
  { prop: 'currentPlantedArea', label: t('pickPlan.column.currentPlantedArea'), minWidth: 140, align: 'center' },
  { prop: 'expectedYield', label: t('pickPlan.column.expectedYield'), minWidth: 120, align: 'center' },
  { prop: 'actualYield', label: t('pickPlan.column.actualYield'), minWidth: 130, align: 'center' },
  { prop: 'plotTotalCount', label: t('pickPlan.column.plotTotalCount'), minWidth: 130, align: 'center' },
  { prop: 'disasterLoss', label: t('pickPlan.column.disasterLoss'), minWidth: 130, align: 'center' },
  { prop: 'activityPlotCount', label: t('pickPlan.column.activityPlotCount'), minWidth: 120, align: 'center' }
]);

/** daterange 字段绑成 [start, end] 数组，拆成 beginEarliest / endEarliest 传后端。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

function buildQuery(): PickPlanQuery {
  const { begin, end } = rangeOf(searchModel.earliestRange);
  return {
    cropName: searchModel.cropName || undefined,
    beginEarliest: begin,
    endEarliest: end,
    pickStatus: (searchModel.pickStatus as DateWindowStatusCode | undefined) || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickPlan(buildQuery());
    // res.data 是 List<PickPlanGroupVO>（无分页）— 按作物纯聚合，rowKey = cropId
    const rows = (res.data || []) as PickPlanGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: String(r.cropId) }));
    total.value = list.value.length;
  } finally {
    loading.value = false;
  }
}

/** 统计卡：跟列表用同一套筛选条件（状态条件由后端忽略），所以换筛选时要一起刷。 */
async function loadStatusStat() {
  try {
    const res = await getPickPlanStatusStat(buildQuery());
    statusStat.value = res.data;
  } catch (e) {
    // 统计卡拿不到就显 '-'，不阻塞下方列表
    console.warn('[PickPlan] loadStatusStat failed', e);
    statusStat.value = null;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  loadList();
  loadStatusStat();
}

function handleReset() {
  searchModel.cropName = undefined;
  searchModel.earliestRange = undefined;
  searchModel.pickStatus = undefined;
  loadList();
  loadStatusStat();
}

function handleExport() {
  const { begin, end } = rangeOf(searchModel.earliestRange);
  proxy?.download(
    'djs/plant/pick/plan/export',
    {
      cropName: searchModel.cropName || undefined,
      beginEarliest: begin,
      endEarliest: end,
      pickStatus: searchModel.pickStatus || undefined
    },
    `pick_plan_${new Date().getTime()}.xlsx`
  );
}

function handleAdjust(row: PlanRow) {
  adjustDrawerRef.value?.open({ cropId: row.cropId, cropName: row.cropName });
}

onMounted(() => {
  loadList();
  loadStatusStat();
});
</script>

<style scoped>
.status-kpi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.status-kpi-card {
  /* 一行 5 个等宽：弹性增长 + min-width 触发换行（窄到放不下才换） */
  flex: 1 1 0;
  min-width: 150px;
  text-align: center;
}

.status-kpi-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.status-kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 甲方点名：临近采摘期（upcoming）用红色字体 */
.pick-status-danger {
  color: var(--el-color-danger);
}
</style>
