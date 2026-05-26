<template>
  <div class="p-2">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="mb-3"
      title="用药治疗流水：单只 + 批量（master/detail）。批量用药 admin 端只查不录；新增主要走小程序端「用药治疗」入口（批次仅显示 3 天内已领的）。台账软删不回滚库存。"
    />
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
import type { MedRecordQuery, MedRecordVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<MedRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  pigId: undefined,
  earNo: undefined,
  medicineType: undefined,
  drugType: undefined,
  batchId: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'earNo', label: '耳号', type: 'input' },
  { field: 'medicineType', label: '用药类型', type: 'select', dictType: 'djs_medicine_use_type' },
  { field: 'drugType', label: '记录类型', type: 'select', dictType: 'djs_drug_type' },
  { field: 'batchId', label: '批次 ID', type: 'number' },
  { field: 'beginDate', label: '开始日期', type: 'date' },
  { field: 'endDate', label: '结束日期', type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'useDate', label: '用药日期', width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'earNo', label: '耳号', width: 110 },
  { prop: 'drugType', label: '记录类型', width: 100, align: 'center', dictType: 'djs_drug_type' },
  { prop: 'medicineType', label: '用药类型', width: 100, align: 'center', dictType: 'djs_medicine_use_type' },
  { prop: 'medicineReason', label: '用药原因', width: 110, align: 'center', dictType: 'djs_medicine_reason' },
  { prop: 'medicineWay', label: '用药方式', width: 100, align: 'center', dictType: 'djs_medicine_way' },
  { prop: 'medicineName', label: '药品', width: 140 },
  { prop: 'batchId', label: '批次 ID', width: 120 },
  { prop: 'medicineDosage', label: '剂量', width: 100, align: 'right' },
  { prop: 'operatorName', label: '操作人', width: 110 },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: MedRecordQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      pigId: searchModel.pigId || undefined,
      earNo: searchModel.earNo || undefined,
      medicineType: searchModel.medicineType || undefined,
      drugType: searchModel.drugType || undefined,
      batchId: searchModel.batchId || undefined,
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('common.confirmDelete', { count: ids.length }) || `确定删除 ${ids.length} 条？`);
  await delMedRecord(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess') || '操作成功');
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/breed/med-record/export',
    {
      pigId: searchModel.pigId || undefined,
      earNo: searchModel.earNo || undefined,
      medicineType: searchModel.medicineType || undefined,
      drugType: searchModel.drugType || undefined,
      batchId: searchModel.batchId || undefined,
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
