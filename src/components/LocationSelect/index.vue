<template>
  <!--
    LocationSelect · 库位下拉（STR-RETURN-OPS-001 新建的可复用组件，全仓此前没有）

    用途：入库库位这类「按产品预设优先、配空回落全量」的下拉。选项由调用方给（后端随行下发
    `locationOptions`），组件只负责渲染 + v-model 双向绑定，不自己发请求 —— 这样同一行数据
    在列表里批量渲染时不会打出 N 个请求。

    ⚠️ value 一律用 string：库位 id 是雪花主键（19 位 > 2^53），用 number 会末位被截
    （跨层契约 1）。后端 Jackson 也把 Long 序列化成 string，两边同型。
  -->
  <el-select
    :model-value="normalizedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :size="size"
    :style="{ width }"
    @update:model-value="onUpdate"
  >
    <el-option v-for="opt in options" :key="String(opt.id)" :label="labelOf(opt)" :value="String(opt.id)" />
  </el-select>
</template>

<script setup name="LocationSelect" lang="ts">
import type { LocationPickerVO } from '@/api/djs-store/return/types';

const props = withDefaults(
  defineProps<{
    /** 当前选中库位 ID（string；number 也接受，内部统一转 string） */
    modelValue?: string | number | null;
    /** 可选库位（后端 LocationPickerVo 列表；空数组 = 下拉无选项） */
    options?: LocationPickerVO[];
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    filterable?: boolean;
    size?: 'large' | 'default' | 'small';
    /** 宽度（默认 100%，跟单元格对齐） */
    width?: string;
  }>(),
  {
    modelValue: null,
    options: () => [],
    placeholder: '',
    disabled: false,
    clearable: false,
    filterable: true,
    size: 'default',
    width: '100%'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'change', value: string | null): void;
}>();

// 统一成 string | null：避免调用方传 number 时 el-select 匹配不上 string 选项、显示成空白
const normalizedValue = computed<string | null>(() => {
  const v = props.modelValue;
  return v === null || v === undefined || v === '' ? null : String(v);
});

// 展示「名称（编码）」——同名库位（如两个「冻品库」）只靠名称分不出来，编码是唯一区分
function labelOf(opt: LocationPickerVO): string {
  const name = opt.locationName ?? String(opt.id);
  return opt.locationCode ? `${name}（${opt.locationCode}）` : name;
}

function onUpdate(value: string | null) {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>
