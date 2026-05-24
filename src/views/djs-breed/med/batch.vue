<template>
  <div class="p-2">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="mb-3"
      title="批次管理用于多批次精细化扣减（D5+ FIFO 联动）。如只需简单库存管理，请使用「药品库」主页 currentStock 字段直接进出库。"
    />
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
      perm-prefix="djs:breed:med-batch"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />

    <MedBatchForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="MedBatch" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import MedBatchForm from './components/MedBatchForm.vue';
import { delMedBatch, listMedBatch } from '@/api/djs-breed/med';
import type { MedBatchQuery, MedBatchVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<MedBatchVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  medicineId: undefined,
  batchNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'medicineId', label: t('medBatch.field.medicineId'), type: 'number' },
  { field: 'batchNo', label: t('medBatch.field.batchNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'medicineId', label: t('medBatch.column.medicineId'), width: 140 },
  { prop: 'batchNo', label: t('medBatch.column.batchNo'), width: 160, showOverflowTooltip: true },
  { prop: 'productionDate', label: t('medBatch.column.productionDate'), width: 130, align: 'center' },
  { prop: 'expiryDate', label: t('medBatch.column.expiryDate'), width: 130, align: 'center' },
  { prop: 'quantity', label: t('medBatch.column.quantity'), width: 120, align: 'right' },
  { prop: 'unitPrice', label: t('medBatch.column.unitPrice'), width: 120, align: 'right' },
  { prop: 'remark', label: t('medBatch.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('medBatch.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: MedBatchQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      medicineId: searchModel.medicineId || undefined,
      batchNo: searchModel.batchNo || undefined
    };
    const res = await listMedBatch(query);
    list.value = (res.rows ?? res.data ?? []) as MedBatchVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, any>) {
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
  await proxy?.$modal.confirm(t('medBatch.confirm.del', { count: ids.length }));
  await delMedBatch(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/breed/med-batch/export',
    {
      medicineId: searchModel.medicineId || undefined,
      batchNo: searchModel.batchNo || undefined
    },
    `med_batch_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
