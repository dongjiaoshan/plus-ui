<template>
  <div class="p-2">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="mb-3"
      title="领用台账记录所有领用 / 退回 / 损耗动作；新增时后端同步扣减或归还批次库存。台账软删不回滚库存（已发生的对账不可逆）。"
    />
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_medicine_usage_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-edit="false"
      show-export
      perm-prefix="djs:breed:med-usage"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />

    <MedUsageForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="MedUsage" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import MedUsageForm from './components/MedUsageForm.vue';
import { delMedUsage, listMedUsage } from '@/api/djs-breed/med';
import type { MedUsageQuery, MedUsageVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void }>();

const list = ref<MedUsageVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  medicineId: undefined,
  batchId: undefined,
  usageType: undefined,
  useDateFrom: undefined,
  useDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'medicineId', label: t('medUsage.field.medicineId'), type: 'number' },
  { field: 'batchId', label: t('medUsage.field.batchId'), type: 'number' },
  { field: 'usageType', label: t('medUsage.field.usageType'), type: 'select', dictType: 'djs_medicine_usage_type' },
  { field: 'useDateFrom', label: t('medUsage.field.useDateFrom'), type: 'date' },
  { field: 'useDateTo', label: t('medUsage.field.useDateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'medicineId', label: t('medUsage.column.medicineId'), width: 120 },
  { prop: 'batchId', label: t('medUsage.column.batchId'), width: 120 },
  { prop: 'usageType', label: t('medUsage.column.usageType'), width: 100, align: 'center', dictType: 'djs_medicine_usage_type' },
  { prop: 'usageQty', label: t('medUsage.column.usageQty'), width: 110, align: 'right' },
  { prop: 'useDate', label: t('medUsage.column.useDate'), width: 130, align: 'center' },
  { prop: 'pigId', label: t('medUsage.column.pigId'), width: 110 },
  { prop: 'relatedPenId', label: t('medUsage.column.relatedPenId'), width: 110 },
  { prop: 'remark', label: t('medUsage.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createBy', label: t('medUsage.column.createBy'), width: 110 },
  { prop: 'createTime', label: t('medUsage.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: MedUsageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      medicineId: searchModel.medicineId || undefined,
      batchId: searchModel.batchId || undefined,
      usageType: searchModel.usageType || undefined,
      useDateFrom: searchModel.useDateFrom || undefined,
      useDateTo: searchModel.useDateTo || undefined
    };
    const res = await listMedUsage(query);
    list.value = (res.rows ?? res.data ?? []) as MedUsageVO[];
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('medUsage.confirm.del', { count: ids.length }));
  await delMedUsage(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/breed/med-usage/export',
    {
      medicineId: searchModel.medicineId || undefined,
      batchId: searchModel.batchId || undefined,
      usageType: searchModel.usageType || undefined,
      useDateFrom: searchModel.useDateFrom || undefined,
      useDateTo: searchModel.useDateTo || undefined
    },
    `med_usage_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
