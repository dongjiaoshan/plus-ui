<template>
  <div class="plant-overview p-2" v-loading="loading">
    <!-- 标题 -->
    <div class="page-title">{{ t('plantOverview.title') }}</div>

    <!-- 一行 5 个 KPI 统计卡（产量类，单位吨；决策#7，单位已含在 label 文案中） -->
    <el-row :gutter="12" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="8" :lg="4" :xl="4">
        <div class="kpi-card">
          <div class="kpi-label">{{ t('plantOverview.kpi.idlePlotCount') }}</div>
          <div class="kpi-value">{{ summary?.idlePlotCount ?? 0 }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="8" :lg="4" :xl="4">
        <div class="kpi-card">
          <div class="kpi-label">{{ t('plantOverview.kpi.plantedPlotCount') }}</div>
          <div class="kpi-value">{{ summary?.plantedPlotCount ?? 0 }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="8" :lg="4" :xl="4">
        <div class="kpi-card">
          <div class="kpi-label">{{ t('plantOverview.kpi.harvestedTotalTon') }}</div>
          <div class="kpi-value">{{ summary?.harvestedTotalTon ?? 0 }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="8" :lg="4" :xl="4">
        <div class="kpi-card">
          <div class="kpi-label">{{ t('plantOverview.kpi.expectedTotalTon') }}</div>
          <div class="kpi-value">{{ summary?.expectedTotalTon ?? 0 }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="8" :lg="4" :xl="4">
        <div class="kpi-card">
          <div class="kpi-label">{{ t('plantOverview.kpi.remainingExpectedTon') }}</div>
          <div class="kpi-value">{{ summary?.remainingExpectedTon ?? 0 }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 分隔线 -->
    <el-divider />

    <!-- 作物卡片网格（el-row/el-col，每作物一卡，整卡可点击下钻） -->
    <el-empty v-if="!loading && crops.length === 0" :description="t('plantOverview.empty')" />
    <el-row v-else :gutter="12">
      <el-col v-for="c in crops" :key="c.cropId" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="crop-col">
        <div class="crop-card" @click="goCropDetail(c)">
          <!-- 缩略图 + 作物名 + 当前已种 -->
          <div class="crop-head">
            <el-image v-if="thumbUrlMap[String(c.cropImageOssId)]" class="crop-thumb" :src="thumbUrlMap[String(c.cropImageOssId)]" fit="cover" />
            <div v-else class="crop-thumb crop-thumb-empty"><el-icon><Picture /></el-icon></div>
            <div class="crop-head-info">
              <div class="crop-name">{{ c.cropName || '-' }}</div>
              <div class="crop-current">
                {{ t('plantOverview.card.currentPlanted') }}：{{ c.currentPlantedPlotCount ?? 0 }} /
                {{ t('plantOverview.card.currentPlantedArea') }} {{ c.currentPlantedArea ?? 0 }}
              </div>
            </div>
          </div>

          <!-- 双栏：计划 / 已完成（label 文案已含单位） -->
          <div class="crop-metrics">
            <div class="metric-group">
              <div class="metric-group-title">{{ t('plantOverview.card.planGroup') }}</div>
              <div class="metric-line">{{ t('plantOverview.card.plotCount') }}：{{ c.planPlotCount ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.area') }}：{{ c.planArea ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.expectedYield') }}：{{ c.planExpectedYield ?? 0 }}</div>
            </div>
            <div class="metric-divider" />
            <div class="metric-group">
              <div class="metric-group-title">{{ t('plantOverview.card.doneGroup') }}</div>
              <div class="metric-line">{{ t('plantOverview.card.donePlotCount') }}：{{ c.donePlotCount ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.doneArea') }}：{{ c.doneArea ?? 0 }}</div>
              <div class="metric-line">{{ t('plantOverview.card.harvestYield') }}：{{ c.doneHarvestYield ?? 0 }}</div>
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

const { t } = useI18n();

const summary = ref<PlantOverviewSummaryVO | null>(null);
const crops = ref<CropOverviewCardVO[]>([]);
const thumbUrlMap = ref<Record<string, string>>({});
const loading = ref(false);

// 作物详情抽屉（替代旧 /djs-plant/overview/crop-detail 整页路由，§6.13 抽屉化）
const detailVisible = ref(false);
const detailCropId = ref<string>('');
const detailCropName = ref<string>('');

async function loadSummary() {
  loading.value = true;
  try {
    const res = await getPlantOverviewSummary();
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
    .kpi-card {
      background: var(--el-bg-color-overlay, #fff);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      text-align: center;
      height: 100%;
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

  .crop-col {
    margin-bottom: 12px;
  }

  .crop-card {
    background: var(--el-bg-color-overlay, #fff);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 16px;
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
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

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
          margin-bottom: 4px;
        }
        .crop-current {
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
        .metric-group-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
        }
        .metric-line {
          font-size: 12px;
          color: var(--el-text-color-regular);
          line-height: 1.8;
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
