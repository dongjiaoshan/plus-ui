<template>
  <div class="numpad">
    <div class="numpad-display">
      <input
        class="numpad-input"
        :value="buffer"
        :placeholder="placeholder"
        inputmode="decimal"
        @input="onInput"
        @blur="normalize"
      />
      <span v-if="unit" class="numpad-unit">{{ unit }}</span>
    </div>
    <div class="numpad-keys">
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
import { ref, watch } from 'vue';
import { Back } from '@element-plus/icons-vue';

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
  }>(),
  {
    placeholder: '',
    unit: '',
    precision: 3
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | undefined): void;
}>();

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];

// 编辑态字符串 buffer：内部权威；外部 modelValue 变化（如重置）时同步回 buffer
const buffer = ref<string>(props.modelValue == null || Number.isNaN(props.modelValue) ? '' : String(props.modelValue));

watch(
  () => props.modelValue,
  (v) => {
    const asStr = v == null || Number.isNaN(v) ? '' : String(v);
    // 仅当外部值与 buffer 当前数值不一致时回灌（避免「5.」中间态被自身 emit 冲掉）
    if (Number(buffer.value || '0') !== Number(asStr || '0') || (asStr === '' && buffer.value !== '')) {
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
  if (s === '' || s === '.') {
    emit('update:modelValue', undefined);
    return;
  }
  const num = Number(s);
  emit('update:modelValue', Number.isNaN(num) ? undefined : num);
}

function press(key: string) {
  if (key === '.' && props.precision <= 0) return;
  if (key === '.' && buffer.value.includes('.')) return;
  let next = buffer.value;
  if (key === '.' && next === '') next = '0';
  buffer.value = sanitize(next + key);
  emitFromBuffer();
}

function backspace() {
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
.numpad-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  background: transparent;
  color: var(--el-text-color-primary);
  width: 100%;
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
