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
      :dict-types="['djs_shipment_status', 'djs_demand_product_type', 'djs_deliver_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:shipment"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 发货流水只读，行级操作仅查看 -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="WarehouseShipment" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listShipment } from '@/api/djs-warehouse/shipment';
import type { ShipmentQuery, ShipmentVO } from '@/api/djs-warehouse/shipment/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<ShipmentVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  shipmentNo: undefined,
  demandId: undefined,
  productType: undefined,
  storeId: undefined,
  shipmentStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'shipmentNo', label: t('djs.warehouse.shipment.shipmentNo'), type: 'input' },
  { field: 'productType', label: t('djs.warehouse.shipment.productType'), type: 'select', dictType: 'djs_demand_product_type' },
  { field: 'shipmentStatus', label: t('djs.warehouse.shipment.shipmentStatus'), type: 'select', dictType: 'djs_shipment_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'shipmentNo', label: t('djs.warehouse.shipment.shipmentNo'), minWidth: 160 },
  { prop: 'shipDate', label: t('djs.warehouse.shipment.shipDate'), minWidth: 120 },
  { prop: 'productType', label: t('djs.warehouse.shipment.productType'), dictType: 'djs_demand_product_type', minWidth: 100 },
  { prop: 'demandId', label: t('djs.warehouse.shipment.demandId'), minWidth: 140 },
  { prop: 'storeId', label: t('djs.warehouse.shipment.storeId'), minWidth: 100 },
  { prop: 'shipQuantity', label: t('djs.warehouse.shipment.shipQuantity'), minWidth: 100 },
  { prop: 'shipUnit', label: t('djs.warehouse.shipment.shipUnit'), minWidth: 80 },
  { prop: 'deliverType', label: t('djs.warehouse.shipment.deliverType'), dictType: 'djs_deliver_type', minWidth: 100 },
  { prop: 'shipmentStatus', label: t('djs.warehouse.shipment.shipmentStatus'), dictType: 'djs_shipment_status', minWidth: 100 },
  { prop: 'checkerName', label: t('djs.warehouse.shipment.checker'), minWidth: 100 },
  { prop: 'checkTime', label: t('djs.warehouse.shipment.checkTime'), minWidth: 160 },
  { prop: 'remark', label: t('djs.warehouse.shipment.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: ShipmentQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listShipment(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
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
  proxy?.download('/djs/warehouse/shipment/export', { ...searchModel }, `发货流水_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
