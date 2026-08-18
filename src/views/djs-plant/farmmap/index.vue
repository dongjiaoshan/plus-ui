<template>
  <div class="p-2 farmmap-page">
    <el-alert :title="t('plantFarmMap.draftNotice')" type="warning" :closable="false" show-icon class="mb-2" />

    <el-card shadow="never" body-class="farmmap-card-body">
      <template #header>
        <div class="farmmap-header">
          <span class="text-base font-medium">{{ t('plantFarmMap.pageTitle') }}</span>
          <div class="farmmap-header__right">
            <span class="farmmap-header__stat">
              {{ t('plantFarmMap.stat.regionTotal', { n: regions.length }) }} ·
              {{ t('plantFarmMap.stat.bound', { n: boundCount }) }}
            </span>
            <el-radio-group v-model="colorMode" size="small">
              <el-radio-button value="status">{{ t('plantFarmMap.colorBy.status') }}</el-radio-button>
              <el-radio-button value="phase">{{ t('plantFarmMap.colorBy.phase') }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div class="farmmap-body">
        <FarmMapCanvas class="farmmap-body__canvas" :states="states" :selected-key="selectedKey" @region-click="onRegionClick" />

        <aside class="farmmap-body__side">
          <div class="farmmap-side-block">
            <div class="farmmap-side-title">{{ t('plantFarmMap.legend.title') }}</div>
            <div v-for="item in legend" :key="item.status" class="farmmap-legend-row">
              <i class="farmmap-legend-swatch" :class="`farmmap-legend-swatch--${item.status}`" />
              <span>{{ item.text }}</span>
            </div>
          </div>

          <div class="farmmap-side-block">
            <div class="farmmap-side-title">{{ t('plantFarmMap.offMap.title') }}</div>
            <el-tag v-for="z in offMapZones" :key="z" type="info" size="small" class="mr-1 mb-1">{{ z }}</el-tag>
            <div class="farmmap-side-tip">{{ t('plantFarmMap.offMap.tip') }}</div>
          </div>

          <div class="farmmap-side-block">
            <div class="farmmap-side-title">{{ t('plantFarmMap.selected.title') }}</div>
            <template v-if="selectedRegion">
              <div class="farmmap-selected-name">{{ selectedRegion.label }}</div>
              <div class="farmmap-side-tip">{{ selectedRegion.key }}</div>
              <div class="farmmap-side-tip">{{ t(`plantFarmMap.phase.${selectedRegion.phase}`) }}</div>
            </template>
            <div v-else class="farmmap-side-tip">{{ t('plantFarmMap.selected.empty') }}</div>
          </div>

          <div class="farmmap-side-tip farmmap-side-tip--foot">{{ t('plantFarmMap.opTip') }}</div>
        </aside>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="PlantFarmMap">
import { useI18n } from 'vue-i18n';
import FarmMapCanvas, { type RegionState, type RegionStatus } from './components/FarmMapCanvas.vue';
import { MAP_REGIONS } from './map/regions';

const { t } = useI18n();

const regions = MAP_REGIONS;
const colorMode = ref<'status' | 'phase'>('status');
const selectedKey = ref('');

/**
 * P0 草图用的演示排产状态。
 *
 * 接后端前先给几种颜色都铺一遍，才看得出四色在整张图上分不分得开；
 * 没列进来的区块按 unbound（白底虚线）渲染，正是真实的「还没挂片区」样子。
 * 走到 P2 时这张表整体换成 GET /farmmap/zoneSummary 的返回。
 */
const DEMO_STATUS: Record<string, RegionStatus> = {
  'R-P1-A1W': 'planned',
  'R-P1-A2W': 'planned',
  'R-P1-A3W': 'partial',
  'R-P1-A4W': 'idle',
  'R-P1-A1E': 'harvesting',
  'R-P1-A2E': 'planned',
  'R-P1-A3E': 'idle',
  'R-P1-A4E': 'idle',
  'R-P1-A5': 'partial',
  'R-P1-NURSERY': 'planned',
  'R-P1-PICK': 'harvesting',
  'R-P1-B1': 'partial',
  'R-P1-B2': 'idle',
  'R-P1-B3': 'planned',
  'R-P1-B4': 'idle',
  'R-P1-C1': 'planned',
  'R-P1-C2': 'idle',
  'R-P1-C3': 'partial',
  'R-P1-COR-W': 'idle',
  'R-P1-COR-C': 'idle',
  'R-P2-G1': 'planned',
  'R-P2-G2': 'planned',
  'R-P2-G3': 'harvesting',
  'R-P2-G4': 'partial',
  'R-P2-G5': 'partial',
  'R-P2-G6': 'planned',
  'R-P2-OPEN': 'idle',
  'R-P2-SHED': 'harvesting',
  'R-P2-D': 'partial',
  'R-P2-COR-M': 'idle'
};

/** P0 固定演示；P1 起改由后端返回「没挂到图上的片区」 */
const offMapZones = ['三期'];

const states = computed<Record<string, RegionState>>(() => {
  const result: Record<string, RegionState> = {};
  for (const region of regions) {
    const demo = DEMO_STATUS[region.key];
    const status: RegionStatus = colorMode.value === 'phase' ? region.phase : (demo ?? 'unbound');
    const tooltip =
      colorMode.value === 'phase'
        ? [t(`plantFarmMap.phase.${region.phase}`)]
        : [t(`plantFarmMap.legend.${demo ?? 'unbound'}`), t(`plantFarmMap.phase.${region.phase}`)];
    result[region.key] = { status, label: region.label, tooltip };
  }
  return result;
});

/** P0 还没有绑定表，「已挂载」恒为 0；P1 接上 GET /farmmap/bindings 后变成真实数 */
const boundCount = 0;

const legend = computed(() => {
  const keys: RegionStatus[] = colorMode.value === 'phase' ? ['p1', 'p2'] : ['unbound', 'idle', 'partial', 'planned', 'harvesting'];
  return keys.map((status) => ({ status, text: t(`plantFarmMap.legend.${status}`) }));
});

const selectedRegion = computed(() => regions.find((r) => r.key === selectedKey.value));

function onRegionClick(key: string) {
  selectedKey.value = selectedKey.value === key ? '' : key;
}
</script>

<style scoped>
.farmmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.farmmap-header__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.farmmap-header__stat {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.farmmap-body {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.farmmap-body__canvas {
  /* 地图是主体，占满剩余宽度；高度固定，图本身按 viewBox 等比缩放 */
  flex: 1 1 auto;
  min-width: 0;
  height: 700px;
}

.farmmap-body__side {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.farmmap-side-block {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.farmmap-side-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.farmmap-legend-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.farmmap-legend-swatch {
  width: 16px;
  height: 12px;
  border: 1.4px solid;
  border-radius: 2px;
}

.farmmap-legend-swatch--unbound {
  background-color: #fff;
  border-style: dashed;
  border-color: #b6bcb2;
}

.farmmap-legend-swatch--idle {
  background-color: #e6e9ec;
  border-color: #b4bcc4;
}

.farmmap-legend-swatch--partial {
  background-color: #f8e3ad;
  border-color: #e0a13a;
}

.farmmap-legend-swatch--planned {
  background-color: #bfe4ab;
  border-color: #6cb84c;
}

.farmmap-legend-swatch--harvesting {
  background-color: #fad7bb;
  border-color: #e2872f;
}

.farmmap-legend-swatch--p1 {
  background-color: #d8e8cd;
  border-color: #9dbf8b;
}

.farmmap-legend-swatch--p2 {
  background-color: #cfe0ee;
  border-color: #8fb0cd;
}

.farmmap-selected-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.farmmap-side-tip {
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.farmmap-side-tip--foot {
  margin-top: auto;
}
</style>
