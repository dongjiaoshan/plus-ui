<template>
  <div class="p-2">
    <!-- 追溯码管理 tab 壳：果蔬追溯（列表）| 猪肉追溯（卡片现场生码） -->
    <el-tabs v-model="activeTab" class="trace-tabs">
      <el-tab-pane :label="t('storeTrace.tab.veg')" name="veg" lazy>
        <VegTracePanel />
      </el-tab-pane>
      <el-tab-pane :label="t('storeTrace.tab.pork')" name="pork" lazy>
        <PorkTracePanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="StoreTrace" lang="ts">
import VegTracePanel from './components/VegTracePanel.vue';
import PorkTracePanel from './components/PorkTracePanel.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeTab = ref<'veg' | 'pork'>('veg');
</script>
