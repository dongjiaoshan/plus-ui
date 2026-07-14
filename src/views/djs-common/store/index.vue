<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_store_type', 'djs_store_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      :action-width="220"
      perm-prefix="djs:common:store"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.view')" placement="top">
          <el-button v-hasPermi="['djs:common:store:list']" link type="primary" icon="View" @click="handleView(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:common:store:edit']" link type="primary" icon="Edit" @click="handleEdit(row)" />
        </el-tooltip>
        <el-tooltip :content="t('store.title.setManager')" placement="top">
          <el-button v-hasPermi="['djs:common:store:setManager']" link type="primary" icon="User" @click="handleSetManager(row)" />
        </el-tooltip>
        <el-tooltip :content="t('store.title.bindUser')" placement="top">
          <el-button v-hasPermi="['djs:common:store:bindUser']" link type="primary" icon="UserFilled" @click="handleBindUser(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:common:store:remove']" link type="danger" icon="Delete" @click="handleDel(row)" />
        </el-tooltip>
      </template>
    </BizTable>

    <StoreForm ref="formRef" @success="handleFormSuccess" />
    <StoreView ref="viewRef" />
    <SetManagerDialog ref="setManagerRef" @success="handleFormSuccess" />
    <StoreUserBindDialog ref="bindUserRef" />
  </div>
</template>

<script setup name="Store" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreForm from './components/StoreForm.vue';
import StoreView from './components/StoreView.vue';
import SetManagerDialog from './components/SetManagerDialog.vue';
import StoreUserBindDialog from './components/StoreUserBindDialog.vue';
import { delStore, listStore } from '@/api/djs-common/store';
import type { StoreQuery, StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const viewRef = ref<{ open: (id: number | string) => void }>();
const setManagerRef = ref<{ open: (storeId: number | string, currentUserId?: number | null) => void }>();
const bindUserRef = ref<{ open: (storeId: number | string) => void }>();

const list = ref<StoreVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  storeName: undefined,
  storeCode: undefined,
  storeType: undefined,
  managerName: undefined,
  businessStatus: undefined,
  updateTimeRange: undefined,
  updateBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'storeName', label: t('store.field.storeName'), type: 'input' },
  { field: 'storeCode', label: t('store.field.storeCode'), type: 'input' },
  { field: 'storeType', label: t('store.field.storeType'), type: 'select', dictType: 'djs_store_type' },
  { field: 'managerName', label: t('store.field.managerName'), type: 'input' },
  { field: 'businessStatus', label: t('store.field.businessStatus'), type: 'select', dictType: 'djs_store_status' },
  { field: 'updateTimeRange', label: t('store.field.updateTimeRange'), type: 'daterange' },
  { field: 'updateBy', label: t('store.field.updateBy'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'storeCode', label: t('store.column.storeCode'), width: 120, showOverflowTooltip: true },
  { prop: 'storeName', label: t('store.column.storeName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'shortName', label: t('store.column.shortName'), width: 120, showOverflowTooltip: true },
  { prop: 'storeType', label: t('store.column.storeType'), width: 100, align: 'center', dictType: 'djs_store_type' },
  { prop: 'productionMarkCode', label: t('store.column.productionMarkCode'), width: 120, align: 'center', showOverflowTooltip: true },
  { prop: 'managerName', label: t('store.column.managerName'), width: 120 },
  { prop: 'managerPhone', label: t('store.column.managerPhone'), width: 140, align: 'center' },
  { prop: 'employeeCount', label: t('store.column.employeeCount'), width: 100, align: 'center' },
  { prop: 'openDate', label: t('store.column.openDate'), width: 120, align: 'center', formatter: 'date' },
  { prop: 'businessStatus', label: t('store.column.businessStatus'), width: 100, align: 'center', dictType: 'djs_store_status' },
  { prop: 'address', label: t('store.column.address'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'updateTime', label: t('store.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'updateBy', label: t('store.column.updateBy'), width: 120, align: 'center' }
]);

function buildQuery(): StoreQuery {
  const range = searchModel.updateTimeRange as [string, string] | undefined;
  const updateByRaw = searchModel.updateBy as string | number | undefined;
  const updateBy = updateByRaw === undefined || updateByRaw === '' ? undefined : Number(updateByRaw);
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    storeName: searchModel.storeName || undefined,
    storeCode: searchModel.storeCode || undefined,
    storeType: searchModel.storeType || undefined,
    managerName: searchModel.managerName || undefined,
    businessStatus: searchModel.businessStatus || undefined,
    updateTimeBegin: range && range[0] ? `${range[0]} 00:00:00` : undefined,
    updateTimeEnd: range && range[1] ? `${range[1]} 23:59:59` : undefined,
    updateBy: Number.isFinite(updateBy) ? (updateBy as number) : undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listStore(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as StoreVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
function handleView(row: BizRow) {
  viewRef.value?.open(row.id);
}
function handleSetManager(row: BizRow) {
  setManagerRef.value?.open(row.id, row.managerUserId ?? null);
}
function handleBindUser(row: BizRow) {
  bindUserRef.value?.open(row.id);
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('store.confirm.del', { count: ids.length }));
  await delStore(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  proxy?.download('djs/common/store/export', buildQuery(), `store_${new Date().getTime()}.xlsx`);
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
