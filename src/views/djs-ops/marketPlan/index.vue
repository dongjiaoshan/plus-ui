<template>
  <div class="p-2">
    <BizTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="planId"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:ops:marketPlan"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 作物图片：后端已把 ossId 解析成 URL（cropImageUrl），前端不再二次查 sys_oss -->
      <template #cell-cropImageUrl="{ row }">
        <el-image
          v-if="row.cropImageUrl"
          :src="row.cropImageUrl"
          :preview-src-list="[row.cropImageUrl]"
          :preview-teleported="true"
          fit="cover"
          class="market-crop-thumb"
        />
        <span v-else>-</span>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="MarketPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listMarketPlan } from '@/api/djs-ops/marketPlan';
import type { MarketPlanQuery, MarketPlanVO } from '@/api/djs-ops/marketPlan/types';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const list = ref<MarketPlanVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 搜索：严格只有甲方点名的三项（作物名称模糊 / 上市月份 / 下市月份），不加隐式年份过滤
const searchModel = reactive<Record<string, unknown>>({
  cropName: undefined,
  marketBeginMonth: undefined,
  marketEndMonth: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'cropName',
    label: t('marketPlan.field.cropName'),
    type: 'input',
    placeholder: t('marketPlan.placeholder.cropName'),
    width: 180
  },
  {
    field: 'marketBeginMonth',
    label: t('marketPlan.field.marketBeginMonth'),
    type: 'month',
    placeholder: t('marketPlan.placeholder.marketBeginMonth'),
    width: 180
  },
  {
    field: 'marketEndMonth',
    label: t('marketPlan.field.marketEndMonth'),
    type: 'month',
    placeholder: t('marketPlan.placeholder.marketEndMonth'),
    width: 180
  }
]);

// 列序严格对齐甲方：作物图片 / 作物名称 / 预计产量 / 实际产量 / 上市月份 / 下市月份（导出同序）
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropImageUrl', label: t('marketPlan.column.cropImage'), width: 90, align: 'center' },
  { prop: 'cropName', label: t('marketPlan.column.cropName'), minWidth: 160, align: 'center', showOverflowTooltip: true },
  {
    prop: 'expectedYield',
    label: t('marketPlan.column.expectedYield'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.expectedYield != null ? Number(r.expectedYield).toFixed(3) : '-')
  },
  {
    prop: 'actualYield',
    label: t('marketPlan.column.actualYield'),
    minWidth: 130,
    align: 'center',
    formatter: (r: BizRow) => (r.actualYield != null ? Number(r.actualYield).toFixed(3) : '-')
  },
  // 该计划一条采摘明细都没有时两列为空，显 '-'（行仍保留，排序压在最后）
  {
    prop: 'marketBeginMonth',
    label: t('marketPlan.column.marketBeginMonth'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => (r.marketBeginMonth ? String(r.marketBeginMonth) : '-')
  },
  {
    prop: 'marketEndMonth',
    label: t('marketPlan.column.marketEndMonth'),
    minWidth: 120,
    align: 'center',
    formatter: (r: BizRow) => (r.marketEndMonth ? String(r.marketEndMonth) : '-')
  }
]);

function buildQueryParams(): MarketPlanQuery {
  return {
    cropName: (searchModel.cropName as string | undefined) || undefined,
    marketBeginMonth: (searchModel.marketBeginMonth as string | undefined) || undefined,
    marketEndMonth: (searchModel.marketEndMonth as string | undefined) || undefined,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listMarketPlan(buildQueryParams());
    list.value = (res.rows as MarketPlanVO[]) || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

const handleSearch = (payload?: Record<string, unknown>) => {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
};

const handleReset = () => {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  handleSearch();
};

// BizTable 的 page-change 发的是**位置参数** emit('page-change', page, limit)，不是对象
const handlePageChange = (pn: number, ps: number) => {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
};

const handleExport = () => {
  const { pageNum: _pn, pageSize: _ps, ...exportParams } = buildQueryParams();
  proxy?.download('djs/ops/marketPlan/export', exportParams, `${t('marketPlan.pageTitle')}_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.market-crop-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}
</style>
