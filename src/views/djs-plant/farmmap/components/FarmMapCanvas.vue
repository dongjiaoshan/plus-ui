<template>
  <div ref="containerRef" class="farm-map" :class="{ 'is-dragging': dragging }">
    <div class="farm-map__layer" :style="{ transform }">
      <svg :viewBox="`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`" preserveAspectRatio="xMidYMid meet" class="farm-map__svg">
        <FarmMapBase />

        <g class="farm-map__regions">
          <g
            v-for="region in MAP_REGIONS"
            :key="region.key"
            class="region"
            :class="[
              colorMode === 'origin' ? `region--origin-${region.palette}` : `region--${stateOf(region).status}`,
              { 'region--active': region.key === selectedKey }
            ]"
            @click="onRegionClick($event, region)"
            @mouseenter="onRegionEnter($event, region)"
            @mousemove="onRegionMove"
            @mouseleave="hoverKey = ''"
          >
            <polygon :points="toPointsAttr(region.points)" class="region__shape" />
            <text
              v-if="labelFits(region, scale)"
              class="region__label"
              :x="regionCenter(region)[0]"
              :y="regionCenter(region)[1] + labelFontSize * 0.34"
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
import { MAP_REGIONS, VIEW_BOX, labelFits, regionCenter, toPointsAttr, type MapRegion } from '../map/regions';
import { usePanZoom } from '../composables/usePanZoom';

/**
 * 格子着色状态。
 *
 * unbound = 这个格子还没挂地块（白底虚线）；其余三个直接对应地块状态字典
 * djs_plot_status 的 1/2/3，不另造一套枚举——图上的颜色和地块列表里的状态列
 * 说的必须是同一件事，否则两个页面看同一块地会得出不同结论。
 */
export type RegionStatus = 'unbound' | 'idle' | 'planting' | 'harvesting';

export interface RegionState {
  status: RegionStatus;
  /** 图上显示名：已挂 = 地块名；未挂 = 格子号 */
  label: string;
  tooltip: string[];
}

const props = withDefaults(
  defineProps<{
    /** regionKey → 状态。缺省的 key 按 unbound 渲染 */
    states?: Record<string, RegionState>;
    selectedKey?: string;
    /** status = 按地块状态着色；origin = 还原甲方地图原配色 */
    colorMode?: 'status' | 'origin';
  }>(),
  {
    states: () => ({}),
    selectedKey: '',
    colorMode: 'status'
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
  return props.states[region.key] ?? { status: 'unbound', label: region.key, tooltip: ['未挂地块'] };
}

const hoverState = computed(() => {
  if (!hoverKey.value) return null;
  const region = MAP_REGIONS.find((r) => r.key === hoverKey.value);
  return region ? stateOf(region) : null;
});

/**
 * 标签字号随缩放反向补偿，让它在屏幕上恒定大小。
 * 否则放大到 200% 时标签跟着变成两倍大，挤满整块地。
 */
const labelFontSize = computed(() => 12 / scale.value);

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

// 容器尺寸变化（进出全屏）后父组件要能把地图复位，否则之前的平移量会把图推到视口外
defineExpose({ reset });
</script>

<style scoped>
.farm-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fdf3e7;
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

/* ---- 格子 ---- */
.region {
  cursor: pointer;
}

.region__shape {
  stroke: #fff;
  stroke-width: 1.2;
  transition:
    fill 0.15s,
    stroke 0.15s;
}

.region__label {
  /* font-size / stroke-width 由内联 style 按缩放反算，见 labelFontSize */
  text-anchor: middle;
  pointer-events: none;
  paint-order: stroke;
  stroke: rgb(255 255 255 / 75%);
  fill: #40513f;
}

/* ---- 按地块状态着色 ---- */
.region--unbound .region__shape {
  fill: #fff;
  stroke: #c2c6bd;
  stroke-dasharray: 5 4;
}

.region--idle .region__shape {
  fill: #e6e9ec;
  stroke: #fff;
}

.region--planting .region__shape {
  fill: #a8d98b;
  stroke: #fff;
}

.region--harvesting .region__shape {
  fill: #f5b969;
  stroke: #fff;
}

/* ---- 还原甲方地图原配色 ---- */
.region--origin-field-light .region__shape {
  fill: #cbd58f;
}

.region--origin-field-dark .region__shape {
  fill: #8cc18c;
}

.region--origin-house-blue .region__shape {
  fill: #b0d1e9;
}

.region--origin-strip-purple .region__shape {
  fill: #c4afd6;
}

.region--origin-strip-pale .region__shape {
  fill: #c8c8e1;
}

.region--origin-yellow .region__shape {
  fill: #e4d66e;
}

.region--origin-orange .region__shape {
  fill: #e8a369;
}

.region--origin-red .region__shape {
  fill: #e28a82;
}

.region:hover .region__shape {
  stroke-width: 2.6;
  stroke: var(--el-color-primary);
}

.region--active .region__shape {
  stroke-width: 3.2;
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
