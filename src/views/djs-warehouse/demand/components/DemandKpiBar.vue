<!--
  需求管理页顶部「今日全局」KPI 横条（DJS-FIX-ADMIN-W22-007）。

  一次返 6 个跨业态数字（今日猪需求/已调配头数 + 今日果蔬需求/已调配品种数 + 其他需求/已调配条数），
  供仓库管理员横向对比"今天哪种业态压力大"。

  与 SummaryBar（当前业态摘要）互不替代：本横条渲染在 SummaryBar 上方。
  4 业态 index.vue 共用本组件（无 props，自取今日全局数）。
-->
<template>
  <el-row :gutter="8" class="kpi-bar">
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.pigDemand') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayPigDemand) }} <span class="kpi-unit">{{ t('demand.kpi.unitHead') }}</span>
        </div>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.assigned') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayPigAssigned) }} <span class="kpi-unit">{{ t('demand.kpi.unitHead') }}</span>
        </div>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.vegDemand') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayVegSpeciesDemand) }} <span class="kpi-unit">{{ t('demand.kpi.unitSpecies') }}</span>
        </div>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.assigned') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayVegSpeciesAssigned) }} <span class="kpi-unit">{{ t('demand.kpi.unitSpecies') }}</span>
        </div>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.otherDemand') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayOtherDemand) }} <span class="kpi-unit">{{ t('demand.kpi.unitItem') }}</span>
        </div>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="kpi-item">
        <div class="kpi-label">{{ t('demand.kpi.assigned') }}</div>
        <div class="kpi-value">
          {{ display(kpi?.todayOtherAssigned) }} <span class="kpi-unit">{{ t('demand.kpi.unitItem') }}</span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { DemandTodayKpiVO } from '@/api/djs-warehouse/demand/types';
import { getDemandTodayKpi } from '@/api/djs-warehouse/demand';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const kpi = ref<DemandTodayKpiVO | null>(null);

/** 数字为 undefined/null（加载中或加载失败）时占位 '-'；后端无数据返 0 正常显示。 */
function display(v: number | undefined | null): string {
  return v === undefined || v === null ? '-' : String(v);
}

async function load() {
  try {
    const res = await getDemandTodayKpi();
    kpi.value = res.data;
  } catch {
    // 加载失败保持 null → 6 格显示 '-'，不阻塞下方列表
    kpi.value = null;
  }
}

onMounted(load);

defineExpose({ refresh: load });
</script>

<style scoped>
.kpi-bar {
  margin-bottom: 8px;
}
.kpi-item {
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
}
.kpi-label {
  font-size: 12px;
  color: #909399;
}
.kpi-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.kpi-unit {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}
</style>
