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
      :selectable="false"
      :show-row-edit="false"
      :show-export="true"
      perm-prefix="djs:store:split"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-cutPart="{ row }">
        <dict-tag :options="djs_pig_cut_part" :value="row.cutPart" />
      </template>
      <template #cell-source="{ row }">
        <el-tag type="success" size="small">{{ row.source === 'store' ? t('storeSplit.tag.store') : row.source }}</el-tag>
      </template>
    </BizTable>

    <StoreSplitForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="StoreSplit" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreSplitForm from './components/StoreSplitForm.vue';
import { listSplit } from '@/api/djs-store/split';
import type { StoreSplitQuery, StoreSplitVO } from '@/api/djs-store/split/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_cut_part } = toRefs<any>(proxy?.useDict('djs_pig_cut_part'));

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ open: () => void }>();

const list = ref<StoreSplitVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, unknown>>({
  cutPart: undefined,
  produceDateStart: undefined,
  produceDateEnd: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cutPart', label: t('storeSplit.field.cutPart'), type: 'select', dictType: 'djs_pig_cut_part' },
  { field: 'produceDateStart', label: t('storeSplit.field.produceDateStart'), type: 'date' },
  { field: 'produceDateEnd', label: t('storeSplit.field.produceDateEnd'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cutPart', label: t('storeSplit.column.cutPart'), width: 110, align: 'center' },
  { prop: 'productName', label: t('storeSplit.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'productWeight', label: t('storeSplit.column.productWeight'), width: 110, align: 'right' },
  { prop: 'produceDate', label: t('storeSplit.column.produceDate'), width: 120, align: 'center', formatter: 'date' },
  { prop: 'source', label: t('storeSplit.column.source'), width: 100, align: 'center' },
  { prop: 'createByName', label: t('storeSplit.column.createByName'), width: 110, align: 'center' },
  { prop: 'createTime', label: t('storeSplit.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreSplitQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      cutPart: (searchModel.cutPart as string) || undefined,
      produceDateStart: (searchModel.produceDateStart as string) || undefined,
      produceDateEnd: (searchModel.produceDateEnd as string) || undefined
    };
    const res = await listSplit(query);
    list.value = (res.rows ?? res.data ?? []) as StoreSplitVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
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
  formRef.value?.open();
}
function handleExport(query?: Record<string, unknown>) {
  proxy?.download('djs/store/split/export', { ...(query ?? {}) }, `store_split_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  fetchList();
});
</script>
