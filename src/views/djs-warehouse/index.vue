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

    <!-- KPI 横条 1：今日需求（4 项：白条需求量 + 猪肉/果蔬/其他产品需求品种数） -->
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

    <!-- 图栅格 行1：明日产品需求分布（双维度：猪肉/果蔬 + 按 KG/非 KG） | 退货产品分布（双维度） -->
    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('warehouse.dashboard.chartDemandPie') }}</span>
              <el-radio-group v-model="demandTab" size="small">
                <el-radio-button value="pork">{{ t('warehouse.dashboard.demandTabPork') }}</el-radio-button>
                <el-radio-button value="vegetable">{{ t('warehouse.dashboard.demandTabVeg') }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-unit-switch">
            <el-radio-group v-model="demandUnitTab" size="small">
              <el-radio-button value="kg">{{ t('warehouse.dashboard.demandTabKg') }}</el-radio-button>
              <el-radio-button value="nonkg">{{ t('warehouse.dashboard.demandTabNonKg') }}</el-radio-button>
            </el-radio-group>
          </div>
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
          <div class="chart-unit-switch">
            <el-radio-group v-model="returnUnitTab" size="small">
              <el-radio-button value="kg">{{ t('warehouse.dashboard.returnTabKg') }}</el-radio-button>
              <el-radio-button value="nonkg">{{ t('warehouse.dashboard.returnTabNonKg') }}</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="returnRingEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图栅格 行2：生产趋势（占满整行） -->
    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="24">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartProductionTrend') }}</span></template
          >
          <div ref="productionTrendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图栅格 行3：盘点结果分布 | 损耗趋势 -->
    <el-row :gutter="12" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header
            ><span class="title">{{ t('warehouse.dashboard.chartCheckPie') }}</span></template
          >
          <div ref="checkPieEl" class="chart-canvas"></div>
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

/** ECharts axis-trigger tooltip 回调单条 param（只取渲染需要的字段，避免引 any）。 */
interface TrendTooltipParam {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | string;
}

const summary = ref<WarehouseDashboardSummaryVo | null>(null);
const charts = ref<WarehouseDashboardChartsVo | null>(null);
const loading = ref(false);
const lastRefreshAt = ref('');

// 图 ref + 实例
const demandPieEl = ref<HTMLDivElement>();
const returnRingEl = ref<HTMLDivElement>();
const productionTrendEl = ref<HTMLDivElement>();
const checkPieEl = ref<HTMLDivElement>();
const lossTrendEl = ref<HTMLDivElement>();

let demandPie: echarts.ECharts | null = null;
let returnRing: echarts.ECharts | null = null;
let productionTrend: echarts.ECharts | null = null;
let checkPie: echarts.ECharts | null = null;
let lossTrend: echarts.ECharts | null = null;

// 明日产品需求分布 维度一「猪肉 / 果蔬」切换
const demandTab = ref<'pork' | 'vegetable'>('pork');
// 明日产品需求分布 维度二「按 KG / 按非 KG」切换（与维度一取交集）
const demandUnitTab = ref<'kg' | 'nonkg'>('kg');
// 退货环 维度一「猪肉 / 果蔬」切换
const returnTab = ref<'pork' | 'vegetable'>('pork');
// 退货环 维度二「按 KG / 按非 KG」切换（与维度一取交集）
const returnUnitTab = ref<'kg' | 'nonkg'>('kg');

/** 切片取需求最高 TOP5，其余合并为「其他」。 */
function top5WithOther(data: ChartSeriesItem[] | undefined): ChartSeriesItem[] {
  const items = (data ?? []).filter((d) => Number(d.value) > 0).map((d) => ({ name: d.name, value: Number(d.value) }));
  items.sort((a, b) => b.value - a.value);
  if (items.length <= 5) return items;
  const top = items.slice(0, 5);
  const otherValue = items.slice(5).reduce((sum, d) => sum + Number(d.value), 0);
  if (otherValue > 0) top.push({ name: t('warehouse.dashboard.otherSlice'), value: otherValue });
  return top;
}

// 横条 1：今日需求 4 项（白条需求量 + 猪肉/果蔬/其他产品需求品种数，对齐原型）
const demandKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiDemandWhiteBar'), unit: t('warehouse.dashboard.unitHead'), value: fmtInt(c?.todayDemandWhiteBar) },
    { label: t('warehouse.dashboard.kpiDemandPorkKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayDemandPorkKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiDemandVegetableKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayDemandVegetableKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiDemandOtherKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayDemandOtherKinds ?? 0 }
  ];
});

// 横条 2：今日生产 8 项（对齐原型；毛菜两项落第二行前两列 = 数组第 5/6 位）
const productionKpis = computed(() => {
  const c = charts.value;
  return [
    { label: t('warehouse.dashboard.kpiSlaughterPig'), unit: t('warehouse.dashboard.unitHead'), value: c?.todaySlaughterPigCount ?? 0 },
    { label: t('warehouse.dashboard.kpiWhiteBarWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayMarketingWeight) },
    { label: t('warehouse.dashboard.kpiCutBar'), unit: t('warehouse.dashboard.unitHead'), value: fmtCount(c?.todayCutBarCount) },
    { label: t('warehouse.dashboard.kpiCutProductWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayCutProductWeight) },
    { label: t('warehouse.dashboard.kpiVegHandleKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayVegHandleKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiVegHandleWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayVegHandleWeight) },
    { label: t('warehouse.dashboard.kpiVegReceiveKinds'), unit: t('warehouse.dashboard.unitKind'), value: c?.todayVegReceiveKinds ?? 0 },
    { label: t('warehouse.dashboard.kpiVegReceiveWeight'), unit: t('warehouse.dashboard.unitKg'), value: fmt(c?.todayVegReceiveWeight) }
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

// 分割白条数：半只 0.5 计，值可为小数（后端 BigDecimal 序列化成字符串）。
// 不四舍五入（fmtInt 会把 0.5→1 破坏口径），去掉整数的 .0 尾巴：3.0→"3"、1.5→"1.5"。
function fmtCount(v?: number | string | null): string {
  if (v == null) return '0';
  return String(Number(v));
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
  // 图① 明日产品需求分布（按 KG / 按非 KG 切换，近 7 日）
  renderDemandPie();
  // 图② 退货产品分布（按 KG / 按非 KG 切换，近 7 日）
  renderReturnRing();
  // 图③ 产品生产趋势（白条头数柱 + 猪肉/果蔬重量线，组合图，占满整行）
  renderProductionCombo();
  // 图④ 库存盘点结果分布
  renderPie(checkPieEl, () => (checkPie ??= echarts.init(checkPieEl.value!)), charts.value?.checkResult, t('warehouse.dashboard.chartCheckPie'));
  // 图⑤ 产品生产损耗趋势（猪肉 / 果蔬多系列）
  renderLossMulti();
}

/** 按产品单位维度过滤：product_unit='kg' 视为 KG，其余 / 空视为非 KG。 */
function filterByUnit(raw: ChartSeriesItem[] | undefined, unitTab: 'kg' | 'nonkg'): ChartSeriesItem[] {
  return (raw ?? []).filter((it) => (String(it.unit ?? '').toLowerCase() === 'kg') === (unitTab === 'kg'));
}

/** 图① 产品需求分布：先按维度一（猪肉/果蔬）取分布，再按维度二（KG/非 KG）过滤，取需求最高 TOP5、其余归「其他」。 */
function renderDemandPie() {
  const raw = demandTab.value === 'pork' ? charts.value?.demandPork : charts.value?.demandVeg;
  const data = top5WithOther(filterByUnit(raw, demandUnitTab.value));
  renderPie(demandPieEl, () => (demandPie ??= echarts.init(demandPieEl.value!)), data, t('warehouse.dashboard.chartDemandPie'));
}

/** 图② 退货环：先按维度一（猪肉/果蔬）取分布，再按维度二（KG/非 KG）过滤，取退货最高 TOP5、其余归「其他」。 */
function renderReturnRing() {
  const raw = returnTab.value === 'pork' ? charts.value?.returnPork : charts.value?.returnVegetable;
  const data = top5WithOther(filterByUnit(raw, returnUnitTab.value));
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
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      // 白条头数系列显「原值+头」；两条重量线显「3 位小数 + KG」（流程性问题 row45）。
      formatter: (params: unknown): string => {
        const arr = (Array.isArray(params) ? params : [params]) as TrendTooltipParam[];
        if (arr.length === 0) return '';
        const uHead = t('warehouse.dashboard.unitHead');
        const uKg = t('warehouse.dashboard.unitKg');
        const lines = [arr[0].axisValue];
        for (const p of arr) {
          const valText = p.seriesName === nameHead ? `${p.value}${uHead}` : `${Number(p.value).toFixed(3)} ${uKg}`;
          lines.push(`${p.marker}${p.seriesName}：${valText}`);
        }
        return lines.join('<br/>');
      }
    },
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
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { bottom: 0, data: [namePork, nameVeg] },
    grid: { left: 50, right: 50, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    // 双竖轴：左轴猪肉损耗量 / 右轴果蔬损耗量，各自独立缩放（流程性问题 row76）。
    yAxis: [
      { type: 'value', name: namePork, position: 'left', nameTextStyle: { color: '#5b8ff9' }, axisLine: { show: true, lineStyle: { color: '#5b8ff9' } } },
      { type: 'value', name: nameVeg, position: 'right', nameTextStyle: { color: '#73d13d' }, axisLine: { show: true, lineStyle: { color: '#73d13d' } } }
    ],
    series: [
      {
        name: namePork,
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#5b8ff9' },
        itemStyle: { color: '#5b8ff9' },
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

/** 空态占位：不画占位圆，改居中「暂无数据」文本（graphic）。 */
function renderEmptyChart(chart: echarts.ECharts) {
  chart.clear();
  chart.setOption({
    graphic: { type: 'text', left: 'center', top: 'middle', style: { text: t('warehouse.dashboard.noData'), fill: '#999', fontSize: 14 } }
  });
}

function renderPie(el: typeof demandPieEl, getChart: () => echarts.ECharts, data: ChartSeriesItem[] | undefined, name: string) {
  if (!el.value) return;
  const chart = getChart();
  const items = (data ?? []).filter((d) => Number(d.value) > 0).map((d) => ({ name: d.name, value: Number(d.value) }));
  if (items.length === 0) {
    renderEmptyChart(chart);
    return;
  }
  chart.clear();
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
        label: { show: true, formatter: '{b}，{c}' },
        data: items
      }
    ]
  });
}

function renderRing(el: typeof returnRingEl, getChart: () => echarts.ECharts, data: ChartSeriesItem[] | undefined, name: string) {
  if (!el.value) return;
  const chart = getChart();
  const items = (data ?? []).filter((d) => Number(d.value) > 0).map((d) => ({ name: d.name, value: Number(d.value) }));
  if (items.length === 0) {
    renderEmptyChart(chart);
    return;
  }
  chart.clear();
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
        label: { show: true, formatter: '{b}，{c}' },
        data: items
      }
    ]
  });
}

function disposeCharts() {
  [demandPie, returnRing, productionTrend, checkPie, lossTrend].forEach((c) => c?.dispose());
  demandPie = returnRing = productionTrend = checkPie = lossTrend = null;
}

function handleResize() {
  [demandPie, returnRing, productionTrend, checkPie, lossTrend].forEach((c) => c?.resize());
}

// 需求饼 维度一 / 维度二 切换 → 仅重渲染该饼图
watch(demandTab, () => renderDemandPie());
watch(demandUnitTab, () => renderDemandPie());
// 退货环 维度一 / 维度二 切换 → 仅重渲染该环图
watch(returnTab, () => renderReturnRing());
watch(returnUnitTab, () => renderReturnRing());

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
    .chart-unit-switch {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
    }

    .chart-canvas {
      width: 100%;
      height: 280px;
    }
  }
}
</style>
