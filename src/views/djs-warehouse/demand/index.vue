<!--
  需求管理单页 7 产品 tab（DJS-FIX-WMS-RALN-C）。

  原型「需求管理」是单页顶部 7 tab 切产品类型（白条/猪/果蔬/干货/鸡蛋/礼盒/其他），
  非 4 独立菜单。本页 = 1 个 BizTable + tab 切 productType；列差异按业态派生：
    - 白条 / 蔬菜：有「原材料」列 + 指定猪只（白条/猪）
    - 礼盒：无原材料、无 shipped
    - 其他：无原材料、无 shipped
  复用 DemandCart（购物车录入 drawer）/ DemandForm / PigAssignDialog / HistoryDialog /
  SummaryBar / DemandKpiBar / useDemandList。
-->
<template>
  <div class="p-2">
    <DemandKpiBar ref="kpiBarRef" />

    <el-tabs v-model="activeType" class="demand-tabs" type="card" @tab-change="onTabChange">
      <el-tab-pane v-for="tp in DEMAND_PRODUCT_TYPES" :key="tp" :name="tp" :label="tabLabel(tp)" />
    </el-tabs>

    <SummaryBar ref="summaryBarRef" :key="`summary-${activeType}`" :product-type="activeType" />

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

    <DemandForm ref="formRef" :product-type="activeType" @success="reloadAll" />
    <DemandCart ref="cartRef" :product-type="activeType" @success="reloadAll" />
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
import SummaryBar from './components/SummaryBar.vue';
import DemandKpiBar from './components/DemandKpiBar.vue';
import { useDemandList } from './composables/useDemandList';
import { DEMAND_PRODUCT_TYPES, demandTypeLabel, demandTypeHasRaw, demandTypeHasPigAssign } from './composables/demandTypeMeta';
import type { DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_demand_product_type } = toRefs<any>(proxy?.useDict('djs_demand_product_type'));

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: string) => void }>();
const cartRef = ref<{ open: () => void }>();
const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();
const historyDialogRef = ref<{ open: (demandId: string) => void }>();
const summaryBarRef = ref<{ refresh: () => void }>();
const kpiBarRef = ref<{ refresh: () => void }>();

/** 当前激活的业态 tab（默认白条）。 */
const activeType = ref<DemandProductType>('white_bar');

/**
 * useDemandList 接 productType 闭包 —— 不能换 productType。改 tab 时重建一个新实例不便，
 * 这里改用「单实例 + searchModel.productType 注入」方式：useDemandList 内部 fetchList 读固定
 * productType 闭包，因此切 tab 需重置闭包。为简单稳健，按 tab 维护一个 map 缓存。
 */
type DemandListApi = ReturnType<typeof useDemandList>;
const apiCache = new Map<DemandProductType, DemandListApi>();
function getApi(tp: DemandProductType): DemandListApi {
  let api = apiCache.get(tp);
  if (!api) {
    api = useDemandList(tp);
    apiCache.set(tp, api);
  }
  return api;
}

const currentApi = computed(() => getApi(activeType.value));

// 把当前 api 的响应式状态映射出来（随 activeType 切换）
const list = computed(() => currentApi.value.list.value);
const total = computed(() => currentApi.value.total.value);
const loading = computed(() => currentApi.value.loading.value);
const pageNum = computed({ get: () => currentApi.value.pageNum.value, set: (v) => (currentApi.value.pageNum.value = v) });
const pageSize = computed({ get: () => currentApi.value.pageSize.value, set: (v) => (currentApi.value.pageSize.value = v) });
const searchModel = computed(() => currentApi.value.searchModel);

function tabLabel(tp: DemandProductType): string {
  return demandTypeLabel(tp, djs_demand_product_type.value);
}

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'demandNo', label: t('demand.field.demandNo'), type: 'input' },
  { field: 'demandStatus', label: t('demand.field.demandStatus'), type: 'select', dictType: 'djs_demand_status' },
  { field: 'beginDate', label: t('demand.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('demand.field.endDate'), type: 'date' }
]);

/**
 * 列按业态派生：
 *  - 白条 / 蔬菜：插入「原材料」列
 *  - 礼盒 / 其他：不显示 shipped（已发货数）
 */
const columns = computed<BizTableColumn[]>(() => {
  const tp = activeType.value;
  const cols: BizTableColumn[] = [
    { prop: 'demandNo', label: t('demand.column.demandNo'), width: 170 },
    { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, showOverflowTooltip: true },
    { prop: 'demandQuantity', label: t('demand.column.demandQuantity'), width: 100, align: 'right' },
    { prop: 'productUnit', label: t('demand.column.productUnit'), width: 70, align: 'center' }
  ];
  if (demandTypeHasRaw(tp)) {
    cols.push({ prop: 'rawMaterial', label: t('demand.column.rawMaterial'), minWidth: 130, showOverflowTooltip: true });
  }
  cols.push(
    { prop: 'demandStatus', label: t('demand.column.demandStatus'), width: 100, align: 'center', dictType: 'djs_demand_status' },
    { prop: 'storeId', label: t('demand.column.storeId'), width: 110, align: 'center' }
  );
  // 礼盒 / 其他无「已发货」语义列
  if (tp !== 'gift_box' && tp !== 'other') {
    cols.push({ prop: 'shippedCount', label: t('demand.column.shippedCount'), width: 90, align: 'right' });
  }
  cols.push(
    { prop: 'createTime', label: t('demand.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
    { prop: 'actions', label: t('demand.column.actions'), width: 320, fixed: 'right', align: 'center' }
  );
  return cols;
});

function statusActions(row: DemandManageVO): string[] {
  return currentApi.value.allowedActions(row.demandStatus as DemandStatusCode);
}
const canSubmit = (r: DemandManageVO) => statusActions(r).includes('submit');
const canConfirm = (r: DemandManageVO) => statusActions(r).includes('confirm');
const canStart = (r: DemandManageVO) => statusActions(r).includes('start_production');
// 指定猪只仅白条 / 猪业态
const canAssignPig = (r: DemandManageVO) => demandTypeHasPigAssign(activeType.value) && statusActions(r).includes('assign_pig');
const canCancel = (r: DemandManageVO) => statusActions(r).includes('cancel');

async function onTabChange() {
  // 切 tab：刷新该业态列表 + 摘要条
  await currentApi.value.fetchList();
  await nextTick();
  summaryBarRef.value?.refresh?.();
}

async function reloadAll() {
  await currentApi.value.fetchList();
  summaryBarRef.value?.refresh?.();
  kpiBarRef.value?.refresh?.();
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel.value, payload);
  pageNum.value = 1;
  currentApi.value.fetchList();
}
function handleReset() {
  Object.keys(searchModel.value).forEach((k) => (searchModel.value[k] = undefined));
  pageNum.value = 1;
  currentApi.value.fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  currentApi.value.fetchList();
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
  await currentApi.value.handleDelete(rows as DemandManageVO[]);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onSubmit(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.submit', { no: row.demandNo }));
  await currentApi.value.handleSubmit(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onConfirm(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.confirm', { no: row.demandNo }));
  await currentApi.value.handleConfirm(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onStart(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.startProduction', { no: row.demandNo }));
  await currentApi.value.handleStartProduction(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
}
async function onCancel(row: DemandManageVO) {
  const { value: remark } = (await proxy?.$modal.prompt(t('demand.prompt.cancelRemark'), t('demand.action.cancel'), {
    inputPlaceholder: t('demand.prompt.cancelRemarkPh')
  })) as { value: string };
  await currentApi.value.handleCancel(row.id, remark);
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
  currentApi.value.fetchList();
});
</script>

<style scoped>
.demand-tabs {
  margin-bottom: 8px;
}
</style>
