<template>
  <!-- 门店猪肉分割：白条领到门店后现场分割 → 选白条耳号 + 选产品（门店打包间 workshop=5）+ 录重量 → 生成追溯码。
       追溯码列表/重打印在「追溯码管理 > 猪肉追溯码管理」。 -->
  <div class="p-2">
    <PorkTracePanel />
  </div>
</template>

<script setup name="StorePorkSplit" lang="ts">
import PorkTracePanel from '../trace/components/PorkTracePanel.vue';
</script>
