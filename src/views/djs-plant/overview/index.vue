<template>
  <div class="plant-overview p-2" v-loading="loading">
    <!-- 标题 -->
    <div class="page-title">{{ t('plantOverview.title') }}</div>

    <!-- 一行 5 个 KPI 统计卡（产量类，单位吨；决策#7，单位已含在 label 文案中）；flex 等宽铺满整行，窄到放不下才换行 -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">{{ t('plantOverview.kpi.idlePlotCount') }}</div>
        <div class="kpi-value">{{ summary?.idlePlotCount ?? 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('plantOverview.kpi.plantedPlotCount') }}</div>
        <div class="kpi-value">{{ summary?.plantedPlotCount ?? 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('plantOverview.kpi.harvestedTotalTon') }}</div>
        <div class="kpi-value">{{ summary?.harvestedTotalTon ?? 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('plantOverview.kpi.expectedTotalTon') }}</div>
        <div class="kpi-value">{{ summary?.expectedTotalTon ?? 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('plantOverview.kpi.remainingExpectedTon') }}</div>
        <div class="kpi-value">{{ summary?.remainingExpectedTon ?? 0 }}</div>
      </div>
    </div>

    <!-- 工具条（KPI 与作物卡片之间）：左作物名称搜索 / 右导出；自带下边框，替代原分隔线 -->
    <div class="overview-toolbar">
      <el-form :inline="true" class="overview-toolbar-form" @submit.prevent>
        <el-form-item :label="t('plantOverview.search.cropName')">
          <el-input
            v-model="searchCropName"
            :placeholder="t('plantOverview.search.cropNamePlaceholder')"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">{{ t('biz.table.search.submit') }}</el-button>
          <el-button icon="Refresh" @click="handleReset">{{ t('biz.table.search.reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-button v-hasPermi="['djs:plant:overview:export']" type="warning" plain icon="Download" @click="handleExport">
        {{ t('biz.table.action.export') }}
      </el-button>
    </div>

    <!-- 作物卡片网格（el-row/el-col，每作物一卡，整卡可点击下钻） -->
    <el-empty v-if="!loading && crops.length === 0" :description="t('plantOverview.empty')" />
    <el-row v-else :gutter="12">
      <el-col v-for="c in sortedCrops" :key="c.cropId" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="crop-col">
        <div class="crop-card" @click="goCropDetail(c)">
          <!-- 缩略图 + 作物名 + 当前已种 -->
          <div class="crop-head">
            <el-image v-if="thumbUrlMap[String(c.cropImageOssId)]" class="crop-thumb" :src="thumbUrlMap[String(c.cropImageOssId)]" fit="cover" />
            <div v-else class="crop-thumb crop-thumb-empty"><el-icon><Picture /></el-icon></div>
            <div class="crop-head-info">
              <div class="crop-name">{{ c.cropName || '-' }}</div>
              <div v-if="c.cropCode" class="crop-code">{{ c.cropCode }}</div>
            </div>
            <div class="crop-rate">
              <span class="crop-rate-label">{{ t('plantOverview.card.completionRate') }}</span>
              <span class="crop-rate-value">{{ completionRate(c) }}%</span>
            </div>
          </div>

          <!-- 双栏：计划 / 已完成（label 文案已含单位） -->
          <div class="crop-metrics">
            <div class="metric-group">
              <div class="metric-group-title">{{ t('plantOverview.card.planGroup') }}</div>
              <div class="metric-line">{{ t('plantOverview.card.plotCount') }}：{{ c.planPlotCount ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.area') }}：{{ c.planArea ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.expectedYield') }}：{{ Number(c.planExpectedYield ?? 0).toFixed(3) }}</div>
            </div>
            <div class="metric-divider" />
            <div class="metric-group">
              <div class="metric-group-title">{{ t('plantOverview.card.doneGroup') }}</div>
              <div class="metric-line">{{ t('plantOverview.card.donePlotCount') }}：{{ c.donePlotCount ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.doneArea') }}：{{ c.doneArea ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.harvestYield') }}：{{ Number(c.doneHarvestYield ?? 0).toFixed(3) }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 作物详情抽屉（整卡点击下钻打开） -->
    <CropDetailDrawer v-model="detailVisible" :crop-id="detailCropId" :crop-name="detailCropName" />
  </div>
</template>

<script setup name="PlantOverviewIndex" lang="ts">
import { getPlantOverviewSummary } from '@/api/djs-plant/overview';
import type { CropOverviewCardVO, PlantOverviewSummaryVO } from '@/api/djs-plant/overview/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import CropDetailDrawer from './components/CropDetailDrawer.vue';
import { useI18n } from 'vue-i18n';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const summary = ref<PlantOverviewSummaryVO | null>(null);
const crops = ref<CropOverviewCardVO[]>([]);
const thumbUrlMap = ref<Record<string, string>>({});
const loading = ref(false);

/** 搜索框绑定值（未提交）。 */
const searchCropName = ref<string>('');
/** 已提交生效的作物名称关键字：卡片列表与导出共用，避免改了输入框没点搜索就导出导致屏幕/文件不一致。 */
const appliedCropName = ref<string>('');

// 作物详情抽屉（替代旧 /djs-plant/overview/crop-detail 整页路由，§6.13 抽屉化）
const detailVisible = ref(false);
const detailCropId = ref<string>('');
const detailCropName = ref<string>('');

async function loadSummary() {
  loading.value = true;
  try {
    const res = await getPlantOverviewSummary(appliedCropName.value || undefined);
    summary.value = res.data ?? null;
    crops.value = res.data?.crops ?? [];
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(crops.value.map((c) => c.cropImageOssId).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    thumbUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[PlantOverview] listOssByIds failed', e);
    thumbUrlMap.value = {};
  }
}

/** 搜索：提交输入框关键字并重查（只过滤下方作物卡片，顶部 KPI 恒全场口径）。 */
function handleSearch() {
  appliedCropName.value = searchCropName.value.trim();
  loadSummary();
}

/** 重置：清空关键字并重查全量。 */
function handleReset() {
  searchCropName.value = '';
  appliedCropName.value = '';
  loadSummary();
}

/** 导出作物卡片（一作物一行横向展示），过滤条件与当前列表一致。 */
function handleExport() {
  proxy?.download(
    'djs/plant/overview/cropCard/export',
    { cropName: appliedCropName.value || undefined },
    `plant_overview_${new Date().getTime()}.xlsx`
  );
}

/** 计划完成率 = 已种地块 / 计划地块数 * 100，保留两位小数；计划地块为 0 时兜底 0.00 防除零。 */
function completionRate(c: CropOverviewCardVO): string {
  const plan = Number(c.planPlotCount ?? 0);
  if (plan <= 0) return '0.00';
  const done = Number(c.donePlotCount ?? 0);
  return ((done / plan) * 100).toFixed(2);
}

/** 作物卡片按计划完成率升序（从左到右由低到高）排列（row44）；同率保持后端返回相对顺序（稳定排序）。 */
const sortedCrops = computed<CropOverviewCardVO[]>(() =>
  [...crops.value].sort((a, b) => Number(completionRate(a)) - Number(completionRate(b)))
);

/** 整卡点击下钻：打开作物详情抽屉（携 cropId + cropName 回填标题）。 */
function goCropDetail(c: CropOverviewCardVO) {
  detailCropId.value = c.cropId;
  detailCropName.value = c.cropName ?? '';
  detailVisible.value = true;
}

onMounted(loadSummary);
</script>

<style scoped lang="scss">
.plant-overview {
  .page-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .kpi-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;

    .kpi-card {
      /* 一行 5 个等宽铺满：弹性增长 + min-width 触发换行（窄到 5 个放不下才换） */
      flex: 1 1 0;
      min-width: 150px;
      background: var(--el-bg-color-overlay, #fff);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      box-sizing: border-box;

      .kpi-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }
      .kpi-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-color-primary);
        .kpi-unit {
          font-size: 13px;
          font-weight: 400;
          color: var(--el-text-color-secondary);
          margin-left: 2px;
        }
      }
    }
  }

  .overview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .overview-toolbar-form {
      margin: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .crop-col {
    margin-bottom: 12px;
  }

  .crop-card {
    background: var(--el-bg-color-overlay, #fff);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 12px;
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      transform: translateY(-2px);
    }

    .crop-head {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .crop-rate {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .crop-rate-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
        .crop-rate-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .crop-thumb {
        width: 56px;
        height: 56px;
        border-radius: 6px;
        flex-shrink: 0;
      }
      .crop-thumb-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--el-fill-color-light);
        color: var(--el-text-color-placeholder);
        font-size: 22px;
      }
      .crop-head-info {
        min-width: 0;
        .crop-name {
          font-size: 16px;
          font-weight: 600;
        }
        .crop-code {
          margin-top: 2px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .crop-metrics {
      display: flex;
      align-items: stretch;

      .metric-group {
        flex: 1;
        min-width: 0;
        text-align: left;
        .metric-group-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
          text-align: center;
        }
        .metric-line {
          font-size: 12px;
          color: var(--el-text-color-regular);
          line-height: 1.6;
        }
      }
      .metric-divider {
        width: 1px;
        background: var(--el-border-color-lighter);
        margin: 0 12px;
      }
    }
  }
}
</style>
