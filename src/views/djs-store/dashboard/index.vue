<template>
  <div class="store-dashboard p-2">
    <!-- KPI 横条：6 卡（保持原样，不动） -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todaySale') }}</div>
          <div class="kpi-value">{{ summary?.todaySaleAmount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthSale') }}</div>
          <div class="kpi-value">{{ summary?.monthSaleAmount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todayOrder') }}</div>
          <div class="kpi-value">{{ summary?.todayOrderCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthOrder') }}</div>
          <div class="kpi-value">{{ summary?.monthOrderCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.pendingShip') }}</div>
          <div class="kpi-value warn">{{ summary?.pendingShipCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.pendingPurchase') }}</div>
          <div class="kpi-value warn">{{ summary?.pendingPurchaseCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 当日产品结构（按业态）：ECharts 饼图，业态名走字典 label -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="block-card">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('storeDashboard.title.productStructure') }}</span>
              <el-button size="small" :loading="loading" @click="load">{{ t('storeDashboard.action.refresh') }}</el-button>
            </div>
          </template>
          <div ref="productPieEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>

      <!-- 当月 TOP10 产品排行：ECharts 横条 bar（productName 当类目，saleAmount 为值） -->
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.top10') }}</span>
          </template>
          <div ref="top10BarEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 近 10 日订单数柱（新会员线待后端扩 VO，见 _open-issues） -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.trend') }} · {{ t('storeDashboard.legend.orderCount') }}</span>
          </template>
          <div ref="orderComboEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>

      <!-- 销售额 + 客单价双轴折线 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.legend.saleAmount') }} / {{ t('storeDashboard.legend.avgPrice') }}</span>
          </template>
          <div ref="salePriceLineEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 门店看板 admin 端入口（STR-DASH-001 / ADMIN-DASH-CHART-001 ECharts 化）。
 *
 * 4 ECharts（后端 summary 已返序列，本 ticket 只替换渲染层，不改后端 VO）：
 *  1. 当日产品结构饼图（productStructure，业态名走 djs_demand_product_type 字典 label）
 *  2. 当月 TOP10 横条 bar（top10Products，productName 当类目 / saleAmount 为值）
 *  3. 近 10 日订单数柱（trend10Days.orderCount；新会员线缺字段，待后端扩 VO）
 *  4. 销售额 + 客单价双轴折线（trend10Days.saleAmount / avgPrice）
 *
 * ECharts 4 件套：onMounted init / onUnmounted dispose+clearInterval / window resize / 5 分钟轮询。
 * 只用现有 echarts 6.0.0，不引新库。snowflake productId 不当数值轴（丢精度）。
 */
import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { getStoreDashboardSummary, type StoreDashboardSummaryVo } from '@/api/djs-store/dashboard';
import { STORE_CHART_COLOR, REFRESH_INTERVAL_MS } from './constants';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 业态字典（Vue3 toRefs 写法，避免整页空白事故 C-fe；饼图扇区名走字典 label）
const { djs_demand_product_type } = toRefs<any>(proxy?.useDict('djs_demand_product_type'));

const summary = ref<StoreDashboardSummaryVo | null>(null);
const loading = ref(false);

const productPieEl = ref<HTMLDivElement>();
const top10BarEl = ref<HTMLDivElement>();
const orderComboEl = ref<HTMLDivElement>();
const salePriceLineEl = ref<HTMLDivElement>();

let productPie: echarts.ECharts | null = null;
let top10Bar: echarts.ECharts | null = null;
let orderCombo: echarts.ECharts | null = null;
let salePriceLine: echarts.ECharts | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/** 业态 code → 中文 label：字典优先，缺失落 raw key */
function productTypeLabel(code: string): string {
  const dict = djs_demand_product_type?.value as { value: string; label: string }[] | undefined;
  return dict?.find((d) => d.value === code)?.label ?? code;
}

/** 空态 option：图中央显示「暂无数据」 */
function emptyOption() {
  return {
    title: { text: t('storeDashboard.chart.noData'), left: 'center', top: 'center', textStyle: { fontSize: 14, color: '#999' } }
  };
}

async function load() {
  loading.value = true;
  try {
    const res = await getStoreDashboardSummary();
    summary.value = res.data ?? null;
    await nextTick();
    renderAll();
  } finally {
    loading.value = false;
  }
}

function renderAll() {
  renderProductPie();
  renderTop10Bar();
  renderOrderCombo();
  renderSalePriceLine();
}

/** 当日产品结构饼图：扇区名走业态字典 label，value=需求量 */
function renderProductPie() {
  if (!productPieEl.value) return;
  if (!productPie) productPie = echarts.init(productPieEl.value);
  const list = summary.value?.productStructure ?? [];
  if (!list.length) {
    productPie.clear();
    productPie.setOption(emptyOption());
    return;
  }
  const data = list.map((s) => ({ name: productTypeLabel(s.key), value: s.value }));
  productPie.setOption({
    color: STORE_CHART_COLOR.pie,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
        data
      }
    ]
  });
}

/** 当月 TOP10 横条 bar：y=productName（类目），x=saleAmount（值）；saleQty 进 tooltip */
function renderTop10Bar() {
  if (!top10BarEl.value) return;
  if (!top10Bar) top10Bar = echarts.init(top10BarEl.value);
  const list = summary.value?.top10Products ?? [];
  if (!list.length) {
    top10Bar.clear();
    top10Bar.setOption(emptyOption());
    return;
  }
  // 横条 bar 自下而上递增，倒序使销售额最大者落在最顶部
  const sorted = [...list].sort((a, b) => Number(a.saleAmount) - Number(b.saleAmount));
  const names = sorted.map((p) => p.productName);
  const qtyMap = new Map(sorted.map((p) => [p.productName, p.saleQty]));
  top10Bar.setOption({
    color: [STORE_CHART_COLOR.bar],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: TooltipParam[]) => {
        const p = params[0];
        const qty = qtyMap.get(String(p.name)) ?? 0;
        return `${p.name}<br/>${t('storeDashboard.column.saleAmount')}: ${p.value}<br/>${t('storeDashboard.column.saleQty')}: ${qty}`;
      }
    },
    grid: { left: 12, right: 50, top: 16, bottom: 16, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontSize: 11, width: 110, overflow: 'truncate' }
    },
    series: [
      {
        name: t('storeDashboard.column.saleAmount'),
        type: 'bar',
        barWidth: '55%',
        label: { show: true, position: 'right', fontSize: 11 },
        data: sorted.map((p) => p.saleAmount)
      }
    ]
  });
}

/** 近 10 日订单数柱（x=date，柱=orderCount）。新会员线缺 VO 字段，本 ticket 仅订单柱。 */
function renderOrderCombo() {
  if (!orderComboEl.value) return;
  if (!orderCombo) orderCombo = echarts.init(orderComboEl.value);
  const list = summary.value?.trend10Days ?? [];
  if (!list.length) {
    orderCombo.clear();
    orderCombo.setOption(emptyOption());
    return;
  }
  orderCombo.setOption({
    color: [STORE_CHART_COLOR.primary],
    tooltip: { trigger: 'axis' },
    grid: { left: 12, right: 16, top: 24, bottom: 24, containLabel: true },
    xAxis: { type: 'category', data: list.map((p) => p.date), axisLabel: { fontSize: 11, rotate: list.length > 7 ? 30 : 0 } },
    yAxis: { type: 'value', name: t('storeDashboard.legend.orderCount') },
    series: [
      {
        name: t('storeDashboard.legend.orderCount'),
        type: 'bar',
        barWidth: '50%',
        label: { show: true, position: 'top', fontSize: 11 },
        data: list.map((p) => p.orderCount)
      }
    ]
  });
}

/** 销售额 + 客单价双轴折线：x=date，左轴 saleAmount，右轴 avgPrice */
function renderSalePriceLine() {
  if (!salePriceLineEl.value) return;
  if (!salePriceLine) salePriceLine = echarts.init(salePriceLineEl.value);
  const list = summary.value?.trend10Days ?? [];
  if (!list.length) {
    salePriceLine.clear();
    salePriceLine.setOption(emptyOption());
    return;
  }
  salePriceLine.setOption({
    color: [STORE_CHART_COLOR.primary, STORE_CHART_COLOR.accent],
    tooltip: { trigger: 'axis' },
    legend: { data: [t('storeDashboard.legend.saleAmount'), t('storeDashboard.legend.avgPrice')], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 12, right: 12, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: list.map((p) => p.date), axisLabel: { fontSize: 11, rotate: list.length > 7 ? 30 : 0 } },
    yAxis: [
      { type: 'value', name: t('storeDashboard.axis.saleAmount'), position: 'left' },
      { type: 'value', name: t('storeDashboard.axis.avgPrice'), position: 'right' }
    ],
    series: [
      {
        name: t('storeDashboard.legend.saleAmount'),
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        data: list.map((p) => p.saleAmount)
      },
      {
        name: t('storeDashboard.legend.avgPrice'),
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: list.map((p) => p.avgPrice)
      }
    ]
  });
}

/** ECharts tooltip formatter 回调参数最小类型（避免 any，CLAUDE.md §6 #7） */
interface TooltipParam {
  name: string | number;
  value: number | string;
}

function disposeCharts() {
  productPie?.dispose();
  productPie = null;
  top10Bar?.dispose();
  top10Bar = null;
  orderCombo?.dispose();
  orderCombo = null;
  salePriceLine?.dispose();
  salePriceLine = null;
}

function handleResize() {
  productPie?.resize();
  top10Bar?.resize();
  orderCombo?.resize();
  salePriceLine?.resize();
}

onMounted(async () => {
  await load();
  window.addEventListener('resize', handleResize);
  timer = setInterval(load, REFRESH_INTERVAL_MS);
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

<style lang="scss" scoped>
.store-dashboard {
  .kpi-row {
    margin-bottom: 16px;
  }

  .kpi-card {
    text-align: center;

    .kpi-label {
      font-size: 13px;
      color: #909399;
    }

    .kpi-value {
      margin: 6px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;

      &.warn {
        color: #e6a23c;
      }
    }

    .kpi-unit {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .block-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-weight: 600;
    }
  }

  .chart-canvas {
    width: 100%;
    height: 300px;
  }
}
</style>
