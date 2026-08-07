<!--
  需求管理汇总列表（0613-10 重做）。

  原型 bc5e5339：列表按「需求日期 + 需求产品」分组汇总——同一需求日期的同一种需求产品，
  无论被几家门店下单，只展示一条汇总统计行（不再平铺每条需求单）。
  列：需求状态(三态 待确认|已全部确认|部分确认)/需求确认率/需求日期/产品名称/规格/需求量/单位/
      需求产品类型/原材料/原材料计算量/原材料单位/需求门店数量/需求最终确认时间/操作(查看需求)。
  点「查看需求」→ 跳需求确认页（携 demandDate + productId），逐门店明细 + 状态机操作在确认页内做。
  数据源：GET /djs/warehouse/demand/group-list（后端 queryGroupList，聚合 + 三态 + 确认率）。
  顶部保留今日全局 KPI（DemandKpiBar）+「新增需求」跨业态购物车（DemandCart）。

  row32（甲方）两条：
    · 默认排序 = 需求确认率升序 —— 排在后端 SQL（ORDER BY 确认率 ASC, 需求日期 DESC, 产品名 ASC），
      前端不参与排序：列表是「后端聚合全量后分页」，前端只能排当前页，跨页会串。
    · 每 60s 自动刷新列表 + 顶部 KPI（标签页不可见 / 有勾选 / 抽屉打开 / 切走本 tab 时跳过，见 autoRefreshTick）。
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
      :dict-types="['djs_demand_product_type', 'djs_belong_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="rowKey"
      selectable
      :show-row-edit="false"
      :show-row-del="false"
      :show-batch-del="false"
      show-export
      perm-prefix="djs:warehouse:demand"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
      @selection-change="onSelectionChange"
    >
      <!-- row41：全选本页 + 批量确认需求（确认选中分组下所有待确认门店需求单） -->
      <template #toolbar-extra>
        <el-button plain @click="onToggleAllSelection">
          {{ t('demand.action.selectAllPage') }}
        </el-button>
        <el-button
          v-hasPermi="['djs:warehouse:demand:confirm']"
          type="success"
          plain
          :disabled="confirmableSelectedCount === 0"
          @click="onBatchConfirm"
        >
          {{ t('demand.action.batchConfirm') }}<template v-if="confirmableSelectedCount > 0"> ({{ confirmableSelectedCount }})</template>
        </el-button>
      </template>

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
import { batchConfirmDemand, listDemandGroup } from '@/api/djs-warehouse/demand';
import type { DemandGroupStatusCode, DemandGroupVO, DemandManageQuery, DemandProductType } from '@/api/djs-warehouse/demand/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { formatOrderQuantity, isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
// visible 由子组件 defineExpose 透出（抽屉开着时跳过自动刷新，见 autoRefreshTick）
const cartRef = ref<{ open: () => void; visible: boolean }>();
const kpiBarRef = ref<{ refresh: () => void }>();
const confirmDrawerRef = ref<{ open: (row: DemandGroupVO) => void; visible: boolean }>();

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
  { field: 'productType', label: t('demand.field.productType'), type: 'select', multiple: true, dictType: 'djs_belong_type' },
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

/** 汇总列（对齐原型 bc5e5339：13 数据列 + 1 操作列）。统一居中 + 统一 minWidth。 */
const columns = computed<BizTableColumn[]>(() => [
  // 列顺序：需求状态 → 需求确认率 → 需求日期 → 产品名称
  { prop: 'demandStatus', label: t('demand.column.demandStatus'), minWidth: 120, align: 'center' },
  {
    prop: 'confirmRate',
    label: t('demand.column.confirmRate'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => formatRate((row as unknown as DemandGroupVO).confirmRate)
  },
  { prop: 'demandDate', label: t('demand.column.demandDate'), minWidth: 120, align: 'center' },
  { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'productSpec', label: t('demand.column.productSpec'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'demandQuantity',
    label: t('demand.column.demandQuantity'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as unknown as DemandGroupVO;
      return formatOrderQuantity(r.demandQuantity, r.productUnit, r.belongType === 'white_bar');
    }
  },
  {
    prop: 'productUnit',
    label: t('demand.column.productUnit'),
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as unknown as DemandGroupVO;
      return r.belongType === 'white_bar' ? t('demand.kpi.unitHead') : r.productUnit || '-';
    }
  },
  { prop: 'belongType', label: t('demand.column.productType'), minWidth: 120, align: 'center', dictType: 'djs_belong_type' },
  { prop: 'rawMaterial', label: t('demand.column.rawMaterial'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'materialQty',
    label: t('demand.column.materialQty'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => {
      const r = row as unknown as DemandGroupVO;
      return r.materialQty == null ? '-' : formatQtyByKgRule(r.materialQty, r.materialUnit);
    }
  },
  {
    prop: 'materialUnit',
    label: t('demand.column.materialUnit'),
    minWidth: 100,
    align: 'center',
    formatter: (row: BizRow) => (row as unknown as DemandGroupVO).materialUnit || '-'
  },
  {
    prop: 'storeCount',
    label: t('demand.column.storeCount'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => String((row as unknown as DemandGroupVO).storeCount ?? 0)
  },
  { prop: 'lastConfirmTime', label: t('demand.column.lastConfirmTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('demand.column.actions'), width: 110, fixed: 'right', align: 'center' }
]);

/** 需求量/原材料计算量按单位分流：kg（含公斤）保留三位小数，其余取整不留小数。 */
function formatQtyByKgRule(v: number | string | undefined, unit: string | null | undefined): string {
  const n = Number(v ?? 0);
  return isKgUnit(unit) ? n.toFixed(3) : String(Math.round(n));
}
/** 确认率：后端 0~1 小数 → 百分比整数。 */
function formatRate(v: number | string | undefined): string {
  return Math.round(Number(v ?? 0) * 100) + '%';
}

/** 是否后端约定的聚合三态；入参放宽到 string 以便拦住三态之外的取值。 */
function isGroupStatus(code: string | null | undefined): code is DemandGroupStatusCode {
  return code === 'PENDING' || code === 'ALL_CONFIRMED' || code === 'PARTIAL';
}
/**
 * 三态状态文案（无字典，前端固定 map；与后端 groupStatus 编码对齐）。
 *
 * 三态之外一律回落 unknown 文案，不允许把 i18n key 拼进页面：
 * el-table-column 渲染时会先拿空行 `{}` 走一遍列 slot 去探测子列（Element Plus
 * table-column render），此时 demandStatus 是 undefined；后端将来加第 4 态同样落这里。
 */
function groupStatusLabel(code: string | null | undefined): string {
  return isGroupStatus(code) ? t(`demand.groupStatus.${code}`) : t('demand.groupStatus.unknown');
}
/** 三态对应 el-tag 颜色；三态之外按中性灰（同「待确认」）。 */
function groupStatusTagType(code: string | null | undefined): 'info' | 'success' | 'warning' {
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

/**
 * 查询条件（不含分页）—— 列表与导出共用，保证导出的就是「当前筛选下所见」的那批分组行。
 * R70 多选 → 复数数组参数（productTypes / storeIds / demandStatuses，后端 IN）；删单值发送，单值 fallback 在后端保留。
 */
function buildFilter(): DemandManageQuery {
  const range = searchModel.demandDateRange as [string, string] | undefined;
  const productTypes =
    Array.isArray(searchModel.productType) && searchModel.productType.length ? (searchModel.productType as DemandProductType[]) : undefined;
  const storeIds =
    Array.isArray(searchModel.storeId) && searchModel.storeId.length ? searchModel.storeId.map((v: number | string) => String(v)) : undefined;
  const demandStatuses =
    Array.isArray(searchModel.demandStatus) && searchModel.demandStatus.length ? (searchModel.demandStatus as DemandGroupStatusCode[]) : undefined;
  return {
    productName: searchModel.productName,
    productTypes,
    storeIds,
    demandStatuses,
    beginDate: range && range[0] ? range[0] : undefined,
    endDate: range && range[1] ? range[1] : undefined
  };
}

/** row155：导出当前筛选下的全量汇总行（后端 /group-export，与列表 /group-list 同口径）。 */
function handleExport() {
  proxy?.download('djs/warehouse/demand/group-export', buildFilter(), `需求管理_${new Date().getTime()}.xlsx`);
}

/**
 * 拉当前页汇总行。
 *
 * silent = 自动刷新用（row32）：不打 loading 遮罩，否则每分钟整表闪一次白。
 * 行序由后端 SQL 定（需求确认率升序），前端不再排序 —— 只排当前页会让第 2 页的 0% 掉在第 1 页 100% 之后。
 */
async function fetchList(silent = false) {
  if (!silent) loading.value = true;
  try {
    const query: DemandManageQuery = {
      ...buildFilter(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res: any = await listDemandGroup(query, silent);
    const rows = (res.rows ?? res.data ?? []) as DemandGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: rowKeyOf(r) })) as DemandGroupVO[];
    total.value = (res.total ?? 0) as number;
  } finally {
    if (!silent) loading.value = false;
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

// row41：批量确认需求 —— 选中分组行里只统计仍有待确认门店单的（非「已全部确认」）
const selection = ref<DemandGroupVO[]>([]);
const confirmableSelected = computed(() => selection.value.filter((r) => r.demandStatus !== 'ALL_CONFIRMED'));
const confirmableSelectedCount = computed(() => confirmableSelected.value.length);

function onSelectionChange(rows: BizRow[]) {
  selection.value = rows as unknown as DemandGroupVO[];
}
function onToggleAllSelection() {
  tableRef.value?.toggleAllSelection();
}
async function onBatchConfirm() {
  const rows = confirmableSelected.value;
  if (rows.length === 0) return;
  await proxy?.$modal.confirm(t('demand.confirm.batchConfirm', { count: rows.length }));
  const groups = rows.map((r) => ({ demandDate: r.demandDate, productId: String(r.productId) }));
  const res: any = await batchConfirmDemand(groups);
  const data = (res.data ?? res) as { confirmed: number; failed: number; failReasons?: string[] };
  if (!data.failed) {
    proxy?.$modal.msgSuccess(t('demand.message.batchConfirmSuccess', { count: data.confirmed }));
  } else {
    proxy?.$modal.msgWarning(t('demand.message.batchConfirmPartial', { success: data.confirmed, failed: data.failed }));
  }
  tableRef.value?.clearSelection();
  reloadAll();
}

/** keep-alive 下首帧 onMounted + onActivated 都会触发，用此标记跳过 onActivated 的首次重复拉取。 */
let firstActivate = true;

// ── row32：页面开着时每 60s 自动刷新一次列表 ──────────────────────────────
/** 自动刷新周期（甲方 row32：每隔 1 分钟）。 */
const AUTO_REFRESH_INTERVAL_MS = 60 * 1000;
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
/** 浏览器标签页可见性（切走 / 最小化 → 'hidden'），后台不打接口。 */
const documentVisibility = useDocumentVisibility();

/**
 * 自动刷新一轮。以下任一情形跳过本轮（等下一分钟），不做 location.reload，只重拉列表数据：
 *  1. 标签页不可见 —— 后台标签不空打接口；
 *  2. 手动查询还在飞 —— 不叠加请求；
 *  3. 有勾选行 —— BizTable 的 selection 列没开 reserve-selection，重拉会把用户为「批量确认」勾的行清空；
 *  4. 新增需求 / 查看需求抽屉开着 —— 不打断正在录入或确认的操作。
 * （keep-alive 切走的情况由 onDeactivated 直接停表，不靠这里兜。）
 */
function autoRefreshTick() {
  if (documentVisibility.value !== 'visible') return;
  if (loading.value) return;
  if (selection.value.length > 0) return;
  if (cartRef.value?.visible || confirmDrawerRef.value?.visible) return;
  // 静默刷新必须自己吞掉失败：axios 拦截器对 500 / 网络异常一律 ElMessage.error，
  // 页面挂着不动的用户会每分钟挨一次红条 + 一个 unhandled rejection。手动查询那条路径不受影响，
  // 报错照弹（用户点了搜索就该知道失败了）。
  fetchList(true).catch(() => {
    /* 自动刷新失败静默跳过，等下一分钟再试 */
  });
  try {
    kpiBarRef.value?.refresh?.();
  } catch {
    /* 同上 */
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshTimer = setInterval(autoRefreshTick, AUTO_REFRESH_INTERVAL_MS);
}
function stopAutoRefresh() {
  if (autoRefreshTimer !== null) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

onMounted(() => {
  loadStoreOptions();
  fetchList();
  startAutoRefresh();
});

// 列表组件被 keep-alive 缓存，切回本 tab 时用 onActivated 重拉分组列表 + 顶部 KPI，
// 保证从别处操作后回来状态/确认率是最新的（确认抽屉内的改动已由 @changed→reloadAll 即时刷新）。
onActivated(() => {
  // 切回本 tab → 重开定时器（离开时已停）
  startAutoRefresh();
  if (firstActivate) {
    firstActivate = false;
    return;
  }
  reloadAll();
});

// keep-alive 下切到别的 tab：组件不卸载，必须在此停表，否则后台标签页仍每分钟打一次接口
onDeactivated(stopAutoRefresh);
onUnmounted(stopAutoRefresh);
</script>
