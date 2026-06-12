<template>
  <div class="return-record-list">
    <!-- 退回记录（只读 + 仓库确认入库）。猪肉/果蔬 tab 按产品归属过滤 -->
    <el-tabs v-model="activeTab" class="return-tabs" @tab-change="handleTabChange">
      <el-tab-pane :label="t('storeReturn.tab.pork')" name="pork" />
      <el-tab-pane :label="t('storeReturn.tab.vegetable')" name="vegetable" />
    </el-tabs>
    <BizTable
      ref="tableRef"
      :data="displayList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_store_return_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :selectable="false"
      :show-add="false"
      :show-row-edit="false"
      :show-export="true"
      perm-prefix="djs:store:return"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button
          v-if="row.returnStatus === 'pending'"
          v-hasPermi="['djs:store:return:confirm']"
          link
          type="primary"
          icon="Select"
          @click="handleConfirm(row)"
        >
          {{ t('storeReturn.action.confirm') }}
        </el-button>
        <span v-else class="text-muted">—</span>
      </template>
    </BizTable>

    <!-- 仓库确认实收对话框（点蒙层可关，Element Plus 默认） -->
    <el-dialog v-model="confirmVisible" :title="t('storeReturn.dialog.confirm')" width="480px" append-to-body @closed="resetConfirm">
      <el-form ref="confirmFormRef" :model="confirmForm" :rules="confirmRules" label-width="110px">
        <el-form-item :label="t('storeReturn.column.productName')">
          <span>{{ confirmRow?.productName }}（{{ t('storeReturn.column.goodsWeight') }} {{ confirmRow?.goodsWeight ?? '-' }}）</span>
        </el-form-item>
        <el-form-item :label="t('storeReturn.field.location')" prop="locationId">
          <el-select v-model="confirmForm.locationId" filterable :placeholder="t('storeReturn.placeholder.location')" style="width: 100%">
            <el-option v-for="l in locationOptions" :key="l.id" :label="l.locationName" :value="String(l.id)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('storeReturn.column.receivedQty')" prop="receivedQty">
          <el-input-number v-model="confirmForm.receivedQty" :min="0.01" :precision="2" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('storeReturn.column.receivedWeight')" prop="receivedWeight">
          <el-input-number v-model="confirmForm.receivedWeight" :min="0" :precision="2" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="submitConfirm">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StoreReturnRecordList" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStoreReturn, confirmStoreReturn } from '@/api/djs-store/return';
import type { StoreReturnConfirmForm, StoreReturnQuery, StoreReturnVO } from '@/api/djs-store/return/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const tableRef = ref<BizTableExpose>();

const list = ref<StoreReturnVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const productOptions = ref<ProductInfoVO[]>([]);
const locationOptions = ref<LocationInfoVO[]>([]);

const activeTab = ref<'pork' | 'vegetable'>('pork');
const PORK_BELONG_TYPES = ['pork', 'white_bar'];

// 产品 snowflake id → { belongType, productCode(业务码), productSpec, productUnit }
const productMetaMap = computed(() => {
  const m = new Map<string, { belongType?: string; productCode?: string; productSpec?: string; productUnit?: string }>();
  productOptions.value.forEach((p) => {
    m.set(String(p.id), { belongType: p.belongType, productCode: p.productId, productSpec: p.productSpec, productUnit: p.productUnit });
  });
  return m;
});

function categoryOf(belongType?: string): 'pork' | 'vegetable' {
  return belongType && PORK_BELONG_TYPES.includes(belongType) ? 'pork' : 'vegetable';
}

// 列表行补充 产品类型/代码/单位（从产品主数据 join），并按当前 tab 过滤
const displayList = computed<StoreReturnVO[]>(() => {
  return list.value
    .map((row) => {
      const meta = productMetaMap.value.get(String(row.productId));
      const cat = categoryOf(meta?.belongType);
      return {
        ...row,
        productCode: meta?.productCode,
        unit: meta?.productUnit,
        productCategory: cat,
        productTypeLabel: cat === 'pork' ? t('storeReturn.tab.pork') : t('storeReturn.tab.vegetable')
      } as StoreReturnVO & { productCategory: 'pork' | 'vegetable'; productTypeLabel: string; unit?: string };
    })
    .filter((row) => (row as { productCategory: string }).productCategory === activeTab.value);
});

const searchModel = reactive<Record<string, unknown>>({
  returnStatus: undefined,
  productName: undefined,
  returnDateFrom: undefined,
  returnDateTo: undefined
});

// 搜索：退货日期 / 产品类型 / 产品名称 / 退货状态（产品类型走 tab，不入搜索栏）
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDateFrom', label: t('storeReturn.field.returnDateFrom'), type: 'date' },
  { field: 'returnDateTo', label: t('storeReturn.field.returnDateTo'), type: 'date' },
  { field: 'productName', label: t('storeReturn.column.productName'), type: 'input' },
  { field: 'returnStatus', label: t('storeReturn.column.returnStatus'), type: 'select', dictType: 'djs_store_return_status' }
]);

// 原型「退回记录」列：退回日期/产品类型/产品代码/产品名称/退货量/单位/货物重量/仓库实收量/仓库实收重量/退货状态
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnDate', label: t('storeReturn.column.returnDate'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'productTypeLabel', label: t('storeReturn.column.productType'), width: 110, align: 'center' },
  { prop: 'productCode', label: t('storeReturn.column.productCode'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'productName', label: t('storeReturn.column.productName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'returnQuantity', label: t('storeReturn.column.returnQuantity'), width: 90, align: 'right' },
  { prop: 'unit', label: t('storeReturn.column.unit'), width: 70, align: 'center' },
  { prop: 'goodsWeight', label: t('storeReturn.column.goodsWeight'), width: 100, align: 'right' },
  { prop: 'receivedQty', label: t('storeReturn.column.receivedQty'), width: 100, align: 'right' },
  { prop: 'receivedWeight', label: t('storeReturn.column.receivedWeight'), width: 110, align: 'right' },
  { prop: 'returnStatus', label: t('storeReturn.column.returnStatus'), width: 110, align: 'center', dictType: 'djs_store_return_status' }
]);

async function loadProductOptions() {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    productOptions.value = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[ReturnRecordList] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 200 });
    locationOptions.value = ((res as unknown as { rows?: LocationInfoVO[]; data?: LocationInfoVO[] }).rows ?? []) as LocationInfoVO[];
  } catch (e) {
    console.warn('[ReturnRecordList] loadLocationOptions failed', e);
    locationOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreReturnQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      returnStatus: (searchModel.returnStatus as string) || undefined,
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

function handleTabChange() {
  tableRef.value?.clearSelection?.();
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

// ---------- 仓库确认实收 ----------
const confirmVisible = ref(false);
const confirmLoading = ref(false);
const confirmFormRef = ref<FormInstance>();
const confirmRow = ref<(StoreReturnVO & { unit?: string }) | null>(null);
const confirmForm = reactive<StoreReturnConfirmForm>({ id: undefined, locationId: undefined, receivedQty: undefined, receivedWeight: undefined });

const confirmRules = computed<FormRules>(() => ({
  locationId: [{ required: true, message: t('storeReturn.placeholder.location'), trigger: 'change' }],
  receivedQty: [{ required: true, message: t('storeReturn.rule.receivedQty'), trigger: 'blur' }]
}));

function resetConfirm() {
  confirmRow.value = null;
  Object.assign(confirmForm, { id: undefined, locationId: undefined, receivedQty: undefined, receivedWeight: undefined });
  confirmFormRef.value?.clearValidate();
}

function handleConfirm(row: BizRow) {
  const r = row as unknown as StoreReturnVO & { unit?: string };
  confirmRow.value = r;
  Object.assign(confirmForm, {
    id: r.id,
    locationId: undefined,
    receivedQty: r.returnQuantity,
    receivedWeight: r.goodsWeight
  });
  confirmVisible.value = true;
}

async function submitConfirm() {
  await confirmFormRef.value?.validate();
  confirmLoading.value = true;
  try {
    await confirmStoreReturn(confirmForm);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    confirmVisible.value = false;
    fetchList();
  } finally {
    confirmLoading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadProductOptions(), loadLocationOptions()]);
  fetchList();
});
</script>

<style lang="scss" scoped>
.text-muted {
  color: #c0c4cc;
}
</style>
