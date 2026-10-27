<template>
  <!-- 去皮（V7-R4）：标题上方先给「称重 / 去皮」，实重单独一行放大；下面「不去皮」排第一，再列本页可选规格 -->
  <section v-if="tare.options.value.length" class="tare-selector">
    <p class="tare-summary">
      {{ t('tareSpec.station.gross') }}：{{ kg(tare.grossKg.value) }}，{{ t('tareSpec.station.tareWeight') }}：{{ kg(tare.tareKg.value) }}
    </p>
    <p class="tare-net">
      {{ t('tareSpec.station.net') }}：<strong :class="{ invalid: (tare.net.value ?? 1) <= 0 }">{{ kg(tare.net.value) }}</strong>
    </p>
    <label class="tare-title">{{ t('tareSpec.station.tare') }}</label>
    <div class="tare-options">
      <button type="button" :class="{ active: tare.selectedId.value === '' }" :aria-pressed="tare.selectedId.value === ''" @click="tare.select('')">
        <span>{{ t('tareSpec.station.none') }}</span>
      </button>
      <button
        v-for="o in tare.options.value"
        :key="o.id"
        type="button"
        :class="{ active: tare.selectedId.value === o.id }"
        :aria-pressed="tare.selectedId.value === o.id"
        @click="tare.select(o.id)"
      >
        <span>{{ o.specName }}</span>
        <small>{{ kg(o.tareWeight) }}</small>
      </button>
    </div>
  </section>
  <!-- 规格取不到时常驻提示，不让工人在不知情的情况下按称重提交 -->
  <p v-else-if="tare.loadFailed.value" class="tare-load-failed" role="alert">{{ t('tareSpec.station.loadFailed') }}</p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TareState } from './useTare';

defineProps<{ tare: TareState }>();
const { t } = useI18n();

function kg(v: number | undefined): string {
  return v == null ? '—' : `${Number(v).toFixed(3)}Kg`;
}
</script>

<style scoped>
.tare-selector {
  margin-top: 14px;
}
.tare-summary {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.tare-net {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.tare-net strong {
  font-size: 20px;
  color: var(--el-color-primary);
}
.tare-net strong.invalid {
  color: var(--el-color-danger);
}
.tare-title {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
}
.tare-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.tare-options button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 38px;
  padding: 6px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  cursor: pointer;
  overflow-wrap: anywhere;
}
.tare-options button small {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
.tare-options button.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.tare-load-failed {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--el-color-warning);
}
.tare-options button:disabled {
  cursor: not-allowed;
}
</style>
