<template>
  <el-row :gutter="10" class="biz-table-toolbar">
    <el-col v-if="showAdd" :span="1.5">
      <el-button v-hasPermi="[`${permPrefix}:add`]" type="primary" plain icon="Plus" @click="emits('add')">
        {{ t('biz.table.action.add') }}
      </el-button>
    </el-col>
    <el-col v-if="showBatchDel" :span="1.5">
      <el-button v-hasPermi="[`${permPrefix}:remove`]" type="danger" plain icon="Delete" :disabled="selectionCount === 0" @click="emits('batchDel')">
        {{ t('biz.table.action.batchDel') }}
      </el-button>
    </el-col>
    <el-col v-if="showExport" :span="1.5">
      <el-button v-hasPermi="[`${permPrefix}:export`]" type="warning" plain icon="Download" @click="emits('export')">
        {{ t('biz.table.action.export') }}
      </el-button>
    </el-col>

    <!-- 自定义左侧扩展 slot -->
    <slot name="extra" />

    <right-toolbar v-model:show-search="showSearchRef" :columns="columnFields" @query-table="emits('refresh')" />
  </el-row>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  permPrefix: string;
  showAdd: boolean;
  showBatchDel: boolean;
  showExport: boolean;
  showSearch: boolean;
  selectionCount: number;
  /** 用于 RightToolbar 显隐列 */
  columnFields?: FieldOption[];
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'add'): void;
  (e: 'batchDel'): void;
  (e: 'export'): void;
  (e: 'refresh'): void;
  (e: 'update:showSearch', val: boolean): void;
}>();

const { t } = useI18n();

const showSearchRef = computed({
  get: () => props.showSearch,
  set: (val: boolean) => emits('update:showSearch', val)
});
</script>

<style lang="scss" scoped>
.biz-table-toolbar {
  width: 100%;
}
</style>
