<template>
  <div class="plant-dashboard p-2">
    <!-- 顶部土地总览 + 今日农事 KPI 横条 -->
    <el-card class="kpi-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('plantDashboard.title.overview') }}</span>
          <div class="actions">
            <el-tag v-if="lastRefreshAt" type="info" size="small">{{ t('plantDashboard.action.lastRefresh') }} {{ lastRefreshAt }}</el-tag>
            <el-button size="small" :loading="loading" @click="loadAll">{{ t('plantDashboard.action.refresh') }}</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="12" class="kpi-row">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.idle') }}</div>
            <div class="kpi-value">{{ summary?.idlePlotCount ?? 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.planting') }}</div>
            <div class="kpi-value">{{ summary?.plantingPlotCount ?? 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.harvesting') }}</div>
            <div class="kpi-value">{{ summary?.harvestingPlotCount ?? 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.pending') }}</div>
            <div class="kpi-value">{{ summary?.pendingPlotCount ?? 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.total') }}</div>
            <div class="kpi-value">{{ summary?.totalPlotCount ?? 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ t('plantDashboard.kpi.totalArea') }}</div>
            <div class="kpi-value">
              {{ formatArea(summary?.totalPlotArea) }}<span class="kpi-unit">{{ t('plantDashboard.kpi.areaUnit') }}</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 今日农事：总数 + 按类型分桶小标签 -->
      <div class="farm-row">
        <span class="farm-title">{{ t('plantDashboard.title.todayFarm') }}</span>
        <span class="farm-total"
          >{{ t('plantDashboard.kpi.todayFarmTotal') }}: {{ summary?.todayFarmWorkTotal ?? 0 }} {{ t('plantDashboard.kpi.farmUnit') }}</span
        >
        <template v-if="todayFarmWork.length">
          <el-tag v-for="fw in todayFarmWork" :key="fw.farmType" class="farm-tag" type="success" effect="plain" size="small">
            {{ farmTypeLabel(fw.farmType) }} {{ fw.count }}
          </el-tag>
        </template>
        <span v-else class="farm-empty">{{ t('plantDashboard.chart.noData') }}</span>
      </div>
    </el-card>

    <!-- 当月完成率柱状图 -->
    <el-card class="chart-card" shadow="never">
      <template #header
        ><span class="title">{{ t('plantDashboard.title.monthCompletion') }}</span></template
      >
      <div ref="completionBarEl" class="chart-canvas"></div>
    </el-card>

    <!-- 双甘特图 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('plantDashboard.title.gantt') }}</span>
          <div class="gantt-legend">
            <span class="dot dot-plant"></span>{{ t('plantDashboard.chart.plantSegment') }} <span class="dot dot-pick"></span
            >{{ t('plantDashboard.chart.pickSegment') }}
          </div>
        </div>
      </template>
      <div ref="ganttEl" class="gantt-canvas"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 种植看板 admin 端入口（PLT-DASH-001 / D13，A 版）。
 *
 * 三块：
 *  1. 顶部土地总览（6 KPI）+ 今日农事（总数 + 按类型分桶）
 *  2. 当月种植任务完成率柱状图（ECharts bar，按作物，柱高=完成率%）
 *  3. 双甘特图（ECharts custom series 模拟横条，种植段绿 / 采摘段黄）
 *
 * ECharts 4 件套：onMounted init / onUnmounted dispose+clearInterval / window resize / 5 分钟轮询。
 * 不引 dhtmlx-gantt（用已有 echarts 6.0.0 custom series 模拟甘特）。
 */
import { ref, computed, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { getSummary, getGantt, type PlantDashboardSummaryVO, type FarmWorkCountVO, type GanttItemVO } from '@/api/djs-plant/dashboard';
import { ganttColor, COMPLETION_COLOR, COMPLETION_GOOD_THRESHOLD, FARM_TYPE_LABELS, REFRESH_INTERVAL_MS } from './constants';

const { t } = useI18n();
const { proxy } = getCurrentInstance()!;

// 农事类型字典（Vue3 toRefs 写法，避免整页空白事故 C-fe）
const { djs_farm_work_type } = toRefs<any>(proxy?.useDict('djs_farm_work_type'));

const summary = ref<PlantDashboardSummaryVO | null>(null);
const gantt = ref<GanttItemVO[]>([]);
const loading = ref(false);
const lastRefreshAt = ref('');

const completionBarEl = ref<HTMLDivElement>();
const ganttEl = ref<HTMLDivElement>();

let completionBar: echarts.ECharts | null = null;
let ganttChart: echarts.ECharts | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

const todayFarmWork = computed<FarmWorkCountVO[]>(() => summary.value?.todayFarmWork ?? []);

/** 农事类型中文 label：字典优先，缺失落 fallback 映射 */
function farmTypeLabel(code: string): string {
  const dict = djs_farm_work_type?.value as { value: string; label: string }[] | undefined;
  const hit = dict?.find((d) => d.value === code);
  return hit?.label ?? FARM_TYPE_LABELS[code] ?? code;
}

/** 面积格式化（亩，保留 2 位） */
function formatArea(v?: number | null): string {
  if (v == null) return '0.00';
  return Number(v).toFixed(2);
}

function nowTimeText(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loadAll() {
  loading.value = true;
  try {
    const [sumRes, ganttRes] = await Promise.all([getSummary(), getGantt()]);
    summary.value = sumRes.data ?? null;
    gantt.value = ganttRes.data ?? [];
    lastRefreshAt.value = nowTimeText();
    await nextTick();
    renderAll();
  } finally {
    loading.value = false;
  }
}

function renderAll() {
  renderCompletionBar();
  renderGantt();
}

/** 当月完成率柱状图：x=作物，y=完成率%，分母 0 → 0 */
function renderCompletionBar() {
  if (!completionBarEl.value) return;
  if (!completionBar) completionBar = echarts.init(completionBarEl.value);
  const list = summary.value?.monthCompletion ?? [];
  const crops = list.map((m) => m.cropName ?? '-');
  const rates = list.map((m) => {
    const expected = Number(m.expectedYield ?? 0);
    const actual = Number(m.actualYield ?? 0);
    const rate = expected > 0 ? actual / expected : 0;
    return {
      value: +(rate * 100).toFixed(1),
      itemStyle: { color: rate >= COMPLETION_GOOD_THRESHOLD ? COMPLETION_COLOR.good : COMPLETION_COLOR.low }
    };
  });
  completionBar.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
    grid: { left: 50, right: 20, top: 30, bottom: crops.length > 6 ? 70 : 40 },
    xAxis: {
      type: 'category',
      data: crops.length ? crops : [t('plantDashboard.chart.noData')],
      axisLabel: { interval: 0, rotate: crops.length > 6 ? 30 : 0, fontSize: 11 }
    },
    yAxis: { type: 'value', max: 100, name: t('plantDashboard.chart.completionRate') + ' %' },
    series: [
      {
        name: t('plantDashboard.chart.completionRate'),
        type: 'bar',
        barWidth: '45%',
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 },
        data: rates.length ? rates : [{ value: 0 }]
      }
    ]
  });
}

/** 双甘特图：ECharts custom series 模拟横条，每条用日期区间画矩形 */
function renderGantt() {
  if (!ganttEl.value) return;
  if (!ganttChart) ganttChart = echarts.init(ganttEl.value);
  const items = gantt.value ?? [];

  if (!items.length) {
    ganttChart.clear();
    ganttChart.setOption({
      title: { text: t('plantDashboard.chart.noData'), left: 'center', top: 'center', textStyle: { fontSize: 14, color: '#999' } }
    });
    return;
  }

  // y 轴类目 = 去重的 "作物-地块" 文本；一行可能有 plant + pick 两条
  const categories = Array.from(new Set(items.map((i) => i.text)));
  const catIndex = new Map(categories.map((c, idx) => [c, idx]));

  // 每条 → [categoryIndex, startMs, endMs, type, progress, text]
  const data = items.map((i) => {
    const start = new Date(i.startDate).getTime();
    const end = new Date(i.endDate).getTime();
    return {
      value: [catIndex.get(i.text) ?? 0, start, end, i.type, i.progress, i.text],
      itemStyle: { color: ganttColor(i.type) }
    };
  });

  ganttChart.setOption({
    tooltip: {
      formatter: (params: { value: (string | number)[] }) => {
        const v = params.value;
        const typeLabel = v[3] === 'pick' ? t('plantDashboard.chart.pickSegment') : t('plantDashboard.chart.plantSegment');
        const s = echarts.time.format(v[1] as number, '{yyyy}-{MM}-{dd}', false);
        const e = echarts.time.format(v[2] as number, '{yyyy}-{MM}-{dd}', false);
        return `${v[5]}<br/>${typeLabel}: ${s} ~ ${e}<br/>${t('plantDashboard.chart.completionRate')}: ${v[4]}%`;
      }
    },
    grid: { left: 130, right: 30, top: 20, bottom: 40 },
    xAxis: { type: 'time', axisLabel: { formatter: '{MM}-{dd}' } },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { interval: 0, fontSize: 11, width: 120, overflow: 'truncate' }
    },
    series: [
      {
        type: 'custom',
        renderItem: (renderParams: unknown, api: GanttRenderApi) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = (api.size?.([0, 1])?.[1] ?? 20) * 0.5;
          const x = start[0];
          const width = Math.max(end[0] - start[0], 2);
          const y = start[1] - height / 2;
          return {
            type: 'rect',
            shape: { x, y, width, height, r: 3 },
            style: api.style?.()
          };
        },
        encode: { x: [1, 2], y: 0 },
        data
      }
    ]
  });
}

/** ECharts custom renderItem 的 api 最小类型（避免 any，CLAUDE.md §6 #7） */
interface GanttRenderApi {
  value: (idx: number) => number;
  coord: (point: [number, number]) => [number, number];
  size?: (range: [number, number]) => [number, number];
  style?: () => Record<string, unknown>;
}

function disposeCharts() {
  completionBar?.dispose();
  completionBar = null;
  ganttChart?.dispose();
  ganttChart = null;
}

function handleResize() {
  completionBar?.resize();
  ganttChart?.resize();
}

onMounted(async () => {
  await loadAll();
  window.addEventListener('resize', handleResize);
  timer = setInterval(loadAll, REFRESH_INTERVAL_MS);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  window.removeEventListener('resize', handleResize);
  disposeCharts();
});
</script>

<style scoped>
.plant-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-weight: 600;
  font-size: 14px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.kpi-row {
  margin: 0 !important;
}
.kpi {
  background: #f9fafc;
  border-radius: 6px;
  padding: 12px 16px;
  text-align: center;
  margin-bottom: 8px;
}
.kpi-label {
  color: #888;
  font-size: 12px;
  margin-bottom: 6px;
}
.kpi-value {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}
.kpi-unit {
  font-size: 13px;
  color: #888;
  margin-left: 2px;
}
.farm-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}
.farm-title {
  font-weight: 600;
  font-size: 13px;
  color: #555;
}
.farm-total {
  font-size: 13px;
  color: #2c3e50;
  margin-right: 4px;
}
.farm-empty {
  font-size: 12px;
  color: #aaa;
}
.chart-card {
  margin-top: 0;
}
.chart-canvas {
  width: 100%;
  height: 300px;
}
.gantt-canvas {
  width: 100%;
  height: 420px;
}
.gantt-legend {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin: 0 2px 0 8px;
}
.dot-plant {
  background: #2ea36c;
}
.dot-pick {
  background: #e6a23c;
}
</style>
