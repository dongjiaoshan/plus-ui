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
      :dict-types="['djs_pack_status', 'djs_product_type', 'djs_produce_location', 'djs_deliver_type', 'djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:production"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 只读：admin 不暴露写入入口（写入走 mp 4 业态打包子页） -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="ProductProduction" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listProduction } from '@/api/djs-warehouse/production';
import type { ProductProductionQuery, ProductProductionVO } from '@/api/djs-warehouse/production/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<ProductProductionVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  produceNo: undefined,
  productType: undefined,
  packStatus: undefined,
  earNo: undefined,
  storeId: undefined,
  produceTimeFrom: undefined,
  produceTimeTo: undefined
});

const productTypeOptions = [
  { label: '自产', value: 1 },
  { label: '外购', value: 2 },
  { label: '礼盒', value: 3 }
];

const packStatusOptions = [
  { label: '待打包', value: 'pending' },
  { label: '已打包', value: 'packed' },
  { label: '已出库待发货', value: 'shipped_out' }
];

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { key: 'produceNo', label: '生产编号', type: 'input' },
  { key: 'productType', label: '产品类型', type: 'select', options: productTypeOptions },
  { key: 'packStatus', label: '打包状态', type: 'select', options: packStatusOptions },
  { key: 'earNo', label: '来源耳号', type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'produceNo', label: '生产编号', minWidth: 160 },
  { prop: 'produceDate', label: '生产日期', minWidth: 120 },
  { prop: 'productName', label: '产品名称', minWidth: 160 },
  {
    prop: 'productType',
    label: '类型',
    minWidth: 80,
    formatter: (row: ProductProductionVO) => {
      return productTypeOptions.find((o) => o.value === row.productType)?.label || row.productType;
    }
  },
  { prop: 'productUnit', label: '单位', minWidth: 80 },
  { prop: 'productSpec', label: '规格', minWidth: 120 },
  { prop: 'productWeight', label: '重量/数量', minWidth: 100 },
  {
    prop: 'packStatus',
    label: '打包状态',
    minWidth: 120,
    formatter: (row: ProductProductionVO) => {
      return packStatusOptions.find((o) => o.value === row.packStatus)?.label || row.packStatus;
    }
  },
  { prop: 'earNo', label: '来源耳号', minWidth: 120 },
  { prop: 'plotId', label: '来源地块', minWidth: 100 },
  { prop: 'storeId', label: '需求门店', minWidth: 100 },
  { prop: 'produceTime', label: '生产时间', minWidth: 160 },
  {
    prop: 'isDeliveryCheck',
    label: '已清点',
    minWidth: 80,
    formatter: (row: ProductProductionVO) => {
      return row.isDeliveryCheck === 1 ? '是' : '否';
    }
  },
  {
    prop: 'isArrivalConfirm',
    label: '已到货',
    minWidth: 80,
    formatter: (row: ProductProductionVO) => {
      return row.isArrivalConfirm === 1 ? '是' : '否';
    }
  },
  { prop: 'traceCode', label: '追溯码', minWidth: 140 },
  { prop: 'createByName', label: '录入人', minWidth: 100 },
  { prop: 'remark', label: '备注', minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: ProductProductionQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listProduction(params);
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
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(p: { pageNum: number; pageSize: number }) {
  pageNum.value = p.pageNum;
  pageSize.value = p.pageSize;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/production/export', { ...searchModel }, `生产记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
