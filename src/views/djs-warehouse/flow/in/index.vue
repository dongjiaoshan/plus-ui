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
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listFlowIn } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowQuery, StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

/** djs_flow_type 是出入合并字典，入库方式下拉只保留入库方向的值（按 value 白名单过滤，不动字典 seed） */
const FLOW_TYPE_IN_VALUES = [
  // 退回入库按来源拆分（FIX-WMS-FLOWDICT-001，旧 return_in 已停写，保留兼容历史流水筛选）
  'return_in',
  'store_return_in',
  'prod_return_in',
  'pick_return_in',
  'cut_out_in',
  'veg_stock_in',
  'slaughter_burn',
  'bar_in_stock',
  'check_in',
  'supplier_in',
  'purchase_in',
  // pack_in（打包入库）不在入库记录展示，下拉同步移除（D-row7）
  'veg_receive_in',
  'veg_purchase_in',
  // 三期作物入库（V6 row88）—— 新入库方式必须同步进这个白名单，否则「入库记录」页筛不出来
  'third_phase_in',
  'receive_in',
  'return_goods_in',
  'other'
];
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
  earNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.flowIn.flowDate'), type: 'daterange' },
  { field: 'productName', label: t('djs.warehouse.flowIn.productName'), type: 'input' },
  { field: 'productType', label: t('djs.warehouse.flowIn.productType'), type: 'select', multiple: true, dictType: 'djs_product_type' },
  { field: 'flowType', label: t('djs.warehouse.flowIn.inMode'), type: 'select', multiple: true, options: inModeOptions.value },
  { field: 'warehouseId', label: t('djs.warehouse.flowIn.location'), type: 'select', multiple: true, options: locationOptions.value },
  { field: 'operatorName', label: t('djs.warehouse.flowIn.operator'), type: 'input' },
  { field: 'blockNo', label: t('djs.warehouse.flowIn.blockNo'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.flowIn.earNo'), type: 'input' }
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
  { prop: 'earNo', label: t('djs.warehouse.flowIn.earNo'), minWidth: 120, align: 'center' },
  { prop: 'operatorName', label: t('djs.warehouse.flowIn.operator'), minWidth: 100, align: 'center' }
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
