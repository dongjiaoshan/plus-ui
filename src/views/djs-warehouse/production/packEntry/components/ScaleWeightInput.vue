<template>
  <!-- 带边框卡片，和其它区块区分（Kevin）；头部一排：左=标签，右=秤状态+自动填入 -->
  <div class="scale-input">
    <div class="si-head">
      <span class="si-label">{{ label || t('djs.warehouse.packEntry.productWeight') }}</span>
      <span class="si-ctrl">
        <span class="si-status" :class="connected ? 'on' : 'off'">
          <span class="dot" />{{ statusText }}
        </span>
        <span v-if="connected" class="si-badge" :class="isSteady ? 'ok' : 'warn'">
          {{ isSteady ? t('djs.warehouse.scale.steady') : t('djs.warehouse.scale.unstable') }}
        </span>
        <span class="si-auto">
          {{ t('djs.warehouse.scale.autoFill') }}
          <el-switch v-model="cfg.autoFill" size="small" />
        </span>
      </span>
    </div>

    <!-- 重量输入框（对齐原 numpad 显示框；可手输/改，秤稳定有值时自动填） -->
    <div class="si-display" :class="{ 'is-steady': connected && isSteady }">
      <input
        class="si-input"
        :value="buffer"
        :placeholder="placeholder || t('djs.warehouse.packEntry.weightPlaceholder')"
        inputmode="decimal"
        @input="onInput"
        @blur="normalize"
      />
      <span class="si-unit">{{ displayUnit }}</span>
    </div>

    <div v-if="offlineTip" class="si-tip">{{ offlineTip }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScaleWeight } from '@/composables/useScaleWeight';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 小屏用「秤重量可编辑输入框」（替代触屏 numpad + ScaleReader）：
 * - 带边框卡片，头部一排放标签 + 秤状态 + 自动填入开关；下面是重量输入框。
 * - 用户可手动输入 / 修改；秤稳定且有值(≥MIN)时自动填入覆盖；空秤(<MIN)不覆盖手输。
 * v-model 绑父级 productWeight（单位与录入口径一致：肉品/果蔬=克整数，其余=kg 3 位）。
 */
const props = withDefaults(
  defineProps<{
    modelValue: number | undefined;
    /** 录入单位是否为克（肉品/果蔬=true，秤 kg×1000 取整）；否则 kg 三位小数 */
    inGram: boolean;
    /** 单位展示文本（缺省按 inGram 推 g/kg） */
    unit?: string;
    /** 标签文案（缺省「产品重量」） */
    label?: string;
    placeholder?: string;
  }>(),
  { unit: '', label: '', placeholder: '' }
);
const emit = defineEmits<{ 'update:modelValue': [v: number | undefined] }>();

const { t } = useI18n();
const cfg = useScaleConfigStore();
const { connected, weightKg, isSteady, unitName, code, lastError, connect, close } = useScaleWeight();

onMounted(connect);
onActivated(connect);
onDeactivated(close);
onUnmounted(close);

const MIN_KG = 0.005;
const REFILL_DELTA_KG = 0.005;
const precision = computed<number>(() => (props.inGram ? 0 : 3));
const displayUnit = computed<string>(() => props.unit || (props.inGram ? 'g' : unitName.value || 'kg'));

const buffer = ref<string>(props.modelValue == null || Number.isNaN(props.modelValue) ? '' : String(props.modelValue));
watch(
  () => props.modelValue,
  (v) => {
    const s = v == null || Number.isNaN(v) ? '' : String(v);
    if (Number(buffer.value || '0') !== Number(s || '0') || (s === '' && buffer.value !== '')) buffer.value = s;
  }
);

function sanitize(raw: string): string {
  let s = raw.replace(/[^0-9.]/g, '');
  const dot = s.indexOf('.');
  if (dot >= 0) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  if (precision.value <= 0) {
    s = s.replace(/\./g, '');
  } else if (s.indexOf('.') >= 0) {
    const d = s.indexOf('.');
    s = s.slice(0, d + 1) + s.slice(d + 1).slice(0, precision.value);
  }
  return s;
}
function emitFromBuffer(): void {
  const s = buffer.value;
  if (s === '' || s === '.') {
    emit('update:modelValue', undefined);
    return;
  }
  const n = Number(s);
  emit('update:modelValue', Number.isNaN(n) ? undefined : n);
}
function onInput(e: Event): void {
  buffer.value = sanitize((e.target as HTMLInputElement).value);
  emitFromBuffer();
}
function normalize(): void {
  if (buffer.value.endsWith('.')) buffer.value = buffer.value.slice(0, -1);
  emitFromBuffer();
}

const statusText = computed<string>(() =>
  connected.value ? t('djs.warehouse.scale.connected') : t('djs.warehouse.scale.disconnected')
);
const offlineTip = computed<string>(() => {
  if (!connected.value) return t('djs.warehouse.scale.offlineTip');
  if (code.value === 0) return lastError.value || t('djs.warehouse.scale.scaleError');
  return '';
});

const convert = (kg: number): number => (props.inGram ? Math.round(kg * 1000) : Number(kg.toFixed(3)));

const lastFilledKg = ref<number | null>(null);
watch(
  () => [weightKg.value, isSteady.value, connected.value, code.value, cfg.autoFill] as const,
  () => {
    const kg = weightKg.value;
    if (kg === null || kg < MIN_KG) {
      lastFilledKg.value = null;
      return;
    }
    if (
      cfg.autoFill &&
      connected.value &&
      isSteady.value &&
      code.value === 1 &&
      (lastFilledKg.value === null || Math.abs(kg - lastFilledKg.value) >= REFILL_DELTA_KG)
    ) {
      emit('update:modelValue', convert(kg));
      lastFilledKg.value = kg;
    }
  }
);
</script>

<style scoped>
/* 带边框卡片，和其它区块区分 */
.scale-input {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--el-fill-color-blank);
}
/* 头部一排：左标签 + 右状态/开关 */
.si-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.si-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.si-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.si-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}
.si-status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-info);
}
.si-status.on {
  color: var(--el-color-success);
}
.si-status.on .dot {
  background: var(--el-color-success);
}
.si-status.off {
  color: var(--el-text-color-placeholder);
}
.si-badge {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}
.si-badge.ok {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.si-badge.warn {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.si-auto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
/* 重量输入框（对齐原 WeightNumpad 显示框） */
.si-display {
  display: flex;
  align-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 0 12px;
  height: 44px;
  background: var(--el-bg-color);
  transition: border-color 0.15s ease;
}
.si-display.is-steady {
  border-color: var(--el-color-success);
}
.si-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 20px;
  background: transparent;
  color: var(--el-text-color-primary);
  width: 100%;
}
.si-input::placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
.si-unit {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-left: 6px;
}
.si-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-color-warning);
  line-height: 1.4;
}
</style>
