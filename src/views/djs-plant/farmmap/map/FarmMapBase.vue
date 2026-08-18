<template>
  <!--
    装饰底层：地界 / 河道 / 林地 / 水塘 / 建筑 / 道路 / 指北针。
    纯静态，不参与交互（pointer-events 全关），点击穿透到上层的区块图层。
    形态参照甲方《参观总动线导览牌》：主体在西，东北方向伸出一条窄臂，中间由河道分开。
    地界顶点来自 regions.ts 的 LAND_OUTLINE —— 区块布局按它约束，两边不能各写一份。
  -->
  <g class="farm-map-base">
    <polygon class="base-land" :points="landPoints" />

    <!-- 林地 -->
    <polygon class="base-wood" points="178,480 246,472 272,545 242,595 202,566" />
    <text class="base-label" x="228" y="528">林地</text>

    <!-- 荷花池 -->
    <ellipse class="base-water" cx="110" cy="300" rx="28" ry="17" />
    <text class="base-label" x="110" y="304">荷花池</text>

    <!-- 河道：沿东北臂西侧南下，把一期与二期分开，再向西南横穿场区 -->
    <path
      class="base-water-line"
      d="M 682 58 C 672 150, 670 250, 678 340 C 688 410, 678 470, 650 528 C 610 582, 556 620, 480 656 C 436 676, 404 684, 380 686"
    />

    <!-- 垂钓区 -->
    <ellipse class="base-water" cx="600" cy="598" rx="26" ry="16" />
    <text class="base-label" x="600" y="602">垂钓区</text>

    <!-- 入口道路 -->
    <path class="base-road" d="M 408 680 L 452 650 L 500 616 L 548 578" />

    <!-- 建筑群（生态餐厅 / 办公楼 / 仓库），对照导览图放在南端出入口一带 -->
    <rect class="base-building" x="458" y="620" width="30" height="18" />
    <rect class="base-building" x="494" y="614" width="26" height="16" />
    <rect class="base-building" x="452" y="642" width="24" height="14" />
    <text class="base-label" x="470" y="670">建筑群</text>

    <!-- 指北针 -->
    <g class="base-compass">
      <polygon points="46,44 54,68 46,62 38,68" />
      <text class="base-compass-text" x="46" y="84">N</text>
    </g>
  </g>
</template>

<script setup lang="ts" name="FarmMapBase">
import { LAND_OUTLINE } from './regions';

const landPoints = LAND_OUTLINE.map(([x, y]) => `${x},${y}`).join(' ');
</script>

<style scoped>
.farm-map-base {
  pointer-events: none;
}

.base-land {
  fill: #f4f8f0;
  stroke: #b9cdaf;
  stroke-width: 2.5;
}

.base-wood {
  fill: #cfe2c4;
  stroke: #a2c493;
  stroke-width: 1.5;
}

.base-water {
  fill: #c6def0;
  stroke: #8dbfe0;
  stroke-width: 1.5;
}

.base-water-line {
  fill: none;
  stroke: #c6def0;
  stroke-width: 13;
  stroke-linecap: round;
}

.base-road {
  fill: none;
  stroke: #e7dfcd;
  stroke-width: 7;
  stroke-linecap: round;
}

.base-building {
  fill: #e2dfd7;
  stroke: #b6b1a5;
  stroke-width: 1.2;
}

.base-label {
  font-size: 11px;
  fill: #8a9384;
  text-anchor: middle;
}

.base-compass polygon {
  fill: #90a08a;
}

.base-compass-text {
  font-size: 13px;
  font-weight: 600;
  fill: #90a08a;
  text-anchor: middle;
}
</style>
