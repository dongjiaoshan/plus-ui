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
      :dict-types="['sys_user_sex', 'djs_user_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:common:person"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />

    <PersonForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="Person" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PersonForm from './components/PersonForm.vue';
import { delPerson, listPerson } from '@/api/djs-common/person';
import type { PersonQuery, PersonVO } from '@/api/djs-common/person/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<PersonVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  name: undefined,
  phone: undefined,
  status: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'name', label: t('person.field.name'), type: 'input' },
  { field: 'phone', label: t('person.field.phone'), type: 'input' },
  { field: 'status', label: t('person.field.status'), type: 'select', dictType: 'djs_user_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'personCode', label: t('person.column.personCode'), width: 180, showOverflowTooltip: true },
  { prop: 'name', label: t('person.column.name'), minWidth: 120 },
  { prop: 'gender', label: t('person.column.gender'), width: 80, align: 'center', dictType: 'sys_user_sex' },
  { prop: 'phone', label: t('person.column.phone'), width: 140, align: 'center' },
  { prop: 'position', label: t('person.column.position'), width: 140 },
  { prop: 'status', label: t('person.column.status'), width: 100, align: 'center', dictType: 'djs_user_status' },
  { prop: 'hireDate', label: t('person.column.hireDate'), width: 120, align: 'center', formatter: 'date' },
  { prop: 'createTime', label: t('person.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: PersonQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      name: searchModel.name || undefined,
      phone: searchModel.phone || undefined,
      status: searchModel.status || undefined
    };
    const res = await listPerson(query);
    list.value = (res.rows ?? res.data ?? []) as PersonVO[];
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
  await proxy?.$modal.confirm(t('person.confirm.del', { count: ids.length }));
  await delPerson(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  proxy?.download(
    'djs/common/person/export',
    {
      name: searchModel.name || undefined,
      phone: searchModel.phone || undefined,
      status: searchModel.status || undefined
    },
    `person_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
