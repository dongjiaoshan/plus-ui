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
      :dict-types="['djs_return_direction', 'djs_return_status', 'djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:return"
      show-export
      :show-add="true"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="openAddDialog"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #action="{ row }">
        <el-button v-if="(row as ReturnProductVO).isConfirm === 0" type="primary" link @click="openConfirmDialog(row as ReturnProductVO)">
          {{ t('djs.warehouse.return.confirm') }}
        </el-button>
        <el-button v-if="(row as ReturnProductVO).isConfirm === 0" type="primary" link @click="openEditDialog(row as ReturnProductVO)">
          {{ t('common.edit') }}
        </el-button>
        <el-button v-if="(row as ReturnProductVO).isConfirm === 0" type="danger" link @click="handleDelete(row as ReturnProductVO)">
          {{ t('common.delete') }}
        </el-button>
        <span v-if="(row as ReturnProductVO).isConfirm === 1" class="text-gray-400">{{ t('djs.warehouse.return.confirmed') }}</span>
      </template>
    </BizTable>

    <!-- 新增 / 编辑 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formMode === 'add' ? t('djs.warehouse.return.dialogAddTitle') : t('djs.warehouse.return.dialogEditTitle')"
      destroy-on-close
      append-to-body
      width="560px"
      @closed="handleDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('djs.warehouse.return.returnDirection')" prop="returnDirection">
          <el-select v-model="form.returnDirection" style="width: 100%">
            <el-option v-for="opt in dictDirectionOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.storeId')" prop="storeId">
          <el-select v-model="form.storeId" filterable clearable placeholder="选择退货门店" style="width: 100%">
            <el-option v-for="s in storeOptions" :key="String(s.id)" :label="`${s.storeName}（${s.storeCode}）`" :value="String(s.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.productId')" prop="productId">
          <el-select v-model="form.productId" filterable clearable placeholder="选择产品" style="width: 100%" @change="onProductChange">
            <el-option v-for="p in productOptions" :key="String(p.id)" :label="`${p.productName}（${p.productUnit}）`" :value="String(p.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.productName')" prop="productName">
          <el-input v-model="form.productName" maxlength="128" placeholder="选产品后自动带出，可改" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.returnWeight')" prop="returnWeight">
          <el-input-number v-model="form.returnWeight" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.returnReason')" prop="returnReason">
          <el-input v-model="form.returnReason" type="textarea" :rows="2" maxlength="255" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认退货 -->
    <el-dialog v-model="confirmDialogVisible" :title="t('djs.warehouse.return.confirmDialogTitle')" destroy-on-close append-to-body width="480px">
      <el-form ref="confirmFormRef" :model="confirmForm" :rules="confirmRules" label-width="120px">
        <el-form-item label="退货单号">
          <span>{{ currentRow?.returnNo }}</span>
        </el-form-item>
        <el-form-item label="退货方向">
          <dict-tag :options="dictDirectionTags" :value="currentRow?.returnDirection" />
        </el-form-item>
        <el-form-item label="退货重量">
          <span>{{ currentRow?.returnWeight }} kg</span>
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.confirmWeight')" prop="confirmWeight">
          <el-input-number v-model="confirmForm.confirmWeight" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('djs.warehouse.return.remark')" prop="remark">
          <el-input v-model="confirmForm.remark" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="currentRow?.returnDirection === 'store_to_warehouse'">
          <el-alert type="info" :title="t('djs.warehouse.return.confirmStockHint')" :closable="false" />
        </el-form-item>
        <el-form-item v-else>
          <el-alert type="warning" :title="t('djs.warehouse.return.confirmPlaceholderHint')" :closable="false" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="confirmSubmitting" @click="handleConfirmSubmit">{{ t('common.confirm') }}</el-button>
          <el-button @click="confirmDialogVisible = false">{{ t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ReturnProduct" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { addReturn, confirmReturn, delReturn, exportReturn, listReturn, updateReturn } from '@/api/djs-warehouse/return';
import type { ReturnConfirmBody, ReturnProductForm, ReturnProductQuery, ReturnProductVO } from '@/api/djs-warehouse/return/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<ReturnProductVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  returnNo: undefined,
  storeId: undefined,
  productId: undefined,
  isConfirm: undefined,
  returnDirection: undefined,
  returnStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnNo', label: t('djs.warehouse.return.returnNo'), type: 'input' },
  { field: 'returnDirection', label: t('djs.warehouse.return.returnDirection'), type: 'select', dictType: 'djs_return_direction' },
  { field: 'returnStatus', label: t('djs.warehouse.return.returnStatus'), type: 'select', dictType: 'djs_return_status' },
  { field: 'isConfirm', label: t('djs.warehouse.return.isConfirm'), type: 'select', dictType: 'djs_yes_no' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnNo', label: t('djs.warehouse.return.returnNo'), minWidth: 160 },
  { prop: 'applyTime', label: t('djs.warehouse.return.applyTime'), minWidth: 160 },
  { prop: 'storeId', label: t('djs.warehouse.return.storeId'), minWidth: 100 },
  { prop: 'productName', label: t('djs.warehouse.return.productName'), minWidth: 120 },
  { prop: 'returnWeight', label: t('djs.warehouse.return.returnWeight'), minWidth: 100 },
  { prop: 'confirmWeight', label: t('djs.warehouse.return.confirmWeight'), minWidth: 100 },
  { prop: 'returnDirection', label: t('djs.warehouse.return.returnDirection'), dictType: 'djs_return_direction', minWidth: 130 },
  { prop: 'returnStatus', label: t('djs.warehouse.return.returnStatus'), dictType: 'djs_return_status', minWidth: 100 },
  { prop: 'confirmUserName', label: t('djs.warehouse.return.confirmUser'), minWidth: 100 },
  { prop: 'confirmTime', label: t('djs.warehouse.return.confirmTime'), minWidth: 160 },
  { prop: 'remark', label: t('djs.warehouse.return.remark'), minWidth: 160 }
]);

const dictDirectionOptions = [
  { label: '门店→仓库', value: 'store_to_warehouse' },
  { label: '顾客→门店', value: 'customer_to_store' },
  { label: '仓库→供应商', value: 'warehouse_to_supplier' }
];

const dictDirectionTags = dictDirectionOptions.map((o) => ({ label: o.label, value: o.value }));

// 门店 / 产品 下拉数据源（替代手输 snowflake）
const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);

async function loadStoreOptions() {
  const res: any = await listStore({ pageNum: 1, pageSize: 500 });
  storeOptions.value = res.rows ?? [];
}

async function loadProductOptions() {
  const res: any = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0 });
  productOptions.value = res.rows ?? [];
}

function onProductChange(id: string) {
  const p = productOptions.value.find((x) => String(x.id) === String(id));
  form.productName = p?.productName;
}

// 新增 / 编辑
const dialogVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();
const submitting = ref(false);
const form = reactive<ReturnProductForm>({
  productId: '',
  returnWeight: 0,
  returnDirection: 'store_to_warehouse'
});

const rules: FormRules = {
  productId: [{ required: true, message: t('djs.warehouse.return.productIdRequired'), trigger: 'blur' }],
  returnWeight: [{ required: true, message: t('djs.warehouse.return.returnWeightRequired'), trigger: 'blur' }],
  returnDirection: [{ required: true, trigger: 'change' }]
};

function openAddDialog() {
  formMode.value = 'add';
  resetForm();
  dialogVisible.value = true;
}

function openEditDialog(row: ReturnProductVO) {
  formMode.value = 'edit';
  resetForm();
  Object.assign(form, {
    id: row.id,
    storeId: row.storeId,
    productId: row.productId,
    productName: row.productName,
    returnWeight: row.returnWeight,
    returnReason: row.returnReason,
    returnDirection: row.returnDirection,
    remark: row.remark
  });
  dialogVisible.value = true;
}

function resetForm() {
  Object.assign(form, {
    id: undefined,
    storeId: undefined,
    productId: '',
    productName: undefined,
    returnWeight: 0,
    returnReason: undefined,
    returnDirection: 'store_to_warehouse',
    remark: undefined
  });
}

function handleDialogClosed() {
  formRef.value?.resetFields();
  resetForm();
}

async function handleSubmit() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    if (formMode.value === 'add') {
      await addReturn(form);
      proxy?.$modal.msgSuccess(t('djs.warehouse.return.addSuccess'));
    } else {
      await updateReturn(form);
      proxy?.$modal.msgSuccess(t('djs.warehouse.return.editSuccess'));
    }
    dialogVisible.value = false;
    await loadList();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: ReturnProductVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.return.deleteConfirm', { no: row.returnNo }));
  await delReturn(row.id!);
  proxy?.$modal.msgSuccess(t('djs.warehouse.return.deleteSuccess'));
  await loadList();
}

// 确认退货
const confirmDialogVisible = ref(false);
const confirmFormRef = ref<FormInstance>();
const confirmSubmitting = ref(false);
const currentRow = ref<ReturnProductVO | null>(null);
const confirmForm = reactive<ReturnConfirmBody>({
  confirmWeight: 0
});
const confirmRules: FormRules = {
  confirmWeight: [{ required: true, message: t('djs.warehouse.return.confirmWeightRequired'), trigger: 'blur' }]
};

function openConfirmDialog(row: ReturnProductVO) {
  currentRow.value = row;
  confirmForm.confirmWeight = row.returnWeight ?? 0;
  confirmForm.remark = undefined;
  confirmDialogVisible.value = true;
}

async function handleConfirmSubmit() {
  if (!confirmFormRef.value || !currentRow.value) return;
  try {
    await confirmFormRef.value.validate();
  } catch {
    return;
  }
  confirmSubmitting.value = true;
  try {
    await confirmReturn(currentRow.value.id!, confirmForm);
    proxy?.$modal.msgSuccess(t('djs.warehouse.return.confirmSuccess'));
    confirmDialogVisible.value = false;
    await loadList();
  } finally {
    confirmSubmitting.value = false;
  }
}

async function loadList() {
  loading.value = true;
  try {
    const params: ReturnProductQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listReturn(params);
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
  proxy?.download('/djs/warehouse/return/export', { ...searchModel }, `退货管理_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
  loadStoreOptions();
  loadProductOptions();
});
</script>
