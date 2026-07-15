<template>
  <div class="store-dashboard p-2">
    <!-- 销售订单板块：今日销售额 / 本月累计销售额 / 今日订单数 / 本月累计订单数 -->
    <el-card shadow="never" class="kpi-group">
      <template #header>
        <span class="group-title">{{ t('storeDashboard.title.saleOrderGroup') }}</span>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="kpi-card">
            <div class="kpi-label">{{ t('storeDashboard.kpi.todaySale') }}</div>
            <div class="kpi-value">{{ summary?.todaySaleAmount ?? 0 }}</div>
            <div class="kpi-foot">
              <span class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</span>
              <span v-if="yoyText(summary?.todaySaleAmountYoy)" class="kpi-yoy" :class="yoyClass(summary?.todaySaleAmountYoy)">{{ yoyText(summary?.todaySaleAmountYoy) }}</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="kpi-card">
            <div class="kpi-label">{{ t('storeDashboard.kpi.monthSale') }}</div>
            <div class="kpi-value">{{ summary?.monthSaleAmount ?? 0 }}</div>
            <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</span></div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="kpi-card">
            <div class="kpi-label">{{ t('storeDashboard.kpi.todayOrder') }}</div>
            <div class="kpi-value">{{ summary?.todayOrderCount ?? 0 }}</div>
            <div class="kpi-foot">
              <span class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</span>
              <span v-if="yoyText(summary?.todayOrderCountYoy)" class="kpi-yoy" :class="yoyClass(summary?.todayOrderCountYoy)">{{ yoyText(summary?.todayOrderCountYoy) }}</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="kpi-card">
            <div class="kpi-label">{{ t('storeDashboard.kpi.monthOrder') }}</div>
            <div class="kpi-value">{{ summary?.monthOrderCount ?? 0 }}</div>
            <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</span></div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 本月客单价 -->
    <el-card shadow="never" class="kpi-group">
      <template #header>
        <div class="group-header">
          <span class="group-title">{{ t('storeDashboard.kpi.monthAvgPrice') }}</span>
          <el-button size="small" :loading="loading" @click="load">{{ t('storeDashboard.action.refresh') }}</el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="kpi-card">
            <div class="kpi-label">{{ t('storeDashboard.kpi.monthAvgPrice') }}</div>
            <div class="kpi-value">{{ summary?.monthAvgPrice ?? 0 }}</div>
            <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</span></div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <!-- 当月订单产品结构：饼图（各产品订单占比） -->
      <el-col :xs="24" :md="9">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.monthProductStructure') }}</span>
          </template>
          <div ref="productStructureEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>

      <!-- 当月热门产品排行 TOP10（按订单数）：横向柱状图 -->
      <el-col :xs="24" :md="15">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.monthTop10ByOrder') }}</span>
          </template>
          <div ref="top10BarEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近十日订单数趋势 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.axis.orderCount') }}</span>
          </template>
          <div ref="memberOrderTrendEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售额与客单价趋势：竖柱（销售额）+ 折线（客单价），双轴，横轴本月每天 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.saleAvgPriceTrend') }}</span>
          </template>
          <div ref="saleAvgPriceTrendEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 门店总览 admin 端（0613-02 对齐原型 6 板块）。
 *
 * KPI 两组：
 *  - 销售订单：今日销售额 / 本月累计销售额 / 今日订单数 / 本月累计订单数
 *
 * 4 ECharts（后端 summary 已返序列，前端只渲染层）：
 *  1. 当月订单产品结构 饼图（monthProductStructure，name=产品名 / value=当月订单数）
 *  2. 当月热门产品排行 TOP10（monthTop10ByOrder，productName 当类目 / orderCount 为值，横向柱）
 *  3. 近十日订单数趋势（折线=trend10Days.orderCount 订单数）
 *  4. 销售额与客单价趋势（双轴：竖柱=monthDailyTrend.saleAmount / 折线=monthDailyTrend.avgPrice，横轴本月每天）
 *
 * ECharts 4 件套：onMounted init / onUnmounted dispose+clearInterval / window resize / 5 分钟轮询。
 * 只用现有 echarts，不引新库。snowflake productId 不当数值轴（丢精度）。
 */
import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { getStoreDashboardSummary, type StoreDashboardSummaryVo, type StoreTrendPoint } from '@/api/djs-store/dashboard';
import { STORE_CHART_COLOR, REFRESH_INTERVAL_MS } from './constants';

const { t } = useI18n();
getCurrentInstance();

const summary = ref<StoreDashboardSummaryVo | null>(null);
const loading = ref(false);

const productStructureEl = ref<HTMLDivElement>();
const top10BarEl = ref<HTMLDivElement>();
const memberOrderTrendEl = ref<HTMLDivElement>();
const saleAvgPriceTrendEl = ref<HTMLDivElement>();

let productStructure: echarts.ECharts | null = null;
let top10Bar: echarts.ECharts | null = null;
let memberOrderTrend: echarts.ECharts | null = null;
let saleAvgPriceTrend: echarts.ECharts | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/** 同比角标文案：null/undefined 不显示，正负带箭头 + 百分号 */
function yoyText(yoy?: number | null): string {
  if (yoy === null || yoy === undefined) return '';
  const arrow = Number(yoy) >= 0 ? '↑' : '↓';
  return `${arrow}${Math.abs(Number(yoy))}%`;
}

/** 同比角标颜色：涨绿跌红 */
function yoyClass(yoy?: number | null): string {
  if (yoy === null || yoy === undefined) return '';
  return Number(yoy) >= 0 ? 'up' : 'down';
}

/** 空态 option：图中央显示「暂无数据」 */
function emptyOption() {
  return {
    title: { text: t('storeDashboard.chart.noData'), left: 'center', top: 'center', textStyle: { fontSize: 14, color: '#999' } }
  };
}

/** 'YYYY-MM-DD' → 'MM-DD'（趋势图横轴更紧凑） */
function shortDate(date: string): string {
  if (!date) return '';
  const parts = date.split('-');
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : date;
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
  renderProductStructure();
  renderTop10Bar();
  renderMemberOrderTrend();
  renderSaleAvgPriceTrend();
}

/** 当月订单产品结构 饼图：name=产品名，value=当月订单数 */
function renderProductStructure() {
  if (!productStructureEl.value) return;
  if (!productStructure) productStructure = echarts.init(productStructureEl.value);
  const list = summary.value?.monthProductStructure ?? [];
  if (!list.length) {
    productStructure.clear();
    productStructure.setOption(emptyOption());
    return;
  }
  const data = list.map((p) => ({ name: p.key, value: p.value }));
  productStructure.setOption({
    color: [...STORE_CHART_COLOR.pie],
    tooltip: { trigger: 'item', formatter: `{b}: {c} ${t('storeDashboard.kpi.orderUnit')} ({d}%)` },
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

/** 当月热门产品排行 TOP10（按订单数）：y=productName（类目），x=orderCount（值）；销售额进 tooltip */
function renderTop10Bar() {
  if (!top10BarEl.value) return;
  if (!top10Bar) top10Bar = echarts.init(top10BarEl.value);
  const list = summary.value?.monthTop10ByOrder ?? [];
  if (!list.length) {
    top10Bar.clear();
    top10Bar.setOption(emptyOption());
    return;
  }
  // 横条 bar 自下而上递增，倒序使订单数最大者落在最顶部
  const sorted = [...list].sort((a, b) => Number(a.orderCount ?? 0) - Number(b.orderCount ?? 0));
  const names = sorted.map((p) => p.productName);
  const amountMap = new Map(sorted.map((p) => [p.productName, p.saleAmount]));
  top10Bar.setOption({
    color: [STORE_CHART_COLOR.bar],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: TooltipParam[]) => {
        const p = params[0];
        const amount = amountMap.get(String(p.name)) ?? 0;
        return `${p.name}<br/>${t('storeDashboard.column.orderCount')}: ${p.value}<br/>${t('storeDashboard.column.saleAmount')}: ${amount}`;
      }
    },
    grid: { left: 12, right: 50, top: 16, bottom: 16, containLabel: true },
    xAxis: { type: 'value', name: t('storeDashboard.column.orderCount') },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontSize: 11, width: 110, overflow: 'truncate' }
    },
    series: [
      {
        name: t('storeDashboard.column.orderCount'),
        type: 'bar',
        barWidth: '55%',
        label: { show: true, position: 'right', fontSize: 11 },
        data: sorted.map((p) => p.orderCount ?? 0)
      }
    ]
  });
}

/**
 * 近十日订单数趋势：折线。x=最近 10 天日期；订单数。
 */
function renderMemberOrderTrend() {
  if (!memberOrderTrendEl.value) return;
  if (!memberOrderTrend) memberOrderTrend = echarts.init(memberOrderTrendEl.value);
  const orders = summary.value?.trend10Days ?? [];
  if (!orders.length) {
    memberOrderTrend.clear();
    memberOrderTrend.setOption(emptyOption());
    return;
  }
  const orderName = t('storeDashboard.legend.orderCount');
  memberOrderTrend.setOption({
    color: [STORE_CHART_COLOR.accent],
    tooltip: { trigger: 'axis' },
    legend: { data: [orderName], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 12, right: 24, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: orders.map((p) => shortDate(p.date)), axisLabel: { fontSize: 11, rotate: orders.length > 7 ? 30 : 0 } },
    yAxis: [{ type: 'value', name: t('storeDashboard.axis.orderCount'), position: 'left' }],
    series: [
      { name: orderName, type: 'line', smooth: true, data: orders.map((p: StoreTrendPoint) => Number(p.orderCount ?? 0)) }
    ]
  });
}

/**
 * 销售额与客单价趋势：双轴。
 * x=本月每天；竖柱（左轴）=销售额；折线（右轴）=客单价。
 */
function renderSaleAvgPriceTrend() {
  if (!saleAvgPriceTrendEl.value) return;
  if (!saleAvgPriceTrend) saleAvgPriceTrend = echarts.init(saleAvgPriceTrendEl.value);
  const list = summary.value?.monthDailyTrend ?? [];
  if (!list.length) {
    saleAvgPriceTrend.clear();
    saleAvgPriceTrend.setOption(emptyOption());
    return;
  }
  const saleName = t('storeDashboard.legend.saleAmount');
  const avgName = t('storeDashboard.legend.avgPrice');
  saleAvgPriceTrend.setOption({
    color: [STORE_CHART_COLOR.primary, STORE_CHART_COLOR.accent],
    tooltip: { trigger: 'axis' },
    legend: { data: [saleName, avgName], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 12, right: 24, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: list.map((p) => shortDate(p.date)), axisLabel: { fontSize: 11, rotate: list.length > 10 ? 45 : 30 } },
    yAxis: [
      { type: 'value', name: t('storeDashboard.axis.saleAmount'), position: 'left' },
      { type: 'value', name: t('storeDashboard.axis.avgPrice'), position: 'right' }
    ],
    series: [
      { name: saleName, type: 'bar', barWidth: '50%', yAxisIndex: 0, data: list.map((p) => p.saleAmount) },
      { name: avgName, type: 'line', smooth: true, yAxisIndex: 1, data: list.map((p) => p.avgPrice) }
    ]
  });
}

/** 多组日期数组合并去重 + 升序（双序列 union 横轴） */
function mergeDates(dateLists: string[][]): string[] {
  const set = new Set<string>();
  dateLists.forEach((list) => list.forEach((d) => set.add(d)));
  return Array.from(set).sort();
}

/** ECharts tooltip formatter 回调参数最小类型（避免 any，CLAUDE.md §6 #7） */
interface TooltipParam {
  name: string | number;
  value: number | string;
}

function disposeCharts() {
  productStructure?.dispose();
  productStructure = null;
  top10Bar?.dispose();
  top10Bar = null;
  memberOrderTrend?.dispose();
  memberOrderTrend = null;
  saleAvgPriceTrend?.dispose();
  saleAvgPriceTrend = null;
}

function handleResize() {
  productStructure?.resize();
  top10Bar?.resize();
  memberOrderTrend?.resize();
  saleAvgPriceTrend?.resize();
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
  .kpi-group {
    margin-bottom: 16px;

    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .group-title {
      font-weight: 600;
    }
  }

  .kpi-card {
    text-align: center;
    padding: 8px 0;

    .kpi-label {
      font-size: 13px;
      color: #909399;
    }

    .kpi-value {
      margin: 6px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;

      &.accent {
        color: #409eff;
      }
    }

    .kpi-foot {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .kpi-unit {
      font-size: 12px;
      color: #c0c4cc;
    }

    .kpi-yoy {
      font-size: 12px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }
  }

  .block-card {
    margin-bottom: 16px;

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
