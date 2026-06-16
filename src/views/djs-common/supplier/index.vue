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
      :dict-types="['djs_supplier_type', 'djs_supplier_status', 'djs_settle_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:common:supplier"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.view')" placement="top">
          <el-button v-hasPermi="['djs:common:supplier:list']" link type="primary" icon="View" @click="handleView(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:common:supplier:edit']" link type="primary" icon="Edit" @click="handleEdit(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:common:supplier:remove']" link type="danger" icon="Delete" @click="handleDel(row)" />
        </el-tooltip>
      </template>
    </BizTable>

    <SupplierForm ref="formRef" @success="handleFormSuccess" />
    <SupplierView ref="viewRef" />
  </div>
</template>

<script setup name="Supplier" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import SupplierForm from './components/SupplierForm.vue';
import SupplierView from './components/SupplierView.vue';
import { delSupplier, listSupplier } from '@/api/djs-common/supplier';
import type { SupplierQuery, SupplierVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const viewRef = ref<{ open: (id: number | string) => void }>();

const list = ref<SupplierVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  supplierName: undefined,
  supplierCode: undefined,
  supplierType: undefined,
  liaisonName: undefined,
  businessStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'supplierName', label: t('supplier.field.supplierName'), type: 'input' },
  { field: 'supplierCode', label: t('supplier.field.supplierCode'), type: 'input' },
  { field: 'supplierType', label: t('supplier.field.supplierType'), type: 'select', dictType: 'djs_supplier_type' },
  { field: 'liaisonName', label: t('supplier.field.liaisonName'), type: 'input' },
  { field: 'businessStatus', label: t('supplier.field.businessStatus'), type: 'select', dictType: 'djs_supplier_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'supplierCode', label: t('supplier.column.supplierCode'), width: 120, showOverflowTooltip: true },
  { prop: 'supplierName', label: t('supplier.column.supplierName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'supplierType', label: t('supplier.column.supplierType'), width: 110, align: 'center', dictType: 'djs_supplier_type' },
  { prop: 'liaisonName', label: t('supplier.column.liaisonName'), width: 120 },
  { prop: 'liaisonPhone', label: t('supplier.column.liaisonPhone'), width: 140, align: 'center' },
  { prop: 'settleType', label: t('supplier.column.settleType'), width: 100, align: 'center', dictType: 'djs_settle_type' },
  { prop: 'businessStatus', label: t('supplier.column.businessStatus'), width: 100, align: 'center', dictType: 'djs_supplier_status' },
  { prop: 'dealCount', label: t('supplier.column.dealCount'), width: 90, align: 'center' },
  { prop: 'purchaseQty', label: t('supplier.column.purchaseQty'), width: 110, align: 'center' },
  { prop: 'remark', label: t('supplier.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'updateTime', label: t('supplier.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

function buildQuery(): SupplierQuery {
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    supplierName: searchModel.supplierName || undefined,
    supplierCode: searchModel.supplierCode || undefined,
    supplierType: searchModel.supplierType || undefined,
    liaisonName: searchModel.liaisonName || undefined,
    businessStatus: searchModel.businessStatus || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listSupplier(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as SupplierVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
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
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
function handleView(row: BizRow) {
  viewRef.value?.open(row.id);
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('supplier.confirm.del', { count: ids.length }));
  await delSupplier(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
  proxy?.download('djs/common/supplier/export', buildQuery(), `supplier_${new Date().getTime()}.xlsx`);
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
