<template>
  <div class="warehouse-dashboard p-2">
    <!-- KPI 横条 1：今日需求（6 项） -->
    <el-card shadow="never" class="kpi-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.demandBar') }}</span>
          <div class="actions">
            <el-tag v-if="lastRefreshAt" type="info" size="small">{{ t('warehouse.dashboard.lastRefresh', { time: lastRefreshAt }) }}</el-tag>
            <el-button size="small" :loading="loading" @click="loadAll">{{ t('warehouse.dashboard.refresh') }}</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="12" class="kpi-row">
        <el-col v-for="item in demandKpis" :key="item.label" :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ item.label }}</div>
            <div class="kpi-value">{{ item.value }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- KPI 横条 2：今日生产（5 项） -->
    <el-card shadow="never" class="kpi-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.productionBar') }}</span>
        </div>
      </template>
      <el-row :gutter="12" class="kpi-row">
        <el-col v-for="item in productionKpis" :key="item.label" :xs="12" :sm="8" :md="4">
          <div class="kpi">
            <div class="kpi-label">{{ item.label }}</div>
            <div class="kpi-value">{{ item.value }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6 图栅格（2 列 × 3 行） -->
    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartDemandPie') }}</span></template>
          <div ref="demandPieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartReturnRing') }}</span></template>
          <div ref="returnRingEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartProductionTrend') }}</span></template>
          <div ref="productionTrendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartCheckPie') }}</span></template>
          <div ref="checkPieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartLocationRing') }}</span></template>
          <div ref="locationRingEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="title">{{ t('warehouse.dashboard.chartLossTrend') }}</span></template>
          <div ref="lossTrendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库位概览 -->
    <el-card shadow="never" class="location-overview">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.locationOverview') }}</span>
        </div>
      </template>
      <el-table v-loading="loading" :data="summary?.locationOverview ?? []" border>
        <el-table-column prop="locationName" :label="t('warehouse.dashboard.colLocation')" min-width="160" />
        <el-table-column prop="locationType" :label="t('warehouse.dashboard.colType')" width="120" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_location_type" :value="row.locationType" />
          </template>
        </el-table-column>
        <el-table-column prop="currentStock" :label="t('warehouse.dashboard.colStock')" width="140" align="right" />
        <el-table-column prop="status" :label="t('warehouse.dashboard.colStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'abnormal' ? 'danger' : 'success'">
              {{ row.status === 'abnormal' ? t('warehouse.dashboard.statusAbnormal') : t('warehouse.dashboard.statusNormal') }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="t('warehouse.dashboard.emptyLocation')" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import {
  getWarehouseDashboardSummary,
  getWarehouseDashboardCharts,
  type WarehouseDashboardSummaryVo,
  type WarehouseDashboardChartsVo,
  type ChartSeriesItem,
  type ChartTrendPoint
} from '@/api/djs-warehouse/dashboard';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_location_type } = toRefs<any>(proxy?.useDict('djs_location_type'));

const summary = ref<WarehouseDashboardSummaryVo | null>(null);
const charts = ref<WarehouseDashboardChartsVo | null>(null);
const loading = ref(false);
const lastRefreshAt = ref('');

// 6 图 ref + 实例
const demandPieEl = ref<HTMLDivElement>();
const returnRingEl = ref<HTMLDivElement>();
const productionTrendEl = ref<HTMLDivElement>();
const checkPieEl = ref<HTMLDivElement>();
const locationRingEl = ref<HTMLDivElement>();
const lossTrendEl = ref<HTMLDivElement>();

let demandPie: echarts.ECharts | null = null;
let returnRing: echarts.ECharts | null = null;
let productionTrend: echarts.ECharts | null = null;
let checkPie: echarts.ECharts | null = null;
let locationRing: echarts.ECharts | null = null;
let lossTrend: echarts.ECharts | null = null;

// 横条 1：今日需求 6 项
const demandKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiDemandWhiteBar'), value: fmt(c?.todayDemandWhiteBar) },
    { label: t('warehouse.dashboard.kpiDemandVegetable'), value: fmt(c?.todayDemandVegetable) },
    { label: t('warehouse.dashboard.kpiDemandGiftBox'), value: fmt(c?.todayDemandGiftBox) },
    { label: t('warehouse.dashboard.kpiDemandOther'), value: fmt(c?.todayDemandOther) },
    { label: t('warehouse.dashboard.kpiDemandOrders'), value: c?.todayDemandOrderCount ?? 0 },
    { label: t('warehouse.dashboard.kpiDemandTotal'), value: fmt(c?.todayDemandTotal) }
  ];
});

// 横条 2：今日生产 5 项
const productionKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiProductionCount'), value: c?.todayProductionCount ?? 0 },
    { label: t('warehouse.dashboard.kpiProductionWeight'), value: fmt(c?.todayProductionWeight) },
    { label: t('warehouse.dashboard.kpiInbound'), value: c?.todayInboundCount ?? 0 },
    { label: t('warehouse.dashboard.kpiOutbound'), value: c?.todayOutboundCount ?? 0 },
    { label: t('warehouse.dashboard.kpiLoss'), value: fmt(c?.todayLossQuantity) }
  ];
});

function fmt(v?: number | null): string {
  if (v == null) return '0.00';
  return Number(v).toFixed(2);
}

async function loadAll() {
  loading.value = true;
  try {
    const [sumRes, chartRes] = await Promise.all([getWarehouseDashboardSummary(), getWarehouseDashboardCharts()]);
    summary.value = sumRes.data;
    charts.value = chartRes.data;
    lastRefreshAt.value = nowTimeText();
    await nextTick();
    renderAll();
  } finally {
    loading.value = false;
  }
}

function nowTimeText(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function renderAll() {
  renderPie(demandPieEl, () => (demandPie ??= echarts.init(demandPieEl.value!)), charts.value?.demandByType, t('warehouse.dashboard.chartDemandPie'));
  renderRing(returnRingEl, () => (returnRing ??= echarts.init(returnRingEl.value!)), charts.value?.returnByDirection, t('warehouse.dashboard.chartReturnRing'));
  renderTrend(productionTrendEl, () => (productionTrend ??= echarts.init(productionTrendEl.value!)), charts.value?.productionTrend, t('warehouse.dashboard.seriesProduction'), '#5470c6');
  renderPie(checkPieEl, () => (checkPie ??= echarts.init(checkPieEl.value!)), charts.value?.checkResult, t('warehouse.dashboard.chartCheckPie'));
  renderRing(locationRingEl, () => (locationRing ??= echarts.init(locationRingEl.value!)), charts.value?.locationHealth, t('warehouse.dashboard.chartLocationRing'));
  renderTrend(lossTrendEl, () => (lossTrend ??= echarts.init(lossTrendEl.value!)), charts.value?.lossTrend, t('warehouse.dashboard.seriesLoss'), '#e6a23c');
}

function renderPie(el: typeof demandPieEl, getChart: () => echarts.ECharts, data: ChartSeriesItem[] | undefined, name: string) {
  if (!el.value) return;
  const chart = getChart();
  const items = (data ?? []).filter((d) => Number(d.value) > 0).map((d) => ({ name: d.name, value: Number(d.value) }));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name,
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}\n{c}' },
        data: items.length > 0 ? items : [{ name: t('warehouse.dashboard.noData'), value: 1 }]
      }
    ]
  });
}

function renderRing(el: typeof returnRingEl, getChart: () => echarts.ECharts, data: ChartSeriesItem[] | undefined, name: string) {
  if (!el.value) return;
  const chart = getChart();
  const items = (data ?? []).filter((d) => Number(d.value) > 0).map((d) => ({ name: d.name, value: Number(d.value) }));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name,
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}\n{c}' },
        data: items.length > 0 ? items : [{ name: t('warehouse.dashboard.noData'), value: 1 }]
      }
    ]
  });
}

function renderTrend(el: typeof productionTrendEl, getChart: () => echarts.ECharts, data: ChartTrendPoint[] | undefined, name: string, color: string) {
  if (!el.value) return;
  const chart = getChart();
  const points = data ?? [];
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: points.map((p) => p.date.slice(5)), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value' },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: { opacity: 0.1 },
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        data: points.map((p) => Number(p.value))
      }
    ]
  });
}

function disposeCharts() {
  [demandPie, returnRing, productionTrend, checkPie, locationRing, lossTrend].forEach((c) => c?.dispose());
  demandPie = returnRing = productionTrend = checkPie = locationRing = lossTrend = null;
}

function handleResize() {
  [demandPie, returnRing, productionTrend, checkPie, locationRing, lossTrend].forEach((c) => c?.resize());
}

onMounted(async () => {
  await loadAll();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  disposeCharts();
});
</script>

<style lang="scss" scoped>
.warehouse-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-weight: 600;
      font-size: 14px;
    }
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

    .kpi-label {
      color: #888;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .kpi-value {
      color: #2c3e50;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.2;
    }
  }

  .chart-row {
    margin: 0 !important;
  }

  .chart-card {
    .chart-canvas {
      width: 100%;
      height: 280px;
    }
  }
}
</style>
