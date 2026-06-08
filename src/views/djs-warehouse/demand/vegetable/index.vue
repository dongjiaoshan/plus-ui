<template>
  <div class="p-2">
    <DemandKpiBar />
    <SummaryBar product-type="vegetable" />
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_demand_status', 'djs_demand_product_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:warehouse:demand"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @page-change="handlePageChange"
    >
      <template #cell-actions="{ row }">
        <el-button v-if="canSubmit(row)" link type="primary" size="small" @click="onSubmit(row)">{{ t('demand.action.submit') }}</el-button>
        <el-button v-if="canConfirm(row)" link type="success" size="small" @click="onConfirm(row)">{{ t('demand.action.confirm') }}</el-button>
        <el-button v-if="canStart(row)" link type="warning" size="small" @click="onStart(row)">{{ t('demand.action.startProduction') }}</el-button>
        <el-button v-if="canCancel(row)" link type="danger" size="small" @click="onCancel(row)">{{ t('demand.action.cancel') }}</el-button>
        <el-button link type="info" size="small" @click="onHistory(row)">{{ t('demand.action.history') }}</el-button>
      </template>
    </BizTable>

    <DemandForm ref="formRef" product-type="vegetable" @success="fetchList" />
    <DemandCart ref="cartRef" product-type="vegetable" @success="fetchList" />
    <HistoryDialog ref="historyDialogRef" />
  </div>
</template>

<script setup name="DemandVegetable" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DemandForm from '../components/DemandForm.vue';
import DemandCart from '../components/DemandCart.vue';
import HistoryDialog from '../components/HistoryDialog.vue';
import SummaryBar from '../components/SummaryBar.vue';
import DemandKpiBar from '../components/DemandKpiBar.vue';
import { useDemandList } from '../composables/useDemandList';
import type { DemandManageVO, DemandStatusCode } from '@/api/djs-warehouse/demand/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: string) => void }>();
const cartRef = ref<{ open: () => void }>();
const historyDialogRef = ref<{ open: (demandId: string) => void }>();

const {
  list,
  total,
  loading,
  pageNum,
  pageSize,
  searchModel,
  fetchList,
  handleSubmit,
  handleConfirm,
  handleStartProduction,
  handleCancel,
  handleDelete,
  allowedActions
} = useDemandList('vegetable');

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'demandNo', label: t('demand.field.demandNo'), type: 'input' },
  { field: 'demandStatus', label: t('demand.field.demandStatus'), type: 'select', dictType: 'djs_demand_status' },
  { field: 'beginDate', label: t('demand.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('demand.field.endDate'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandNo', label: t('demand.column.demandNo'), width: 170 },
  { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'demandQuantity', label: t('demand.column.demandQuantity'), width: 100, align: 'right' },
  { prop: 'productUnit', label: t('demand.column.productUnit'), width: 70, align: 'center' },
  { prop: 'rawMaterial', label: t('demand.column.rawMaterial'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'demandStatus', label: t('demand.column.demandStatus'), width: 100, align: 'center', dictType: 'djs_demand_status' },
  { prop: 'storeId', label: t('demand.column.storeId'), width: 110, align: 'center' },
  { prop: 'shippedCount', label: t('demand.column.shippedCount'), width: 90, align: 'right' },
  { prop: 'createTime', label: t('demand.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('demand.column.actions'), width: 260, fixed: 'right', align: 'center' }
]);

const statusActions = (r: DemandManageVO) => allowedActions(r.demandStatus as DemandStatusCode);
const canSubmit = (r: DemandManageVO) => statusActions(r).includes('submit');
const canConfirm = (r: DemandManageVO) => statusActions(r).includes('confirm');
const canStart = (r: DemandManageVO) => statusActions(r).includes('start_production');
const canCancel = (r: DemandManageVO) => statusActions(r).includes('cancel');

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
  cartRef.value?.open();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(String(row.id));
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
  await proxy?.$modal.confirm(t('demand.confirm.del', { count: rows.length }));
  await handleDelete(rows as DemandManageVO[]);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onSubmit(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.submit', { no: row.demandNo }));
  await handleSubmit(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onConfirm(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.confirm', { no: row.demandNo }));
  await handleConfirm(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onStart(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.startProduction', { no: row.demandNo }));
  await handleStartProduction(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onCancel(row: DemandManageVO) {
  const { value: remark } = (await proxy?.$modal.prompt(t('demand.prompt.cancelRemark'), t('demand.action.cancel'), {
    inputPlaceholder: t('demand.prompt.cancelRemarkPh')
  })) as { value: string };
  await handleCancel(row.id, remark);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
function onHistory(row: DemandManageVO) {
  historyDialogRef.value?.open(row.id);
}

onMounted(() => {
  fetchList();
});
</script>
