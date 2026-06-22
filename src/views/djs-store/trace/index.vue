<template>
  <div class="p-2">
    <!-- 追溯码管理 tab 壳：果蔬追溯 / 猪肉追溯 —— 均为「已生成追溯码列表 + 重打印」。
         现场分割生码已独立成「门店猪肉分割」菜单（djs-store/pork-split）。 -->
    <el-tabs v-model="activeTab" class="trace-tabs">
      <el-tab-pane :label="t('storeTrace.tab.veg')" name="veg" lazy>
        <VegTracePanel />
      </el-tab-pane>
      <el-tab-pane :label="t('storeTrace.tab.pork')" name="pork" lazy>
        <PorkTraceListPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="StoreTrace" lang="ts">
import VegTracePanel from './components/VegTracePanel.vue';
import PorkTraceListPanel from './components/PorkTraceListPanel.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 二级菜单（果蔬追溯码管理 / 猪肉追溯码管理）经 query_param 预选 tab
const route = useRoute();
const activeTab = ref<'veg' | 'pork'>(route.query.tab === 'pork' ? 'pork' : 'veg');
</script>
