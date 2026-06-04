<template>
  <transition :enter-active-class="proxy?.animate?.searchAnimate?.enter" :leave-active-class="proxy?.animate?.searchAnimate?.leave">
    <div v-show="visible" class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="formRef" :model="innerModel" :inline="true" @submit.prevent>
          <el-form-item v-for="field in schema" :key="field.field" :label="field.label" :prop="field.field">
            <!-- input -->
            <el-input
              v-if="field.type === 'input'"
              v-model="innerModel[field.field]"
              :placeholder="field.placeholder ?? `${t('biz.table.search.inputPrefix')}${field.label}`"
              :clearable="field.clearable ?? true"
              :style="resolveWidth(field.width)"
              @keyup.enter="handleSearch"
            />

            <!-- number -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="innerModel[field.field]"
              controls-position="right"
              :style="resolveWidth(field.width)"
            />

            <!-- select（dictType / options 二选一） -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="innerModel[field.field]"
              :placeholder="field.placeholder ?? `${t('biz.table.search.selectPrefix')}${field.label}`"
              :clearable="field.clearable ?? true"
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
              :style="resolveWidth(field.width)"
            />

            <!-- month（回写 'YYYY-MM'） -->
            <el-date-picker
              v-else-if="field.type === 'month'"
              v-model="innerModel[field.field]"
              type="month"
              :placeholder="field.placeholder ?? `${t('biz.table.search.selectPrefix')}${field.label}`"
              value-format="YYYY-MM"
              :clearable="field.clearable ?? true"
              :style="resolveWidth(field.width)"
            />

            <!-- daterange -->
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="innerModel[field.field]"
              type="daterange"
              :start-placeholder="t('biz.table.search.startDate')"
              :end-placeholder="t('biz.table.search.endDate')"
              value-format="YYYY-MM-DD"
              :style="resolveWidth(field.width)"
            />
          </el-form-item>

          <el-form-item>
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
 */
const localDictCache = ref<Record<string, DictDataOption[]>>({});

function resolveSelectOptions(field: SearchFieldSchema): Array<{ label: string; value: string | number }> {
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
