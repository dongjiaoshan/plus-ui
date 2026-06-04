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
      :selectable="false"
      :show-row-edit="false"
      :show-export="true"
      perm-prefix="djs:store:return"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:store:return:edit']" link type="primary" icon="Edit" @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button v-hasPermi="['djs:store:return:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </BizTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" append-to-body @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-alert v-if="isEdit" :title="t('storeReturn.tip.editLock')" type="info" :closable="false" show-icon class="mb-2" />
        <el-form-item :label="t('storeReturn.field.store')" prop="storeId">
          <el-select v-model="form.storeId" clearable filterable :placeholder="t('storeReturn.placeholder.store')" style="width: 100%">
            <el-option v-for="s in storeOptions" :key="s.id" :label="s.storeName" :value="String(s.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.product')" prop="productId">
          <el-select v-model="form.productId" filterable :disabled="isEdit" :placeholder="t('storeReturn.placeholder.product')" style="width: 100%">
            <el-option v-for="p in productOptions" :key="p.id" :label="p.productName" :value="String(p.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.location')" prop="locationId">
          <el-select v-model="form.locationId" filterable :disabled="isEdit" :placeholder="t('storeReturn.placeholder.location')" style="width: 100%">
            <el-option v-for="l in locationOptions" :key="l.id" :label="l.locationName" :value="String(l.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.returnQuantity')" prop="returnQuantity">
          <el-input-number v-model="form.returnQuantity" :min="0.01" :precision="2" :step="1" :disabled="isEdit" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.returnReason')" prop="returnReason">
          <el-input v-model="form.returnReason" type="textarea" :rows="2" maxlength="255" :placeholder="t('storeReturn.placeholder.returnReason')" />
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.returnDate')" prop="returnDate">
          <el-date-picker
            v-model="form.returnDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="t('storeReturn.placeholder.returnDate')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StoreReturn" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStoreReturn, addStoreReturn, updateStoreReturn, delStoreReturn, getStoreReturn } from '@/api/djs-store/return';
import type { StoreReturnForm, StoreReturnQuery, StoreReturnVO } from '@/api/djs-store/return/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const tableRef = ref<BizTableExpose>();
const formRef = ref<FormInstance>();

const list = ref<StoreReturnVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);
const locationOptions = ref<LocationInfoVO[]>([]);

const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const dialogTitle = computed(() => (isEdit.value ? t('storeReturn.dialog.edit') : t('storeReturn.dialog.add')));

const defaultForm = (): StoreReturnForm => ({
  id: undefined,
  returnDirection: 'customer_to_store',
  storeId: undefined,
  productId: undefined,
  locationId: undefined,
  returnQuantity: undefined,
  returnReason: undefined,
  traceCode: undefined,
  returnDate: undefined,
  memberId: undefined,
  remark: undefined
});
const form = reactive<StoreReturnForm>(defaultForm());

const rules = computed<FormRules>(() => ({
  storeId: [{ required: true, message: t('storeReturn.placeholder.store'), trigger: 'change' }],
  productId: [{ required: true, message: t('storeReturn.rule.product'), trigger: 'change' }],
  locationId: [{ required: true, message: t('storeReturn.rule.location'), trigger: 'change' }],
  returnQuantity: [
    { required: true, message: t('storeReturn.rule.returnQuantity'), trigger: 'blur' },
    { type: 'number', min: 0.01, message: t('storeReturn.rule.returnQuantityMin'), trigger: 'blur' }
  ]
}));

const searchModel = reactive<Record<string, unknown>>({
  returnNo: undefined,
  storeId: undefined,
  productId: undefined,
  returnDirection: undefined,
  returnDateFrom: undefined,
  returnDateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnNo', label: t('storeReturn.field.returnNo'), type: 'input' },
  {
    field: 'storeId',
    label: t('storeReturn.field.store'),
    type: 'select',
    options: storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) }))
  },
  { field: 'returnDateFrom', label: t('storeReturn.field.returnDateFrom'), type: 'date' },
  { field: 'returnDateTo', label: t('storeReturn.field.returnDateTo'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnNo', label: t('storeReturn.column.returnNo'), width: 170, showOverflowTooltip: true },
  { prop: 'storeName', label: t('storeReturn.column.storeName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'productName', label: t('storeReturn.column.productName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'locationName', label: t('storeReturn.column.locationName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'returnQuantity', label: t('storeReturn.column.returnQuantity'), width: 100, align: 'right' },
  { prop: 'returnReason', label: t('storeReturn.column.returnReason'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'returnDate', label: t('storeReturn.column.returnDate'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'operatorName', label: t('storeReturn.column.operatorName'), width: 100, align: 'center' },
  { prop: 'createTime', label: t('storeReturn.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreReturn] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadProductOptions() {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    productOptions.value = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[StoreReturn] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 200 });
    locationOptions.value = ((res as unknown as { rows?: LocationInfoVO[]; data?: LocationInfoVO[] }).rows ?? []) as LocationInfoVO[];
  } catch (e) {
    console.warn('[StoreReturn] loadLocationOptions failed', e);
    locationOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreReturnQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      returnNo: (searchModel.returnNo as string) || undefined,
      storeId: (searchModel.storeId as string) || undefined,
      productId: (searchModel.productId as string) || undefined,
      returnDirection: (searchModel.returnDirection as string) || undefined,
      returnDateFrom: (searchModel.returnDateFrom as string) || undefined,
      returnDateTo: (searchModel.returnDateTo as string) || undefined
    };
    const res = await listStoreReturn(query);
    list.value = (res.rows ?? res.data ?? []) as StoreReturnVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
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
function handleExport(query?: Record<string, unknown>) {
  proxy?.download('djs/store/return/export', { ...(query ?? {}) }, `store_return_${new Date().getTime()}.xlsx`);
}

function resetForm() {
  Object.assign(form, defaultForm());
  formRef.value?.clearValidate();
}

function handleAdd() {
  isEdit.value = false;
  Object.assign(form, defaultForm());
  dialogVisible.value = true;
}

async function handleEdit(row: BizRow) {
  isEdit.value = true;
  const res = await getStoreReturn(String(row.id));
  const vo = res.data as StoreReturnVO;
  Object.assign(form, {
    id: vo.id,
    returnDirection: vo.returnDirection,
    storeId: vo.storeId,
    productId: vo.productId,
    locationId: vo.locationId,
    returnQuantity: vo.returnQuantity,
    returnReason: vo.returnReason,
    traceCode: vo.traceCode,
    returnDate: vo.returnDate,
    memberId: vo.memberId,
    remark: vo.remark
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await updateStoreReturn(form);
    } else {
      await addStoreReturn(form);
    }
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    dialogVisible.value = false;
    fetchList();
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(row: BizRow) {
  await proxy?.$modal.confirm(t('storeReturn.confirm.delete', { no: row.returnNo }));
  await delStoreReturn(String(row.id));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

onMounted(async () => {
  await Promise.all([loadStoreOptions(), loadProductOptions(), loadLocationOptions()]);
  fetchList();
});
</script>
