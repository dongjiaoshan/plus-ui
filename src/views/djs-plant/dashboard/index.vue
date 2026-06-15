<template>
  <div class="plant-dashboard p-2" v-loading="loading">
    <!-- 顶部标题 + 刷新 -->
    <div class="page-head">
      <span class="page-title">{{ t('plantDashboard.title') }}</span>
      <div class="actions">
        <el-tag v-if="lastRefreshAt" type="info" size="small">{{ t('plantDashboard.lastRefresh') }} {{ lastRefreshAt }}</el-tag>
        <el-button size="small" :loading="loading" @click="loadAll">{{ t('plantDashboard.refresh') }}</el-button>
      </div>
    </div>

    <!-- 上半区：左 两行 KPI / 右 有机证书一览 -->
    <el-row :gutter="12" class="top-row">
      <el-col :xs="24" :lg="17">
        <!-- 区块 ① 土地总览 KPI -->
        <el-card class="kpi-card" shadow="never">
          <div class="kpi-line">
            <div class="kpi-line-tag"><span class="tag-main">{{ t('plantDashboard.land.title') }}</span></div>
            <div class="kpi-items">
              <div class="kpi-item">
                <div class="kpi-value">{{ summary?.pendingPlotCount ?? 0 }}</div>
                <div class="kpi-label">{{ t('plantDashboard.land.pending') }}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-value">{{ summary?.plantingPlotCount ?? 0 }}</div>
                <div class="kpi-label">{{ t('plantDashboard.land.planting') }}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-value">{{ summary?.harvestingPlotCount ?? 0 }}</div>
                <div class="kpi-label">{{ t('plantDashboard.land.planted') }}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-value">{{ Number(summary?.currentPlantingArea ?? 0).toFixed(0) }}</div>
                <div class="kpi-label">{{ t('plantDashboard.land.currentArea') }}</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-value">{{ kgToWanJin(summary?.currentExpectedYield) }}</div>
                <div class="kpi-label">{{ t('plantDashboard.land.currentYield') }}</div>
              </div>
            </div>
          </div>

          <el-divider class="inner-divider" />

          <!-- 区块 ② 今日工作 KPI（固定 6 格） -->
          <div class="kpi-line">
            <div class="kpi-line-tag"><span class="tag-main">{{ t('plantDashboard.today.title') }}</span></div>
            <div class="kpi-items">
              <div v-for="w in todayWorkItems" :key="w.key" class="kpi-item">
                <div class="kpi-value">{{ w.value }}<span v-if="w.unit" class="kpi-unit">{{ w.unit }}</span></div>
                <div class="kpi-label">{{ w.label }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 区块 ③ 有机证书情况一览 -->
      <el-col :xs="24" :lg="7">
        <el-card class="cert-card" shadow="never">
          <template #header><span class="title">{{ t('plantDashboard.cert.title') }}</span></template>
          <el-row :gutter="8">
            <el-col :span="12">
              <div class="cert-item">
                <div class="cert-value">{{ summary?.organicCertOverview?.cropCertExpiryDate || '-' }}</div>
                <div class="cert-label">{{ t('plantDashboard.cert.cropCertExpiryDate') }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="cert-item">
                <div class="cert-value">{{ certDaysText(summary?.organicCertOverview?.cropCertDaysToExpiry) }}</div>
                <div class="cert-label">{{ t('plantDashboard.cert.cropCertDaysToExpiry') }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="cert-item">
                <div class="cert-value">{{ summary?.organicCertOverview?.cropNoCertCount ?? 0 }}</div>
                <div class="cert-label">{{ t('plantDashboard.cert.cropNoCert') }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="cert-item">
                <div class="cert-value">{{ summary?.organicCertOverview?.cropCertCategoryCount ?? 0 }}</div>
                <div class="cert-label">{{ t('plantDashboard.cert.cropCertCategoryCount') }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 区块 ④ 实时种植物统计（bar + line 双轴） -->
    <el-card class="chart-card" shadow="never">
      <template #header><span class="title">{{ t('plantDashboard.cropStat.title') }}</span></template>
      <div ref="cropStatEl" class="chart-canvas chart-canvas-tall"></div>
    </el-card>

    <!-- 区块 ⑤⑥ 双甘特 -->
    <el-row :gutter="12" class="gantt-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('plantDashboard.gantt.plantTitle') }}</span></template>
          <div ref="plantGanttEl" class="chart-canvas chart-canvas-tall"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('plantDashboard.gantt.pickTitle') }}</span></template>
          <div ref="pickGanttEl" class="chart-canvas chart-canvas-tall"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 种植看板 admin 入口（PLT-DASH-001 富图看板版）。
 *
 * 对照原型 doc/origin/prototype/admin/.../种植管理/种植看板/06edfbc1-...png，6 区块：
 *  ① 土地总览 KPI（未安排 / 持续种植 / 已种植 / 当前种植面积亩 / 当前预计产量万斤）
 *  ② 今日工作 KPI（固定 6 格：种植 / 采摘 / 空地管理 / 种植管理 / 灾害损失 地块数 + 采摘活动 kg）
 *  ③ 有机证书情况一览（土地 / 作物证书最早到期天数 + 无证书 / 已建档品类数）
 *  ④ 实时种植物统计（bar=在种地块数 + line=预计产量 kg，双轴，by 作物）— ECharts
 *  ⑤ 种植计划甘特（绿 / 橙）— ECharts custom
 *  ⑥ 采摘周期甘特（黄）— ECharts custom
 *
 * 5 分钟自动轮询（onMounted setInterval，onUnmounted 清理 + dispose 图表）。
 * 与「种植总览」（djs-plant/overview）是两个独立页，本页是富图看板，总览是列表着陆页。
 */
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { getPlantDashboardSummary, getPlantDashboardGantt } from '@/api/djs-plant/dashboard';
import type { PlantDashboardSummaryVO, GanttItemVO } from '@/api/djs-plant/dashboard/types';
import { CROP_STAT_COLOR, GANTT_COLOR, REFRESH_INTERVAL_MS, kgToWanJin, certDaysText } from './constants';

const { t } = useI18n();

const summary = ref<PlantDashboardSummaryVO | null>(null);
const gantt = ref<GanttItemVO[]>([]);
const loading = ref(false);
const lastRefreshAt = ref('');

const cropStatEl = ref<HTMLDivElement>();
const plantGanttEl = ref<HTMLDivElement>();
const pickGanttEl = ref<HTMLDivElement>();

let cropStatChart: echarts.ECharts | null = null;
let plantGanttChart: echarts.ECharts | null = null;
let pickGanttChart: echarts.ECharts | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/** 今日工作固定 6 格（种植 / 采摘 / 空地管理 / 种植管理 / 灾害损失 地块数 + 采摘活动 kg）。 */
const todayWorkItems = computed(() => {
  const s = summary.value;
  const plotUnit = t('plantDashboard.today.unitPlot');
  return [
    { key: 'planting', value: s?.todayPlantingPlotCount ?? 0, unit: plotUnit, label: t('plantDashboard.today.planting') },
    { key: 'harvest', value: s?.todayHarvestPlotCount ?? 0, unit: plotUnit, label: t('plantDashboard.today.harvest') },
    { key: 'idleMgmt', value: s?.todayIdleMgmtPlotCount ?? 0, unit: plotUnit, label: t('plantDashboard.today.idleMgmt') },
    { key: 'plantMgmt', value: s?.todayPlantMgmtPlotCount ?? 0, unit: plotUnit, label: t('plantDashboard.today.plantMgmt') },
    { key: 'disaster', value: s?.todayDisasterPlotCount ?? 0, unit: plotUnit, label: t('plantDashboard.today.disaster') },
    { key: 'pickActivity', value: Number(s?.todayPickActivityWeight ?? 0).toFixed(0), unit: 'kg', label: t('plantDashboard.today.pickActivity') }
  ];
});

function nowTimeText(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loadAll() {
  loading.value = true;
  try {
    const [sumRes, ganttRes] = await Promise.all([getPlantDashboardSummary(), getPlantDashboardGantt()]);
    summary.value = (sumRes as any).data ?? null;
    gantt.value = (ganttRes as any).data ?? [];
    lastRefreshAt.value = nowTimeText();
    await nextTick();
    renderAll();
  } finally {
    loading.value = false;
  }
}

function renderAll() {
  renderCropStat();
  renderGantt('plant');
  renderGantt('pick');
}

/** 区块 ④ 实时种植物统计：bar(地块数) + line(预计产量 kg) 双轴。 */
function renderCropStat() {
  if (!cropStatEl.value) return;
  if (!cropStatChart) cropStatChart = echarts.init(cropStatEl.value);
  const rows = summary.value?.cropPlantStat ?? [];
  const names = rows.map((r) => r.cropName || '-');
  const plotCounts = rows.map((r) => Number(r.plotCount ?? 0));
  const yields = rows.map((r) => Number(r.expectedYield ?? 0));
  cropStatChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: [t('plantDashboard.cropStat.plotCount'), t('plantDashboard.cropStat.expectedYield')], bottom: 0 },
    grid: { left: 50, right: 55, top: 30, bottom: 50 },
    xAxis: [{ type: 'category', data: names.length > 0 ? names : ['-'], axisLabel: { interval: 0, fontSize: 11 } }],
    yAxis: [
      { type: 'value', name: t('plantDashboard.cropStat.plotCount'), minInterval: 1, position: 'left' },
      { type: 'value', name: t('plantDashboard.cropStat.expectedYield'), position: 'right' }
    ],
    series: [
      {
        name: t('plantDashboard.cropStat.plotCount'),
        type: 'bar',
        barWidth: '40%',
        yAxisIndex: 0,
        itemStyle: { color: CROP_STAT_COLOR.bar },
        data: plotCounts
      },
      {
        name: t('plantDashboard.cropStat.expectedYield'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        yAxisIndex: 1,
        lineStyle: { color: CROP_STAT_COLOR.line, width: 2 },
        itemStyle: { color: CROP_STAT_COLOR.line },
        data: yields
      }
    ]
  });
}

/**
 * 渲染单个甘特图（ECharts custom renderItem，横向时间条）。
 *
 * @param type 段类型 plant（种植，绿/橙）/ pick（采摘，黄）—— 同时决定容器、chart 实例、取哪段数据
 */
function renderGantt(type: 'plant' | 'pick') {
  const el = type === 'plant' ? plantGanttEl.value : pickGanttEl.value;
  if (!el) return;
  let chart: echarts.ECharts | null = type === 'plant' ? plantGanttChart : pickGanttChart;
  if (!chart) {
    chart = echarts.init(el);
    if (type === 'plant') plantGanttChart = chart;
    else pickGanttChart = chart;
  }
  const segs = gantt.value.filter((g) => g.type === type);
  // y 轴类目 = 去重的甘特条文本
  const categories = Array.from(new Set(segs.map((s) => s.text)));
  const catIndex = new Map(categories.map((c, i) => [c, i]));

  type GanttDatum = [number, number, number, number, string];
  const data: GanttDatum[] = segs.map((s) => {
    const start = new Date(s.startDate).getTime();
    const end = new Date(s.endDate).getTime();
    return [catIndex.get(s.text) ?? 0, start, end, s.progress ?? 0, s.text];
  });

  function colorFor(progress: number): string {
    if (type === 'pick') return GANTT_COLOR.pick;
    // 种植段：进行中 / 已完成（绿）vs 待开始 / 延期（橙）
    return progress >= 50 && progress <= 100 ? GANTT_COLOR.plantOngoing : GANTT_COLOR.plantPending;
  }

  chart.setOption({
    tooltip: {
      formatter: (p: any) => {
        const d = p.data as GanttDatum;
        const fmt = (ts: number) => new Date(ts).toLocaleDateString();
        return `${d[4]}<br/>${fmt(d[1])} ~ ${fmt(d[2])}<br/>${t('plantDashboard.gantt.progress')}: ${d[3]}%`;
      }
    },
    grid: { left: 110, right: 20, top: 16, bottom: 40 },
    xAxis: {
      type: 'time',
      axisLabel: { formatter: '{yyyy}-{MM}' }
    },
    yAxis: {
      type: 'category',
      data: categories.length > 0 ? categories : ['-'],
      inverse: true,
      axisLabel: { fontSize: 11, width: 100, overflow: 'truncate' }
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const catIdx = api.value(0);
          const start = api.coord([api.value(1), catIdx]);
          const end = api.coord([api.value(2), catIdx]);
          const height = api.size([0, 1])[1] * 0.5;
          const progress = api.value(3);
          const x = start[0];
          const width = Math.max(end[0] - start[0], 2);
          const y = start[1] - height / 2;
          return {
            type: 'rect',
            shape: { x, y, width, height, r: 3 },
            style: { fill: colorFor(progress) }
          };
        },
        encode: { x: [1, 2], y: 0 },
        data
      }
    ]
  });
}

function disposeCharts() {
  cropStatChart?.dispose();
  cropStatChart = null;
  plantGanttChart?.dispose();
  plantGanttChart = null;
  pickGanttChart?.dispose();
  pickGanttChart = null;
}

function handleResize() {
  cropStatChart?.resize();
  plantGanttChart?.resize();
  pickGanttChart?.resize();
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
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title {
  font-weight: 600;
  font-size: 14px;
}
.top-row {
  margin: 0 !important;
}
.kpi-card,
.cert-card {
  height: 100%;
}
.kpi-line {
  display: flex;
  align-items: center;
  gap: 16px;
}
.kpi-line-tag {
  flex: 0 0 64px;
}
.tag-main {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #409eff;
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
  line-height: 1.3;
}
.kpi-items {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 12px;
}
.kpi-item {
  flex: 1 1 90px;
  min-width: 80px;
  background: #f7f9fc;
  border-radius: 6px;
  padding: 10px 8px;
  text-align: center;
}
.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}
.kpi-unit {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #888;
}
.kpi-label {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}
.inner-divider {
  margin: 14px 0;
}
.cert-item {
  text-align: center;
  padding: 12px 6px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: #f7f9fc;
}
.cert-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f7a55;
  line-height: 1.2;
}
.cert-label {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}
.chart-card {
  width: 100%;
}
.gantt-row {
  margin: 0 !important;
}
.chart-canvas {
  width: 100%;
  height: 280px;
}
.chart-canvas-tall {
  height: 320px;
}
</style>
