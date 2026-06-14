<template>
  <div class="pr-page">
    <div class="t-card">
      <div class="t-section-title">{{ t('tracePublic.plotRecords.title') }}</div>
      <div v-if="records.length === 0" class="t-empty">{{ t('tracePublic.plotRecords.empty') }}</div>
      <div v-for="(r, idx) in records" :key="idx" class="pr-row">
        <div class="pr-dot" :style="{ background: dotColor(r.workType) }"></div>
        <div class="pr-content">
          <div class="pr-head">
            <span class="pr-type">{{ farmWorkTypeLabel(r.workType) }}</span>
            <span v-if="r.date" class="pr-date">{{ r.date }}</span>
          </div>
          <div v-if="r.detail" class="pr-detail">{{ r.detail }}</div>
          <div v-if="r.operatorName" class="pr-op">{{ r.operatorName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PublicTraceVo } from '@/api/trace/types';
import { farmWorkTypeLabel } from '@/api/trace/labels';

const props = defineProps<{ trace: PublicTraceVo }>();
const { t } = useI18n();

const records = computed(() => props.trace.plotRecords ?? []);

// 农事类型 → 圆点色（浇灌/水肥蓝 / 施肥橙 / 其他主色绿）
function dotColor(workType?: string): string {
  switch (workType) {
    case 'irrigation':
    case 'water_fertilize':
      return '#4a90d9';
    case 'fertilize':
      return '#e6791a';
    default:
      return '#2f7c44';
  }
}
</script>

<style lang="scss" scoped>
@use './trace-h5.scss';

.pr-page {
  padding: 12px;
}
.pr-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.pr-row:last-child {
  border-bottom: none;
}
.pr-dot {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
}
.pr-content {
  flex: 1;
}
.pr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pr-type {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.pr-date {
  font-size: 12px;
  color: #909399;
  font-variant-numeric: tabular-nums;
}
.pr-detail {
  font-size: 13px;
  color: #606266;
}
.pr-op {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}
</style>
