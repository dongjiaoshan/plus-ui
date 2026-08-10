<template>
  <div class="scale-reader">
    <div class="scale-head">
      <span class="scale-title">{{ t('djs.warehouse.scale.title') }}</span>
      <span class="scale-status" :class="connected ? 'on' : 'off'">
        <span class="dot" />
        {{ statusText }}
      </span>
    </div>

    <div class="scale-display" :class="{ steady: isSteady && connected }">
      <span class="scale-value">{{ displayWeight }}</span>
      <span class="scale-unit">{{ displayUnit }}</span>
      <span v-if="connected" class="scale-badge" :class="isSteady ? 'ok' : 'warn'">
        {{ isSteady ? t('djs.warehouse.scale.steady') : t('djs.warehouse.scale.unstable') }}
      </span>
    </div>

    <div v-if="offlineTip" class="scale-tip">{{ offlineTip }}</div>

    <div class="scale-actions">
      <el-button type="primary" size="large" class="scale-fill" :disabled="!canFill" @click="fillNow">
        {{ t('djs.warehouse.scale.fill') }}
      </el-button>
      <el-button :disabled="!connected" @click="onZero">{{ t('djs.warehouse.scale.zero') }}</el-button>
      <el-button :disabled="!connected" @click="onTare">{{ t('djs.warehouse.scale.tare') }}</el-button>
      <div class="scale-auto">
        <span class="scale-auto-label">{{ t('djs.warehouse.scale.autoFill') }}</span>
        <el-switch v-model="cfg.autoFill" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useScaleAutoFill } from '@/composables/useScaleAutoFill';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 电子秤实时重量小部件（挂在打包页右侧操作台，WeightNumpad 之后）。
 * 连本机秤桥 ws://127.0.0.1:5017/weight，自动填入（可关）或点「填入」手动填，
 * 向父组件 emit('fill', 换算后的数值)——单位与录入口径一致（克/kg）。
 * 自动填入口径（镜像秤读数、取下回 0）单一来源在 useScaleAutoFill。
 */
const props = withDefaults(
  defineProps<{
    /** 录入单位是否为克（肉品/果蔬打包=true，秤给 kg → ×1000 取整）；否则按 kg 三位小数 */
    inGram: boolean;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{ fill: [v: number] }>();

const { t } = useI18n();
const cfg = useScaleConfigStore();
const { connected, weightKg, isSteady, unitName, code, lastError, zero, tare } = useScaleAutoFill({
  inGram: () => props.inGram,
  disabled: () => props.disabled,
  onFill: (v) => emit('fill', v)
});

/** 手动「填入」的最小起填重量（kg）：空秤（< 5g）不给手动填 0 进去。 */
const MIN_KG = 0.005;

const displayWeight = computed<string>(() => {
  const kg = weightKg.value;
  if (kg === null) return '—';
  return props.inGram ? String(Math.round(kg * 1000)) : kg.toFixed(3);
});
const displayUnit = computed<string>(() => (props.inGram ? 'g' : unitName.value || 'kg'));
const statusText = computed<string>(() => (connected.value ? t('djs.warehouse.scale.connected') : t('djs.warehouse.scale.disconnected')));
const offlineTip = computed<string>(() => {
  if (!connected.value) return t('djs.warehouse.scale.offlineTip');
  // 秤异常（Code=0）：优先展示设备返回的 Message，无则走 i18n 兜底
  if (code.value === 0) return lastError.value || t('djs.warehouse.scale.scaleError');
  return lastError.value;
});
const canFill = computed<boolean>(() => !props.disabled && connected.value && isSteady.value && code.value === 1 && (weightKg.value ?? 0) >= MIN_KG);

const convert = (kg: number): number => (props.inGram ? Math.round(kg * 1000) : Number(kg.toFixed(3)));

function fillNow(): void {
  const kg = weightKg.value;
  if (kg === null || kg < MIN_KG) return;
  emit('fill', convert(kg));
}

async function onZero(): Promise<void> {
  const r = await zero();
  if (r.ok) ElMessage.success(t('djs.warehouse.scale.zeroOk'));
  else ElMessage.error(r.message || t('djs.warehouse.scale.zeroFail'));
}

async function onTare(): Promise<void> {
  const r = await tare();
  if (r.ok) ElMessage.success(t('djs.warehouse.scale.tareOk'));
  else ElMessage.error(r.message || t('djs.warehouse.scale.tareFail'));
}
</script>

<style scoped>
.scale-reader {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--el-fill-color-blank);
}
.scale-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.scale-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.scale-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}
.scale-status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-info);
}
.scale-status.on {
  color: var(--el-color-success);
}
.scale-status.on .dot {
  background: var(--el-color-success);
}
.scale-status.off {
  color: var(--el-text-color-placeholder);
}
.scale-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  margin-bottom: 10px;
}
.scale-display.steady {
  border-color: var(--el-color-success);
}
.scale-value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}
.scale-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.scale-badge {
  margin-left: auto;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}
.scale-badge.ok {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.scale-badge.warn {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.scale-tip {
  font-size: 12px;
  color: var(--el-color-warning);
  margin-bottom: 8px;
  line-height: 1.4;
}
.scale-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.scale-fill {
  flex: 1 1 auto;
}
.scale-auto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.scale-auto-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
