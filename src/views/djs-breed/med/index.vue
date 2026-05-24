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
      :dict-types="['djs_med_type', 'sys_normal_disable']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:breed:med"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />

    <MedicineForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="Medicine" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import MedicineForm from './components/MedicineForm.vue';
import { delMedicine, listMedicine } from '@/api/djs-breed/med';
import type { MedicineQuery, MedicineVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<MedicineVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  medicineName: undefined,
  medicineCode: undefined,
  medicineType: undefined,
  medStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'medicineName', label: t('medicine.field.medicineName'), type: 'input' },
  { field: 'medicineCode', label: t('medicine.field.medicineCode'), type: 'input' },
  { field: 'medicineType', label: t('medicine.field.medicineType'), type: 'select', dictType: 'djs_med_type' },
  { field: 'medStatus', label: t('medicine.field.medStatus'), type: 'select', dictType: 'sys_normal_disable' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'medicineCode', label: t('medicine.column.medicineCode'), width: 140, showOverflowTooltip: true },
  { prop: 'medicineName', label: t('medicine.column.medicineName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'medicineType', label: t('medicine.column.medicineType'), width: 100, align: 'center', dictType: 'djs_med_type' },
  { prop: 'spec', label: t('medicine.column.spec'), width: 160, showOverflowTooltip: true },
  { prop: 'unit', label: t('medicine.column.unit'), width: 80, align: 'center' },
  { prop: 'currentStock', label: t('medicine.column.currentStock'), width: 110, align: 'right' },
  { prop: 'withdrawDays', label: t('medicine.column.withdrawDays'), width: 110, align: 'center' },
  { prop: 'manufacturer', label: t('medicine.column.manufacturer'), width: 160, showOverflowTooltip: true },
  { prop: 'expireDate', label: t('medicine.column.expireDate'), width: 120, align: 'center' },
  { prop: 'medStatus', label: t('medicine.column.medStatus'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'createTime', label: t('medicine.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: MedicineQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      medicineName: searchModel.medicineName || undefined,
      medicineCode: searchModel.medicineCode || undefined,
      medicineType: searchModel.medicineType || undefined,
      medStatus: searchModel.medStatus === undefined || searchModel.medStatus === '' ? undefined : Number(searchModel.medStatus)
    };
    const res = await listMedicine(query);
    list.value = (res.rows ?? res.data ?? []) as MedicineVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, any>) {
  // BizTable 单向数据流，emit('search') 把 innerSearchModel 传回，必须 merge 进父 searchModel
  Object.assign(searchModel, payload);
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
  await proxy?.$modal.confirm(t('medicine.confirm.del', { count: ids.length }));
  await delMedicine(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/breed/med/export',
    {
      medicineName: searchModel.medicineName || undefined,
      medicineCode: searchModel.medicineCode || undefined,
      medicineType: searchModel.medicineType || undefined,
      medStatus: searchModel.medStatus === undefined || searchModel.medStatus === '' ? undefined : Number(searchModel.medStatus)
    },
    `medicine_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
