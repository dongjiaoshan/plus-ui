<template>
  <div ref="containerRef" class="farm-map" :class="{ 'is-dragging': dragging }">
    <div class="farm-map__layer" :style="{ transform }">
      <svg :viewBox="`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`" preserveAspectRatio="xMidYMid meet" class="farm-map__svg">
        <FarmMapBase />

        <g class="farm-map__regions">
          <g
            v-for="region in regions"
            :key="region.key"
            class="region"
            :class="[`region--${stateOf(region).status}`, { 'region--active': region.key === selectedKey }]"
            @click="onRegionClick($event, region)"
            @mouseenter="onRegionEnter($event, region)"
            @mousemove="onRegionMove"
            @mouseleave="hoverKey = ''"
          >
            <polygon :points="toPointsAttr(region.shape)" class="region__shape" />
            <!-- 块内地块细分线：让一个片区看得出装着 N 个地块 -->
            <line v-for="(d, i) in regionDividers(region)" :key="i" class="region__divider" :x1="d[0]" :y1="d[1]" :x2="d[2]" :y2="d[3]" />
            <text
              v-if="labelFits(region)"
              class="region__label"
              :x="regionCenter(region.shape)[0]"
              :y="regionCenter(region.shape)[1] + labelFontSize * 0.34"
              :style="{ fontSize: `${labelFontSize}px`, strokeWidth: `${labelFontSize * 0.2}px` }"
            >
              {{ stateOf(region).label }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- 缩放控件：不随地图变换，固定在右下角 -->
    <div class="farm-map__zoom">
      <el-button-group>
        <el-button :icon="ZoomIn" :disabled="scale >= MAX_SCALE" @click="zoomIn" />
        <el-button :icon="ZoomOut" :disabled="scale <= MIN_SCALE" @click="zoomOut" />
        <el-button :icon="Refresh" :disabled="scale === MIN_SCALE" @click="reset" />
      </el-button-group>
      <span class="farm-map__zoom-text">{{ Math.round(scale * 100) }}%</span>
    </div>

    <!-- 悬浮信息卡 -->
    <div v-if="hoverState" class="farm-map__tip" :style="{ left: `${tipX}px`, top: `${tipY}px` }">
      <div class="farm-map__tip-title">{{ hoverState.label }}</div>
      <div v-for="line in hoverState.tooltip" :key="line" class="farm-map__tip-line">{{ line }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="FarmMapCanvas">
import { Refresh, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
import FarmMapBase from '../map/FarmMapBase.vue';
import { MAP_REGIONS, VIEW_BOX, regionBox, regionCenter, regionDividers, toPointsAttr, type MapRegion } from '../map/regions';
import { usePanZoom } from '../composables/usePanZoom';

/**
 * 区块着色。
 *
 * 前 5 个是排产状态（unbound = 还没挂片区）；p1 / p2 是「按期着色」模式下用的期别色，
 * 用来把注意力从排产状态挪回地块归属。
 */
export type RegionStatus = 'unbound' | 'idle' | 'partial' | 'planned' | 'harvesting' | 'p1' | 'p2';

export interface RegionState {
  status: RegionStatus;
  /** 图上显示名：已绑定 = 真实片区名；未绑定 = regions.ts 里的预设参考名 */
  label: string;
  tooltip: string[];
}

const props = withDefaults(
  defineProps<{
    /** 区块几何，默认用内置布局 */
    regions?: MapRegion[];
    /** key → 状态。缺省的 key 按 unbound 渲染 */
    states?: Record<string, RegionState>;
    selectedKey?: string;
  }>(),
  {
    regions: () => MAP_REGIONS,
    states: () => ({}),
    selectedKey: ''
  }
);

const emit = defineEmits<{
  (e: 'region-click', key: string): void;
}>();

const containerRef = ref<HTMLElement>();
const { scale, transform, dragging, movedSinceDown, zoomIn, zoomOut, reset, MIN_SCALE, MAX_SCALE } = usePanZoom(containerRef);

const hoverKey = ref('');
const tipX = ref(0);
const tipY = ref(0);

function stateOf(region: MapRegion): RegionState {
  return props.states[region.key] ?? { status: 'unbound', label: region.label, tooltip: ['未挂载片区'] };
}

const hoverState = computed(() => {
  if (!hoverKey.value) return null;
  const region = props.regions.find((r) => r.key === hoverKey.value);
  return region ? stateOf(region) : null;
});

/**
 * 标签字号随缩放反向补偿，让它在屏幕上恒定大小。
 * 否则放大到 200% 时标签跟着变成两倍大，挤满整块地。
 */
const labelFontSize = computed(() => 12 / scale.value);

/**
 * 太窄的区块放不下标签。判据用**屏幕尺寸**（几何尺寸 × 缩放）而不是几何尺寸，
 * 于是长廊、地头这类窄条在放大后会自动显出名字——这正是缩放该有的用处。
 */
function labelFits(region: MapRegion): boolean {
  const { w, h } = regionBox(region.shape);
  return w * scale.value >= 44 && h * scale.value >= 20;
}

function onRegionClick(e: MouseEvent, region: MapRegion) {
  // 拖动地图时鼠标抬起会顺带触发 click，位移超阈值就不当成点选
  if (movedSinceDown(e)) return;
  emit('region-click', region.key);
}

function updateTipPos(e: MouseEvent) {
  const rect = containerRef.value?.getBoundingClientRect();
  if (!rect) return;
  tipX.value = e.clientX - rect.left + 14;
  tipY.value = e.clientY - rect.top + 14;
}

function onRegionEnter(e: MouseEvent, region: MapRegion) {
  hoverKey.value = region.key;
  updateTipPos(e);
}

function onRegionMove(e: MouseEvent) {
  updateTipPos(e);
}
</script>

<style scoped>
.farm-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fbfaf4;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: grab;
  user-select: none;
}

.farm-map.is-dragging {
  cursor: grabbing;
}

.farm-map__layer {
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.farm-map__svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* ---- 区块 ---- */
.region {
  cursor: pointer;
}

.region__shape {
  stroke-width: 1.4;
  transition:
    fill 0.15s,
    stroke 0.15s;
}

.region__divider {
  stroke: #fff;
  stroke-width: 0.8;
  opacity: 0.6;
  pointer-events: none;
}

.region__label {
  /* font-size / stroke-width 由内联 style 按缩放反算，见 labelFontSize */
  text-anchor: middle;
  pointer-events: none;
  paint-order: stroke;
  stroke: rgb(255 255 255 / 70%);
  fill: #3f5140;
}

.region--unbound .region__shape {
  fill: #fff;
  stroke: #b6bcb2;
  stroke-dasharray: 4 3;
}

.region--idle .region__shape {
  fill: #e6e9ec;
  stroke: #b4bcc4;
}

.region--partial .region__shape {
  fill: #f8e3ad;
  stroke: #e0a13a;
}

.region--planned .region__shape {
  fill: #bfe4ab;
  stroke: #6cb84c;
}

.region--harvesting .region__shape {
  fill: #fad7bb;
  stroke: #e2872f;
}

.region--p1 .region__shape {
  fill: #d8e8cd;
  stroke: #9dbf8b;
}

.region--p2 .region__shape {
  fill: #cfe0ee;
  stroke: #8fb0cd;
}

.region:hover .region__shape {
  stroke-width: 2.4;
  stroke: var(--el-color-primary);
}

.region--active .region__shape {
  stroke-width: 3;
  stroke: var(--el-color-primary);
}

/* ---- 缩放控件 ---- */
.farm-map__zoom {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.farm-map__zoom-text {
  min-width: 44px;
  padding: 2px 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color-overlay);
  border-radius: 4px;
}

/* ---- 悬浮卡 ---- */
.farm-map__tip {
  position: absolute;
  z-index: 10;
  min-width: 120px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1.7;
  pointer-events: none;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
}

.farm-map__tip-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.farm-map__tip-line {
  color: var(--el-text-color-regular);
}
</style>
