<template>
  <div class="p-2">
    <!-- 果蔬追溯码管理（10501 path=trace-veg）与 猪肉追溯码管理（10520 path=trace-pork）
         为两个独立菜单，各自只展示自己的列表，不用页内 tab 互跳（按路由 path 区分渲染）。
         现场分割生码已独立成「门店猪肉打包」菜单（djs-store/pork-split）。 -->
    <PorkTraceListPanel v-if="isPork" />
    <VegTracePanel v-else />
  </div>
</template>

<script setup name="StoreTrace" lang="ts">
import VegTracePanel from './components/VegTracePanel.vue';
import PorkTraceListPanel from './components/PorkTraceListPanel.vue';

// 同一组件挂在两个菜单：trace-pork → 猪肉列表；其余（trace-veg）→ 果蔬列表
const route = useRoute();
const isPork = computed(() => route.path.includes('trace-pork'));
</script>
