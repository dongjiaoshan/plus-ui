<!--
  需求管理汇总列表（0613-10 重做）。

  原型 bc5e5339：列表按「需求日期 + 需求产品」分组汇总——同一需求日期的同一种需求产品，
  无论被几家门店下单，只展示一条汇总统计行（不再平铺每条需求单）。
  列：需求日期/需求产品/产品规格/需求量/需求产品类型/原材料/原材料计算量/需求门店数量/
      需求状态(三态 待确认|已全部确认|部分确认)/需求确认率/需求最终确认时间/操作(查看需求)。
  点「查看需求」→ 跳需求确认页（携 demandDate + productId），逐门店明细 + 状态机操作在确认页内做。
  数据源：GET /djs/warehouse/demand/group-list（后端 queryGroupList，聚合 + 三态 + 确认率）。
  顶部保留今日全局 KPI（DemandKpiBar）+「新增需求」跨业态购物车（DemandCart）。
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
      :dict-types="['djs_demand_product_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="rowKey"
      :show-row-edit="false"
      :show-row-del="false"
      :show-batch-del="false"
      perm-prefix="djs:warehouse:demand"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @page-change="handlePageChange"
    >
      <template #cell-demandStatus="{ row }">
        <el-tag :type="groupStatusTagType((row as unknown as DemandGroupVO).demandStatus)" effect="light">
          {{ groupStatusLabel((row as unknown as DemandGroupVO).demandStatus) }}
        </el-tag>
      </template>

      <template #cell-actions="{ row }">
        <el-button link type="primary" size="small" @click="onViewDemand(row as unknown as DemandGroupVO)">
          {{ t('demand.action.viewDemand') }}
        </el-button>
      </template>
    </BizTable>

    <DemandCart ref="cartRef" @success="reloadAll" />

    <!-- 查看需求：右侧抽屉（点蒙层自动关闭，每次打开重拉，无缓存）替代原整页子路由 -->
    <DemandConfirmDrawer ref="confirmDrawerRef" @changed="reloadAll" />
  </div>
</template>

<script setup name="DemandManage" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DemandCart from './components/DemandCart.vue';
import DemandConfirmDrawer from './components/DemandConfirmDrawer.vue';
import DemandKpiBar from './components/DemandKpiBar.vue';
import { listDemandGroup } from '@/api/djs-warehouse/demand';
import type { DemandGroupStatusCode, DemandGroupVO, DemandManageQuery, DemandProductType } from '@/api/djs-warehouse/demand/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/** 需求门店下拉 options（按门店过滤汇总列表）。 */
const storeOptions = ref<{ label: string; value: number | string }[]>([]);
async function loadStoreOptions() {
  try {
    const res: any = await listStore({ pageNum: 1, pageSize: 200 });
    const rows = (res.rows ?? res.data ?? []) as StoreVO[];
    storeOptions.value = rows.map((s) => ({ label: s.storeName, value: s.id }));
  } catch {
    storeOptions.value = [];
  }
}

const tableRef = ref<BizTableExpose>();
const cartRef = ref<{ open: () => void }>();
const kpiBarRef = ref<{ refresh: () => void }>();
const confirmDrawerRef = ref<{ open: (row: DemandGroupVO) => void }>();

const list = ref<DemandGroupVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  // R70 产品类型 / 需求门店 / 需求状态下拉多选 → 默认空数组
  productType: [],
  storeId: [],
  demandStatus: [],
  demandDateRange: undefined
});

/**
 * 汇总列表查询区：需求产品名 / 需求产品类型(业态字典) / 需求状态(聚合三态) / 起止日期。
 * 需求状态用聚合三态（PENDING/ALL_CONFIRMED/PARTIAL），非原始 7 态 djs_demand_status——
 * 7 态在分组语义下过滤不到任何聚合行，故走静态三态 options。
 */
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('demand.field.searchProductName'), type: 'input' },
  { field: 'productType', label: t('demand.field.productType'), type: 'select', multiple: true, dictType: 'djs_demand_product_type' },
  { field: 'storeId', label: t('demand.field.storeName'), type: 'select', multiple: true, options: storeOptions.value },
  {
    field: 'demandStatus',
    label: t('demand.field.demandStatus'),
    type: 'select',
    multiple: true,
    options: [
      { label: t('demand.groupStatus.PENDING'), value: 'PENDING' },
      { label: t('demand.groupStatus.ALL_CONFIRMED'), value: 'ALL_CONFIRMED' },
      { label: t('demand.groupStatus.PARTIAL'), value: 'PARTIAL' }
    ]
  },
  { field: 'demandDateRange', label: t('demand.field.demandDateRange'), type: 'daterange' }
]);

/** 汇总列（对齐原型 bc5e5339：11 数据列 + 1 操作列）。统一居中 + 统一 minWidth。 */
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandDate', label: t('demand.column.demandDate'), minWidth: 120, align: 'center' },
  { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'productSpec', label: t('demand.column.productSpec'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'demandQuantity',
    label: t('demand.column.demandQuantity'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => formatInt((row as unknown as DemandGroupVO).demandQuantity)
  },
  { prop: 'productType', label: t('demand.column.productType'), minWidth: 120, align: 'center', dictType: 'djs_demand_product_type' },
  { prop: 'rawMaterial', label: t('demand.column.rawMaterial'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'materialQty',
    label: t('demand.column.materialQty'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => formatNumber((row as unknown as DemandGroupVO).materialQty)
  },
  {
    prop: 'storeCount',
    label: t('demand.column.storeCount'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => String((row as unknown as DemandGroupVO).storeCount ?? 0)
  },
  { prop: 'demandStatus', label: t('demand.column.demandStatus'), minWidth: 120, align: 'center' },
  {
    prop: 'confirmRate',
    label: t('demand.column.confirmRate'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => formatRate((row as unknown as DemandGroupVO).confirmRate)
  },
  { prop: 'lastConfirmTime', label: t('demand.column.lastConfirmTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('demand.column.actions'), width: 110, fixed: 'right', align: 'center' }
]);

/** 原材料计算量：两位小数显示。 */
function formatNumber(v: number | string | undefined): string {
  return Number(v ?? 0).toFixed(2);
}
/** 需求量：整数显示（原材料计算量仍保留小数）。 */
function formatInt(v: number | string | undefined): string {
  return String(Math.round(Number(v ?? 0)));
}
/** 确认率：后端 0~1 小数 → 百分比整数。 */
function formatRate(v: number | string | undefined): string {
  return Math.round(Number(v ?? 0) * 100) + '%';
}

/** 三态状态文案（无字典，前端固定 map；与后端 groupStatus 编码对齐）。 */
function groupStatusLabel(code: DemandGroupStatusCode): string {
  return t(`demand.groupStatus.${code}`);
}
/** 三态对应 el-tag 颜色。 */
function groupStatusTagType(code: DemandGroupStatusCode): 'info' | 'success' | 'warning' {
  switch (code) {
    case 'ALL_CONFIRMED':
      return 'success';
    case 'PARTIAL':
      return 'warning';
    case 'PENDING':
    default:
      return 'info';
  }
}

/** group-list 行 row-key（demandDate + productId 复合）。 */
function rowKeyOf(row: DemandGroupVO): string {
  return `${row.demandDate}_${row.productId}`;
}

async function fetchList() {
  loading.value = true;
  try {
    const range = searchModel.demandDateRange as [string, string] | undefined;
    // R70 多选 → 复数数组参数（productTypes / storeIds / demandStatuses，后端 IN）；删单值发送，单值 fallback 在后端保留
    const productTypes =
      Array.isArray(searchModel.productType) && searchModel.productType.length ? (searchModel.productType as DemandProductType[]) : undefined;
    const storeIds =
      Array.isArray(searchModel.storeId) && searchModel.storeId.length ? searchModel.storeId.map((v: number | string) => String(v)) : undefined;
    const demandStatuses =
      Array.isArray(searchModel.demandStatus) && searchModel.demandStatus.length ? (searchModel.demandStatus as DemandGroupStatusCode[]) : undefined;
    const query: DemandManageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchModel.productName,
      productTypes,
      storeIds,
      demandStatuses,
      beginDate: range && range[0] ? range[0] : undefined,
      endDate: range && range[1] ? range[1] : undefined
    };
    const res: any = await listDemandGroup(query);
    const rows = (res.rows ?? res.data ?? []) as DemandGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: rowKeyOf(r) })) as DemandGroupVO[];
    total.value = (res.total ?? 0) as number;
  } finally {
    loading.value = false;
  }
}

async function reloadAll() {
  await fetchList();
  kpiBarRef.value?.refresh?.();
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
  cartRef.value?.open();
}

/** 点「查看需求」→ 右侧抽屉下钻该日该产品各门店明细（每次打开重拉，无缓存）。 */
function onViewDemand(row: DemandGroupVO) {
  confirmDrawerRef.value?.open(row);
}

/** keep-alive 下首帧 onMounted + onActivated 都会触发，用此标记跳过 onActivated 的首次重复拉取。 */
let firstActivate = true;

onMounted(() => {
  loadStoreOptions();
  fetchList();
});

// 列表组件被 keep-alive 缓存，切回本 tab 时用 onActivated 重拉分组列表 + 顶部 KPI，
// 保证从别处操作后回来状态/确认率是最新的（确认抽屉内的改动已由 @changed→reloadAll 即时刷新）。
onActivated(() => {
  if (firstActivate) {
    firstActivate = false;
    return;
  }
  reloadAll();
});
</script>
