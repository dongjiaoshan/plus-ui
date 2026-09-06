<template>
  <BizTable
    ref="tableRef"
    :data="list"
    :total="total"
    :loading="loading"
    :columns="columns"
    :search-schema="searchSchema"
    :search-model="searchModel"
    :dict-types="['djs_stock_out_dest', 'djs_product_type']"
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
 * 出库统计 Tab（V6-R167 第 4 点）：区间内按 产品 × 出库去向 的出库量。
 *
 * 后端 compute-on-read 实时 GROUP BY 出入库流水，字典 label 与「未指定」兜底都在后端完成，
 * 前端只负责搜索条件与展示 —— 这样导出的 Excel 与页面逐列一致（甲方第 5 点）。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listOutStat, type InoutStatOutVO, type InoutStatQuery } from '@/api/djs-warehouse/inoutStat';
import { defaultDateRange } from '../options';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'OutStatPanel' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 分页响应实际结构（request 拦截器已剥掉 axios 外壳） */
interface StatListPayload {
  rows?: InoutStatOutVO[];
  total?: number;
}

const tableRef = ref<BizTableExpose>();

const list = ref<InoutStatOutVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 默认近一个月（上月同日 → 今天）；重置也回到这个区间，而不是清空 */
const searchModel = reactive<Record<string, any>>({
  dateRange: defaultDateRange(),
  productName: undefined,
  productType: [],
  stockOutDest: []
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('inoutStat.field.date'), type: 'daterange' },
  { field: 'productName', label: t('inoutStat.field.productName'), type: 'input' },
  { field: 'stockOutDest', label: t('inoutStat.field.outDest'), type: 'select', multiple: true, dictType: 'djs_stock_out_dest' },
  { field: 'productType', label: t('inoutStat.field.productType'), type: 'select', multiple: true, dictType: 'djs_product_type' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productName', label: t('inoutStat.column.productName'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  { prop: 'productTypeName', label: t('inoutStat.column.productType'), minWidth: 100, align: 'center' },
  { prop: 'productSpec', label: t('inoutStat.column.productSpec'), minWidth: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'outDestName', label: t('inoutStat.column.outDest'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'outboundQty',
    label: t('inoutStat.column.outboundQty'),
    minWidth: 110,
    align: 'center',
    // 按行单位分流：kg/公斤 恒 3 位小数补零，非 kg 去尾零
    formatter: (row: BizRow) => formatQtyByUnit(row.outboundQty, row.productUnit)
  },
  { prop: 'productUnit', label: t('inoutStat.column.productUnit'), minWidth: 80, align: 'center' }
]);

/** searchModel → 后端 query（daterange 拆 dateFrom/dateTo；空串 / 空数组归一 undefined） */
function buildQuery(): Omit<InoutStatQuery, 'pageNum' | 'pageSize'> {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    dateFrom: from || undefined,
    dateTo: to || undefined,
    productName: searchModel.productName || undefined,
    productTypes:
      Array.isArray(searchModel.productType) && searchModel.productType.length
        ? searchModel.productType.map((v: string | number) => Number(v))
        : undefined,
    stockOutDests: Array.isArray(searchModel.stockOutDest) && searchModel.stockOutDest.length ? searchModel.stockOutDest : undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    // request 拦截器已把响应拆成业务体（TableDataInfo），声明的 AxiosPromise 泛型对不上，按实际结构收窄
    const res = (await listOutStat({ ...buildQuery(), pageNum: pageNum.value, pageSize: pageSize.value })) as unknown as StatListPayload;
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
  searchModel.stockOutDest = [];
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
  proxy?.download('/djs/warehouse/inoutStat/out/export', query, `出库统计_${suffix}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
