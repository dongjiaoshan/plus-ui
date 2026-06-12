<template>
  <div class="store-dashboard p-2">
    <!-- KPI 横条：销售订单组 + 客户/会员组（对齐原型门店总览顶部两组卡） -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todaySale') }}</div>
          <div class="kpi-value">{{ summary?.todaySaleAmount ?? 0 }}</div>
          <div class="kpi-foot">
            <span class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</span>
            <span v-if="yoyText(summary?.todaySaleAmountYoy)" class="kpi-yoy" :class="yoyClass(summary?.todaySaleAmountYoy)">{{ yoyText(summary?.todaySaleAmountYoy) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthSale') }}</div>
          <div class="kpi-value">{{ summary?.monthSaleAmount ?? 0 }}</div>
          <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</span></div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todayOrder') }}</div>
          <div class="kpi-value">{{ summary?.todayOrderCount ?? 0 }}</div>
          <div class="kpi-foot">
            <span class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</span>
            <span v-if="yoyText(summary?.todayOrderCountYoy)" class="kpi-yoy" :class="yoyClass(summary?.todayOrderCountYoy)">{{ yoyText(summary?.todayOrderCountYoy) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthOrder') }}</div>
          <div class="kpi-value">{{ summary?.monthOrderCount ?? 0 }}</div>
          <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</span></div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.totalMembers') }}</div>
          <div class="kpi-value">{{ summary?.totalMembers ?? 0 }}</div>
          <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.memberUnit') }}</span></div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todayNewMembers') }}</div>
          <div class="kpi-value accent">{{ summary?.todayNewMembers ?? 0 }}</div>
          <div class="kpi-foot"><span class="kpi-unit">{{ t('storeDashboard.kpi.memberUnit') }}</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 当日热销产品 TOP10 环形（donut，name=产品名 / value=销售额） -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="block-card">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('storeDashboard.title.top10Donut') }}</span>
              <el-button size="small" :loading="loading" @click="load">{{ t('storeDashboard.action.refresh') }}</el-button>
            </div>
          </template>
          <div ref="top10DonutEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>

      <!-- 当日热销产品 TOP10 横条 bar（productName 当类目 / saleAmount 为值） -->
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
      <!-- 销售量与退货量趋势：近 10 日双柱（saleQty / returnQty） -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.saleReturnTrend') }}</span>
          </template>
          <div ref="saleReturnBarEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>

      <!-- 销售额变化趋势：近 10 日单折线（saleAmount） -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.saleAmountTrend') }}</span>
          </template>
          <div ref="saleAmountLineEl" v-loading="loading" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 门店总览 admin 端入口（STR-DASH-001 / STORE-REALIGN-DASH-001 对齐原型门店首页）。
 *
 * 4 ECharts（后端 summary 已返序列，前端只渲染层）：
 *  1. 当日热销产品 TOP10 环形 donut（top10Products，name=productName / value=saleAmount）
 *  2. 当日热销产品 TOP10 横条 bar（top10Products，productName 当类目 / saleAmount 为值）
 *  3. 销售量与退货量趋势双柱（trend10Days.saleQty / returnQty）
 *  4. 销售额变化趋势单折线（trend10Days.saleAmount）
 *
 * KPI：销售订单组（今日/本月 销售额 + 订单数 + 同比）+ 客户/会员组（会员数 + 今日新增）。
 * ECharts 4 件套：onMounted init / onUnmounted dispose+clearInterval / window resize / 5 分钟轮询。
 * 只用现有 echarts 6.0.0，不引新库。snowflake productId 不当数值轴（丢精度）。
 */
import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { useI18n } from 'vue-i18n';
import { getStoreDashboardSummary, type StoreDashboardSummaryVo } from '@/api/djs-store/dashboard';
import { STORE_CHART_COLOR, REFRESH_INTERVAL_MS } from './constants';

const { t } = useI18n();
getCurrentInstance();

const summary = ref<StoreDashboardSummaryVo | null>(null);
const loading = ref(false);

const top10DonutEl = ref<HTMLDivElement>();
const top10BarEl = ref<HTMLDivElement>();
const saleReturnBarEl = ref<HTMLDivElement>();
const saleAmountLineEl = ref<HTMLDivElement>();

let top10Donut: echarts.ECharts | null = null;
let top10Bar: echarts.ECharts | null = null;
let saleReturnBar: echarts.ECharts | null = null;
let saleAmountLine: echarts.ECharts | null = null;
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
  renderTop10Donut();
  renderTop10Bar();
  renderSaleReturnBar();
  renderSaleAmountLine();
}

/** 当日热销产品 TOP10 环形 donut：name=产品名，value=销售额 */
function renderTop10Donut() {
  if (!top10DonutEl.value) return;
  if (!top10Donut) top10Donut = echarts.init(top10DonutEl.value);
  const list = summary.value?.top10Products ?? [];
  if (!list.length) {
    top10Donut.clear();
    top10Donut.setOption(emptyOption());
    return;
  }
  const data = list.map((p) => ({ name: p.productName, value: p.saleAmount }));
  top10Donut.setOption({
    color: [...STORE_CHART_COLOR.pie],
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

/** 当日热销产品 TOP10 横条 bar：y=productName（类目），x=saleAmount（值）；saleQty 进 tooltip */
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

/** 销售量与退货量趋势：近 10 日双柱（x=date，柱1=saleQty，柱2=returnQty） */
function renderSaleReturnBar() {
  if (!saleReturnBarEl.value) return;
  if (!saleReturnBar) saleReturnBar = echarts.init(saleReturnBarEl.value);
  const list = summary.value?.trend10Days ?? [];
  if (!list.length) {
    saleReturnBar.clear();
    saleReturnBar.setOption(emptyOption());
    return;
  }
  const saleName = t('storeDashboard.legend.saleQty');
  const returnName = t('storeDashboard.legend.returnQty');
  saleReturnBar.setOption({
    color: [STORE_CHART_COLOR.primary, STORE_CHART_COLOR.accent],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: [saleName, returnName], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 12, right: 16, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: list.map((p) => p.date), axisLabel: { fontSize: 11, rotate: list.length > 7 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series: [
      { name: saleName, type: 'bar', barGap: 0, barWidth: '32%', data: list.map((p) => p.saleQty) },
      { name: returnName, type: 'bar', barWidth: '32%', data: list.map((p) => p.returnQty) }
    ]
  });
}

/** 销售额变化趋势：近 10 日单折线（x=date，line=saleAmount） */
function renderSaleAmountLine() {
  if (!saleAmountLineEl.value) return;
  if (!saleAmountLine) saleAmountLine = echarts.init(saleAmountLineEl.value);
  const list = summary.value?.trend10Days ?? [];
  if (!list.length) {
    saleAmountLine.clear();
    saleAmountLine.setOption(emptyOption());
    return;
  }
  saleAmountLine.setOption({
    color: [STORE_CHART_COLOR.primary],
    tooltip: { trigger: 'axis' },
    grid: { left: 12, right: 16, top: 24, bottom: 24, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: list.map((p) => p.date), axisLabel: { fontSize: 11, rotate: list.length > 7 ? 30 : 0 } },
    yAxis: { type: 'value', name: t('storeDashboard.axis.saleAmount') },
    series: [
      {
        name: t('storeDashboard.legend.saleAmount'),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.08 },
        data: list.map((p) => p.saleAmount)
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
  top10Donut?.dispose();
  top10Donut = null;
  top10Bar?.dispose();
  top10Bar = null;
  saleReturnBar?.dispose();
  saleReturnBar = null;
  saleAmountLine?.dispose();
  saleAmountLine = null;
}

function handleResize() {
  top10Donut?.resize();
  top10Bar?.resize();
  saleReturnBar?.resize();
  saleAmountLine?.resize();
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
