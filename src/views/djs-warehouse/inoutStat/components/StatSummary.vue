<template>
  <div class="stat-summary" :style="{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }">
    <el-card v-for="card in cards" :key="card.key" shadow="hover">
      <div class="stat-value">{{ card.value }}</div>
      <div class="stat-label">{{ t(`inoutStat.summary.${card.key}`) }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { InoutStatSummaryVO } from '@/api/djs-warehouse/inoutStat';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ direction: 'in' | 'out'; summary: InoutStatSummaryVO }>();
const { t } = useI18n();
const qty = (value: number | string | undefined, weight = false) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: weight ? 3 : 0, maximumFractionDigits: 3 });
const cards = computed(() => {
  const prefix = props.direction;
  const totals = props.summary;
  return [
    { key: `${prefix}Products`, value: totals.productCount ?? 0 },
    { key: `${prefix}Weight`, value: `${qty(totals.weightQty, true)} kg` },
    { key: `${prefix}Quantity`, value: qty(totals.nonWeightQty) },
    { key: `${prefix}Types`, value: (prefix === 'in' ? totals.flowTypeCount : totals.outDestCount) ?? 0 },
    ...(prefix === 'in' ? [{ key: 'suppliers', value: totals.supplierCount ?? 0 }] : [])
  ];
});
</script>

<style scoped lang="scss">
.stat-summary {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
  :deep(.el-card__body) {
    padding: 16px 10px;
    text-align: center;
  }
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.stat-label {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
