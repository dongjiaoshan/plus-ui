<template>
  <div class="pig-detail p-4" v-loading="loading">
    <!-- 顶部头：耳号 + 状态 tag + 返回 -->
    <div class="header">
      <el-button text @click="goBack">
        <el-icon><Back /></el-icon>
        {{ t('common.back') }}
      </el-button>
      <h2 v-if="detail" class="title">
        {{ t('pig.detail.title', { earNo: detail.earNo }) }}
        <el-tag v-if="detail.currentStatus" :type="statusTagType" effect="dark" class="ml-2">
          <dict-tag :options="lifecycleDict" :value="detail.currentStatus" />
        </el-tag>
      </h2>
    </div>

    <el-tabs v-if="detail" v-model="activeTab" class="mt-2">
      <!-- tab 1 基础信息 -->
      <el-tab-pane :label="t('pig.detail.tab.basic')" name="basic">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="t('pig.column.earNo')">{{ detail.earNo }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.earTag')">{{ detail.earTag || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.pigSex')">
            <el-tag :type="detail.pigSex === 'F' ? 'success' : 'primary'" size="small">
              {{ detail.pigSex === 'F' ? t('pig.sex.female') : t('pig.sex.male') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.pigType')">
            <dict-tag :options="pigTypeDict" :value="detail.pigType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.currentStatus')">
            <dict-tag :options="lifecycleDict" :value="detail.currentStatus" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.statusStartedAt')">{{ detail.statusStartedAt || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.currentStatus === 'END'" :label="t('pig.column.endReason')">
            <dict-tag :options="endReasonDict" :value="detail.endReason" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.pigBreedCode')">{{ detail.pigBreedName || detail.pigBreedCode || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.pigStrainCode')">{{ detail.pigStrainName || detail.pigStrainCode || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.birthDate')">{{ detail.birthDate || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.introduceDate')">{{ detail.introduceDate || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.barn')">{{ detail.barnName || detail.barnCode || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.pen')">{{ detail.penName || detail.penCode || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.pigSex === 'F'" :label="t('pig.column.parity')">
            {{ detail.parity ?? 0 }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.pigSex === 'F'" :label="t('pig.column.matingCount')">
            {{ detail.matingCount ?? 0 }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.pigSex === 'F' && detail.lastMatingDate" :label="t('pig.column.lastMatingDate')">
            {{ detail.lastMatingDate }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.motherEar')">
            <el-link v-if="detail.motherEar" type="primary" @click="openByEarNo(detail.motherEar)">{{ detail.motherEar }}</el-link>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.fatherEar')">
            <el-link v-if="detail.fatherEar" type="primary" @click="openByEarNo(detail.fatherEar)">{{ detail.fatherEar }}</el-link>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('pig.detail.creator')">{{ detail.createName || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('common.createTime')">{{ detail.createTime || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('pig.column.remark')" :span="2">{{ detail.remark || '—' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- tab 2 生产指标（仅母猪 / sow） -->
      <el-tab-pane v-if="detail.pigType === 'sow'" :label="t('pig.detail.tab.performance')" name="performance" lazy>
        <div v-if="perfLoading" v-loading="perfLoading" class="loading-box" />
        <el-empty v-else-if="!performance.length" :description="t('pig.detail.performanceEmpty')" />
        <el-table v-else :data="performance" border size="small">
          <el-table-column prop="parity" :label="t('pig.column.parity')" width="80" align="center" />
          <el-table-column prop="totalBorn" :label="t('pig.perf.totalBorn')" width="100" align="center" />
          <el-table-column prop="totalLiveBorn" :label="t('pig.perf.totalLiveBorn')" width="100" align="center" />
          <el-table-column prop="totalWeaned" :label="t('pig.perf.totalWeaned')" width="100" align="center" />
          <el-table-column prop="avgBornWeight" :label="t('pig.perf.avgBornWeight')" width="120" align="center" />
          <el-table-column prop="avgWeanedWeight" :label="t('pig.perf.avgWeanedWeight')" width="120" align="center" />
          <el-table-column prop="lastUpdateDate" :label="t('pig.perf.lastUpdateDate')" width="120" align="center" />
        </el-table>
        <div class="hint mt-2">
          {{ t('pig.detail.performanceDataHint') }}
        </div>
      </el-tab-pane>

      <!-- tab 3 养殖记录（状态变更历史） -->
      <el-tab-pane :label="t('pig.detail.tab.history')" name="history" lazy>
        <div v-if="historyLoading" v-loading="historyLoading" class="loading-box" />
        <el-empty v-else-if="!history.length" :description="t('pig.detail.historyEmpty')" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="(rec, idx) in history"
            :key="rec.id"
            :timestamp="rec.changeTime"
            :type="timelineColor(rec.eventType)"
            :hollow="idx !== 0"
            placement="top"
          >
            <span class="event-badge">
              <dict-tag :options="eventDict" :value="rec.eventType" />
            </span>
            <span class="ml-2">
              <span v-if="rec.oldStatus">
                <dict-tag :options="lifecycleDict" :value="rec.oldStatus" />
                →
              </span>
              <span v-else>{{ t('pig.detail.historyInit') }} →</span>
              <dict-tag :options="lifecycleDict" :value="rec.newStatus" />
            </span>
            <div v-if="rec.durationDays != null" class="meta">
              {{ t('pig.detail.duration', { days: rec.durationDays }) }}
            </div>
            <div v-if="rec.relatedEventId" class="meta">
              {{ t('pig.detail.relatedEvent', { id: rec.relatedEventId }) }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <!-- tab 配种 / 分娩明细（从状态流水筛繁殖类事件，结构化呈现） -->
      <el-tab-pane :label="t('pig.detail.tab.breeding')" name="breeding" lazy>
        <div v-if="historyLoading" v-loading="historyLoading" class="loading-box" />
        <el-empty v-else-if="!breedingRows.length" :description="t('pig.detail.breedingEmpty')" />
        <el-table v-else :data="breedingRows" border size="small">
          <el-table-column prop="changeTime" :label="t('pig.detail.breedingCol.changeTime')" width="170" align="center" />
          <el-table-column :label="t('pig.detail.breedingCol.eventType')" width="110" align="center">
            <template #default="{ row }">
              <dict-tag :options="eventDict" :value="row.eventType" />
            </template>
          </el-table-column>
          <el-table-column :label="t('pig.detail.breedingCol.transition')" min-width="160" align="center">
            <template #default="{ row }">
              <span v-if="row.oldStatus"><dict-tag :options="lifecycleDict" :value="row.oldStatus" /> → </span>
              <dict-tag :options="lifecycleDict" :value="row.newStatus" />
            </template>
          </el-table-column>
          <el-table-column prop="relatedEventId" :label="t('pig.detail.breedingCol.relatedEventId')" width="180" align="center" />
        </el-table>
      </el-tab-pane>

      <!-- tab 用药 / 治疗（拉 med/record by pigId） -->
      <el-tab-pane :label="t('pig.detail.tab.med')" name="med" lazy>
        <div v-if="medLoading" v-loading="medLoading" class="loading-box" />
        <el-empty v-else-if="!medRows.length" :description="t('pig.detail.medEmpty')" />
        <el-table v-else :data="medRows" border size="small">
          <el-table-column prop="useDate" :label="t('pig.detail.medCol.useDate')" width="120" align="center" />
          <el-table-column prop="medicineName" :label="t('pig.detail.medCol.medicineName')" min-width="120" />
          <el-table-column :label="t('pig.detail.medCol.medicineType')" width="100" align="center">
            <template #default="{ row }">
              <dict-tag :options="medUseTypeDict" :value="row.medicineType" />
            </template>
          </el-table-column>
          <el-table-column prop="medicineDosage" :label="t('pig.detail.medCol.medicineDosage')" width="90" align="right" />
          <el-table-column :label="t('pig.detail.medCol.medicineWay')" width="100" align="center">
            <template #default="{ row }">
              <dict-tag :options="medWayDict" :value="row.medicineWay" />
            </template>
          </el-table-column>
          <el-table-column :label="t('pig.detail.medCol.medicineReason')" width="110" align="center">
            <template #default="{ row }">
              <dict-tag :options="medReasonDict" :value="row.medicineReason" />
            </template>
          </el-table-column>
          <el-table-column prop="operatorName" :label="t('pig.detail.medCol.operatorName')" width="110" align="center" />
        </el-table>
      </el-tab-pane>

      <!-- tab 生长曲线 -->
      <el-tab-pane :label="t('pig.detail.tab.growth')" name="growth" lazy>
        <div v-if="growthLoading" v-loading="growthLoading" class="loading-box" />
        <el-empty v-else-if="!growthRows.length" :description="t('pig.detail.growthEmpty')" />
        <div v-else>
          <div ref="chartEl" class="growth-chart" />
          <el-table :data="growthRows" border size="small" class="mt-4">
            <el-table-column prop="measureDate" :label="t('pig.growth.measureDate')" width="120" align="center" />
            <el-table-column prop="weight" :label="t('pig.growth.weight')" width="100" align="center" />
            <el-table-column prop="backfatThickness" :label="t('pig.growth.backfatThickness')" width="100" align="center" />
            <el-table-column prop="backHeight" :label="t('pig.growth.backHeight')" width="100" align="center" />
            <el-table-column prop="operatorName" :label="t('pig.growth.operatorName')" width="120" align="center" />
            <el-table-column prop="remark" :label="t('pig.column.remark')" min-width="120" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="DjsBreedPigDetail" lang="ts">
/**
 * 猪只详情页（BRD-LIST-001 + BRD-FIX-ADMIN-PIG-DETAIL-001）— admin 端唯一详情入口，
 * 独立路由 `/djs-breed/pig/detail/:id`（"全部" tab 与 4 类子 tab 统一跳此页，已废弃 modal）。
 *
 * tab：
 *  1. 基础信息       — 所有 pig_type 都展示
 *  2. 生产指标       — 仅 sow（母猪）；source: t_farm_sow_performance（由 BRD-DASH-001 写）
 *  3. 养殖记录       — 状态变更时间线（全量 history 最多 200 条）
 *  4. 配种 / 分娩明细 — 从状态流水筛繁殖类事件（BREED/FARROW/WEAN/OESTRUS/NULL_RETURN）结构化呈现
 *  5. 用药 / 治疗     — 拉 med/record by pigId（替代原 health 空占位）
 *  6. 生长曲线       — ECharts 折线图（体重 / 背膘 / 背高 by measureDate）+ 明细表格
 */
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Back } from '@element-plus/icons-vue';
import { useDict } from '@/utils/dict';
import { getPig, listPig, listPigHistory } from '@/api/djs-breed/pig';
import { listSowPerformance } from '@/api/djs-breed/sow-performance';
import { listGrowth, type PigGrowthVO } from '@/api/djs-breed/event/growth';
import { listMedRecord } from '@/api/djs-breed/med';
import type { MedRecordVO } from '@/api/djs-breed/med/types';
import type { PigDetailVO, PigStatusEventCode, PigStatusRecordVO } from '@/api/djs-breed/pig/types';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import type { SowPerformanceVO } from '@/api/djs-breed/sow-performance';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const {
  djs_pig_lifecycle: lifecycleDict,
  djs_pig_type: pigTypeDict,
  djs_pig_status_event: eventDict,
  djs_pig_end_reason: endReasonDict,
  djs_medicine_use_type: medUseTypeDict,
  djs_medicine_way: medWayDict,
  djs_medicine_reason: medReasonDict
} = useDict(
  'djs_pig_lifecycle',
  'djs_pig_type',
  'djs_pig_status_event',
  'djs_pig_end_reason',
  'djs_medicine_use_type',
  'djs_medicine_way',
  'djs_medicine_reason'
);

const pigId = computed(() => String(route.params.id ?? ''));

const detail = ref<PigDetailVO | null>(null);
const loading = ref(false);
const activeTab = ref('basic');

const history = ref<PigStatusRecordVO[]>([]);
const historyLoading = ref(false);

const performance = ref<SowPerformanceVO[]>([]);
const perfLoading = ref(false);

const growthRows = ref<PigGrowthVO[]>([]);
const growthLoading = ref(false);
const chartEl = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const medRows = ref<MedRecordVO[]>([]);
const medLoading = ref(false);

// 配种 / 分娩明细：从状态流水筛繁殖类事件，结构化呈现（无独立 BE 端点，复用 history 数据）
const BREEDING_EVENTS: PigStatusEventCode[] = ['BREED', 'FARROW', 'WEAN', 'OESTRUS', 'NULL_RETURN'];
const breedingRows = computed(() => history.value.filter((r) => BREEDING_EVENTS.includes(r.eventType)));

const statusTagType = computed<'success' | 'warning' | 'info' | 'primary' | 'danger'>(() => {
  if (!detail.value) return 'info';
  const s = detail.value.currentStatus;
  if (s === 'END') return 'info';
  if (s === 'PZ' || s === 'PH' || s === 'FM') return 'success';
  if (s === 'LC' || s === 'FQ' || s === 'KH') return 'warning';
  return 'primary';
});

function timelineColor(ev: PigStatusEventCode): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  switch (ev) {
    case 'INTRO':
      return 'success';
    case 'BREED':
    case 'OESTRUS':
    case 'FARROW':
    case 'WEAN':
    case 'TRANSFER':
      return 'primary';
    case 'NULL_RETURN':
      return 'warning';
    case 'DIE':
    case 'ELIMINATE':
    case 'CASTRATE':
    case 'SLAUGHTER':
      return 'danger';
    default:
      return 'info';
  }
}

async function loadDetail() {
  if (!pigId.value) return;
  loading.value = true;
  try {
    const res = (await getPig(pigId.value)) as any;
    detail.value = (res.data ?? null) as PigDetailVO | null;
    if (detail.value?.recentHistory?.length) {
      history.value = detail.value.recentHistory;
    }
  } finally {
    loading.value = false;
  }
}

async function loadFullHistory() {
  if (!pigId.value || history.value.length >= 20) {
    // 如果详情已带 recentHistory (20)，需要全量再拉一次；这里阈值放宽，<20 不重拉
    if (history.value.length >= 20) {
      historyLoading.value = true;
      try {
        const res = (await listPigHistory(pigId.value)) as any;
        history.value = (res.data ?? []) as PigStatusRecordVO[];
      } finally {
        historyLoading.value = false;
      }
    }
  }
}

async function loadPerformance() {
  if (!detail.value || detail.value.pigType !== 'sow') return;
  perfLoading.value = true;
  try {
    const res = (await listSowPerformance(pigId.value)) as any;
    performance.value = (res.data ?? []) as SowPerformanceVO[];
  } finally {
    perfLoading.value = false;
  }
}

async function loadGrowth() {
  growthLoading.value = true;
  try {
    const res = (await listGrowth({ pigId: pigId.value, pageNum: 1, pageSize: 100 })) as any;
    // 后端按 measureDate DESC 返回；图表需按 ASC 显示 → 反转
    const rows = ((res.rows ?? []) as PigGrowthVO[]).slice();
    growthRows.value = rows;
    nextTick(() => renderChart(rows.slice().reverse()));
  } finally {
    growthLoading.value = false;
  }
}

function renderChart(rowsAsc: PigGrowthVO[]) {
  if (!chartEl.value || rowsAsc.length === 0) return;
  if (!chart) {
    chart = echarts.init(chartEl.value);
  }
  const dates = rowsAsc.map((r) => r.measureDate);
  const weights = rowsAsc.map((r) => Number(r.weight));
  const backfats = rowsAsc.map((r) => (r.backfatThickness == null ? null : Number(r.backfatThickness)));
  const heights = rowsAsc.map((r) => (r.backHeight == null ? null : Number(r.backHeight)));
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: [t('pig.growth.weight'), t('pig.growth.backfatThickness'), t('pig.growth.backHeight')] },
    grid: { left: 50, right: 50, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { type: 'value', name: 'kg', position: 'left' },
      { type: 'value', name: 'mm/cm', position: 'right' }
    ],
    series: [
      { name: t('pig.growth.weight'), type: 'line', smooth: true, yAxisIndex: 0, data: weights, connectNulls: true },
      { name: t('pig.growth.backfatThickness'), type: 'line', smooth: true, yAxisIndex: 1, data: backfats, connectNulls: true },
      { name: t('pig.growth.backHeight'), type: 'line', smooth: true, yAxisIndex: 1, data: heights, connectNulls: true }
    ]
  });
}

async function loadMed() {
  if (!pigId.value) return;
  medLoading.value = true;
  try {
    const res = (await listMedRecord({ pigId: pigId.value, pageNum: 1, pageSize: 100 })) as any;
    medRows.value = (res.rows ?? []) as MedRecordVO[];
  } finally {
    medLoading.value = false;
  }
}

watch(activeTab, async (tab) => {
  if (tab === 'history' || tab === 'breeding') {
    await loadFullHistory();
  } else if (tab === 'performance') {
    await loadPerformance();
  } else if (tab === 'med') {
    await loadMed();
  } else if (tab === 'growth') {
    await loadGrowth();
  }
});

async function openByEarNo(earNo: string) {
  try {
    const res = (await listPig({ earNo, pageNum: 1, pageSize: 1, excludeEnd: true })) as any;
    const target = (res.rows ?? [])[0];
    if (!target) {
      ElMessage.warning(t('pig.detail.relatedNotFound', { earNo }));
      return;
    }
    router.push({ path: `/djs-breed/pig/detail/${target.id}` });
  } catch {
    // axios 拦截器处理
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.pig-detail .header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pig-detail .title {
  margin: 0;
  font-size: 18px;
}
.ml-2 {
  margin-left: 8px;
}
.mt-2 {
  margin-top: 12px;
}
.mt-4 {
  margin-top: 16px;
}
.loading-box {
  min-height: 120px;
}
.event-badge {
  font-weight: 500;
}
.meta {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
.hint {
  color: #909399;
  font-size: 12px;
}
.growth-chart {
  width: 100%;
  height: 360px;
}
</style>
