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
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="120"
      row-key="id"
      :show-add="true"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      perm-prefix="djs:warehouse:outsourcePig"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-pigWeight="{ row }">
        <span v-if="row.pigWeight !== undefined && row.pigWeight !== null && row.pigWeight !== ''">{{ row.pigWeight }}kg</span>
        <span v-else class="text-gray-400">-</span>
      </template>

      <template #cell-supplierName="{ row }">
        <span v-if="row.supplierName">{{ row.supplierName }}</span>
        <span v-else class="text-gray-400">-</span>
      </template>

      <template #cell-buyerName="{ row }">
        <span v-if="row.buyerName">{{ row.buyerName }}</span>
        <span v-else class="text-gray-400">-</span>
      </template>

      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:outsourcePig:remove']" link type="danger" icon="Delete" @click="handleDel(row)">
          {{ t('common.del') }}
        </el-button>
      </template>
    </BizTable>

    <OutsourcePigForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="OutsourcePigList" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import OutsourcePigForm from './components/OutsourcePigForm.vue';
import { listOutsourcePig, delOutsourcePig } from '@/api/djs-warehouse/outsourcePig';
import type { OutsourcePigQuery, OutsourcePigVO } from '@/api/djs-warehouse/outsourcePig/types';
import { listSupplier } from '@/api/djs-common/supplier';
import { listUser } from '@/api/system/user';
import { lastMonthRange } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void }>();

const list = ref<OutsourcePigVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  // 采购日期范围（daterange，默认近一月；fetchList 拆成 From/To）
  purchaseDateRange: lastMonthRange(),
  arriveTime: undefined,
  supplierId: [],
  buyer: []
});

const supplierOptions = ref<Array<{ label: string; value: string | number }>>([]);
const buyerOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'purchaseDateRange', label: t('djs.warehouse.outsourcePig.column.purchaseDate'), type: 'daterange', clearable: true },
  { field: 'arriveTime', label: t('djs.warehouse.outsourcePig.column.arriveTime'), type: 'date', clearable: true },
  {
    field: 'supplierId',
    label: t('djs.warehouse.outsourcePig.column.supplier'),
    type: 'select',
    options: supplierOptions.value,
    clearable: true,
    multiple: true
  },
  {
    field: 'buyer',
    label: t('djs.warehouse.outsourcePig.column.buyer'),
    type: 'select',
    options: buyerOptions.value,
    clearable: true,
    multiple: true
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'purchaseDate', label: t('djs.warehouse.outsourcePig.column.purchaseDate'), minWidth: 140, align: 'center', formatter: 'date' },
  { prop: 'arriveTime', label: t('djs.warehouse.outsourcePig.column.arriveTime'), minWidth: 140, align: 'center', formatter: 'datetime' },
  { prop: 'pigMarkNo', label: t('djs.warehouse.outsourcePig.column.pigMarkNo'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'pigWeight', label: t('djs.warehouse.outsourcePig.column.pigWeight'), minWidth: 140, align: 'center' },
  { prop: 'supplierName', label: t('djs.warehouse.outsourcePig.column.supplier'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'buyerName', label: t('djs.warehouse.outsourcePig.column.buyer'), minWidth: 140, align: 'center', showOverflowTooltip: true }
]);

async function fetchList() {
  loading.value = true;
  try {
    const range = (searchModel.purchaseDateRange as string[] | undefined) ?? [];
    const query: OutsourcePigQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      purchaseDateFrom: range[0] || undefined,
      purchaseDateTo: range[1] || undefined,
      arriveTime: searchModel.arriveTime || undefined,
      supplierIds:
        Array.isArray(searchModel.supplierId) && searchModel.supplierId.length ? searchModel.supplierId.map((v: any) => String(v)) : undefined,
      buyers: Array.isArray(searchModel.buyer) && searchModel.buyer.length ? searchModel.buyer.map((v: any) => String(v)) : undefined
    };
    const res = await listOutsourcePig(query);
    list.value = (res.rows ?? res.data ?? []) as OutsourcePigVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadSupplierOptions() {
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; supplierName: string }>;
    supplierOptions.value = rows.map((r) => ({ label: r.supplierName, value: String(r.id) }));
  } catch (e) {
    console.warn('[OutsourcePig] loadSupplierOptions failed', e);
    supplierOptions.value = [];
  }
}

async function loadBuyerOptions() {
  try {
    const res = await listUser({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ userId: number | string; nickName?: string; userName?: string }>;
    buyerOptions.value = rows.map((r) => ({ label: r.nickName || r.userName || String(r.userId), value: String(r.userId) }));
  } catch (e) {
    console.warn('[OutsourcePig] loadBuyerOptions failed', e);
    buyerOptions.value = [];
  }
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
  formRef.value?.openCreate();
}
async function handleDel(row: BizRow) {
  await proxy?.$modal.confirm(t('djs.warehouse.outsourcePig.confirm.del'));
  await delOutsourcePig(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  const range = (searchModel.purchaseDateRange as string[] | undefined) ?? [];
  proxy?.download(
    'djs/warehouse/outsourcePig/export',
    {
      purchaseDateFrom: range[0] || undefined,
      purchaseDateTo: range[1] || undefined,
      arriveTime: searchModel.arriveTime || undefined,
      supplierIds:
        Array.isArray(searchModel.supplierId) && searchModel.supplierId.length ? searchModel.supplierId.map((v: any) => String(v)) : undefined,
      buyers: Array.isArray(searchModel.buyer) && searchModel.buyer.length ? searchModel.buyer.map((v: any) => String(v)) : undefined
    },
    `outsourcePig_${Date.now()}.xlsx`
  );
}

onMounted(() => {
  loadSupplierOptions();
  loadBuyerOptions();
  fetchList();
});
</script>
