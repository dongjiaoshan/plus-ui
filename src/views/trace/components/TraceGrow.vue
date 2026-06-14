<template>
  <div class="grow-page">
    <el-tabs v-model="activeTab" class="grow-tabs">
      <el-tab-pane :label="t('tracePublic.grow.tabGrowth')" name="growth">
        <div v-if="growthRecords.length === 0" class="t-empty">{{ t('tracePublic.grow.emptyGrowth') }}</div>
        <div v-for="(g, idx) in growthRecords" :key="idx" class="t-card grow-row">
          <div class="grow-row__head">
            <div class="t-timeline-dot"></div>
            <span class="grow-date">{{ g.date }}</span>
          </div>
          <div class="grow-metrics">
            <span v-if="g.ageDays != null">{{ t('tracePublic.grow.ageDays') }} {{ g.ageDays }} {{ t('tracePublic.grow.daysUnit') }}</span>
            <span v-if="g.weight">{{ t('tracePublic.grow.weight') }} {{ g.weight }} {{ t('tracePublic.grow.weightUnit') }}</span>
            <span v-if="g.backfat">{{ t('tracePublic.grow.backfat') }} {{ g.backfat }} {{ t('tracePublic.grow.backfatUnit') }}</span>
          </div>
          <div v-if="g.operatorName" class="grow-op">{{ t('tracePublic.grow.operator') }}：{{ g.operatorName }}</div>
          <el-image v-if="g.photoUrl" :src="g.photoUrl" :preview-src-list="[g.photoUrl]" :preview-teleported="true" fit="cover" class="grow-photo" />
        </div>
      </el-tab-pane>

      <el-tab-pane :label="t('tracePublic.grow.tabMedication')" name="medication">
        <div v-if="medications.length === 0" class="t-empty">{{ t('tracePublic.grow.emptyMedication') }}</div>
        <div v-for="(m, idx) in medications" :key="idx" class="t-card grow-row">
          <div class="grow-row__head">
            <div class="t-timeline-dot"></div>
            <span class="grow-date">{{ m.date }}</span>
          </div>
          <div class="med-name-row">
            <span class="med-type">{{ medicationTypeLabel(m.type) }}</span>
            <span class="med-name">{{ m.name }}</span>
          </div>
          <div class="grow-metrics">
            <span v-if="m.ageDays != null">{{ t('tracePublic.grow.ageDays') }} {{ m.ageDays }} {{ t('tracePublic.grow.daysUnit') }}</span>
            <span v-if="m.operatorName">{{ t('tracePublic.grow.operator') }} {{ m.operatorName }}</span>
          </div>
          <div v-if="m.reason" class="grow-op">{{ t('tracePublic.grow.reason') }}：{{ m.reason }}</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PublicTraceVo } from '@/api/trace/types';
import { medicationTypeLabel } from '@/api/trace/labels';

const props = defineProps<{ trace: PublicTraceVo }>();
const { t } = useI18n();

const activeTab = ref('growth');
const growthRecords = computed(() => props.trace.growthRecords ?? []);
const medications = computed(() => props.trace.medications ?? []);
</script>

<style lang="scss" scoped>
@use './trace-h5.scss';

.grow-page {
  padding: 12px;
}
.grow-tabs :deep(.el-tabs__item) {
  font-size: 14px;
}
.grow-tabs :deep(.el-tabs__item.is-active) {
  color: #2f7c44;
}
.grow-tabs :deep(.el-tabs__active-bar) {
  background-color: #2f7c44;
}
.grow-row {
  margin-bottom: 12px;
}
.grow-row__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.grow-date {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  font-variant-numeric: tabular-nums;
}
.grow-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
.grow-op {
  font-size: 12px;
  color: #909399;
}
.grow-photo {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  margin-top: 8px;
}
.med-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.med-type {
  display: inline-block;
  background: #e8f3ec;
  color: #2f7c44;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
}
.med-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style>
