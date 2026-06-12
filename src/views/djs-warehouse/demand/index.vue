<!--
  需求管理统一列表（DJS-FIX-WMS-RALN-C 返工）。

  原型「需求管理」列表页 = 单个 BizTable 展示全部业态需求（不在列表页顶部切 7 tab）。
  7 产品 tab 只在「新增需求」购物车（DemandCart）内部出现。
  列固定为超集（含「需求产品类型」dict-tag 列）；行操作（状态机按钮）保留，
  「指定猪只」按钮只对 white_bar / pig 业态的行显示。
  顶部仅保留全局今日 KPI（DemandKpiBar），删除 per-type 的业态摘要 SummaryBar。
  复用 DemandCart（跨业态购物车录入 drawer）/ DemandForm（单产品按行 productType 编辑）/
  PigAssignDialog / HistoryDialog / DemandKpiBar / useDemandList。
-->
<template>
  <div class="p-2">
    <DemandKpiBar ref="kpiBarRef" />

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
        <el-button v-if="canAssignPig(row)" link type="primary" size="small" @click="onAssignPig(row)">{{ t('demand.action.assignPig') }}</el-button>
        <el-button v-if="canCancel(row)" link type="danger" size="small" @click="onCancel(row)">{{ t('demand.action.cancel') }}</el-button>
        <el-button link type="info" size="small" @click="onHistory(row)">{{ t('demand.action.history') }}</el-button>
      </template>
    </BizTable>

    <DemandForm ref="formRef" :product-type="editType" @success="reloadAll" />
    <DemandCart ref="cartRef" @success="reloadAll" />
    <PigAssignDialog ref="pigDialogRef" @success="reloadAll" />
    <HistoryDialog ref="historyDialogRef" />
  </div>
</template>

<script setup name="DemandManage" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DemandForm from './components/DemandForm.vue';
import DemandCart from './components/DemandCart.vue';
import PigAssignDialog from './components/PigAssignDialog.vue';
import HistoryDialog from './components/HistoryDialog.vue';
import DemandKpiBar from './components/DemandKpiBar.vue';
import { useDemandList } from './composables/useDemandList';
import { demandTypeHasPigAssign } from './composables/demandTypeMeta';
import type { DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: string) => void }>();
const cartRef = ref<{ open: () => void }>();
const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();
const historyDialogRef = ref<{ open: (demandId: string) => void }>();
const kpiBarRef = ref<{ refresh: () => void }>();

/**
 * 单产品编辑（DemandForm）按行的 productType 工作。列表不再按业态切 tab，
 * 编辑前先把行的 productType 写到 editType，再打开 form。
 */
const editType = ref<DemandProductType>('white_bar');

// 统一列表：不传 productType，后端返回全部业态需求
const api = useDemandList();

const list = computed(() => api.list.value);
const total = computed(() => api.total.value);
const loading = computed(() => api.loading.value);
const pageNum = computed({ get: () => api.pageNum.value, set: (v) => (api.pageNum.value = v) });
const pageSize = computed({ get: () => api.pageSize.value, set: (v) => (api.pageSize.value = v) });
const searchModel = api.searchModel;

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'demandNo', label: t('demand.field.demandNo'), type: 'input' },
  { field: 'productType', label: t('demand.field.productType'), type: 'select', dictType: 'djs_demand_product_type' },
  { field: 'demandStatus', label: t('demand.field.demandStatus'), type: 'select', dictType: 'djs_demand_status' },
  { field: 'beginDate', label: t('demand.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('demand.field.endDate'), type: 'date' }
]);

/** 固定超集列（对齐原型「需求管理」主列表，展示全部业态）。 */
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandNo', label: t('demand.column.demandNo'), width: 170 },
  { prop: 'productType', label: t('demand.column.productType'), width: 110, align: 'center', dictType: 'djs_demand_product_type' },
  { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('demand.column.productSpec'), width: 110, showOverflowTooltip: true },
  { prop: 'rawMaterial', label: t('demand.column.rawMaterial'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'demandQuantity', label: t('demand.column.demandQuantity'), width: 100, align: 'right' },
  { prop: 'productUnit', label: t('demand.column.productUnit'), width: 70, align: 'center' },
  { prop: 'demandStatus', label: t('demand.column.demandStatus'), width: 100, align: 'center', dictType: 'djs_demand_status' },
  { prop: 'storeId', label: t('demand.column.storeId'), width: 110, align: 'center' },
  { prop: 'shippedCount', label: t('demand.column.shippedCount'), width: 90, align: 'right' },
  { prop: 'createTime', label: t('demand.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('demand.column.actions'), width: 320, fixed: 'right', align: 'center' }
]);

function statusActions(row: DemandManageVO): string[] {
  return api.allowedActions(row.demandStatus as DemandStatusCode);
}
const canSubmit = (r: DemandManageVO) => statusActions(r).includes('submit');
const canConfirm = (r: DemandManageVO) => statusActions(r).includes('confirm');
const canStart = (r: DemandManageVO) => statusActions(r).includes('start_production');
// 指定猪只仅 white_bar / pig 业态（按行 productType 判断，不再依赖全局 tab）
const canAssignPig = (r: DemandManageVO) => demandTypeHasPigAssign(r.productType) && statusActions(r).includes('assign_pig');
const canCancel = (r: DemandManageVO) => statusActions(r).includes('cancel');

async function reloadAll() {
  await api.fetchList();
  kpiBarRef.value?.refresh?.();
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  api.fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  api.fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  api.fetchList();
}
function handleAdd() {
  cartRef.value?.open();
}
function handleEdit(row: BizRow) {
  editType.value = (row as unknown as DemandManageVO).productType ?? 'white_bar';
  nextTick(() => formRef.value?.openEdit(String(row.id)));
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
  await proxy?.$modal.confirm(t('demand.confirm.del', { count: rows.length }));
  await api.handleDelete(rows as DemandManageVO[]);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onSubmit(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.submit', { no: row.demandNo }));
  await api.handleSubmit(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onConfirm(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.confirm', { no: row.demandNo }));
  await api.handleConfirm(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onStart(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.startProduction', { no: row.demandNo }));
  await api.handleStartProduction(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onCancel(row: DemandManageVO) {
  const { value: remark } = (await proxy?.$modal.prompt(t('demand.prompt.cancelRemark'), t('demand.action.cancel'), {
    inputPlaceholder: t('demand.prompt.cancelRemarkPh')
  })) as { value: string };
  await api.handleCancel(row.id, remark);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
function onAssignPig(row: DemandManageVO) {
  const required = Number(row.demandQuantity ?? 0);
  pigDialogRef.value?.open(row.id, row.demandNo, required);
}
function onHistory(row: DemandManageVO) {
  historyDialogRef.value?.open(row.id);
}

onMounted(() => {
  api.fetchList();
});
</script>
