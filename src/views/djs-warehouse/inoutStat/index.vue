<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="inout-stat-tabs">
      <!-- lazy：进页面只挂载并请求当前 Tab，切过去的 Tab 之后保活，搜索条件不会被切回来清掉 -->
      <el-tab-pane :label="t('inoutStat.tab.in')" name="in" lazy>
        <InStatPanel />
      </el-tab-pane>
      <el-tab-pane :label="t('inoutStat.tab.out')" name="out" lazy>
        <OutStatPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="InoutStat" lang="ts">
/**
 * 出入库统计（V6-R167）。
 *
 * 顶部两个 Tab：入库统计（产品 × 入库方式 × 供应商）/ 出库统计（产品 × 出库去向），
 * 各自带日期区间搜索（默认近一个月）与导出。
 *
 * compute-on-read：后端按日期区间实时 GROUP BY t_warehouse_stock_flow，不建汇总表、不加跑批 ——
 * 与兄弟页「出入库月汇总」同一套聚合口径与展示排除清单（FlowDisplayScope），
 * 差别只在筛选入口：那页先选月份再下钻，本页是日期区间 + Tab。两页并存（甲方明说「新增」）。
 */
import InStatPanel from './components/InStatPanel.vue';
import OutStatPanel from './components/OutStatPanel.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/** 甲方第 2 点：顶部两个 Tab，入库统计在前（el-tabs 的 v-model 是 string | number，不收窄成字面量联合） */
const activeTab = ref('in');
</script>

<style lang="scss" scoped>
// BizTable 自带 p-2 内边距，Tab 内容区不再叠一层
.inout-stat-tabs :deep(.el-tabs__content) {
  padding: 0;
}
</style>
