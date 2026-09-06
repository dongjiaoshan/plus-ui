<template>
  <BizTable
    ref="tableRef"
    :data="list"
    :total="total"
    :loading="loading"
    :columns="columns"
    :search-schema="searchSchema"
    :search-model="searchModel"
    :dict-types="['djs_product_type']"
    :page-num="pageNum"
    :page-size="pageSize"
    perm-prefix="djs:warehouse:inoutStat"
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
</template>

<script setup lang="ts">
/**
 * 入库统计 Tab（V6-R167 第 3 点）：区间内按 产品 × 入库方式 × 供应商 的入库量。
 *
 * 后端 compute-on-read 实时 GROUP BY 出入库流水，字典 label 与「无供应商」兜底都在后端完成，
 * 前端只负责搜索条件与展示 —— 这样导出的 Excel 与页面逐列一致（甲方第 5 点）。
 * 日期区间放开后行数可能上万，走后端分页（不做一次返全量前端内滚）。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listInStat, type InoutStatInVO, type InoutStatQuery } from '@/api/djs-warehouse/inoutStat';
import { useSupplierOptions } from '@/composables/useSupplierOptions';
import { FLOW_TYPE_IN_VALUES } from '@/views/djs-warehouse/flow/scope';
import { NO_SUPPLIER_VALUE, defaultDateRange } from '../options';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'InStatPanel' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_flow_type } = toRefs<Record<string, DictDataOption[]>>(proxy?.useDict('djs_flow_type'));

/** 分页响应实际结构（request 拦截器已剥掉 axios 外壳） */
interface StatListPayload {
  rows?: InoutStatInVO[];
  total?: number;
}

const tableRef = ref<BizTableExpose>();

const list = ref<InoutStatInVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 供应商主数据下拉（与「入库记录」「入库汇总」共用同一份取数口径，value = 供应商 ID 的 string） */
const { supplierOptions, loadSupplierOptions } = useSupplierOptions();

/** 实际给下拉用的选项：首位补「无供应商」——甲方明说空供应商是一个能被单独筛出来的统计桶 */
const supplierPickOptions = computed(() => [{ label: t('inoutStat.field.noSupplier'), value: NO_SUPPLIER_VALUE }, ...supplierOptions.value]);

/** djs_flow_type 是出入合并字典，入库方式下拉按白名单过滤（与「入库记录」页共用 flow/scope.ts） */
const inModeOptions = computed(() =>
  (djs_flow_type.value ?? []).filter((d) => FLOW_TYPE_IN_VALUES.includes(String(d.value))).map((d) => ({ label: d.label, value: d.value }))
);

/** 默认近一个月（上月同日 → 今天）；重置也回到这个区间，而不是清空 */
const searchModel = reactive<Record<string, any>>({
  dateRange: defaultDateRange(),
  productName: undefined,
  productType: [],
  flowType: [],
  supplier: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('inoutStat.field.date'), type: 'daterange' },
  { field: 'productName', label: t('inoutStat.field.productName'), type: 'input' },
  { field: 'flowType', label: t('inoutStat.field.inMode'), type: 'select', multiple: true, options: inModeOptions.value },
  { field: 'productType', label: t('inoutStat.field.productType'), type: 'select', multiple: true, dictType: 'djs_product_type' },
  // 单选 + 打字过滤（SearchForm 的 select 恒 filterable），选中即精确筛
  { field: 'supplier', label: t('inoutStat.field.supplier'), type: 'select', options: supplierPickOptions.value }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productName', label: t('inoutStat.column.productName'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  { prop: 'productTypeName', label: t('inoutStat.column.productType'), minWidth: 100, align: 'center' },
  { prop: 'productSpec', label: t('inoutStat.column.productSpec'), minWidth: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'inModeName', label: t('inoutStat.column.inMode'), minWidth: 120, align: 'center' },
  {
    prop: 'inboundQty',
    label: t('inoutStat.column.inboundQty'),
    minWidth: 110,
    align: 'center',
    // 按行单位分流：kg/公斤 恒 3 位小数补零，非 kg 去尾零
    formatter: (row: BizRow) => formatQtyByUnit(row.inboundQty, row.productUnit)
  },
  { prop: 'productUnit', label: t('inoutStat.column.productUnit'), minWidth: 80, align: 'center' },
  { prop: 'supplierName', label: t('inoutStat.column.supplier'), minWidth: 160, align: 'center', showOverflowTooltip: true }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串 / 空数组归一 undefined） */
function buildQuery(): Omit<InoutStatQuery, 'pageNum' | 'pageSize'> {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  const supplier = searchModel.supplier as string | undefined;
  return {
    dateFrom: from || undefined,
    dateTo: to || undefined,
    productName: searchModel.productName || undefined,
    productTypes:
      Array.isArray(searchModel.productType) && searchModel.productType.length
        ? searchModel.productType.map((v: string | number) => Number(v))
        : undefined,
    flowTypes: Array.isArray(searchModel.flowType) && searchModel.flowType.length ? searchModel.flowType : undefined,
    // 「无供应商」是空桶没有 ID，用独立开关表达；两者互斥，永远只传一个
    supplierId: supplier && supplier !== NO_SUPPLIER_VALUE ? supplier : undefined,
    noSupplier: supplier === NO_SUPPLIER_VALUE ? true : undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    // request 拦截器已把响应拆成业务体（TableDataInfo），声明的 AxiosPromise 泛型对不上，按实际结构收窄
    const res = (await listInStat({ ...buildQuery(), pageNum: pageNum.value, pageSize: pageSize.value })) as unknown as StatListPayload;
    list.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

/** 重置回「近一个月」默认区间（甲方要的默认值，清空日期等于统计全历史，不是他要的） */
function handleReset() {
  searchModel.dateRange = defaultDateRange();
  searchModel.productName = undefined;
  searchModel.productType = [];
  searchModel.flowType = [];
  searchModel.supplier = undefined;
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

/** 导出当前搜索条件下的全量（后端与列表走同一份聚合 SQL，甲方第 5 点） */
function handleExport() {
  const query = buildQuery();
  const suffix = query.dateFrom && query.dateTo ? `${query.dateFrom}_${query.dateTo}` : String(new Date().getTime());
  proxy?.download('/djs/warehouse/inoutStat/in/export', query, `入库统计_${suffix}.xlsx`);
}

onMounted(() => {
  loadSupplierOptions();
  loadList();
});
</script>
