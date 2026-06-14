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
  </div>
</template>

<script setup name="DemandManage" lang="ts">
import { useRouter } from 'vue-router';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DemandCart from './components/DemandCart.vue';
import DemandKpiBar from './components/DemandKpiBar.vue';
import { listDemandGroup } from '@/api/djs-warehouse/demand';
import type { DemandGroupStatusCode, DemandGroupVO, DemandManageQuery } from '@/api/djs-warehouse/demand/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const tableRef = ref<BizTableExpose>();
const cartRef = ref<{ open: () => void }>();
const kpiBarRef = ref<{ refresh: () => void }>();

const list = ref<DemandGroupVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  beginDate: undefined,
  endDate: undefined
});

/**
 * 汇总列表查询区（group-list 仅支持 需求产品名 / 起止日期 三个过滤；
 * 三态 + 7 态业态过滤在分组语义下不适用，放到确认页做）。
 */
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('demand.field.searchProductName'), type: 'input' },
  { field: 'beginDate', label: t('demand.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('demand.field.endDate'), type: 'date' }
]);

/** 汇总列（对齐原型 bc5e5339：11 数据列 + 1 操作列）。 */
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandDate', label: t('demand.column.demandDate'), width: 120, align: 'center' },
  { prop: 'productName', label: t('demand.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('demand.column.productSpec'), width: 110, showOverflowTooltip: true },
  {
    prop: 'demandQuantity',
    label: t('demand.column.demandQuantity'),
    width: 100,
    align: 'right',
    formatter: (row: BizRow) => formatNumber((row as unknown as DemandGroupVO).demandQuantity)
  },
  { prop: 'productType', label: t('demand.column.productType'), width: 120, align: 'center', dictType: 'djs_demand_product_type' },
  { prop: 'rawMaterial', label: t('demand.column.rawMaterial'), width: 110, showOverflowTooltip: true },
  {
    prop: 'materialQty',
    label: t('demand.column.materialQty'),
    width: 120,
    align: 'right',
    formatter: (row: BizRow) => formatNumber((row as unknown as DemandGroupVO).materialQty)
  },
  {
    prop: 'storeCount',
    label: t('demand.column.storeCount'),
    width: 110,
    align: 'center',
    formatter: (row: BizRow) => String((row as unknown as DemandGroupVO).storeCount ?? 0)
  },
  { prop: 'demandStatus', label: t('demand.column.demandStatus'), width: 110, align: 'center' },
  {
    prop: 'confirmRate',
    label: t('demand.column.confirmRate'),
    width: 100,
    align: 'center',
    formatter: (row: BizRow) => formatRate((row as unknown as DemandGroupVO).confirmRate)
  },
  { prop: 'lastConfirmTime', label: t('demand.column.lastConfirmTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('demand.column.actions'), width: 110, fixed: 'right', align: 'center' }
]);

/** 数量两位小数显示（需求量 / 原材料计算量）。 */
function formatNumber(v: number | string | undefined): string {
  return Number(v ?? 0).toFixed(2);
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
    const query: DemandManageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchModel.productName,
      beginDate: searchModel.beginDate,
      endDate: searchModel.endDate
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

/** 点「查看需求」→ 跳需求确认页（0613-11），携 demandDate + productId 下钻该日该产品各门店明细。 */
function onViewDemand(row: DemandGroupVO) {
  router.push({
    path: '/djs-warehouse/demand-confirm',
    query: {
      demandDate: row.demandDate,
      productId: String(row.productId),
      productName: row.productName,
      productType: row.productType
    }
  });
}

onMounted(() => {
  fetchList();
});
</script>
