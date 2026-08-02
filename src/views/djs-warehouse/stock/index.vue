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
      :dict-types="['djs_check_result', 'djs_belong_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="270"
      row-key="id"
      perm-prefix="djs:warehouse:stock"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 操作列：产品出库 +（猪肉鲜品库的猪肉行）猪肉转移 + 查看详情（入库/出库/盘点记录三 tab 合并进同一弹框） -->
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:stock:out']" link type="primary" size="small" @click="handleProductOut(row as LocationStockVO)">
          {{ t('stock.action.productOut') }}
        </el-button>
        <el-button
          v-if="canPigTransfer(row as LocationStockVO)"
          v-hasPermi="['djs:warehouse:stock:out']"
          link
          type="primary"
          size="small"
          @click="handlePigTransfer(row as LocationStockVO)"
        >
          {{ t('stock.action.pigTransfer') }}
        </el-button>
        <el-button
          v-if="canInternalHandle(row as LocationStockVO)"
          v-hasPermi="['djs:warehouse:stock:out']"
          link
          type="primary"
          size="small"
          @click="handleInternal(row as LocationStockVO)"
        >
          {{ t('stock.action.internalHandle') }}
        </el-button>
        <el-button link type="primary" size="small" @click="drillTo('in', row as LocationStockVO)">
          {{ t('stock.action.viewDetail') }}
        </el-button>
      </template>
    </BizTable>

    <StockOutDialog ref="outDialogRef" @success="fetchList" />
    <InternalHandleDialog ref="internalDialogRef" @success="fetchList" />
    <PigTransferDialog ref="transferDialogRef" @success="fetchList" />
    <StockRecordDialog ref="recordDialogRef" />
  </div>
</template>

<script setup name="Stock" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StockOutDialog from './components/StockOutDialog.vue';
import InternalHandleDialog from './components/InternalHandleDialog.vue';
import PigTransferDialog from './components/PigTransferDialog.vue';
import StockRecordDialog from './components/StockRecordDialog.vue';
import { listStock } from '@/api/djs-warehouse/stock';
import type { LocationStockQuery, LocationStockVO } from '@/api/djs-warehouse/stock/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const outDialogRef = ref<{ open: (row: LocationStockVO) => void }>();
const internalDialogRef = ref<{ open: (row: LocationStockVO) => void }>();
const transferDialogRef = ref<{ open: (row: LocationStockVO) => void }>();
const recordDialogRef = ref<{ open: (row: LocationStockVO, kind: 'in' | 'out' | 'check') => void }>();

/** 猪肉鲜品库库位名（猪肉转移按钮的库位判定；location_type=veg_fresh 被多个鲜品库共用，故按名精确判定，与后端一致）。 */
const PORK_FRESH_LOCATION_NAME = '猪肉鲜品库';

/** 毛菜鲜品库库位名（row185 产品内部处理入口判定；与后端 L0006 常量同一个库位）。 */
const VEG_FRESH_LOCATION_NAME = '毛菜鲜品库';

const list = ref<LocationStockVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  // 归属类型多选（R70，djs_belong_type 10 项 > 2 → 多选）
  belongType: [],
  earNo: undefined,
  blockNo: undefined,
  // 库位多选（R70，库位实体下拉天然 > 2 → 多选）
  locationId: []
});

/** 库位下拉选项（按 id/locationName 拉取，供搜索精确过滤 locationId）。 */
const locationOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('stock.field.productName'), type: 'input' },
  // 归属类型搜索（row152-1，后端 LocationStockQuery 需关联 product 表按 belong_type 过滤）
  { field: 'belongType', label: t('stock.field.belongType'), type: 'select', multiple: true, dictType: 'djs_belong_type', clearable: true },
  { field: 'earNo', label: t('stock.field.earNo'), type: 'input' },
  { field: 'blockNo', label: t('stock.field.blockNo'), type: 'input' },
  { field: 'locationId', label: t('stock.field.locationName'), type: 'select', multiple: true, options: locationOptions.value, clearable: true }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productCode', label: t('stock.column.productCode'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  { prop: 'productName', label: t('stock.column.productName'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  // row183：产品规格列，紧挨产品名称右侧（后端 LocationStockVo JOIN product_info 回填 productSpec）
  { prop: 'productSpec', label: t('stock.column.productSpec'), minWidth: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'locationName', label: t('stock.column.locationName'), minWidth: 120, align: 'center', showOverflowTooltip: true },
  {
    prop: 'productStock',
    label: t('stock.column.productStock'),
    minWidth: 120,
    align: 'center',
    formatter: (row: BizRow) => formatStock(row.productStock, row.productUnit as string)
  },
  { prop: 'productUnit', label: t('stock.column.productUnit'), minWidth: 120, align: 'center' },
  { prop: 'earNo', label: t('stock.column.earNo'), minWidth: 120, align: 'center' },
  { prop: 'whiteBarNo', label: t('stock.column.whiteBarNo'), minWidth: 130, align: 'center' },
  { prop: 'blockNo', label: t('stock.column.blockNo'), minWidth: 120, align: 'center' },
  { prop: 'latestCheckTime', label: t('stock.column.latestCheckTime'), minWidth: 170, align: 'center', formatter: 'datetime' },
  { prop: 'checkResult', label: t('stock.column.checkResult'), minWidth: 120, align: 'center', dictType: 'djs_check_result' }
]);

/** 当前库存格式化（按单位分流）：kg/公斤 恒 3 位小数补零（1g 精度，与流水/损耗明细对账口径一致）；非 kg 计数单位去尾零。 */
function formatStock(v: number | string | undefined | null, unit?: string): string {
  if (v === undefined || v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit);
}

async function fetchList() {
  loading.value = true;
  try {
    const query: LocationStockQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchModel.productName || undefined,
      // R70 多选：归属类型 / 库位发复数数组（删单值发送）
      belongTypes: Array.isArray(searchModel.belongType) && searchModel.belongType.length ? searchModel.belongType : undefined,
      earNo: searchModel.earNo || undefined,
      blockNo: searchModel.blockNo || undefined,
      locationIds: Array.isArray(searchModel.locationId) && searchModel.locationId.length ? searchModel.locationId : undefined
    };
    const res = await listStock(query);
    list.value = (res.rows ?? res.data ?? []) as LocationStockVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

/** 行操作「产品出库」：打开出库弹窗（出库日期默认当天 / 出库量 / 出库方式）。 */
function handleProductOut(row: LocationStockVO) {
  outDialogRef.value?.open(row);
}

/**
 * 是否显示「猪肉转移」按钮（WS13 / row143）：产品业态为猪肉（belongType=pork）且库位为「猪肉鲜品库」。
 * belongType 由后端 JOIN product_info 回填；locationName 由后端 JOIN location_info 回填。
 */
function canPigTransfer(row: LocationStockVO): boolean {
  return row.belongType === 'pork' && row.locationName === PORK_FRESH_LOCATION_NAME;
}

/**
 * 是否显示「产品内部处理」（row185）：毛菜鲜品库里的果蔬行。
 *
 * 甲方原话「对果蔬产品增加产品内部处理功能」+ col8 补充「对于毛菜鲜品库是一个出库的操作」，
 * 取两者交集；后端 submit 同样校验库位与业态，前端隐藏只是少一次无效点击。
 */
function canInternalHandle(row: LocationStockVO): boolean {
  return row.belongType === 'vegetable' && row.locationName === VEG_FRESH_LOCATION_NAME;
}

/** 行操作「产品内部处理」：打开弹窗（形态同产品出库，去向限果蔬月台 / 饲料饲喂）。 */
function handleInternal(row: LocationStockVO) {
  internalDialogRef.value?.open(row);
}

/** 行操作「猪肉转移」：打开转移弹窗（猪肉鲜品库 → 冻品库；当前库存只读 / 转移日期默认当天 / 转移量 ≤ 当前库存）。 */
function handlePigTransfer(row: LocationStockVO) {
  transferDialogRef.value?.open(row);
}

/**
 * 行级钻取：入库 / 出库 / 盘点记录就地弹窗（只看本产品/本库位的记录），不再跳转到对应菜单页。
 * 入/出库按 productId 过滤（复用 listFlowIn/listFlowOut），盘点按库位拉明细后前端过滤本产品。
 */
function drillTo(kind: 'in' | 'out' | 'check', row: LocationStockVO) {
  recordDialogRef.value?.open(row, kind);
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  // 多选字段重置成空数组（el-select 多选）
  searchModel.belongType = [];
  searchModel.locationId = [];
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/warehouse/stock/export',
    {
      productName: searchModel.productName || undefined,
      // R70 多选：导出走同一 buildQueryWrapper，发复数数组
      belongTypes: Array.isArray(searchModel.belongType) && searchModel.belongType.length ? searchModel.belongType : undefined,
      earNo: searchModel.earNo || undefined,
      blockNo: searchModel.blockNo || undefined,
      locationIds: Array.isArray(searchModel.locationId) && searchModel.locationId.length ? searchModel.locationId : undefined
    },
    `stock_${new Date().getTime()}.xlsx`
  );
}

/** 拉取库位列表填充搜索下拉（精确过滤 locationId）。 */
async function loadLocationOptions() {
  const res = await listLocation({ pageNum: 1, pageSize: 1000 });
  const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string }>;
  locationOptions.value = rows.map((r) => ({ label: r.locationName, value: r.id }));
}

onMounted(() => {
  loadLocationOptions();
  fetchList();
});
</script>
