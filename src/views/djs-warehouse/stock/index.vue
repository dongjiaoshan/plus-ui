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
      :dict-types="['djs_check_result']"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-width="280"
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
      <!-- 操作列（对齐原型）：产品出库 + 3 钻取链接（入库 / 出库 / 盘点记录） -->
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:stock:out']" link type="primary" size="small" @click="handleProductOut(row as LocationStockVO)">
          {{ t('stock.action.productOut') }}
        </el-button>
        <el-button link type="primary" size="small" @click="drillTo('in', row as LocationStockVO)">
          {{ t('stock.action.flowIn') }}
        </el-button>
        <el-button link type="primary" size="small" @click="drillTo('out', row as LocationStockVO)">
          {{ t('stock.action.flowOut') }}
        </el-button>
        <el-button link type="primary" size="small" @click="drillTo('check', row as LocationStockVO)">
          {{ t('stock.action.checkRecord') }}
        </el-button>
      </template>
    </BizTable>

    <StockOutDialog ref="outDialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="Stock" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StockOutDialog from './components/StockOutDialog.vue';
import { listStock } from '@/api/djs-warehouse/stock';
import type { LocationStockQuery, LocationStockVO } from '@/api/djs-warehouse/stock/types';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const tableRef = ref<BizTableExpose>();
const outDialogRef = ref<{ open: (row: LocationStockVO) => void }>();

const list = ref<LocationStockVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  productName: undefined,
  earNo: undefined,
  blockNo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'productName', label: t('stock.field.productName'), type: 'input' },
  { field: 'earNo', label: t('stock.field.earNo'), type: 'input' },
  { field: 'blockNo', label: t('stock.field.blockNo'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'productCode', label: t('stock.column.productCode'), width: 120, align: 'center', showOverflowTooltip: true },
  { prop: 'locationName', label: t('stock.column.locationName'), width: 140, showOverflowTooltip: true },
  { prop: 'productName', label: t('stock.column.productName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'productStock', label: t('stock.column.productStock'), width: 110, align: 'right', formatter: (row: BizRow) => formatStock(row.productStock) },
  { prop: 'productUnit', label: t('stock.column.productUnit'), width: 80, align: 'center' },
  { prop: 'earNo', label: t('stock.column.earNo'), width: 140, align: 'center' },
  { prop: 'blockNo', label: t('stock.column.blockNo'), width: 130, align: 'center' },
  { prop: 'latestCheckTime', label: t('stock.column.latestCheckTime'), width: 170, align: 'center', formatter: 'datetime' },
  { prop: 'checkResult', label: t('stock.column.checkResult'), width: 90, align: 'center', dictType: 'djs_check_result' }
]);

/** 当前库存格式化：保留两位小数（后端 BigDecimal 序列化可能是 string / 整数 / 多位小数）。 */
function formatStock(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : n.toFixed(2);
}

async function fetchList() {
  loading.value = true;
  try {
    const query: LocationStockQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productName: searchModel.productName || undefined,
      earNo: searchModel.earNo || undefined,
      blockNo: searchModel.blockNo || undefined
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
 * 行级钻取：入库 → 入库记录页（9240 `flow/in`）/ 出库 → 出库记录页（9241 `flow/out`），
 * 带 productId 预过滤；盘点 → 盘点记录页（9250 `check`），带 locationId 预过滤（盘点单为库位级）。
 *
 * 路由 path 按 plus-ui 动态路由：父菜单 path `djs-warehouse`(9000) + 子 path。
 * 旧入口 `stockFlow`(9110) 已隐藏（visible='1'），隐藏菜单不生成动态路由会 404，故对齐可见的
 * 入库/出库记录权威菜单 9240/9241。
 */
function drillTo(kind: 'in' | 'out' | 'check', row: LocationStockVO) {
  if (kind === 'check') {
    router.push({ path: '/djs-warehouse/check', query: { locationId: row.locationId } });
  } else {
    router.push({
      path: kind === 'in' ? '/djs-warehouse/flow/in' : '/djs-warehouse/flow/out',
      query: { productId: row.productId }
    });
  }
}

function handleSearch(payload: Record<string, any>) {
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
function handleExport() {
  proxy?.download(
    'djs/warehouse/stock/export',
    {
      productName: searchModel.productName || undefined,
      earNo: searchModel.earNo || undefined,
      blockNo: searchModel.blockNo || undefined
    },
    `stock_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
