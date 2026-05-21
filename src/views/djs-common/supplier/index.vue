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
      :dict-types="['djs_supplier_type', 'sys_normal_disable']"
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
    />

    <SupplierForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="Supplier" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import SupplierForm from './components/SupplierForm.vue';
import { delSupplier, listSupplier } from '@/api/djs-common/supplier';
import type { SupplierQuery, SupplierVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<SupplierVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  supplierName: undefined,
  supplierType: undefined,
  contactPhone: undefined,
  businessStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'supplierName', label: t('supplier.field.supplierName'), type: 'input' },
  { field: 'supplierType', label: t('supplier.field.supplierType'), type: 'select', dictType: 'djs_supplier_type' },
  { field: 'contactPhone', label: t('supplier.field.contactPhone'), type: 'input' },
  { field: 'businessStatus', label: t('supplier.field.businessStatus'), type: 'select', dictType: 'sys_normal_disable' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'supplierCode', label: t('supplier.column.supplierCode'), width: 140, showOverflowTooltip: true },
  { prop: 'supplierName', label: t('supplier.column.supplierName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'supplierType', label: t('supplier.column.supplierType'), width: 100, align: 'center', dictType: 'djs_supplier_type' },
  { prop: 'contactName', label: t('supplier.column.contactName'), width: 120 },
  { prop: 'contactPhone', label: t('supplier.column.contactPhone'), width: 140, align: 'center' },
  { prop: 'address', label: t('supplier.column.address'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'businessStatus', label: t('supplier.column.businessStatus'), width: 100, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'createTime', label: t('supplier.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: SupplierQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      supplierName: searchModel.supplierName || undefined,
      supplierType: searchModel.supplierType || undefined,
      contactPhone: searchModel.contactPhone || undefined,
      businessStatus: searchModel.businessStatus === undefined || searchModel.businessStatus === '' ? undefined : Number(searchModel.businessStatus)
    };
    const res = await listSupplier(query);
    list.value = (res.rows ?? res.data ?? []) as SupplierVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('supplier.confirm.del', { count: ids.length }));
  await delSupplier(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/common/supplier/export',
    {
      supplierName: searchModel.supplierName || undefined,
      supplierType: searchModel.supplierType || undefined,
      contactPhone: searchModel.contactPhone || undefined,
      businessStatus: searchModel.businessStatus === undefined || searchModel.businessStatus === '' ? undefined : Number(searchModel.businessStatus)
    },
    `supplier_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
