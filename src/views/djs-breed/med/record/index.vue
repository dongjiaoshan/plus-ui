<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" show-icon class="mb-3" :title="t('medRecord.readonlyTip')" />
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_medicine_use_type', 'djs_medicine_reason', 'djs_medicine_way', 'djs_drug_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-add="false"
      :show-edit="false"
      show-export
      perm-prefix="djs:breed:med-record"
      @search="handleSearch"
      @reset="handleReset"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup name="MedRecord" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { delMedRecord, listMedRecord } from '@/api/djs-breed/med';
import type { MedRecordDrugType, MedRecordQuery, MedRecordVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<MedRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, string | undefined>>({
  earNo: undefined,
  medicineType: undefined,
  drugType: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'earNo', label: t('medRecord.field.earNo'), type: 'input' },
  { field: 'medicineType', label: t('medRecord.field.medicineType'), type: 'select', dictType: 'djs_medicine_use_type' },
  { field: 'drugType', label: t('medRecord.field.drugType'), type: 'select', dictType: 'djs_drug_type' },
  { field: 'beginDate', label: t('medRecord.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('medRecord.field.endDate'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'useDate', label: t('medRecord.column.useDate'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'earNo', label: t('medRecord.column.earNo'), width: 110 },
  { prop: 'drugType', label: t('medRecord.column.drugType'), width: 100, align: 'center', dictType: 'djs_drug_type' },
  { prop: 'medicineType', label: t('medRecord.column.medicineType'), width: 100, align: 'center', dictType: 'djs_medicine_use_type' },
  { prop: 'medicineReason', label: t('medRecord.column.medicineReason'), width: 110, align: 'center', dictType: 'djs_medicine_reason' },
  { prop: 'medicineWay', label: t('medRecord.column.medicineWay'), width: 100, align: 'center', dictType: 'djs_medicine_way' },
  { prop: 'medicineName', label: t('medRecord.column.medicineName'), width: 140 },
  { prop: 'batchNo', label: t('medRecord.column.batchNo'), width: 140, showOverflowTooltip: true },
  { prop: 'medicineDosage', label: t('medRecord.column.medicineDosage'), width: 100, align: 'right' },
  { prop: 'operatorName', label: t('medRecord.column.operatorName'), width: 110 },
  { prop: 'remark', label: t('medRecord.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('medRecord.column.createTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'batchId', label: t('medRecord.column.batchId'), width: 180, visible: false }
]);

async function fetchList() {
  loading.value = true;
  try {
    const drugTypeRaw = searchModel.drugType;
    const query: MedRecordQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      earNo: searchModel.earNo || undefined,
      medicineType: searchModel.medicineType || undefined,
      drugType: drugTypeRaw ? (Number(drugTypeRaw) as MedRecordDrugType) : undefined,
      beginDate: searchModel.beginDate || undefined,
      endDate: searchModel.endDate || undefined
    };
    const res = await listMedRecord(query);
    list.value = (res.rows ?? res.data ?? []) as MedRecordVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, string | undefined>) {
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('medRecord.confirm.del', { count: ids.length }));
  await delMedRecord(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  const drugTypeRaw = searchModel.drugType;
  proxy?.download(
    'djs/breed/med-record/export',
    {
      earNo: searchModel.earNo || undefined,
      medicineType: searchModel.medicineType || undefined,
      drugType: drugTypeRaw ? (Number(drugTypeRaw) as MedRecordDrugType) : undefined,
      beginDate: searchModel.beginDate || undefined,
      endDate: searchModel.endDate || undefined
    },
    `med_record_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
