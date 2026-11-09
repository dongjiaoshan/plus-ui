<template>
  <div class="numpad">
    <!-- 选了去皮规格：大框显示实重（只读），按键 / 秤自动填入改的仍是称重（modelValue）；下方小字给出称重与去皮 -->
    <template v-if="netMode">
      <div class="numpad-display numpad-display--net" :class="{ 'numpad-display--emphasized': emphasize }" role="status">
        <span class="numpad-net-label">{{ displayLabel }}</span>
        <span class="numpad-net" :class="{ invalid: netInvalid }">{{ netText }}</span>
        <span v-if="unit" class="numpad-unit">{{ unit }}</span>
      </div>
      <p v-if="displayHint" class="numpad-hint">{{ displayHint }}</p>
    </template>
    <div v-else class="numpad-display" :class="{ 'numpad-display--emphasized': emphasize }">
      <input class="numpad-input" :value="buffer" :placeholder="placeholder" inputmode="decimal" @input="onInput" @blur="normalize" />
      <span v-if="unit" class="numpad-unit">{{ unit }}</span>
    </div>
    <button v-if="collapsible" type="button" class="numpad-toggle" :aria-expanded="!collapsed" @click="expanded = !expanded">
      {{ collapsed ? t('tareSpec.station.expandKeys') : t('tareSpec.station.collapseKeys') }}
    </button>
    <div v-show="!collapsed" class="numpad-keys">
      <button v-for="key in keys" :key="key" type="button" class="numpad-key" @click="press(key)">
        {{ key }}
      </button>
      <button type="button" class="numpad-key numpad-back" @click="backspace">
        <el-icon><Back /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Back } from '@element-plus/icons-vue';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 触屏数字小键盘（仓库工平板录产品重量）。对齐打包/分割原型右侧 panel 的 1-9·0·. + 退格。
 * 内部以字符串 buffer 维护编辑态（保「123.」「.5」等中间态不丢精度），向外 emit number | undefined。
 */
const props = withDefaults(
  defineProps<{
    modelValue: number | undefined;
    placeholder?: string;
    unit?: string;
    /** 小数位上限（重量 3 位 / 盒数 0 位） */
    precision?: number;
    /**
     * 秤录重的重量键盘传 true：「自动填入」开时收起按键只留重量框，并给一个「展开键盘」按钮，
     * 不关自动填入也能手改（D-0149）；关掉自动填入时按键始终展开。手改后秤读数不变就不会被覆盖（见 useScaleAutoFill）。
     * 盒数 / 份数等非秤录入的键盘不传，始终展开、无按钮。
     */
    collapseOnAutoFill?: boolean;
    /**
     * 大框改显示的值（去皮页的实重，D-0147）。仅在 displayLabel 非空时生效；输入语义不变——
     * modelValue仍是称重；累计去皮后的按键输入用manualOffset换回称重，秤值不加偏移。
     */
    emphasize?: boolean;
    displayValue?: number;
    /** 大框里数字前的小标签（如「实重」）；为空 = 大框照常显示可编辑的 modelValue */
    displayLabel?: string;
    /** 大框下方小字（如「称重：x，去皮：y」），只在 displayLabel 生效时显示 */
    displayHint?: string;
    /** 累计去皮后的手输值是净重，modelValue 仍为总称重；秤自动填入不经过此换算。 */
    manualOffset?: number;
    /** 去皮/恢复/切模式开始新一轮编辑，防止按键拼接上一轮读数。 */
    inputEpoch?: number;
  }>(),
  {
    placeholder: '',
    unit: '',
    precision: 3,
    collapseOnAutoFill: false,
    emphasize: false,
    displayValue: undefined,
    displayLabel: '',
    displayHint: '',
    manualOffset: 0,
    inputEpoch: 0
  }
);

const { t } = useI18n();
const scaleCfg = useScaleConfigStore();
/** 「自动填入」开着的秤重量键盘：默认收起，可点按钮展开手改 */
const collapsible = computed<boolean>(() => props.collapseOnAutoFill && scaleCfg.autoFill);
const expanded = ref(false);
// 自动填入开关一变就回到默认（开 = 收起），免得上次展开的状态带到下一轮
watch(
  () => scaleCfg.autoFill,
  () => {
    expanded.value = false;
  }
);
const collapsed = computed<boolean>(() => collapsible.value && !expanded.value);

const netMode = computed<boolean>(() => props.displayLabel !== '');
const netText = computed<string>(() =>
  props.displayValue == null || !Number.isFinite(props.displayValue) ? '—' : props.displayValue.toFixed(Math.max(props.precision, 0))
);
const netInvalid = computed<boolean>(() => props.displayValue != null && props.displayValue <= 0);

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | undefined): void;
}>();

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];

// 编辑态字符串 buffer：内部权威；外部 modelValue 变化（如重置）时同步回 buffer
const buffer = ref<string>(props.modelValue == null || Number.isNaN(props.modelValue) ? '' : String(props.modelValue));

watch(
  () => [props.modelValue, props.manualOffset, props.inputEpoch] as const,
  ([v, offset, epoch], previous) => {
    if (previous && epoch !== previous[2]) {
      buffer.value = '';
      return;
    }
    const asStr = v == null || Number.isNaN(v) ? '' : String((Math.round(v * 1000) - Math.round(offset * 1000)) / 1000);
    // 仅当外部值与 buffer 当前数值不一致时回灌（避免「5.」中间态被自身 emit 冲掉）。
    // 末条：外部给 0 而框内为空时也要写「0」——秤自动填入镜像空秤读数时，
    // 空框和 0 数值相等会被前两条判为"一致"而不回灌，工人就看不到归零（本项目只有秤会显式给 0，
    // 其余调用方重置一律给 undefined，不受影响）。
    if (Number(buffer.value || '0') !== Number(asStr || '0') || (asStr === '' && buffer.value !== '') || (asStr === '0' && buffer.value === '')) {
      buffer.value = asStr;
    }
  }
);

function sanitize(raw: string): string {
  let s = raw.replace(/[^0-9.]/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot >= 0) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  if (props.precision <= 0) {
    s = s.replace(/\./g, '');
  } else if (s.indexOf('.') >= 0) {
    const dot = s.indexOf('.');
    s = s.slice(0, dot + 1) + s.slice(dot + 1).slice(0, props.precision);
  }
  return s;
}

function emitFromBuffer() {
  const s = buffer.value;
  const num = s === '' || s === '.' ? undefined : Number(s);
  const value = num === undefined || Number.isNaN(num) ? undefined : (Math.round(num * 1000) + Math.round(props.manualOffset * 1000)) / 1000;
  emit('update:modelValue', value);
  // 秤重量键盘的手改：通知自动填入「读数不变前别覆盖」
  if (props.collapseOnAutoFill) scaleCfg.markManualEdit(value);
}

function press(key: string) {
  if (key === '.' && props.precision <= 0) return;
  if (key === '.' && buffer.value.includes('.')) return;
  let next = buffer.value;
  if (key === '.' && next === '') next = '0';
  // 秤空盘自动填入会把框写成 "0"，工人关掉自动填入改手输时首个数字键要顶掉这个 0，
  // 否则敲 1 . 5 显示成 "01.5"（值对但秤屏上看着像按错，会反复清零重敲）。
  else if (next === '0' && key !== '.') next = '';
  buffer.value = sanitize(next + key);
  emitFromBuffer();
}

function backspace() {
  // 去皮/恢复后首个数字仍重新录入；退格则从当前可编辑重量开始删。
  if (buffer.value === '' && props.modelValue != null && Number.isFinite(props.modelValue)) {
    buffer.value = String((Math.round(props.modelValue * 1000) - Math.round(props.manualOffset * 1000)) / 1000);
  }
  if (buffer.value === '') return;
  buffer.value = buffer.value.slice(0, -1);
  emitFromBuffer();
}

function onInput(e: Event) {
  buffer.value = sanitize((e.target as HTMLInputElement).value);
  emitFromBuffer();
}

function normalize() {
  // 失焦时收敛中间态：'5.' → '5'，'' → 清空
  if (buffer.value.endsWith('.')) {
    buffer.value = buffer.value.slice(0, -1);
  }
  emitFromBuffer();
}
</script>

<style scoped>
.numpad {
  width: 100%;
}
.numpad-display {
  display: flex;
  align-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 0 12px;
  height: 44px;
  margin-bottom: 12px;
  background: var(--el-fill-color-blank);
}
.numpad-display--net {
  gap: 8px;
  margin-bottom: 4px;
}
.numpad-net-label {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.numpad-net {
  flex: 1;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.numpad-net.invalid {
  color: var(--el-color-danger);
}
.numpad-hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.numpad-toggle {
  display: block;
  width: 100%;
  height: 34px;
  margin-bottom: 8px;
  border: 1px dashed var(--el-color-primary-light-5);
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 14px;
  cursor: pointer;
}
.numpad-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  background: transparent;
  color: var(--el-text-color-primary);
  width: 100%;
}
.numpad-display--emphasized .numpad-input,
.numpad-display--emphasized .numpad-net,
.numpad-display--emphasized .numpad-unit,
.numpad-display--emphasized .numpad-net-label {
  color: var(--el-color-danger);
  font-weight: 700;
}
.numpad-input::placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
.numpad-unit {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-left: 6px;
}
.numpad-keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.numpad-key {
  height: 44px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  font-size: 18px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: background 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.numpad-key:hover {
  background: var(--el-fill-color-light);
}
.numpad-key:active {
  background: var(--el-fill-color);
}
.numpad-back {
  color: var(--el-color-warning);
}
</style>
