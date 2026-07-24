<template>
  <div class="p-2">
    <!--
      STORE-RETURN-UNIFY-001：仓库「退货记录」统一读门店退回真相源 t_store_return（门店退货→仓库确认入库）。
      本页只读（master-detail 查看）：门店发起退回(pending) → 仓库工人在小程序「接受」确认入库 → 此处可见记录。
      确认动作在小程序端（mp 仓库 > 分拣发货 > 退货管理），admin 不在此确认（避免双确认入口）。
    -->
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
      row-key="_rowKey"
      perm-prefix="djs:warehouse:return"
      :show-add="false"
      show-export
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #action="{ row }">
        <el-button type="primary" link @click="openDetailDialog(row as ReturnStoreDailyVO)">
          {{ t('djs.warehouse.return.viewDetail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 门店当日退回明细（主从视图明细层，只读） -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="t('djs.warehouse.return.detailDialogTitle')"
      destroy-on-close
      append-to-body
      :close-on-click-modal="true"
      width="1000px"
    >
      <div v-if="currentDaily" class="mb-2 text-gray-500">{{ currentDaily.storeName }} · {{ currentDaily.returnDate }}</div>
      <el-table v-loading="detailLoading" :data="detailRows" border height="460">
        <el-table-column prop="productName" :label="t('djs.warehouse.return.returnProduct')" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="returnQuantity" :label="t('storeReturn.column.returnQuantity')" min-width="90" align="center">
          <template #default="{ row }">{{ formatQtyByUnit(row.returnQuantity, row.productUnit) || '—' }}</template>
        </el-table-column>
        <el-table-column prop="productUnit" :label="t('storeReturn.column.unit')" min-width="80" align="center" />
        <el-table-column prop="goodsWeight" :label="t('storeReturn.column.storeReturnWeight')" min-width="120" align="center">
          <template #default="{ row }">{{ formatStoreReturnWeight(row) }}</template>
        </el-table-column>
        <el-table-column prop="receivedWeight" :label="t('storeReturn.column.receivedWeight')" min-width="110" align="center">
          <template #default="{ row }">{{ formatWeight(row.receivedWeight) }}</template>
        </el-table-column>
        <el-table-column prop="returnStatus" :label="t('storeReturn.column.returnStatus')" min-width="110" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_store_return_status" :value="row.returnStatus" />
          </template>
        </el-table-column>
        <el-table-column prop="locationName" :label="t('storeReturn.column.returnLocation')" min-width="120" align="center">
          <template #default="{ row }">{{ row.locationName || '—' }}</template>
        </el-table-column>
        <el-table-column prop="confirmTime" :label="t('djs.warehouse.return.confirmTime')" min-width="160" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="WarehouseStoreReturnRecord" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listReturn, listReturnStoreDaily } from '@/api/djs-warehouse/return';
import type { ReturnProductQuery, ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';
import type { StoreReturnVO } from '@/api/djs-store/return/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { lastMonthRange } from '@/utils/ruoyi';
import { formatQtyByUnit, isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 明细状态走门店退回状态字典（pending=待仓库确认 / received=已入库）
const { djs_store_return_status } = toRefs<any>(proxy?.useDict('djs_store_return_status'));

const tableRef = ref<BizTableExpose>();

// 外层 = 门店当日退回汇总行；逐条明细放进「查看详情」弹窗
const list = ref<ReturnStoreDailyVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 退货记录默认查近一月（退回日期 daterange 回显 [今天-1月, 今天]）；重置清空即展示全部
// R70 退回产品 / 退回门店下拉多选 → 默认空数组
const searchModel = reactive<Record<string, any>>({
  returnDate: lastMonthRange(),
  productId: [],
  storeId: []
});

// 门店 / 产品 下拉数据源（搜索筛选用，onMounted 加载）
const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);
const productSearchOptions = computed(() => productOptions.value.map((p) => ({ label: p.productName, value: String(p.id) })));
const storeSearchOptions = computed(() => storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) })));

// 筛选：退回日期 / 退回产品 / 退回门店
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDate', label: t('djs.warehouse.return.returnDate'), type: 'daterange' },
  { field: 'productId', label: t('djs.warehouse.return.returnProduct'), type: 'select', multiple: true, options: productSearchOptions.value },
  { field: 'storeId', label: t('djs.warehouse.return.storeId'), type: 'select', multiple: true, options: storeSearchOptions.value }
]);

// 外层汇总列：退回日期/退回门店/品种数/退回重量/确认重量/重量差异/确认时间/确认人
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnDate', label: t('djs.warehouse.return.returnDate'), minWidth: 120 },
  { prop: 'storeName', label: t('djs.warehouse.return.storeId'), minWidth: 130 },
  { prop: 'productKindCount', label: t('djs.warehouse.return.productKindCount'), minWidth: 90 },
  { prop: 'returnWeightTotal', label: t('djs.warehouse.return.returnWeightTotal'), minWidth: 100, formatter: (row: any) => formatWeight(row.returnWeightTotal) },
  { prop: 'confirmWeightTotal', label: t('djs.warehouse.return.confirmWeightTotal'), minWidth: 100, formatter: (row: any) => formatWeight(row.confirmWeightTotal) },
  { prop: 'weightDiffTotal', label: t('djs.warehouse.return.weightDiffTotal'), minWidth: 100, formatter: (row: any) => formatWeight(row.weightDiffTotal) },
  { prop: 'nonWeightReturnWeightTotal', label: t('djs.warehouse.return.nonWeightReturnWeightTotal'), minWidth: 130, formatter: (row: any) => formatWeight(row.nonWeightReturnWeightTotal) },
  { prop: 'confirmTime', label: t('djs.warehouse.return.confirmTime'), minWidth: 160 },
  { prop: 'confirmUserName', label: t('djs.warehouse.return.confirmUser'), minWidth: 100 }
]);

// 重量列统一带 kg 单位展示（空值 —）
function formatWeight(v: number | undefined | null): string {
  return v === undefined || v === null ? '—' : `${v}kg`;
}

// 门店退回重量：份/盒等非 kg 单位产品门店未录重量（空或 0）→ 显 —（未录入），kg 产品保持原样（row70）
function formatStoreReturnWeight(row: StoreReturnVO): string {
  const w = row.goodsWeight;
  if (!isKgUnit(row.productUnit) && (w === undefined || w === null || Number(w) === 0)) {
    return '—';
  }
  return formatWeight(w);
}

async function loadStoreOptions() {
  const res: any = await listStore({ pageNum: 1, pageSize: 500 });
  storeOptions.value = res.rows ?? [];
}

async function loadProductOptions() {
  const res: any = await listProduct({ pageNum: 1, pageSize: 500, productStatus: 0 });
  productOptions.value = res.rows ?? [];
}

// 门店当日退回明细弹窗（主从视图明细层，只读）
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const detailRows = ref<StoreReturnVO[]>([]);
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
      returnDateFrom: currentDaily.value.returnDate,
      returnDateTo: currentDaily.value.returnDate,
      pageNum: 1,
      pageSize: 500
    });
    detailRows.value = ((res as any).rows ?? []) as StoreReturnVO[];
  } finally {
    detailLoading.value = false;
  }
}

// searchModel → 后端 query（退回日期 daterange 拆成 returnDateFrom/returnDateTo）
// R70 退回产品 / 退回门店多选 → 复数 productIds / storeIds（后端 IN），删单值发送（单值 fallback 在后端保留）
function buildQueryParams(): ReturnProductQuery {
  const range = (searchModel.returnDate as string[] | undefined) ?? [];
  const productIds =
    Array.isArray(searchModel.productId) && searchModel.productId.length ? searchModel.productId.map((v: number | string) => String(v)) : undefined;
  const storeIds =
    Array.isArray(searchModel.storeId) && searchModel.storeId.length ? searchModel.storeId.map((v: number | string) => String(v)) : undefined;
  return {
    productIds,
    storeIds,
    returnDateFrom: range[0] || undefined,
    returnDateTo: range[1] || undefined
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

// 导出外层「门店 + 当日」汇总（与列表同口径，走 store-daily 导出端点）
function handleExport() {
  proxy?.download('djs/store/return/store-daily/export', buildQueryParams(), `退货记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
  loadStoreOptions();
  loadProductOptions();
});
</script>
