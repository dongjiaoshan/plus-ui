<template>
  <div class="dest-toggle">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      class="dest-btn"
      :class="{ active: String(modelValue) === String(opt.value) }"
      @click="select(opt.value)"
    >
      {{ opt.label }}
    </button>
    <span v-if="options.length === 0" class="dest-empty">{{ emptyText }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * 目的地 button-toggle（对齐打包/分割原型右侧 panel 的发送位置/入库位置/地块）。
 * 替代 el-radio-group，触屏大按钮。value 泛型为 number | string。
 */
defineProps<{
  modelValue: number | string | '' | undefined;
  options: { value: number | string; label: string }[];
  emptyText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | string): void;
  (e: 'change', v: number | string): void;
}>();

function select(v: number | string) {
  emit('update:modelValue', v);
  emit('change', v);
}
</script>

<style scoped>
.dest-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.dest-btn {
  min-width: 76px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  font-size: 14px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all 0.12s ease;
}
.dest-btn:hover {
  border-color: var(--el-color-primary-light-5);
}
.dest-btn.active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.dest-empty {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  line-height: 40px;
}
</style>
