<template>
  <transition :enter-active-class="proxy?.animate?.searchAnimate?.enter" :leave-active-class="proxy?.animate?.searchAnimate?.leave">
    <div v-show="visible" class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="formRef" class="biz-search-form" :model="innerModel" :inline="true" label-width="auto" @submit.prevent>
          <el-form-item v-for="field in schema" :key="field.field" :label="field.label" :prop="field.field">
            <!-- input -->
            <el-input
              v-if="field.type === 'input'"
              v-model="innerModel[field.field]"
              :placeholder="field.placeholder ?? `${t('biz.table.search.inputPrefix')}${field.label}`"
              :clearable="field.clearable ?? true"
              :style="resolveWidth(field.width ?? 200)"
              @keyup.enter="handleSearch"
            />

            <!-- number -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="innerModel[field.field]"
              controls-position="right"
              :style="resolveWidth(field.width ?? 200)"
            />

            <!-- select（dictType / options 二选一） -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="innerModel[field.field]"
              :placeholder="field.placeholder ?? `${t('biz.table.search.selectPrefix')}${field.label}`"
              :clearable="field.clearable ?? true"
              :empty-values="field.allOption ? ALL_OPTION_EMPTY_VALUES : undefined"
              :multiple="field.multiple ?? false"
              :collapse-tags="field.multiple ? true : undefined"
              :collapse-tags-tooltip="field.multiple ? true : undefined"
              filterable
              :style="resolveWidth(field.width ?? 200)"
            >
              <el-option v-for="opt in resolveSelectOptions(field)" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
            </el-select>

            <!-- date -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="innerModel[field.field]"
              type="date"
              :placeholder="field.placeholder ?? `${t('biz.table.search.selectPrefix')}${field.label}`"
              value-format="YYYY-MM-DD"
              :style="resolveWidth(field.width ?? 200)"
            />

            <!-- month（回写 'YYYY-MM'） -->
            <el-date-picker
              v-else-if="field.type === 'month'"
              v-model="innerModel[field.field]"
              type="month"
              :placeholder="field.placeholder ?? `${t('biz.table.search.selectPrefix')}${field.label}`"
              value-format="YYYY-MM"
              :clearable="field.clearable ?? true"
              :style="resolveWidth(field.width ?? 200)"
            />

            <!-- daterange -->
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="innerModel[field.field]"
              type="daterange"
              :start-placeholder="t('biz.table.search.startDate')"
              :end-placeholder="t('biz.table.search.endDate')"
              value-format="YYYY-MM-DD"
              :style="resolveWidth(field.width ?? 240)"
            />
          </el-form-item>

          <el-form-item class="biz-search-btns">
            <el-button type="primary" icon="Search" @click="handleSearch">
              {{ t('biz.table.search.submit') }}
            </el-button>
            <el-button icon="Refresh" @click="handleReset">
              {{ t('biz.table.search.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { SearchFieldSchema } from './types';
import { useI18n } from 'vue-i18n';
import { useDict } from '@/utils/dict';

interface Props {
  schema: SearchFieldSchema[];
  visible: boolean;
  /** 父组件已加载的 dict map（避免重复请求） */
  dictMap?: Record<string, DictDataOption[]>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'search'): void;
  (e: 'reset'): void;
}>();

// v-model:model（双向绑定查询表单，避免直接 mut prop 触发 vue/no-mutating-props）
const innerModel = defineModel<Record<string, any>>('model', { required: true });

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { t } = useI18n();
const formRef = ref<ElFormInstance>();

/**
 * select 字段 options 来源：
 * 1. 父组件 dictMap 里有 → 用
 * 2. 否则按 schema.options 用
 * 3. 否则按 schema.dictType 现取（兜底，不缓存到 dictMap）
 *
 * `field.allOption` 为真时在首位补一个「全部」（value `''`）—— 甲方点名要「全部」选项的下拉用。
 */
const localDictCache = ref<Record<string, DictDataOption[]>>({});

/**
 * `allOption` 的「全部」用空串当值，而 ElementPlus 默认把 `''` 当空值（只显示 placeholder、不显示选中项 label）。
 * 把空值集合收窄成 `undefined / null`，空串才被当成一个真实选项，选中「全部」时输入框显示「全部」。
 */
const ALL_OPTION_EMPTY_VALUES: Array<undefined | null> = [undefined, null];

/**
 * `allOption` 字段的值恒定归一到空串。
 *
 * BizTable 的「重置」把每个字段一律置 `undefined`（见 BizTable/index.vue handleReset），
 * 而业务页的默认搜索模型给的是 `''`（对应「全部」那一项）。父组件把自己的 model 改回 `''` 时值没变化，
 * deep watch 不会触发，inner 就永远停在 `undefined` —— 表现为点一次「重置」后输入框从「全部」掉回灰色占位符。
 * 这里兜底归一，只作用于声明了 `allOption` 的字段，其余字段的重置语义一个字都没动。
 */
watch(
  [() => innerModel.value, () => props.schema],
  () => {
    props.schema
      .filter((f) => f.allOption)
      .forEach((f) => {
        const v = innerModel.value[f.field];
        if (v === undefined || v === null) innerModel.value[f.field] = '';
      });
  },
  { deep: true, immediate: true }
);

function resolveSelectOptions(field: SearchFieldSchema): Array<{ label: string; value: string | number }> {
  const base = resolveRawOptions(field);
  return field.allOption ? [{ label: t('biz.table.search.all'), value: '' }, ...base] : base;
}

function resolveRawOptions(field: SearchFieldSchema): Array<{ label: string; value: string | number }> {
  if (field.dictType) {
    const fromParent = props.dictMap?.[field.dictType];
    if (fromParent && fromParent.length > 0) {
      return fromParent;
    }
    const fromLocal = localDictCache.value[field.dictType];
    if (fromLocal && fromLocal.length > 0) {
      return fromLocal;
    }
    // 懒加载
    const loaded = useDict(field.dictType);
    watch(
      () => loaded[field.dictType!],
      (val) => {
        if (val && val.length > 0) {
          localDictCache.value[field.dictType!] = val;
        }
      },
      { immediate: true }
    );
    return localDictCache.value[field.dictType] ?? [];
  }
  return field.options ?? [];
}

function resolveWidth(w?: string | number): Record<string, string> {
  if (w === undefined || w === null || w === '') return {};
  const val = typeof w === 'number' ? `${w}px` : w;
  return { width: val };
}

function handleSearch() {
  emits('search');
}

function handleReset() {
  formRef.value?.resetFields();
  emits('reset');
}

defineExpose({
  reset: handleReset
});
</script>

<style scoped lang="scss">
// inline 模式下用 flex-wrap 让字段自然换行，按钮组靠右下角
.biz-search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;

  :deep(.el-form-item) {
    margin-right: 16px;
  }

  // 搜索/重置按钮推到搜索区右下角
  .biz-search-btns {
    margin-right: 0;
    margin-left: auto;
  }
}
</style>
