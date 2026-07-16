<template>
  <div class="p-2">
    <!-- 门店由顶部全局选择器（StoreSwitcher）统一控制，列表数据靠请求头 Current-Store-Id 后端过滤 -->
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_store_loss_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :selectable="false"
      :show-add="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:storeLoss"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #cell-lossQty="{ row }">
        {{ formatLossQty(row) }}
      </template>
    </BizTable>
  </div>
</template>

<script setup name="StoreLoss" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStoreLoss } from '@/api/djs-store/loss';
import type { StoreLossRecordVO } from '@/api/djs-store/loss/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();

const list = ref<StoreLossRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, unknown>>({
  lossDateRange: undefined,
  productName: undefined,
  lossType: undefined
});

// 筛选：损耗日期（范围）+ 产品名称 + 损耗类型
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'lossDateRange', label: t('storeLoss.field.lossDate'), type: 'daterange' },
  { field: 'productName', label: t('storeLoss.field.productName'), type: 'input' },
  { field: 'lossType', label: t('storeLoss.field.lossType'), type: 'select', dictType: 'djs_store_loss_type' }
]);

// 列：损耗日期 / 产品名称 / 损耗类型 / 损耗量 / 产品单位
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'lossDate', label: t('storeLoss.column.lossDate'), minWidth: 120, align: 'center', formatter: 'date' },
  { prop: 'productName', label: t('storeLoss.column.productName'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  { prop: 'lossType', label: t('storeLoss.column.lossType'), minWidth: 130, align: 'center', dictType: 'djs_store_loss_type' },
  { prop: 'lossQty', label: t('storeLoss.column.lossQty'), minWidth: 120, align: 'center' },
  { prop: 'productUnit', label: t('storeLoss.column.productUnit'), minWidth: 100, align: 'center' }
]);

// 损耗量展示：kg 单位保留 3 位小数（白条按重量），其余整数展示；无值显 '—'
function formatLossQty(row: BizRow): string {
  const r = row as StoreLossRecordVO;
  if (r.lossQty == null || r.lossQty === '') return '—';
  const n = Number(r.lossQty);
  if (Number.isNaN(n)) return '—';
  const unit = (r.productUnit ?? '').trim().toLowerCase();
  return unit === 'kg' || unit === '公斤' ? n.toFixed(3) : String(Math.round(n));
}

async function fetchList() {
  loading.value = true;
  try {
    // storeId 不显式传：后端按请求头 Current-Store-Id 做行级过滤
    // 损耗日期范围（lossDateRange）拆成 lossDateFrom / lossDateTo，原始数组不下发
    const { lossDateRange, ...rest } = searchModel;
    const range = Array.isArray(lossDateRange) ? (lossDateRange as string[]) : [];
    const params = {
      ...rest,
      lossDateFrom: range[0],
      lossDateTo: range[1],
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listStoreLoss(params as Parameters<typeof listStoreLoss>[0]);
    const payload = res as unknown as { rows?: StoreLossRecordVO[]; total?: number };
    list.value = payload.rows ?? [];
    total.value = Number(payload.total ?? 0);
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

onMounted(() => {
  fetchList();
});
</script>
