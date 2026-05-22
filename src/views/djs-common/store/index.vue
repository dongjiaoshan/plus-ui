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
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:common:store"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />

    <StoreForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="Store" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreForm from './components/StoreForm.vue';
import { delStore, listStore } from '@/api/djs-common/store';
import type { StoreQuery, StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<StoreVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  storeName: undefined,
  storeCode: undefined,
  businessStatus: undefined,
  contactPhone: undefined
});

const storeTypeOptions = computed(() => [
  { label: t('store.option.direct'), value: 'direct' },
  { label: t('store.option.franchise'), value: 'franchise' }
]);

const businessStatusOptions = computed(() => [
  { label: t('store.option.cooperating'), value: 1 },
  { label: t('store.option.terminated'), value: 0 }
]);

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'storeName', label: t('store.field.storeName'), type: 'input' },
  { field: 'storeCode', label: t('store.field.storeCode'), type: 'input' },
  { field: 'businessStatus', label: t('store.field.businessStatus'), type: 'select', options: businessStatusOptions.value },
  { field: 'contactPhone', label: t('store.field.contactPhone'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'storeCode', label: t('store.column.storeCode'), width: 140, showOverflowTooltip: true },
  { prop: 'storeName', label: t('store.column.storeName'), minWidth: 160 },
  {
    prop: 'storeType',
    label: t('store.column.storeType'),
    width: 100,
    align: 'center',
    formatter: (row: BizRow) => (row.storeType === 'franchise' ? t('store.option.franchise') : t('store.option.direct'))
  },
  {
    prop: 'businessStatus',
    label: t('store.column.businessStatus'),
    width: 100,
    align: 'center',
    formatter: (row: BizRow) => (row.businessStatus === 1 ? t('store.option.cooperating') : t('store.option.terminated'))
  },
  { prop: 'contactName', label: t('store.column.contactName'), width: 120 },
  { prop: 'contactPhone', label: t('store.column.contactPhone'), width: 140, align: 'center' },
  { prop: 'address', label: t('store.column.address'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: t('store.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      storeName: searchModel.storeName || undefined,
      storeCode: searchModel.storeCode || undefined,
      businessStatus: searchModel.businessStatus !== undefined && searchModel.businessStatus !== '' ? searchModel.businessStatus : undefined,
      contactPhone: searchModel.contactPhone || undefined
    };
    const res = await listStore(query);
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('store.confirm.del', { count: ids.length }));
  await delStore(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  proxy?.download(
    'djs/common/store/export',
    {
      storeName: searchModel.storeName || undefined,
      storeCode: searchModel.storeCode || undefined,
      businessStatus: searchModel.businessStatus !== undefined && searchModel.businessStatus !== '' ? searchModel.businessStatus : undefined,
      contactPhone: searchModel.contactPhone || undefined
    },
    `store_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
