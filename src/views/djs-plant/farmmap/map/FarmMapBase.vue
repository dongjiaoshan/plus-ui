<template>
  <!--
    装饰底层：建筑 / 道路 / 河道。形状和地块格子一样是从甲方地图描出来的（MAP_DECOR），
    区别只在它们不对应任何地块，所以只画不点——pointer-events 全关，点击穿透到上层格子。
    没有手绘的示意图元：图上有什么就画什么，图上没有的（指北针、图例文字）不补。
  -->
  <g class="farm-map-base">
    <polygon v-for="(item, i) in MAP_DECOR" :key="i" :class="`base-decor base-decor--${item.palette}`" :points="toPointsAttr(item.points)" />
  </g>
</template>

<script setup lang="ts" name="FarmMapBase">
import { MAP_DECOR, toPointsAttr } from './regions';
</script>

<style scoped>
.farm-map-base {
  pointer-events: none;
}

.base-decor {
  stroke-width: 1;
}

/* 建筑：中性暖灰，比地块低一档明度，不抢眼但看得出这里有房子 */
.base-decor--building {
  fill: #c9c6c2;
  stroke: #b3afaa;
}

/* 道路：比底色略深的米色 */
.base-decor--road {
  fill: #ece5d8;
  stroke: #e0d8c8;
}

/* 河道 */
.base-decor--water {
  fill: #9ecbe8;
  stroke: #86bade;
}
</style>
