<template>
  <div class="biz-table p-2">
    <!-- 顶部查询表单 -->
    <SearchForm
      v-if="searchSchema && searchSchema.length > 0"
      v-model:model="innerSearchModel"
      :schema="searchSchema"
      :visible="showSearch"
      :dict-map="dictMap"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 主体 card -->
    <el-card shadow="hover">
      <template #header>
        <Toolbar
          v-model:show-search="showSearch"
          :perm-prefix="permPrefix"
          :show-add="showAdd"
          :show-batch-del="showBatchDel"
          :show-export="showExport"
          :show-search="showSearch"
          :selection-count="selection.length"
          :column-fields="toolbarColumnFields"
          @add="emits('add')"
          @batch-del="handleBatchDel"
          @export="handleExport"
          @refresh="handleSearch"
        >
          <template #extra>
            <slot name="toolbar-extra" />
          </template>
        </Toolbar>
      </template>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data"
        :row-key="rowKey"
        :height="height"
        :style="tableStyle"
        border
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column v-if="selectable" type="selection" width="55" align="center" />

        <template v-for="col in visibleColumns" :key="col.prop">
          <el-table-column
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align ?? 'left'"
            :fixed="col.fixed"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip"
          >
            <template #default="scope">
              <!-- 字典联动 -->
              <dict-tag v-if="col.dictType" :options="dictMap[col.dictType] ?? []" :value="scope.row[col.prop]" />
              <!-- 时间格式化 -->
              <span v-else-if="col.formatter === 'date'">{{ proxy?.parseTime?.(scope.row[col.prop], '{y}-{m}-{d}') }}</span>
              <span v-else-if="col.formatter === 'datetime'">{{ proxy?.parseTime?.(scope.row[col.prop]) }}</span>
              <span v-else-if="typeof col.formatter === 'function'">{{ col.formatter(scope.row) }}</span>
              <!-- 自定义列 slot：cell-<prop> -->
              <slot v-else :name="`cell-${col.prop}`" :row="scope.row" :index="scope.$index">
                {{ scope.row[col.prop] }}
              </slot>
            </template>
          </el-table-column>
        </template>

        <!-- 行操作列 -->
        <el-table-column
          v-if="$slots.action || showRowEdit || showRowDel"
          :label="t('biz.table.column.action')"
          :width="actionWidth"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <slot name="action" :row="scope.row" :index="scope.$index">
              <el-tooltip v-if="showRowEdit" :content="t('biz.table.action.edit')" placement="top">
                <el-button v-hasPermi="[`${permPrefix}:edit`]" link type="primary" icon="Edit" @click="emits('edit', scope.row)" />
              </el-tooltip>
              <el-tooltip v-if="showRowDel" :content="t('biz.table.action.del')" placement="top">
                <el-button v-hasPermi="[`${permPrefix}:remove`]" link type="primary" icon="Delete" @click="emits('del', scope.row)" />
              </el-tooltip>
            </slot>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty :description="t('biz.table.empty')" />
        </template>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-if="total > 0"
        v-model:page="innerPageNum"
        v-model:limit="innerPageSize"
        :total="total"
        :page-sizes="pageSizes"
        @pagination="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDict } from '@/utils/dict';
import SearchForm from './SearchForm.vue';
import Toolbar from './Toolbar.vue';
import type { BizRow, BizTableColumn, BizTableEmits, BizTableExpose, BizTableProps } from './types';

const props = withDefaults(defineProps<BizTableProps>(), {
  loading: false,
  selectable: false,
  pageNum: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 30, 50],
  searchSchema: () => [],
  searchModel: () => ({}),
  dictTypes: () => [],
  showAdd: true,
  showBatchDel: true,
  showExport: false,
  rowKey: 'id'
});

const emits = defineEmits<BizTableEmits>();
defineSlots<{
  action?: (props: { row: BizRow; index: number }) => unknown;
  'toolbar-extra'?: () => unknown;
  [key: `cell-${string}`]: (props: { row: BizRow; index: number }) => unknown;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { t } = useI18n();

/* ---------- 行操作列：根据父组件传的 emits 是否监听决定显隐 ---------- */
const showRowEdit = computed(() => true);
const showRowDel = computed(() => true);
const actionWidth = 160;

/* ---------- 查询表单 model ---------- */
const innerSearchModel = ref<Record<string, any>>({ ...props.searchModel });
watch(
  () => props.searchModel,
  (val) => {
    innerSearchModel.value = { ...innerSearchModel.value, ...val };
  },
  { deep: true }
);

/* ---------- 显示搜索 ---------- */
const showSearch = ref(true);

/* ---------- 字典加载 ---------- */
const dictMap = reactive<Record<string, DictDataOption[]>>({});

function loadDicts() {
  if (!props.dictTypes || props.dictTypes.length === 0) return;
  const loaded = useDict(...props.dictTypes);
  props.dictTypes.forEach((type) => {
    watch(
      () => loaded[type],
      (val) => {
        if (val) dictMap[type] = val;
      },
      { immediate: true, deep: true }
    );
  });
}

watch(
  () => props.dictTypes,
  () => loadDicts(),
  { immediate: true, deep: true }
);

/* ---------- 列显隐（RightToolbar 用） ---------- */
const columnVisibleMap = reactive<Record<string, boolean>>({});
props.columns.forEach((col) => {
  columnVisibleMap[col.prop] = col.visible !== false;
});

const visibleColumns = computed<BizTableColumn[]>(() => {
  return props.columns.filter((col) => columnVisibleMap[col.prop] !== false);
});

const toolbarColumnFields = computed<FieldOption[]>(() => {
  return props.columns.map((col, idx) => ({
    key: idx,
    label: col.label,
    visible: columnVisibleMap[col.prop] !== false
  }));
});

watch(
  toolbarColumnFields,
  (list) => {
    list.forEach((item, idx) => {
      const col = props.columns[idx];
      if (col) columnVisibleMap[col.prop] = item.visible;
    });
  },
  { deep: true }
);

/* ---------- 选中 ---------- */
const selection = ref<BizRow[]>([]);
function handleSelectionChange(rows: BizRow[]) {
  selection.value = rows;
  emits('selection-change', rows);
}

/* ---------- 分页 ---------- */
const innerPageNum = ref(props.pageNum);
const innerPageSize = ref(props.pageSize);

watch(
  () => props.pageNum,
  (v) => (innerPageNum.value = v)
);
watch(
  () => props.pageSize,
  (v) => (innerPageSize.value = v)
);

function handlePageChange(payload: { page: number; limit: number }) {
  innerPageNum.value = payload.page;
  innerPageSize.value = payload.limit;
  emits('page-change', payload.page, payload.limit);
}

/* ---------- 排序 ---------- */
function handleSortChange(payload: { prop: string; order: string | null }) {
  let order: 'asc' | 'desc' | null = null;
  if (payload.order === 'ascending') order = 'asc';
  else if (payload.order === 'descending') order = 'desc';
  emits('sort-change', { prop: payload.prop, order });
}

/* ---------- 操作 ---------- */
function handleSearch() {
  emits('search', { ...innerSearchModel.value });
}

function handleReset() {
  const cleared: Record<string, any> = {};
  Object.keys(innerSearchModel.value).forEach((k) => {
    cleared[k] = undefined;
  });
  innerSearchModel.value = cleared;
  emits('reset');
}

function handleBatchDel() {
  if (selection.value.length === 0) return;
  emits('del', [...selection.value]);
}

function handleExport() {
  emits('export', { ...innerSearchModel.value });
}

/* ---------- table ref ---------- */
const tableRef = ref<ElTableInstance>();

/* ---------- expose ---------- */
const exposed: BizTableExpose = {
  refresh: () => handleSearch(),
  reset: () => handleReset(),
  getSelected: () => [...selection.value],
  clearSelection: () => tableRef.value?.clearSelection()
};

defineExpose(exposed);
</script>

<style lang="scss" scoped>
.biz-table {
  width: 100%;
}
</style>
