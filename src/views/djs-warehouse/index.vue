<template>
  <div class="warehouse-dashboard p-2">
    <!-- 统一页头：标题 + 最近刷新 + 全页刷新按钮 -->
    <div class="page-header">
      <span class="page-title">{{ t('warehouse.dashboard.title') }}</span>
      <div class="actions">
        <el-tag v-if="lastRefreshAt" type="info" size="small">{{ t('warehouse.dashboard.lastRefresh', { time: lastRefreshAt }) }}</el-tag>
        <el-button size="small" :loading="loading" @click="loadAll">{{ t('warehouse.dashboard.refresh') }}</el-button>
      </div>
    </div>

    <!-- KPI 横条 1：今日需求（8 项） -->
    <el-card shadow="never" class="kpi-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.demandBar') }}</span>
        </div>
      </template>
      <el-row :gutter="12" class="kpi-row">
        <el-col v-for="item in demandKpis" :key="item.label" :xs="12" :sm="8" :md="6">
          <div class="kpi">
            <div class="kpi-value">
              {{ item.value }}<span class="kpi-unit">{{ item.unit }}</span>
            </div>
            <div class="kpi-label">{{ item.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- KPI 横条 2：今日生产（8 项） -->
    <el-card shadow="never" class="kpi-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.productionBar') }}</span>
        </div>
      </template>
      <el-row :gutter="12" class="kpi-row">
        <el-col v-for="item in productionKpis" :key="item.label" :xs="12" :sm="8" :md="6">
          <div class="kpi">
            <div class="kpi-value">
              {{ item.value }}<span class="kpi-unit">{{ item.unit }}</span>
            </div>
            <div class="kpi-label">{{ item.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6 图栅格（2 列 × 3 行） -->
    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartDemandPie') }}</span></template
          >
          <div ref="demandPieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('warehouse.dashboard.chartReturnRing') }}</span>
              <el-radio-group v-model="returnTab" size="small">
                <el-radio-button value="pork">{{ t('warehouse.dashboard.returnTabPork') }}</el-radio-button>
                <el-radio-button value="vegetable">{{ t('warehouse.dashboard.returnTabVeg') }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="returnRingEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartProductionTrend') }}</span></template
          >
          <div ref="productionTrendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartCheckPie') }}</span></template
          >
          <div ref="checkPieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartLocationRing') }}</span></template
          >
          <div ref="locationRingEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartLossTrend') }}</span></template
          >
          <div ref="lossTrendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>
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
  type ChartSeriesItem
} from '@/api/djs-warehouse/dashboard';

const { t } = useI18n();

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

// 退货环「猪肉 / 果蔬」切换
const returnTab = ref<'pork' | 'vegetable'>('pork');

// 横条 1：今日需求 8 项（对齐原型；label 走 i18n，键名待 backfill，单位逐字对齐截图）
const demandKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiDemandWhiteBar'), unit: t('warehouse.dashboard.unitHead'), value: fmtInt(c?.todayDemandWhiteBar) },
    { label: t('warehouse.dashboard.kpiDemandPork'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayDemandPork) },
    { label: t('warehouse.dashboard.kpiDemandOffal'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayDemandOffal) },
    { label: t('warehouse.dashboard.kpiDemandGiftBox'), unit: t('warehouse.dashboard.unitBox'), value: fmtInt(c?.todayDemandGiftBox) },
    { label: t('warehouse.dashboard.kpiDemandVegetableKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayDemandVegetableKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiDemandVegetable'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayDemandVegetable) },
    { label: t('warehouse.dashboard.kpiDemandEgg'), unit: t('warehouse.dashboard.unitPiece'), value: fmtInt(c?.todayDemandEgg) },
    { label: t('warehouse.dashboard.kpiDemandDryGood'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayDemandDryGood) }
  ];
});

// 横条 2：今日生产 8 项（对齐原型）
const productionKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiSlaughterPig'), unit: t('warehouse.dashboard.unitHead'), value: c?.todaySlaughterPigCount ?? 0 },
    { label: t('warehouse.dashboard.kpiWhiteBarWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayWhiteBarWeight) },
    { label: t('warehouse.dashboard.kpiCutBar'), unit: t('warehouse.dashboard.unitHead'), value: c?.todayCutBarCount ?? 0 },
    { label: t('warehouse.dashboard.kpiCutProductWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayCutProductWeight) },
    { label: t('warehouse.dashboard.kpiVegReceiveKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayVegReceiveKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiVegReceiveWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayVegReceiveWeight) },
    { label: t('warehouse.dashboard.kpiVegProductKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayVegProductKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiVegProductWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayVegProductWeight) }
  ];
});

function fmt(v?: number | null): string {
  if (v == null) return '0.00';
  return Number(v).toFixed(2);
}

function fmtInt(v?: number | null): number {
  if (v == null) return 0;
  return Math.round(Number(v));
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
  // 图① 果蔬产品当日需求分布（按产品名）
  renderPie(demandPieEl, () => (demandPie ??= echarts.init(demandPieEl.value!)), charts.value?.demandByType, t('warehouse.dashboard.chartDemandPie'));
  // 图② 产品退货分布（猪肉 / 果蔬切换）
  renderReturnRing();
  // 图③ 产品生产趋势（白条头数柱 + 猪肉/果蔬重量线，组合图）
  renderProductionCombo();
  // 图④ 库存盘点结果分布
  renderPie(checkPieEl, () => (checkPie ??= echarts.init(checkPieEl.value!)), charts.value?.checkResult, t('warehouse.dashboard.chartCheckPie'));
  // 图⑤ 当月盘点异常库位分布（按库位名）
  renderRing(
    locationRingEl,
    () => (locationRing ??= echarts.init(locationRingEl.value!)),
    charts.value?.abnormalLocationByName,
    t('warehouse.dashboard.chartLocationRing')
  );
  // 图⑥ 产品生产损耗趋势（猪肉 / 果蔬多系列）
  renderLossMulti();
}

/** 图② 退货环：按当前 tab（猪肉 / 果蔬）渲染对应产品名构成。 */
function renderReturnRing() {
  const data = returnTab.value === 'pork' ? charts.value?.returnPork : charts.value?.returnVegetable;
  renderRing(returnRingEl, () => (returnRing ??= echarts.init(returnRingEl.value!)), data, t('warehouse.dashboard.chartReturnRing'));
}

/** 图③ 产品生产趋势组合图：白条头数（柱，左轴）+ 猪肉/果蔬产品重量（线，右轴）。 */
function renderProductionCombo() {
  if (!productionTrendEl.value) return;
  const chart = (productionTrend ??= echarts.init(productionTrendEl.value));
  const heads = charts.value?.productionWhiteBarHeadTrend ?? [];
  const pork = charts.value?.productionPorkWeightTrend ?? [];
  const veg = charts.value?.productionVegWeightTrend ?? [];
  const dates = (heads.length ? heads : pork.length ? pork : veg).map((p) => p.date.slice(5));
  const nameHead = t('warehouse.dashboard.seriesWhiteBarHead');
  const namePork = t('warehouse.dashboard.seriesPorkWeight');
  const nameVeg = t('warehouse.dashboard.seriesVegWeight');
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { bottom: 0, data: [nameHead, namePork, nameVeg] },
    grid: { left: 45, right: 45, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: [
      { type: 'value', name: t('warehouse.dashboard.unitHead'), position: 'left' },
      { type: 'value', name: t('warehouse.dashboard.unitKg'), position: 'right' }
    ],
    series: [
      { name: nameHead, type: 'bar', yAxisIndex: 0, itemStyle: { color: '#5b8ff9' }, data: heads.map((p) => Number(p.value)) },
      {
        name: namePork,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#36cfc9' },
        itemStyle: { color: '#36cfc9' },
        data: pork.map((p) => Number(p.value))
      },
      {
        name: nameVeg,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#73d13d' },
        itemStyle: { color: '#73d13d' },
        data: veg.map((p) => Number(p.value))
      }
    ]
  });
}

/** 图⑥ 产品生产损耗趋势：猪肉 / 果蔬多系列折线。 */
function renderLossMulti() {
  if (!lossTrendEl.value) return;
  const chart = (lossTrend ??= echarts.init(lossTrendEl.value));
  const pork = charts.value?.lossPorkTrend ?? [];
  const veg = charts.value?.lossVegTrend ?? [];
  const dates = (pork.length ? pork : veg).map((p) => p.date.slice(5));
  const namePork = t('warehouse.dashboard.seriesPorkLoss');
  const nameVeg = t('warehouse.dashboard.seriesVegLoss');
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: [namePork, nameVeg] },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value' },
    series: [
      {
        name: namePork,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#5b8ff9' },
        itemStyle: { color: '#5b8ff9' },
        data: pork.map((p) => Number(p.value))
      },
      {
        name: nameVeg,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#73d13d' },
        itemStyle: { color: '#73d13d' },
        data: veg.map((p) => Number(p.value))
      }
    ]
  });
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

function disposeCharts() {
  [demandPie, returnRing, productionTrend, checkPie, locationRing, lossTrend].forEach((c) => c?.dispose());
  demandPie = returnRing = productionTrend = checkPie = locationRing = lossTrend = null;
}

function handleResize() {
  [demandPie, returnRing, productionTrend, checkPie, locationRing, lossTrend].forEach((c) => c?.resize());
}

// 退货环 tab 切换 → 仅重渲染该环图
watch(returnTab, () => renderReturnRing());

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

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .page-title {
      font-weight: 600;
      font-size: 16px;
      color: #2c3e50;
    }
  }

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

    .kpi-value {
      color: #2c3e50;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.2;

      .kpi-unit {
        color: #888;
        font-size: 12px;
        font-weight: 400;
        margin-left: 3px;
      }
    }

    .kpi-label {
      color: #888;
      font-size: 12px;
      margin-top: 6px;
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
