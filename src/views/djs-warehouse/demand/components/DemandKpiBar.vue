<!--
  需求管理页顶部「明日全局」KPI 卡片（DJS-FIX-ADMIN-W22-007，口径 = 明日需求）。

  一次返 6 个跨业态数字（明日猪需求/已调配头数 + 明日果蔬需求/已调配品种数 + 其他需求/已调配条数），
  供仓库管理员横向对比"明天哪种业态压力大"（门店提前一天下单，备货看的是明日需求）。

  row52：与「种植计划」页统计卡片样式保持一致——el-card 卡片 + flex 等宽（原为扁平内联横条）。
  4 业态 index.vue 共用本组件（无 props，自取明日全局数）。
-->
<template>
  <div class="kpi-row">
    <el-card v-for="c in kpiCards" :key="c.key" shadow="hover" class="kpi-card">
      <div class="kpi-label">{{ c.label }}</div>
      <div class="kpi-value">
        {{ display(c.value) }} <span class="kpi-unit">{{ c.unit }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { DemandTodayKpiVO } from '@/api/djs-warehouse/demand/types';
import { getDemandTodayKpi } from '@/api/djs-warehouse/demand';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const kpi = ref<DemandTodayKpiVO | null>(null);

/** 6 张卡片：明日猪需求/已调配 + 明日果蔬需求/已调配 + 其他需求/已调配（label + 数值 + 单位）。 */
const kpiCards = computed<Array<{ key: string; label: string; value: number | undefined | null; unit: string }>>(() => [
  { key: 'pigDemand', label: t('demand.kpi.pigDemand'), value: kpi.value?.todayPigDemand, unit: t('demand.kpi.unitHead') },
  { key: 'pigAssigned', label: t('demand.kpi.assigned'), value: kpi.value?.todayPigAssigned, unit: t('demand.kpi.unitHead') },
  { key: 'vegDemand', label: t('demand.kpi.vegDemand'), value: kpi.value?.todayVegSpeciesDemand, unit: t('demand.kpi.unitSpecies') },
  { key: 'vegAssigned', label: t('demand.kpi.assigned'), value: kpi.value?.todayVegSpeciesAssigned, unit: t('demand.kpi.unitSpecies') },
  { key: 'otherDemand', label: t('demand.kpi.otherDemand'), value: kpi.value?.todayOtherDemand, unit: t('demand.kpi.unitItem') },
  { key: 'otherAssigned', label: t('demand.kpi.assigned'), value: kpi.value?.todayOtherAssigned, unit: t('demand.kpi.unitItem') }
]);

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
.kpi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}
.kpi-card {
  /* 一行 6 个等宽：弹性增长 + min-width 触发换行（窄到放不下才换），对齐种植计划卡片 */
  flex: 1 1 0;
  min-width: 150px;
  text-align: center;
}
.kpi-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.kpi-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.kpi-unit {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}
</style>
