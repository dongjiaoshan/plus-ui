<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="fatten-info__header">
          <span class="fatten-info__title">{{ t('fattenInfo.title') }}</span>
          <el-button v-hasPermi="['djs:ops:fattenInfo:query']" icon="Refresh" :loading="loading" @click="loadAll">
            {{ t('fattenInfo.refresh') }}
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane v-for="seg in SEGMENTS" :key="seg" :name="seg">
          <template #label>
            {{ segLabel(seg) }}（{{ headCount(seg) }}{{ t('fattenInfo.unit.head') }}）
          </template>

          <div v-loading="loading" class="fatten-info__body">
            <!-- 日龄分布柱状图（口径与小程序「猪只库存信息」页一致：只画有头数的段） -->
            <div class="fatten-info__section-title">{{ chartTitle(seg) }}</div>
            <div v-if="chartRows(seg).length > 0" :ref="(el) => setChartEl(seg, el)" class="fatten-info__chart"></div>
            <el-empty v-else :description="t('fattenInfo.empty')" />

            <!-- 栋舍 × 日龄段矩阵 -->
            <div class="fatten-info__section-title">{{ t('fattenInfo.matrixTitle') }}</div>
            <div v-if="selectedBucket[seg]" class="fatten-info__filter-tip">
              <el-tag type="warning" closable @close="selectedBucket[seg] = ''">
                {{ t('fattenInfo.filterTip', { bucket: selectedBucket[seg] }) }}
              </el-tag>
            </div>
            <el-table
              v-if="matrixMap[seg].length > 0"
              :data="sortedRows(seg)"
              border
              stripe
              show-summary
              :summary-method="summaryMethod"
            >
              <el-table-column prop="barnName" :label="t('fattenInfo.col.barn')" min-width="140" fixed="left" />
              <el-table-column v-for="bucket in visibleBuckets(seg)" :key="bucket" :label="bucket" min-width="120" align="center">
                <template #default="scope">{{ bucketCount(scope.row, bucket) }}</template>
              </el-table-column>
              <el-table-column v-if="!selectedBucket[seg]" :label="t('fattenInfo.col.total')" min-width="110" align="center">
                <template #default="scope">{{ rowTotal(scope.row) }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-else :description="t('fattenInfo.empty')" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="OpsFattenInfo" lang="ts">
/**
 * 运营管理 → 农场信息 → 育肥猪信息（V6-R150）。
 *
 * 顶部两个 tab：育肥猪 / 仔猪，tab 名后跟该类猪当前存栏头数（= 下方表格各栋在栏数之和，
 * 与小程序「猪只库存信息」页卡头「在栏数」同一公式）。
 * 每个 tab 内：上方日龄分布柱状图 + 下方栋舍 × 日龄段矩阵表；
 * 点柱状图某一日龄区间 → 表格只保留该区间列（纯前端过滤，再点同一根取消）。
 *
 * 日龄分段口径 100% 复用后端 InventoryAppletService（小程序同一份实现），
 * 育肥猪段数来自后台「育肥日龄阶段配置」动态生成，前端不做任何分桶。
 */
import { ref, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import * as echarts from 'echarts';
import type { TableColumnCtx } from 'element-plus';
import {
  getOpsInventoryAgeDist,
  getOpsInventoryBarnMatrix,
  type InventoryBarnMatrixVO,
  type InventoryDistItemVO,
  type OpsInventoryPigType
} from '@/api/djs-breed/inventory';

const { t } = useI18n();

type Seg = OpsInventoryPigType;

const SEGMENTS: Seg[] = ['fattening', 'piglet'];
/** 柱图主色，对齐小程序 UChart 主绿，保证两端观感一致 */
const BAR_COLOR = '#2f7c44';

const activeTab = ref<Seg>('fattening');
const loading = ref(false);
const distMap = ref<Record<Seg, InventoryDistItemVO[]>>({ fattening: [], piglet: [] });
const matrixMap = ref<Record<Seg, InventoryBarnMatrixVO[]>>({ fattening: [], piglet: [] });
/** 当前选中的日龄区间（空串 = 不过滤） */
const selectedBucket = ref<Record<Seg, string>>({ fattening: '', piglet: '' });

const chartEls: Record<Seg, HTMLDivElement | null> = { fattening: null, piglet: null };
const charts: Record<Seg, echarts.ECharts | null> = { fattening: null, piglet: null };

function segLabel(seg: Seg): string {
  return seg === 'fattening' ? t('fattenInfo.tab.fattening') : t('fattenInfo.tab.piglet');
}

function chartTitle(seg: Seg): string {
  return seg === 'fattening' ? t('fattenInfo.chart.fatteningTitle') : t('fattenInfo.chart.pigletTitle');
}

/** tab 头数 = 各栋在栏数之和（与小程序 barnTotal 同公式，恒等于表格合计行） */
function headCount(seg: Seg): number {
  return matrixMap.value[seg].reduce((sum, b) => sum + (b.count || 0), 0);
}

/** 柱图只画有头数(>0)的段：与小程序日龄分布图一致，空桶不占柱位 */
function chartRows(seg: Seg): InventoryDistItemVO[] {
  return distMap.value[seg].filter((d) => (d.count || 0) > 0);
}

/** 全部日龄段（后端段序，含全 0 段）：表格列以此为准，保证各栋列位对齐 */
function allBuckets(seg: Seg): string[] {
  const labels = distMap.value[seg].map((d) => d.label);
  if (labels.length > 0) {
    return labels;
  }
  return Object.keys(matrixMap.value[seg][0]?.byAge ?? {});
}

/** 选中某段时只显示该段列（甲方原文：列表的日龄分布里仅显示点中的生长区间） */
function visibleBuckets(seg: Seg): string[] {
  const picked = selectedBucket.value[seg];
  return picked ? [picked] : allBuckets(seg);
}

/** 栋舍按名称自然序排（「2栋」排在「10栋」前），后端返回的是遍历相遇序 */
function sortedRows(seg: Seg): InventoryBarnMatrixVO[] {
  return [...matrixMap.value[seg]].sort((a, b) => (a.barnName || '').localeCompare(b.barnName || '', 'zh-CN', { numeric: true }));
}

/** 单元格：该栋舍在某日龄段的头数（后端 byAge 全段返回，缺省 0） */
function bucketCount(row: InventoryBarnMatrixVO, bucket: string): number {
  return row.byAge?.[bucket] ?? 0;
}

/** 单元格：该栋舍在栏总头数 */
function rowTotal(row: InventoryBarnMatrixVO): number {
  return row.count ?? 0;
}

function summaryMethod({ columns, data }: { columns: TableColumnCtx<InventoryBarnMatrixVO>[]; data: InventoryBarnMatrixVO[] }): string[] {
  const totalLabel = t('fattenInfo.col.total');
  return columns.map((col, idx) => {
    if (idx === 0) {
      return t('fattenInfo.col.sum');
    }
    if (col.label === totalLabel) {
      return String(data.reduce((sum, r) => sum + (r.count || 0), 0));
    }
    return String(data.reduce((sum, r) => sum + (r.byAge?.[col.label] ?? 0), 0));
  });
}

function setChartEl(seg: Seg, el: Element | ComponentPublicInstance | null): void {
  chartEls[seg] = el instanceof HTMLDivElement ? el : null;
}

function renderChart(seg: Seg): void {
  const el = chartEls[seg];
  const rows = chartRows(seg);
  if (!el || rows.length === 0) {
    return;
  }
  let chart = charts[seg];
  if (!chart) {
    chart = echarts.init(el);
    charts[seg] = chart;
    chart.on('click', (params: unknown) => {
      const name = (params as { name?: unknown })?.name;
      if (typeof name !== 'string' || !name) {
        return;
      }
      // 再点同一根取消过滤
      selectedBucket.value[seg] = selectedBucket.value[seg] === name ? '' : name;
    });
  }
  chart.setOption(
    {
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 24, bottom: 64 },
      xAxis: {
        type: 'category',
        data: rows.map((d) => d.label),
        axisLabel: { interval: 0, rotate: rows.length > 6 ? 30 : 0 }
      },
      yAxis: { type: 'value', min: 0, minInterval: 1 },
      series: [
        {
          name: t('fattenInfo.chart.series'),
          type: 'bar',
          barWidth: '45%',
          itemStyle: { color: BAR_COLOR },
          label: { show: true, position: 'top' },
          data: rows.map((d) => d.count || 0)
        }
      ]
    },
    // notMerge：段数随后台阶段配置变化，必须清掉旧 series/轴
    true
  );
  chart.resize();
}

function disposeChart(seg: Seg): void {
  const chart = charts[seg];
  if (chart) {
    chart.dispose();
    charts[seg] = null;
  }
}

async function loadSeg(seg: Seg): Promise<void> {
  const [distRes, matrixRes] = await Promise.all([getOpsInventoryAgeDist(seg), getOpsInventoryBarnMatrix(seg)]);
  distMap.value[seg] = distRes.data ?? [];
  matrixMap.value[seg] = matrixRes.data ?? [];
}

async function loadAll(): Promise<void> {
  loading.value = true;
  try {
    // 两段都要预载：两个 tab 的标题都要显示各自头数
    await Promise.all(SEGMENTS.map((seg) => loadSeg(seg)));
    // 段集合可能随后台配置变化，重置过滤态避免选中一个已不存在的区间
    SEGMENTS.forEach((seg) => {
      if (selectedBucket.value[seg] && !allBuckets(seg).includes(selectedBucket.value[seg])) {
        selectedBucket.value[seg] = '';
      }
    });
    await nextTick();
    // 数据变化后重建图（段数变了要 notMerge 重画），非当前 tab 容器宽度为 0，切过去时再 render
    SEGMENTS.forEach((seg) => disposeChart(seg));
    renderChart(activeTab.value);
  } finally {
    loading.value = false;
  }
}

async function onTabChange(): Promise<void> {
  // el-tab-pane 切换前容器宽度为 0，必须等 DOM 显示后再 init/resize，否则柱图挤成一条
  await nextTick();
  renderChart(activeTab.value);
}

function handleResize(): void {
  SEGMENTS.forEach((seg) => charts[seg]?.resize());
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  await loadAll();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  SEGMENTS.forEach((seg) => disposeChart(seg));
});
</script>

<style scoped>
.fatten-info__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fatten-info__title {
  font-size: 16px;
  font-weight: 600;
}

.fatten-info__section-title {
  margin: 8px 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.fatten-info__chart {
  width: 100%;
  height: 320px;
}

.fatten-info__filter-tip {
  margin-bottom: 12px;
}

.fatten-info__body {
  min-height: 200px;
}
</style>
