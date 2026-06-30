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
      :dict-types="['djs_flow_type', 'djs_inout_type', 'djs_belong_type', 'djs_mat_type', 'djs_stock_out_dest']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:stockFlow"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 行级"调账"按钮（V1 placeholder，D11 WMS-FLOW-001 完整实现） -->
      <template #action="{ row }">
        <el-button
          v-hasPermi="['djs:warehouse:stockFlow:adjust']"
          link
          type="warning"
          :title="t('djs.warehouse.stockFlow.adjustHint')"
          @click="handleAdjust(row as StockFlowVO)"
        >
          {{ t('djs.warehouse.stockFlow.adjust') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="StockFlow" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStockFlow } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowQuery, StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const tableRef = ref<BizTableExpose>();

const list = ref<StockFlowVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  flowNo: undefined,
  flowType: [],
  inoutType: undefined,
  matType: [],
  productId: undefined,
  productCode: undefined,
  earNo: undefined,
  stockOutDest: [],
  dateFrom: undefined,
  dateTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'flowNo', label: t('djs.warehouse.stockFlow.flowNo'), type: 'input' },
  { field: 'flowType', label: t('djs.warehouse.stockFlow.flowType'), type: 'select', multiple: true, dictType: 'djs_flow_type' },
  { field: 'inoutType', label: t('djs.warehouse.stockFlow.inoutType'), type: 'select', dictType: 'djs_inout_type' },
  { field: 'matType', label: t('djs.warehouse.stockFlow.matType'), type: 'select', multiple: true, dictType: 'djs_mat_type' },
  { field: 'productCode', label: t('djs.warehouse.stockFlow.productCode'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.stockFlow.earNo'), type: 'input' },
  { field: 'stockOutDest', label: t('djs.warehouse.stockFlow.stockOutDest'), type: 'select', multiple: true, dictType: 'djs_stock_out_dest' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'flowNo', label: t('djs.warehouse.stockFlow.flowNo'), minWidth: 160 },
  { prop: 'flowDate', label: t('djs.warehouse.stockFlow.flowDate'), minWidth: 160 },
  { prop: 'flowType', label: t('djs.warehouse.stockFlow.flowType'), dictType: 'djs_flow_type', minWidth: 110 },
  { prop: 'inoutType', label: t('djs.warehouse.stockFlow.inoutType'), dictType: 'djs_inout_type', minWidth: 80 },
  { prop: 'productName', label: t('djs.warehouse.stockFlow.productName'), minWidth: 160 },
  { prop: 'belongType', label: t('djs.warehouse.stockFlow.belongType'), dictType: 'djs_belong_type', minWidth: 100 },
  { prop: 'changeQuantity', label: t('djs.warehouse.stockFlow.changeQuantity'), minWidth: 100 },
  { prop: 'productUnit', label: t('djs.warehouse.stockFlow.productUnit'), minWidth: 80 },
  { prop: 'locationName', label: t('djs.warehouse.stockFlow.location'), minWidth: 120 },
  { prop: 'earNo', label: t('djs.warehouse.stockFlow.earNo'), minWidth: 120 },
  { prop: 'stockOutDest', label: t('djs.warehouse.stockFlow.stockOutDest'), dictType: 'djs_stock_out_dest', minWidth: 110 },
  { prop: 'operatorName', label: t('djs.warehouse.stockFlow.operator'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.stockFlow.remark'), minWidth: 160 }
]);

/**
 * searchModel → 后端 query。
 * R70 多选字段（flowType / matType / stockOutDest）发复数 param（flowTypes / matTypes / stockOutDests），
 * 删掉单值同名 key 避免单值+复数都发；其余字段透传。
 */
function buildQuery(): StockFlowQuery {
  const { flowType, matType, stockOutDest, ...rest } = searchModel;
  return {
    ...rest,
    flowTypes: Array.isArray(flowType) && flowType.length ? flowType : undefined,
    matTypes: Array.isArray(matType) && matType.length ? matType : undefined,
    stockOutDests: Array.isArray(stockOutDest) && stockOutDest.length ? stockOutDest : undefined
  } as StockFlowQuery;
}

async function loadList() {
  loading.value = true;
  try {
    const params: StockFlowQuery = {
      ...buildQuery(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listStockFlow(params);
    list.value = (res as any).rows ?? [];
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
  proxy?.download('/djs/warehouse/stockFlow/export', buildQuery(), `出入库流水_${new Date().getTime()}.xlsx`);
}

function handleAdjust(row: StockFlowVO) {
  ElMessage.warning(t('djs.warehouse.stockFlow.adjustNotImpl', { flowNo: row.flowNo }));
}

/**
 * 从库存查询页钻取而来：用 query 预过滤（productId 精确 + inoutType IN/OT）。
 *
 * productId 是雪花 ID，必须保持 string —— Number() 会丢精度（19 位 > MAX_SAFE_INTEGER，
 * 末位被舍入 → 后端查不到，coder-djs-cross-layer-contract）。
 * 返回是否应用了新的钻取参数（同一份参数不重复覆盖用户手动筛选）。
 */
let appliedDrillKey: string | null = null;
function syncDrillFromQuery(): boolean {
  const key = `${route.query.productId ?? ''}|${route.query.inoutType ?? ''}`;
  if (key === appliedDrillKey) {
    return false;
  }
  appliedDrillKey = key;
  searchModel.productId = route.query.productId ? String(route.query.productId) : undefined;
  searchModel.inoutType = route.query.inoutType ? String(route.query.inoutType) : undefined;
  return true;
}

onMounted(() => {
  syncDrillFromQuery();
  loadList();
});

// keep-alive 标签缓存：标签已开着再带新 query 钻入时 onMounted 不重跑，靠 onActivated 兜底
onActivated(() => {
  if (syncDrillFromQuery()) {
    pageNum.value = 1;
    loadList();
  }
});
</script>
