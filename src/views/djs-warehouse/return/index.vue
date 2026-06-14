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
      :dict-types="['djs_return_direction', 'djs_return_status', 'djs_yes_no', 'djs_belong_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="_rowKey"
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
        <el-button type="primary" link @click="openDetailDialog(row as ReturnStoreDailyVO)">
          {{ t('djs.warehouse.return.viewDetail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 门店当日退货明细（主从视图明细层） -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="t('djs.warehouse.return.detailDialogTitle')"
      destroy-on-close
      append-to-body
      :close-on-click-modal="true"
      width="960px"
    >
      <div v-if="currentDaily" class="mb-2 text-gray-500">{{ currentDaily.storeName }} · {{ currentDaily.returnDate }}</div>
      <el-table v-loading="detailLoading" :data="detailRows" border height="460">
        <el-table-column prop="returnCategory" :label="t('djs.warehouse.return.returnCategory')" min-width="110">
          <template #default="{ row }">
            <dict-tag :options="djs_belong_type" :value="row.returnCategory" />
          </template>
        </el-table-column>
        <el-table-column prop="returnProductCode" :label="t('djs.warehouse.return.returnProductCode')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="productName" :label="t('djs.warehouse.return.returnProduct')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="productUnit" :label="t('djs.warehouse.return.productUnit')" min-width="80" />
        <el-table-column prop="returnWeight" :label="t('djs.warehouse.return.returnWeight')" min-width="100">
          <template #default="{ row }">{{ formatWeight(row.returnWeight) }}</template>
        </el-table-column>
        <el-table-column prop="confirmWeight" :label="t('djs.warehouse.return.confirmWeight')" min-width="100">
          <template #default="{ row }">{{ formatWeight(row.confirmWeight) }}</template>
        </el-table-column>
        <el-table-column prop="weightDiff" :label="t('djs.warehouse.return.weightDiff')" min-width="100">
          <template #default="{ row }">{{ formatWeight(row.weightDiff) }}</template>
        </el-table-column>
        <el-table-column prop="confirmTime" :label="t('djs.warehouse.return.confirmTime')" min-width="160" />
        <el-table-column prop="confirmUserName" :label="t('djs.warehouse.return.confirmUser')" min-width="100" />
        <el-table-column :label="t('common.operate')" fixed="right" width="180">
          <template #default="{ row }">
            <el-button v-if="row.isConfirm === 0" type="primary" link @click="openConfirmDialog(row as ReturnProductVO)">
              {{ t('djs.warehouse.return.confirm') }}
            </el-button>
            <el-button v-if="row.isConfirm === 0" type="primary" link @click="openEditDialog(row as ReturnProductVO)">
              {{ t('common.edit') }}
            </el-button>
            <el-button v-if="row.isConfirm === 0" type="danger" link @click="handleDelete(row as ReturnProductVO)">
              {{ t('common.delete') }}
            </el-button>
            <span v-if="row.isConfirm === 1" class="text-gray-400">{{ t('djs.warehouse.return.confirmed') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新增 / 编辑 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formMode === 'add' ? t('djs.warehouse.return.dialogAddTitle') : t('djs.warehouse.return.dialogEditTitle')"
      destroy-on-close
      append-to-body
      :close-on-click-modal="true"
      width="560px"
      @closed="handleDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('djs.warehouse.return.returnDirection')" prop="returnDirection">
          <el-select v-model="form.returnDirection" style="width: 100%">
            <el-option v-for="opt in djs_return_direction" :key="opt.value" :label="opt.label" :value="opt.value" />
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
    <el-dialog
      v-model="confirmDialogVisible"
      :title="t('djs.warehouse.return.confirmDialogTitle')"
      destroy-on-close
      append-to-body
      :close-on-click-modal="true"
      width="480px"
    >
      <el-form ref="confirmFormRef" :model="confirmForm" :rules="confirmRules" label-width="120px">
        <el-form-item label="退货单号">
          <span>{{ currentRow?.returnNo }}</span>
        </el-form-item>
        <el-form-item label="退货方向">
          <dict-tag :options="djs_return_direction" :value="currentRow?.returnDirection" />
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
import { addReturn, confirmReturn, delReturn, exportReturn, listReturn, listReturnStoreDaily, updateReturn } from '@/api/djs-warehouse/return';
import type { ReturnConfirmBody, ReturnProductForm, ReturnProductQuery, ReturnProductVO, ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// ADR-0004 §2.4 Vue3 字典消费范式：弹窗下拉 / dict-tag 走全局字典（消除本地双源）
const { djs_return_direction, djs_belong_type } = toRefs<any>(proxy?.useDict('djs_return_direction', 'djs_belong_type'));

const tableRef = ref<BizTableExpose>();

// 外层 = 门店当日汇总行（图 153）；逐条明细放进「查看详情」弹窗
const list = ref<ReturnStoreDailyVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  returnDate: undefined,
  returnCategory: undefined,
  productId: undefined,
  storeId: undefined
});

// 门店 / 产品 下拉数据源（搜索筛选 + 表单共用，onMounted 加载）
const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);

// 退货产品 / 退货门店 搜索下拉选项
const productSearchOptions = computed(() => productOptions.value.map((p) => ({ label: p.productName, value: String(p.id) })));
const storeSearchOptions = computed(() => storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) })));

// 对齐原型筛选：退货日期 / 退货品类 / 退货产品 / 退货门店
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDate', label: t('djs.warehouse.return.returnDate'), type: 'daterange' },
  { field: 'returnCategory', label: t('djs.warehouse.return.returnCategory'), type: 'select', dictType: 'djs_belong_type' },
  { field: 'productId', label: t('djs.warehouse.return.returnProduct'), type: 'select', options: productSearchOptions.value },
  { field: 'storeId', label: t('djs.warehouse.return.storeId'), type: 'select', options: storeSearchOptions.value }
]);

// 图 153 外层汇总列：退货日期/退货门店/品种数/退货重量/确认重量/重量差异/确认时间/确认人
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnDate', label: t('djs.warehouse.return.returnDate'), minWidth: 120 },
  { prop: 'storeName', label: t('djs.warehouse.return.storeId'), minWidth: 130 },
  { prop: 'productKindCount', label: t('djs.warehouse.return.productKindCount'), minWidth: 90 },
  {
    prop: 'returnWeightTotal',
    label: t('djs.warehouse.return.returnWeightTotal'),
    minWidth: 100,
    formatter: (row: any) => formatWeight(row.returnWeightTotal)
  },
  {
    prop: 'confirmWeightTotal',
    label: t('djs.warehouse.return.confirmWeightTotal'),
    minWidth: 100,
    formatter: (row: any) => formatWeight(row.confirmWeightTotal)
  },
  {
    prop: 'weightDiffTotal',
    label: t('djs.warehouse.return.weightDiffTotal'),
    minWidth: 100,
    formatter: (row: any) => formatWeight(row.weightDiffTotal)
  },
  { prop: 'confirmTime', label: t('djs.warehouse.return.confirmTime'), minWidth: 160 },
  { prop: 'confirmUserName', label: t('djs.warehouse.return.confirmUser'), minWidth: 100 }
]);

// 重量列统一带 kg 单位展示（空值 —）
function formatWeight(v: number | undefined | null): string {
  return v === undefined || v === null ? '—' : `${v}kg`;
}

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

// 门店当日退货明细弹窗（主从视图明细层）
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const detailRows = ref<ReturnProductVO[]>([]);
const currentDaily = ref<ReturnStoreDailyVO | null>(null);

function openDetailDialog(row: ReturnStoreDailyVO) {
  currentDaily.value = row;
  detailDialogVisible.value = true;
  loadDetailRows();
}

async function loadDetailRows() {
  if (!currentDaily.value) return;
  detailLoading.value = true;
  try {
    const res = await listReturn({
      storeId: currentDaily.value.storeId,
      applyDateFrom: currentDaily.value.returnDate,
      applyDateTo: currentDaily.value.returnDate,
      pageNum: 1,
      pageSize: 500
    });
    detailRows.value = (res as any).rows ?? [];
  } finally {
    detailLoading.value = false;
  }
}

// 明细弹窗内操作（确认 / 编辑 / 删除）后刷新明细 + 外层汇总
async function refreshAfterDetailMutation() {
  await loadDetailRows();
  await loadList();
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
    // 编辑来自明细弹窗 → 同步刷新明细 + 汇总；新增来自外层 → 只刷汇总
    await (detailDialogVisible.value ? refreshAfterDetailMutation() : loadList());
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: ReturnProductVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.return.deleteConfirm', { no: row.returnNo }));
  await delReturn(row.id!);
  proxy?.$modal.msgSuccess(t('djs.warehouse.return.deleteSuccess'));
  await refreshAfterDetailMutation();
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
    await refreshAfterDetailMutation();
  } finally {
    confirmSubmitting.value = false;
  }
}

// searchModel → 后端 query（退货日期 daterange 拆成 applyDateFrom/applyDateTo）
function buildQueryParams(): ReturnProductQuery {
  const range = (searchModel.returnDate as string[] | undefined) ?? [];
  return {
    returnCategory: searchModel.returnCategory || undefined,
    productId: searchModel.productId || undefined,
    storeId: searchModel.storeId || undefined,
    applyDateFrom: range[0] || undefined,
    applyDateTo: range[1] || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const params: ReturnProductQuery = {
      ...buildQueryParams(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listReturnStoreDaily(params);
    const rows: ReturnStoreDailyVO[] = (res as any).rows ?? [];
    rows.forEach((r) => {
      r._rowKey = `${r.returnDate}|${r.storeId ?? ''}`;
    });
    list.value = rows;
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

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/return/export', { ...buildQueryParams() }, `退货记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
  loadStoreOptions();
  loadProductOptions();
});
</script>
