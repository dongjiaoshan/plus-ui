<template>
  <!-- 退回操作独立菜单已并入「退回管理」tab 壳（10360 隐藏）；本页仅作兼容壳，复用同一面板。 -->
  <div class="p-2">
    <el-card shadow="never">
      <ReturnOperationPanel />
    </el-card>
  </div>
</template>

<script setup name="StoreReturnOperation" lang="ts">
import ReturnOperationPanel from '../components/ReturnOperationPanel.vue';
</script>
