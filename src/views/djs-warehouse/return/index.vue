<template>
  <div class="p-2">
    <!--
      STORE-RETURN-UNIFY-001：仓库「退回记录」统一读门店退回真相源 t_store_return（门店退回→仓库确认入库）。
      本页只读（master-detail 查看）：门店发起退回(pending) → 仓库工人在小程序「接受」确认入库 → 此处可见记录。
      确认动作在小程序端（mp 仓库 > 分拣发货 > 退回管理），admin 不在此确认（避免双确认入口）。
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
      <!--
        确认进度 = 入库数/丢弃数（row203）。确认时间 / 确认人仍取「最近一条已确认行」。
        还有行未确认时标警告色 + tooltip（tooltip 里给出总条数与待确认条数），避免看成已经完事。
      -->
      <template #cell-confirmProgress="{ row }">
        <el-tooltip v-if="isPartiallyConfirmed(row as ReturnStoreDailyVO)" :content="confirmProgressTip(row as ReturnStoreDailyVO)">
          <span class="confirm-progress--partial">{{ formatConfirmProgress(row as ReturnStoreDailyVO) }}</span>
        </el-tooltip>
        <span v-else>{{ formatConfirmProgress(row as ReturnStoreDailyVO) }}</span>
      </template>

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
        <el-table-column prop="receivedWeight" :label="t('storeReturn.column.receivedWeight')" min-width="110" align="center">
          <template #default="{ row }">{{ formatReceivedWeight(row) }}</template>
        </el-table-column>
        <el-table-column prop="quantityDiff" :label="t('djs.warehouse.return.quantityDiff')" min-width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'qty-diff': hasQuantityDiff(row) }">{{ formatQuantityDiff(row) }}</span>
          </template>
        </el-table-column>
        <!-- row204：差异量右侧「是否丢弃」。退回入库→否，产品丢弃→是；未确认行还没有处置结论，显 '—' -->
        <el-table-column prop="isDiscard" :label="t('djs.warehouse.return.isDiscard')" min-width="100" align="center">
          <template #default="{ row }">{{ formatDiscard(row) }}</template>
        </el-table-column>
        <el-table-column prop="returnStatus" :label="t('storeReturn.column.returnStatus')" min-width="110" align="center">
          <template #default="{ row }">
            <!-- row204：丢弃行不能沿用字典的「已入库」—— 它压根没进库存，
                 那样会和同一行的「是否丢弃=是」自相矛盾。丢弃单独出标签。 -->
            <el-tag v-if="row.returnStatus === 'received' && Number(row.isDiscard) === 1" type="info">
              {{ t('djs.warehouse.return.statusDiscarded') }}
            </el-tag>
            <dict-tag v-else :options="djs_store_return_status" :value="row.returnStatus" />
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
import { formatQtyByUnit, formatReceivedAmount, isKgUnit, returnMetricUnit } from '@/utils/weight';
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

// 退回记录默认查近一月（退回日期 daterange 回显 [今天-1月, 今天]）；重置清空即展示全部
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
  { prop: 'confirmProgress', label: t('djs.warehouse.return.confirmProgress'), minWidth: 100 },
  { prop: 'confirmTime', label: t('djs.warehouse.return.confirmTime'), minWidth: 160 },
  { prop: 'confirmUserName', label: t('djs.warehouse.return.confirmUser'), minWidth: 100 }
]);

// 空值 / 不适用占位符（与本页其余列一致）
const EMPTY_TEXT = '—';

// 重量列统一带 kg 单位展示（空值 —）
function formatWeight(v: number | undefined | null): string {
  return v === undefined || v === null ? EMPTY_TEXT : `${v}kg`;
}

// 仓库实收量（甲方 row14 统一模型）：计量单位由**原材料单位**决定（原材料单位为空则看产品单位）——
// 原材料按 kg → 实收是重量，`X.XXXkg`（3 位小数）；原材料非 kg → 实收是件数，`整数 + 产品单位`（1枚 / 30份）。
// 空值 —。
// （旧口径「不论单位一律 toFixed(3)+kg」已作废：它把 30 枚礼盒的实收显示成 30.000kg。）
function formatReceivedWeight(row: StoreReturnVO): string {
  return formatReceivedAmount(row.receivedWeight, row.productUnit, row.materialUnit) || EMPTY_TEXT;
}

// 差异量 = 退回量 − 仓库实收量，只有**两边同量纲**才有意义：
//   · 退回量恒按产品单位计；实收量按原材料单位口径计（kg 或件数）。
//   · 故仅当「产品单位 = kg 且原材料单位 = kg」两者才都是 kg 重量，可相减。
//   · 产品按份/枚（如 80g 干货礼盒退 1 份、实收 0.080kg）→ 不同量纲，显 —。
// 仓库还没确认（实收为空）的行同样显 — ：货还没收，谈不上差异；按实收 0 计会让整行红字像报错。
function hasQuantityDiff(row: StoreReturnVO): boolean {
  return (
    isKgUnit(row.productUnit) &&
    isKgUnit(returnMetricUnit(row.productUnit, row.materialUnit)) &&
    toNum(row.returnQuantity) !== null &&
    toNum(row.receivedWeight) !== null
  );
}

// 差异量 = 退回量 − 仓库实收重量
function formatQuantityDiff(row: StoreReturnVO): string {
  if (!hasQuantityDiff(row)) return EMPTY_TEXT;
  return `${((toNum(row.returnQuantity) ?? 0) - (toNum(row.receivedWeight) ?? 0)).toFixed(3)}kg`;
}

// 确认进度（row203 起口径改为 **入库数/丢弃数**，只数已确认的行）。
// 「还剩几条没确认」不再出现在主列，挪进 tooltip（见 confirmProgressTip），否则改完看不出进度。
function formatConfirmProgress(row: ReturnStoreDailyVO): string {
  const total = row.totalCount;
  if (total === undefined || total === null) return EMPTY_TEXT;
  return `${row.inboundCount ?? 0}/${row.discardCount ?? 0}`;
}

// 未确认完（含一条都没确认）→ 警告色 + tooltip（tooltip 里给出「共 N 条 / 待确认 M 条」）
function isPartiallyConfirmed(row: ReturnStoreDailyVO): boolean {
  const total = row.totalCount;
  if (!total) return false;
  return (row.confirmedCount ?? 0) < total;
}

// row204：是否丢弃。仅已确认行有处置结论（pending 行库里是建表默认 0，不能当成「否」展示）
function formatDiscard(row: StoreReturnVO): string {
  if (row.returnStatus !== 'received') return EMPTY_TEXT;
  return Number(row.isDiscard) === 1 ? t('djs.warehouse.return.discardYes') : t('djs.warehouse.return.discardNo');
}

// tooltip 文案：主列只剩两个数，这里补回总数与待确认数
function confirmProgressTip(row: ReturnStoreDailyVO): string {
  const total = row.totalCount ?? 0;
  const pending = total - (row.confirmedCount ?? 0);
  return t('djs.warehouse.return.confirmProgressTip', { total, pending });
}

// 后端 BigDecimal 序列化成字符串，统一 Number 强转；无效值返 null（不当 0 用）
function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
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
  proxy?.download('djs/store/return/store-daily/export', buildQueryParams(), `退回记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
  loadStoreOptions();
  loadProductOptions();
});
</script>

<style scoped>
/* 差异量：统一红色，不按正负变色 */
.qty-diff {
  color: var(--el-color-danger);
}

/* 确认进度未满：警告色加粗，避免与「已全部确认」混同 */
.confirm-progress--partial {
  color: var(--el-color-warning);
  font-weight: 600;
}
</style>
