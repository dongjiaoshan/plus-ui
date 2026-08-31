<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_flow_type', 'djs_product_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:flowIn"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    />
  </div>
</template>

<script setup name="WarehouseFlowIn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listFlowIn } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowQuery, StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { formatQtyByUnit } from '@/utils/weight';
import { formatPlotLabel, thirdPhaseFilterOptions, toThirdPhaseParam } from '@/utils/plotTag';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { FLOW_TYPE_IN_VALUES } from '../scope';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const { djs_flow_type } = toRefs<Record<string, any>>(proxy?.useDict('djs_flow_type'));
const inModeOptions = computed(() =>
  (djs_flow_type.value ?? [])
    .filter((d: any) => FLOW_TYPE_IN_VALUES.includes(String(d.value)))
    .map((d: any) => ({ label: d.label, value: d.value }))
);

/** 库存查询行钻取带入的 productId 预过滤（route query，仅本次进入生效） */
const drillProductId = ref<string | undefined>(undefined);

const tableRef = ref<BizTableExpose>();

const list = ref<StockFlowVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 入库仓库下拉（库位主数据），onMounted 拉一次 */
const locationOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchModel = reactive<Record<string, any>>({
  dateRange: undefined,
  productName: undefined,
  productType: [],
  flowType: [],
  warehouseId: [],
  operatorName: undefined,
  blockNo: undefined,
  earNo: undefined,
  supplierName: undefined,
  thirdPhase: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.flowIn.flowDate'), type: 'daterange' },
  { field: 'productName', label: t('djs.warehouse.flowIn.productName'), type: 'input' },
  { field: 'productType', label: t('djs.warehouse.flowIn.productType'), type: 'select', multiple: true, dictType: 'djs_product_type' },
  { field: 'flowType', label: t('djs.warehouse.flowIn.inMode'), type: 'select', multiple: true, options: inModeOptions.value },
  { field: 'warehouseId', label: t('djs.warehouse.flowIn.location'), type: 'select', multiple: true, options: locationOptions.value },
  { field: 'operatorName', label: t('djs.warehouse.flowIn.operator'), type: 'input' },
  { field: 'blockNo', label: t('djs.warehouse.flowIn.blockNo'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowIn.earNo'), type: 'input' },
  // 供应商模糊搜索（甲方 row139）：后端反查 t_md_supplier.id 集合后按 supplierId IN 下推
  { field: 'supplierName', label: t('djs.warehouse.flowIn.supplierName'), type: 'input' },
  // 三期筛选（甲方 row92）：选「仅看三期」传 thirdPhase=1，全部不传
  { field: 'thirdPhase', label: t('plotTag.filter.label'), type: 'select', options: thirdPhaseFilterOptions() }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowDate', label: t('djs.warehouse.flowIn.flowDate'), minWidth: 160, formatter: 'datetime', align: 'center' },
  { prop: 'productType', label: t('djs.warehouse.flowIn.productType'), dictType: 'djs_product_type', minWidth: 100, align: 'center' },
  { prop: 'productCode', label: t('djs.warehouse.flowIn.productCode'), minWidth: 110, align: 'center' },
  { prop: 'productName', label: t('djs.warehouse.flowIn.productName'), minWidth: 160, align: 'center' },
  { prop: 'flowType', label: t('djs.warehouse.flowIn.inMode'), dictType: 'djs_flow_type', minWidth: 110, align: 'center' },
  { prop: 'locationName', label: t('djs.warehouse.flowIn.location'), minWidth: 120, align: 'center' },
  {
    prop: 'changeQuantity',
    label: t('djs.warehouse.flowIn.changeQuantity'),
    minWidth: 110,
    align: 'center',
    formatter: (row: StockFlowVO) => formatQtyByUnit(row.changeQuantity, row.productUnit)
  },
  { prop: 'productUnit', label: t('djs.warehouse.flowIn.productUnit'), minWidth: 80, align: 'center' },
  { prop: 'blockNo', label: t('djs.warehouse.flowIn.blockNo'), minWidth: 110, align: 'center' },
  {
    // 「地块」列（甲方 row92）：三期标识优先显示「三期」，否则真实地块名；三页共用 formatPlotLabel
    prop: 'plotName',
    label: t('plotTag.column'),
    minWidth: 110,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (row: BizRow) => formatPlotLabel(row)
  },
  { prop: 'earNo', label: t('djs.warehouse.flowIn.earNo'), minWidth: 120, align: 'center' },
  { prop: 'operatorName', label: t('djs.warehouse.flowIn.operator'), minWidth: 100, align: 'center' },
  // 供应商列（甲方 row139）：放在最后一列，该笔流水没有供应商时留空
  { prop: 'supplierName', label: t('djs.warehouse.flowIn.supplierName'), minWidth: 140, align: 'center', showOverflowTooltip: true }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串归一 undefined） */
function buildQuery(): StockFlowQuery {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    productId: drillProductId.value || undefined,
    productName: searchModel.productName || undefined,
    productTypes:
      Array.isArray(searchModel.productType) && searchModel.productType.length ? searchModel.productType.map((v: any) => Number(v)) : undefined,
    flowTypes: Array.isArray(searchModel.flowType) && searchModel.flowType.length ? searchModel.flowType : undefined,
    warehouseIds: Array.isArray(searchModel.warehouseId) && searchModel.warehouseId.length ? searchModel.warehouseId : undefined,
    operatorName: searchModel.operatorName || undefined,
    blockNo: searchModel.blockNo || undefined,
    earNo: searchModel.earNo || undefined,
    supplierName: searchModel.supplierName || undefined,
    thirdPhase: toThirdPhaseParam(searchModel.thirdPhase),
    dateFrom: from || undefined,
    dateTo: to || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listFlowIn(buildQuery());
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadLocations() {
  const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
  const rows = (res as any).rows ?? (res as any).data ?? [];
  locationOptions.value = rows.map((r: any) => ({ label: r.locationName, value: r.id }));
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/stockFlow/in/export', buildQuery(), `入库记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  const pid = route.query.productId;
  drillProductId.value = typeof pid === 'string' && pid ? pid : undefined;
  loadLocations();
  loadList();
});
</script>
