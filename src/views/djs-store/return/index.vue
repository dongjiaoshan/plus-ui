<template>
  <div class="p-2 store-return-shell">
    <!-- 退回管理 tab 壳：退回操作（常驻录入）| 退回记录（列表 + 仓库确认入库） -->
    <el-tabs v-model="activeMainTab" class="return-main-tabs">
      <el-tab-pane :label="t('storeReturn.mainTab.operation')" name="operation">
        <ReturnOperationPanel v-if="activeMainTab === 'operation'" />
      </el-tab-pane>
      <el-tab-pane :label="t('storeReturn.mainTab.record')" name="record">
        <ReturnRecordList v-if="activeMainTab === 'record'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="StoreReturn" lang="ts">
import ReturnOperationPanel from './components/ReturnOperationPanel.vue';
import ReturnRecordList from './components/ReturnRecordList.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const activeMainTab = ref<'operation' | 'record'>('operation');
</script>

<style lang="scss" scoped>
.store-return-shell {
  .return-main-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }
  }
}
</style>
