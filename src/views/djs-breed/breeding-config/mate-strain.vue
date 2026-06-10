<template>
  <div class="p-2">
    <BizTable
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
      perm-prefix="djs:breed:breeding"
      @search="onSearch"
      @reset="onReset"
      @add="onAdd"
      @edit="onEdit"
      @del="onDel"
      @page-change="onPageChange"
    />

    <BreedConfigForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="BreedMateStrain" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import BreedConfigForm from './components/BreedConfigForm.vue';
import { delBreedConfig, listBreedConfig } from '@/api/djs-breed/breeding';
import type { BreedConfigQuery, BreedConfigVO } from '@/api/djs-breed/breeding/types';
import { useI18n } from 'vue-i18n';

/**
 * 品种配种（BRD-MD-001 拆 4 menus 后的独立页）：breed_strain=1。
 */
const BREED_STRAIN = 1;

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const formRef = ref<{ openCreate: (s: number) => void; openEdit: (id: number | string) => void }>();

const list = ref<BreedConfigVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  motherCode: undefined,
  fatherCode: undefined,
  cubCode: undefined,
  createTimeRange: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'motherCode', label: t('breeding.field.motherCode'), type: 'input' },
  { field: 'fatherCode', label: t('breeding.field.fatherCode'), type: 'input' },
  { field: 'cubCode', label: t('breeding.field.cubCode'), type: 'input' },
  { field: 'createTimeRange', label: t('breeding.field.createTimeRange'), type: 'daterange' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'motherCode', label: t('breeding.column.motherCode'), width: 160 },
  { prop: 'fatherCode', label: t('breeding.column.fatherCode'), width: 160 },
  { prop: 'cubCode', label: t('breeding.column.cubCode'), width: 160 },
  { prop: 'createTime', label: t('breeding.column.createTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'createByName', label: t('breeding.column.createBy'), width: 120, align: 'center' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const range = searchModel.createTimeRange as [string, string] | undefined;
    const query: BreedConfigQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      breedStrain: BREED_STRAIN,
      motherCode: searchModel.motherCode || undefined,
      fatherCode: searchModel.fatherCode || undefined,
      cubCode: searchModel.cubCode || undefined,
      createTimeBegin: range && range[0] ? `${range[0]} 00:00:00` : undefined,
      createTimeEnd: range && range[1] ? `${range[1]} 23:59:59` : undefined
    };
    const res = await listBreedConfig(query);
    list.value = (res.rows ?? res.data ?? []) as BreedConfigVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function onSearch(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function onReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function onPageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function onAdd() {
  formRef.value?.openCreate(BREED_STRAIN);
}
function onEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
async function onDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('breeding.confirm.delConfig', { count: ids.length }));
  await delBreedConfig(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
