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
      :dict-types="['djs_stock_out_dest']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:whiteBarShipment"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 出库方式：ship_dock 派生 '1'=发货月台 / 后台出库派生 '3'=仓库出库 -->
      <template #cell-outMethod="{ row }">
        {{ outMethodLabel(row.outMethod) }}
      </template>
    </BizTable>
  </div>
</template>

<script setup name="WhiteBarShipment" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listWhiteBarShipment } from '@/api/djs-warehouse/whiteBarShipment';
import type { WhiteBarShipmentQuery, WhiteBarShipmentVO } from '@/api/djs-warehouse/production/types';
import { lastMonthRange } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/** 出库方式派生值 → 显示文案（ship_dock 记 '1'=发货月台 / 仓库出库记 '3'=仓库出库） */
const OUT_METHOD_LABEL: Record<string, string> = {
  '1': '发货月台',
  '3': '仓库出库'
};
const outMethodOptions = [
  { label: '发货月台', value: '1' },
  { label: '仓库出库', value: '3' }
];
function outMethodLabel(v?: string): string {
  return v ? (OUT_METHOD_LABEL[v] ?? v) : '-';
}

const tableRef = ref<BizTableExpose>();

const list = ref<WhiteBarShipmentVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  dateRange: lastMonthRange(),
  earNo: undefined,
  outMethod: [],
  outDest: []
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('djs.warehouse.whiteBarShipment.produceTime'), type: 'daterange' },
  { field: 'earNo', label: t('djs.warehouse.whiteBarShipment.earNo'), type: 'input' },
  { field: 'outMethod', label: t('djs.warehouse.whiteBarShipment.outMethod'), type: 'select', multiple: true, options: outMethodOptions },
  { field: 'outDest', label: t('djs.warehouse.whiteBarShipment.outDest'), type: 'select', multiple: true, dictType: 'djs_stock_out_dest' }
]);

const columns = computed<BizTableColumn[]>(() => [
  {
    prop: 'produceTime',
    label: t('djs.warehouse.whiteBarShipment.produceTime'),
    minWidth: 160,
    align: 'center',
    formatter: (row: any) => proxy?.parseTime?.(row.produceTime, '{y}-{m}-{d} {h}:{i}:{s}')
  },
  { prop: 'productCode', label: t('djs.warehouse.whiteBarShipment.productCode'), minWidth: 140, align: 'center' },
  { prop: 'productName', label: t('djs.warehouse.whiteBarShipment.productName'), minWidth: 140, align: 'center' },
  { prop: 'earNo', label: t('djs.warehouse.whiteBarShipment.earNo'), minWidth: 150, align: 'center' },
  { prop: 'outMethod', label: t('djs.warehouse.whiteBarShipment.outMethod'), minWidth: 100, align: 'center' },
  { prop: 'outDest', label: t('djs.warehouse.whiteBarShipment.outDest'), dictType: 'djs_stock_out_dest', minWidth: 100, align: 'center' },
  { prop: 'storeName', label: t('djs.warehouse.whiteBarShipment.storeName'), minWidth: 120, align: 'center' },
  { prop: 'productWeight', label: t('djs.warehouse.whiteBarShipment.productWeight'), minWidth: 100, align: 'center' },
  { prop: 'productUnit', label: t('djs.warehouse.whiteBarShipment.productUnit'), minWidth: 70, align: 'center' },
  { prop: 'operatorName', label: t('djs.warehouse.whiteBarShipment.operator'), minWidth: 100, align: 'center' }
]);

/** searchModel → 后端 query（daterange 拆 beginDate/endDate；空数组归一 undefined） */
function buildQuery(): WhiteBarShipmentQuery {
  const [from, to] = Array.isArray(searchModel.dateRange) ? searchModel.dateRange : [undefined, undefined];
  return {
    beginDate: from || undefined,
    endDate: to || undefined,
    earNo: searchModel.earNo || undefined,
    outMethods: Array.isArray(searchModel.outMethod) && searchModel.outMethod.length ? searchModel.outMethod : undefined,
    outDests: Array.isArray(searchModel.outDest) && searchModel.outDest.length ? searchModel.outDest : undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listWhiteBarShipment(buildQuery());
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  searchModel.dateRange = lastMonthRange();
  searchModel.earNo = undefined;
  searchModel.outMethod = [];
  searchModel.outDest = [];
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/production/whiteBarShipment/export', buildQuery(), `白条发货记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
