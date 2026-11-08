<template>
  <!-- 去皮（V7-R4）：「不去皮」排第一，再列本页可选规格。称重 / 去皮 / 实重显示在上方重量大框（WeightNumpad，见 useTare.numpadProps） -->
  <section v-if="tare.cumulativeEnabled || tare.options.value.length" class="tare-selector">
    <label class="tare-title">{{ tare.cumulativeEnabled ? 'TAP' : t('tareSpec.station.tare') }}</label>
    <div v-if="tare.cumulativeEnabled" class="tare-modes">
      <button
        type="button"
        :class="{ active: tare.mode.value === 'cumulative' }"
        :aria-pressed="tare.mode.value === 'cumulative'"
        @click="tare.setMode('cumulative')"
      >
        {{ t('tareSpec.station.cumulative') }}
      </button>
      <button
        type="button"
        :class="{ active: tare.mode.value === 'fixed' }"
        :aria-pressed="tare.mode.value === 'fixed'"
        @click="tare.setMode('fixed')"
      >
        {{ t('tareSpec.station.fixed') }}
      </button>
    </div>
    <div v-if="tare.mode.value === 'cumulative'" class="tare-modes">
      <button type="button" :disabled="tare.grossKg.value == null || tare.grossKg.value < 0" @click="tare.captureTare()">
        {{ t('tareSpec.station.capture') }}
      </button>
      <button type="button" @click="tare.restoreTare()">{{ t('tareSpec.station.restore') }}</button>
    </div>
    <div v-else class="tare-options">
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
  <p v-if="tare.loadFailed.value && tare.mode.value === 'fixed'" class="tare-load-failed" role="alert">{{ t('tareSpec.station.loadFailed') }}</p>
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
.tare-title {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
}
.tare-options,
.tare-modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.tare-options button,
.tare-modes button {
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
.tare-options button.active,
.tare-modes button.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.tare-modes {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 8px;
}
.tare-load-failed {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--el-color-warning);
}
.tare-options button:disabled,
.tare-modes button:disabled {
  cursor: not-allowed;
}
</style>
