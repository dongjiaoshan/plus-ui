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
      row-key="id"
      selectable
      :show-row-edit="false"
      perm-prefix="djs:storeSale"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @page-change="handlePageChange"
    >
      <template #toolbar-extra>
        <el-button v-hasPermi="['djs:storeSale:import']" type="info" plain icon="Upload" @click="openImport">
          {{ t('storeOperation.sale.import') }}
        </el-button>
        <el-button v-hasPermi="['djs:storeSale:import']" plain icon="Download" @click="downloadTemplate">
          {{ t('storeOperation.sale.downloadTemplate') }}
        </el-button>
      </template>
      <template #cell-source="{ row }">
        <el-tag v-if="row.source === 'manual'" type="primary">{{ t('storeOperation.sale.sourceManual') }}</el-tag>
        <el-tag v-else type="info">{{ t('storeOperation.sale.sourceExcel') }}</el-tag>
      </template>
    </BizTable>

    <SaleRecordForm ref="formRef" :store-options="storeOptions" @success="fetchList" />

    <!-- Excel 导入对话框 -->
    <el-dialog v-model="importVisible" :title="t('storeOperation.sale.importTitle')" width="460px" append-to-body>
      <el-form label-width="90px">
        <el-form-item :label="t('storeOperation.sale.store')" required>
          <el-select v-model="importStoreId" :placeholder="t('storeOperation.sale.storePlaceholder')" filterable style="width: 100%">
            <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeOperation.sale.file')">
          <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="uploadHeaders"
            :action="importUrl"
            :data="{ storeId: importStoreId }"
            :disabled="!importStoreId"
            :auto-upload="false"
            :on-progress="() => (importing = true)"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            drag
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">{{ t('storeOperation.sale.uploadHint') }}</div>
          </el-upload>
          <div class="mt-2 text-xs text-gray-400">{{ t('storeOperation.sale.importTip') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="importing" :disabled="!importStoreId" @click="submitImport">
          {{ t('storeOperation.sale.confirmImport') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StoreSaleRecord" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import SaleRecordForm from './components/SaleRecordForm.vue';
import { listStoreSale, removeStoreSale, storeSaleImportUrl } from '@/api/djs-store/operation/sale';
import type { StoreSaleRecordQuery, StoreSaleRecordVO } from '@/api/djs-store/operation/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { globalHeaders } from '@/utils/request';
import type { UploadInstance, UploadProps } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void }>();
const uploadRef = ref<UploadInstance>();

const list = ref<StoreSaleRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const storeOptions = ref<StoreVO[]>([]);

const importVisible = ref(false);
const importStoreId = ref<string>('');
const importing = ref(false);
const importUrl = storeSaleImportUrl;
const uploadHeaders = globalHeaders();

const searchModel = reactive<Record<string, unknown>>({
  storeId: undefined,
  source: undefined,
  saleDateFrom: undefined,
  saleDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'storeId',
    label: t('storeOperation.sale.store'),
    type: 'select',
    options: storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) }))
  },
  { field: 'source', label: t('storeOperation.sale.source'), type: 'select', dictType: 'djs_sale_source' },
  { field: 'saleDateFrom', label: t('storeOperation.sale.saleDateFrom'), type: 'date' },
  { field: 'saleDateTo', label: t('storeOperation.sale.saleDateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'storeName', label: t('storeOperation.sale.column.storeName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('storeOperation.sale.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'saleDate', label: t('storeOperation.sale.column.saleDate'), width: 110, align: 'center' },
  { prop: 'saleQty', label: t('storeOperation.sale.column.saleQty'), width: 90, align: 'right' },
  { prop: 'saleUnit', label: t('storeOperation.sale.column.saleUnit'), width: 70, align: 'center' },
  { prop: 'saleAmount', label: t('storeOperation.sale.column.saleAmount'), width: 110, align: 'right' },
  { prop: 'source', label: t('storeOperation.sale.column.source'), width: 100, align: 'center' },
  { prop: 'operatorName', label: t('storeOperation.sale.column.operator'), width: 100, align: 'center' },
  { prop: 'createTime', label: t('storeOperation.sale.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreSale] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreSaleRecordQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      storeId: (searchModel.storeId as string) || undefined,
      source: (searchModel.source as StoreSaleRecordQuery['source']) || undefined,
      saleDateFrom: (searchModel.saleDateFrom as string) || undefined,
      saleDateTo: (searchModel.saleDateTo as string) || undefined
    };
    const res = await listStoreSale(query);
    list.value = (res.rows ?? res.data ?? []) as StoreSaleRecordVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, unknown>) {
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
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => String(r.id)) : [String(rowOrRows.id)];
  await proxy?.$modal.confirm(t('storeOperation.sale.confirmDel', { count: ids.length }));
  await removeStoreSale(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

function openImport() {
  importStoreId.value = (searchModel.storeId as string) || (storeOptions.value[0] ? String(storeOptions.value[0].id) : '');
  importVisible.value = true;
}
function submitImport() {
  if (!importStoreId.value) return;
  uploadRef.value?.submit();
}
const handleImportSuccess: UploadProps['onSuccess'] = (response) => {
  importing.value = false;
  uploadRef.value?.clearFiles();
  const res = response as { code?: number; msg?: string; data?: string };
  if (res.code === 200) {
    proxy?.$modal.msgSuccess(res.data ?? res.msg ?? t('common.opSuccess'));
    importVisible.value = false;
    fetchList();
  } else {
    proxy?.$modal.msgError(res.msg ?? t('storeOperation.sale.importFail'));
  }
};
const handleImportError: UploadProps['onError'] = () => {
  importing.value = false;
  proxy?.$modal.msgError(t('storeOperation.sale.importFail'));
};
function downloadTemplate() {
  proxy?.download('djs/store/sale/importTemplate', {}, `store_sale_template_${new Date().getTime()}.xlsx`);
}

onMounted(async () => {
  await loadStoreOptions();
  fetchList();
});
</script>
