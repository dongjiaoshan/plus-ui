<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="pagedList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      :action-min-width="200"
      row-key="statMonth"
      perm-prefix="djs:warehouse:inoutMonthly"
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <!-- 操作列：入库汇总 / 出库汇总 两个下钻（甲方 row154 第 3 点） -->
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:inoutMonthly:query']" link type="primary" size="small" @click="handleInSummary(row as InoutMonthVO)">
          {{ t('inoutMonthly.action.inSummary') }}
        </el-button>
        <el-button v-hasPermi="['djs:warehouse:inoutMonthly:query']" link type="primary" size="small" @click="handleOutSummary(row as InoutMonthVO)">
          {{ t('inoutMonthly.action.outSummary') }}
        </el-button>
      </template>
    </BizTable>

    <InSummaryDialog ref="inDialogRef" />
    <OutSummaryDialog ref="outDialogRef" />
  </div>
</template>

<script setup name="InoutMonthly" lang="ts">
/**
 * 出入库月汇总（V6-R154）。
 *
 * compute-on-read：后端按月实时 GROUP BY t_warehouse_stock_flow，不建汇总表、不加跑批。
 * 月份集合 = 有出入库流水的月份（本页统计流量，没有出入库的月份出一行全零没有信息）——
 * 与兄弟页「库存月汇总」的连续自然月补零口径刻意分道，那页统计的是结存。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import InSummaryDialog from './components/InSummaryDialog.vue';
import OutSummaryDialog from './components/OutSummaryDialog.vue';
import { listInoutMonth, type InoutMonthVO } from '@/api/djs-warehouse/inoutMonthly';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const inDialogRef = ref<{ open: (statMonth: string) => void }>();
const outDialogRef = ref<{ open: (statMonth: string) => void }>();

/** 后端一次返回全量月份（行数极小），前端客户端分页。 */
const fullList = ref<InoutMonthVO[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 搜索条件 = 单个月份（甲方 row154 第 2 点「搜索条件为月份（月份搜索）」）。 */
const searchModel = reactive<Record<string, string | undefined>>({
  statMonth: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'statMonth', label: t('inoutMonthly.field.statMonth'), type: 'month' }]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statMonth', label: t('inoutMonthly.column.statMonth'), minWidth: 200, align: 'center' }
]);

const total = computed(() => fullList.value.length);
const pagedList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  return fullList.value.slice(start, start + pageSize.value);
});

async function fetchList() {
  loading.value = true;
  try {
    // month 选择器回写 'YYYY-MM'，后端 statMonth 全链路就是这个格式，不用补 -01
    const res = await listInoutMonth({ statMonth: searchModel.statMonth || undefined });
    fullList.value = (res.data ?? []) as InoutMonthVO[];
  } finally {
    loading.value = false;
  }
}

function handleInSummary(row: InoutMonthVO) {
  inDialogRef.value?.open(row.statMonth);
}

function handleOutSummary(row: InoutMonthVO) {
  outDialogRef.value?.open(row.statMonth);
}

function handleSearch(payload?: Record<string, string | undefined>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  fetchList();
}

function handleReset() {
  searchModel.statMonth = undefined;
  pageNum.value = 1;
  fetchList();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
}

onMounted(() => {
  fetchList();
});
</script>
