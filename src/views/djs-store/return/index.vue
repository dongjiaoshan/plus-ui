<template>
  <div class="p-2 store-return-shell">
    <!-- 退回操作（10360 path=return-op，常驻录入）与 退回记录（10350 path=return-record，列表 + 仓库确认入库）
         为两个独立菜单，各自只展示自己的面板，不用页内 tab 互跳（按路由 path 区分渲染）。 -->
    <ReturnOperationPanel v-if="isOperation" />
    <ReturnRecordList v-else />
  </div>
</template>

<script setup name="StoreReturn" lang="ts">
import ReturnOperationPanel from './components/ReturnOperationPanel.vue';
import ReturnRecordList from './components/ReturnRecordList.vue';

// 同一组件挂在两个菜单：return-op → 退回操作；其余（return-record）→ 退回记录
const route = useRoute();
const isOperation = computed(() => route.path.includes('return-op'));
</script>
