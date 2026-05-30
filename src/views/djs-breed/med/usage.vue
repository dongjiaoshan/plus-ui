<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" show-icon class="mb-3" :title="t('medUsage.readonlyTip')" />
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_med_pick_action']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-add="false"
      :show-edit="false"
      show-export
      perm-prefix="djs:breed:med-usage"
      @search="handleSearch"
      @reset="handleReset"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup name="MedUsage" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { delMedUsage, listMedUsage } from '@/api/djs-breed/med';
import type { MedUsageQuery, MedUsageVO } from '@/api/djs-breed/med/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<MedUsageVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, string | undefined>>({
  usageType: undefined,
  useDateFrom: undefined,
  useDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'usageType', label: t('medUsage.field.usageType'), type: 'select', dictType: 'djs_med_pick_action' },
  { field: 'useDateFrom', label: t('medUsage.field.useDateFrom'), type: 'date' },
  { field: 'useDateTo', label: t('medUsage.field.useDateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'medicineName', label: t('medUsage.column.medicineName'), width: 140 },
  { prop: 'batchNo', label: t('medUsage.column.batchNo'), width: 140, showOverflowTooltip: true },
  { prop: 'usageType', label: t('medUsage.column.usageType'), width: 100, align: 'center', dictType: 'djs_med_pick_action' },
  { prop: 'usageQty', label: t('medUsage.column.usageQty'), width: 110, align: 'right' },
  { prop: 'useDate', label: t('medUsage.column.useDate'), width: 130, align: 'center' },
  { prop: 'earNo', label: t('medUsage.column.earNo'), width: 130, align: 'center' },
  { prop: 'penCode', label: t('medUsage.column.penCode'), width: 110, align: 'center' },
  { prop: 'remark', label: t('medUsage.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createBy', label: t('medUsage.column.createBy'), width: 110 },
  { prop: 'createTime', label: t('medUsage.column.createTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'medicineId', label: t('medUsage.column.medicineId'), width: 180, visible: false },
  { prop: 'batchId', label: t('medUsage.column.batchId'), width: 180, visible: false }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: MedUsageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
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
  await proxy?.$modal.confirm(t('medUsage.confirm.del', { count: ids.length }));
  await delMedUsage(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/breed/med-usage/export',
    {
      usageType: searchModel.usageType || undefined,
      useDateFrom: searchModel.useDateFrom || undefined,
      useDateTo: searchModel.useDateTo || undefined
    },
    `med_usage_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
