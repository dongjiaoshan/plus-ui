<template>
  <div class="p-2">
    <!-- 顶部 5 KPI 统计卡（FIX-PLT-AD-PLAN-001，对齐原型 7b44cd24）；flex 等宽一行 5 个，窄到放不下才换行 -->
    <div class="plan-kpi-row">
      <el-card v-for="kpi in kpiCards" :key="kpi.key" shadow="hover" class="plan-kpi-card">
        <div class="plan-kpi-label">{{ kpi.label }}</div>
        <div class="plan-kpi-value">{{ kpi.value }}</div>
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
      :dict-types="['djs_plant_plan_status', 'djs_planting_season']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      show-export
      :show-batch-del="false"
      perm-prefix="djs:plant:plan"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDelOne"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 种植图片缩略图 -->
      <template #cell-cropImage="{ row }">
        <el-image
          v-if="row.cropImage"
          :src="row.cropImage"
          :preview-src-list="[row.cropImage]"
          :preview-teleported="true"
          fit="cover"
          class="plan-crop-thumb"
        />
        <span v-else>-</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:plan:list']" link type="primary" size="small" @click="handleDetail(row)">
          {{ t('plantPlan.action.detail') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:plan:remove']" link type="danger" size="small" icon="Delete" @click="handleDelOne(row)" />
      </template>
    </BizTable>
  </div>
</template>

<script setup name="PlantPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { delPlan, listPlan, getPlanStats } from '@/api/djs-plant/plan';
import type { PlantPlanQuery, PlantPlanStatsVO, PlantPlanVO } from '@/api/djs-plant/plan/types';
import { PLAN_BASE } from './route';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PlantPlanVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// ---- 顶部 KPI ----
const stats = ref<PlantPlanStatsVO>({});
const kpiCards = computed(() => [
  { key: 'idlePlot', label: t('plantPlan.kpi.idlePlot'), value: stats.value.idlePlot ?? '-' },
  { key: 'plantedPlot', label: t('plantPlan.kpi.plantedPlot'), value: stats.value.plantedPlot ?? '-' },
  { key: 'plannedPlot', label: t('plantPlan.kpi.plannedPlot'), value: stats.value.plannedPlot ?? '-' },
  { key: 'plotUsageFreq', label: t('plantPlan.kpi.plotUsageFreq'), value: stats.value.plotUsageFreq ?? '-' },
  { key: 'cropVarietyCount', label: t('plantPlan.kpi.cropVarietyCount'), value: stats.value.cropVarietyCount ?? '-' }
]);

// ---- 筛选：原型 4 项（计划日期 / 种植农作物 / 计划更新时间 / 计划编制人） ----
// 农作物 / 计划编制人改为输入框模糊查询（cropName / queryCreateByName）。
const searchModel = reactive<Record<string, unknown>>({
  planYear: undefined,
  planDate: undefined,
  cropName: undefined,
  queryUpdateTime: undefined,
  queryCreateByName: undefined
});

// 计划年份下拉：当前年向前 5 年 + 向后 1 年
const planYearOptions = computed(() => {
  const now = new Date().getFullYear();
  const years: Array<{ label: string; value: number }> = [];
  for (let y = now + 1; y >= now - 5; y--) {
    years.push({ label: String(y), value: y });
  }
  return years;
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'planYear', label: t('plantPlan.column.planYear'), type: 'select', placeholder: t('plantPlan.placeholder.planYear'), options: planYearOptions.value, width: 160 },
  { field: 'planDate', label: t('plantPlan.field.planDate'), type: 'daterange', placeholder: t('plantPlan.placeholder.planDateFilter'), width: 240 },
  { field: 'cropName', label: t('plantPlan.field.crop'), type: 'input', placeholder: t('plantPlan.placeholder.cropNameInput'), width: 160 },
  { field: 'queryUpdateTime', label: t('plantPlan.field.updateTime'), type: 'date', placeholder: t('plantPlan.placeholder.updateTime'), width: 160 },
  { field: 'queryCreateByName', label: t('plantPlan.field.createBy'), type: 'input', placeholder: t('plantPlan.placeholder.createByInput'), width: 160 }
]);

// ---- 列：原型 14 列序（去首列 planNo + plantDate 文本列；最早/最晚改取开始日期；时间列用 updateTime） ----
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'planYear', label: t('plantPlan.column.planYear'), minWidth: 90, align: 'center' },
  { prop: 'earliestBegindate', label: t('plantPlan.column.earliestBegindate'), minWidth: 130, align: 'center' },
  { prop: 'lastBegindate', label: t('plantPlan.column.lastBegindate'), minWidth: 130, align: 'center' },
  { prop: 'cropImage', label: t('plantPlan.column.cropImage'), width: 90, align: 'center' },
  { prop: 'cropName', label: t('plantPlan.column.crop'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  {
    prop: 'totalPlot',
    label: t('plantPlan.column.totalPlot'),
    minWidth: 110,
    align: 'center',
    formatter: (r: BizRow) => (r.totalPlot != null ? String(r.totalPlot) : '-')
  },
  {
    prop: 'totalArea',
    label: t('plantPlan.column.totalArea'),
    minWidth: 110,
    align: 'center',
    formatter: (r: BizRow) => (r.totalArea != null ? `${r.totalArea} ${t('plantPlan.unit.mu')}` : '-')
  },
  {
    prop: 'expectedYield',
    label: t('plantPlan.column.expectedYield'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => (r.expectedYield != null ? `${Number(r.expectedYield).toFixed(2)} kg` : '-')
  },
  {
    prop: 'actualYield',
    label: t('plantPlan.column.actualYield'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => (r.actualYield != null ? `${Number(r.actualYield).toFixed(2)} kg` : '-')
  },
  {
    prop: 'finishedPlot',
    label: t('plantPlan.column.finishedPlot'),
    minWidth: 150,
    align: 'center',
    formatter: (r: BizRow) => (r.finishedPlot != null ? String(r.finishedPlot) : '-')
  },
  {
    prop: 'completionRate',
    label: t('plantPlan.column.completionRate'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.completionRate != null ? `${r.completionRate}%` : '-')
  },
  // 「执行延期」红高亮由字典 djs_plant_plan_status (delayed → list_class='danger') 自动着色
  { prop: 'plantStatus', label: t('plantPlan.column.plantStatus'), minWidth: 100, align: 'center', dictType: 'djs_plant_plan_status' },
  { prop: 'updateTime', label: t('plantPlan.column.updateTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'createByName', label: t('plantPlan.column.createBy'), minWidth: 110, align: 'center', showOverflowTooltip: true }
]);

async function loadStats() {
  try {
    const res = await getPlanStats();
    stats.value = res.data || {};
  } catch (e) {
    console.warn('[PlantPlan] loadStats failed', e);
    stats.value = {};
  }
}

// 计划日期 daterange [开始, 结束] 拆为后端 beginPlanDate/endPlanDate；移除原始数组字段
function buildQueryParams(): PlantPlanQuery {
  const { planDate, ...rest } = searchModel as Record<string, unknown>;
  const range = Array.isArray(planDate) ? (planDate as string[]) : [];
  return {
    ...rest,
    beginPlanDate: range[0] || undefined,
    endPlanDate: range[1] || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const params: PlantPlanQuery = buildQueryParams();
    const res = await listPlan(params);
    list.value = (res.rows as PlantPlanVO[]) || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

const handleSearch = (payload?: Record<string, any>) => {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
};

const handleReset = () => {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  handleSearch();
};

const handlePageChange = ({ pageNum: pn, pageSize: ps }: { pageNum: number; pageSize: number }) => {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
};

const handleAdd = () => {
  router.push(`${PLAN_BASE}/wizard`);
};

const handleEdit = (row: BizRow) => {
  router.push(`${PLAN_BASE}/detail?id=${row.id}&edit=1`);
};

const handleDetail = (row: BizRow) => {
  router.push(`${PLAN_BASE}/detail?id=${row.id}`);
};

const handleDelOne = async (row: BizRow) => {
  await ElMessageBox.confirm(t('plantPlan.confirm.del', { count: 1 }), t('common.tip'), { type: 'warning' });
  await delPlan([row.id as string]);
  ElMessage.success(t('common.deleteSuccess'));
  loadList();
  loadStats();
};

const handleExport = () => {
  const { pageNum: _pn, pageSize: _ps, ...exportParams } = buildQueryParams();
  proxy?.download('djs/plant/plan/export', exportParams, `${t('plantPlan.pageTitle')}_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  loadList();
  loadStats();
});
</script>

<style scoped>
.plan-kpi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.plan-kpi-card {
  /* 一行 5 个等宽：弹性增长 + min-width 触发换行（窄到 5 个放不下才换） */
  flex: 1 1 0;
  min-width: 150px;
  text-align: center;
}

.plan-kpi-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.plan-kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.plan-crop-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}

/* 列表表头单行不换行 */
:deep(.el-table th .cell) {
  white-space: nowrap;
}
</style>
