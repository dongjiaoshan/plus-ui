<template>
  <div class="p-2">
    <!-- 搜索区：只留日期范围（默认近一个月）。作物名 / 提供位置是明细维度，日汇总层不参与筛选 -->
    <el-card shadow="never" class="mb-2">
      <el-form :inline="true" @submit.prevent>
        <el-form-item :label="t('feedRecord.field.dateRange')">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            :start-placeholder="t('feedRecord.field.startDate')"
            :end-placeholder="t('feedRecord.field.endDate')"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">{{ t('feedRecord.action.search') }}</el-button>
          <el-button icon="Refresh" @click="handleReset">{{ t('feedRecord.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" border>
        <el-table-column :label="t('feedRecord.column.feedDate')" prop="feedDate" min-width="160" align="center" header-align="center" />
        <el-table-column :label="t('feedRecord.column.totalWeight')" prop="totalWeight" min-width="160" align="center" header-align="center">
          <template #default="{ row }">{{ formatWeight3(row.totalWeight) }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.boxCount')" prop="boxCount" min-width="160" align="center" header-align="center">
          <template #default="{ row }">{{ formatBoxCount(row.boxCount) }}</template>
        </el-table-column>
        <el-table-column
          :label="t('feedRecord.column.confirmUser')"
          prop="confirmUserName"
          min-width="160"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.confirmUserName || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.operation')" min-width="140" align="center" header-align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">{{ t('feedRecord.action.detail') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchList" />
    </el-card>

    <!-- 当日明细弹窗：复用原明细端点，传单日 dateFrom=dateTo -->
    <el-dialog v-model="detailVisible" :title="detailTitle" width="900px" append-to-body>
      <el-table v-loading="detailLoading" :data="detailList" border max-height="460">
        <el-table-column :label="t('feedRecord.column.feedDate')" prop="feedDate" min-width="170" align="center" header-align="center">
          <template #default="{ row }">{{ formatDateTime(row.feedDate) }}</template>
        </el-table-column>
        <el-table-column
          :label="t('feedRecord.column.cropName')"
          prop="cropName"
          min-width="150"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.cropName || '—' }}</template>
        </el-table-column>
        <!-- row54：作物名称右边补产品名称（取 feed_log.product_id → product_name；导出同列同序） -->
        <el-table-column
          :label="t('feedRecord.column.productName')"
          prop="productName"
          min-width="150"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.productName || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.feedWeight')" prop="feedWeight" min-width="150" align="center" header-align="center">
          <template #default="{ row }">{{ formatWeight3(row.feedWeight) }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.feedType')" prop="feedType" min-width="130" align="center" header-align="center">
          <template #default="{ row }"><dict-tag :options="djs_feed_type" :value="row.feedType" /></template>
        </el-table-column>
        <el-table-column
          :label="t('feedRecord.column.operator')"
          prop="operatorName"
          min-width="140"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.operatorName || '—' }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="warning" icon="Download" @click="handleExportDetail">{{ t('feedRecord.action.export') }}</el-button>
        <el-button @click="detailVisible = false">{{ t('feedRecord.action.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="FeedRecord" lang="ts">
import { listFeedDaily, listFeedRecord, type FeedDailyVO, type FeedRecordVO } from '@/api/djs-warehouse/feedRecord';
import { parseTime, lastMonthRange } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_feed_type } = toRefs<Record<string, any>>(proxy?.useDict('djs_feed_type'));

/** 日期范围（默认近一个月，'YYYY-MM-DD' 二元组）。 */
const dateRange = ref<[string, string] | undefined>(lastMonthRange());

const loading = ref(false);
const list = ref<FeedDailyVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

/** 日汇总只吃日期范围。 */
function buildQuery() {
  const range = dateRange.value ?? [];
  return {
    dateFrom: range[0] || undefined,
    dateTo: range[1] || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listFeedDaily({
      ...buildQuery(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    list.value = (res.rows ?? res.data ?? []) as FeedDailyVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}

function handleReset() {
  dateRange.value = lastMonthRange();
  pageNum.value = 1;
  fetchList();
}

// ===== 当日明细 =====
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailList = ref<FeedRecordVO[]>([]);
const detailDate = ref('');
const detailTitle = computed(() => `${t('feedRecord.detailTitle')}（${detailDate.value}）`);

/** 当日明细查询参数：明细端点按 [dateFrom, dateTo] 闭区间取，单日就把两端设成同一天。 */
function detailQuery() {
  return { dateFrom: detailDate.value, dateTo: detailDate.value };
}

async function openDetail(row: FeedDailyVO) {
  detailDate.value = row.feedDate;
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    // 单日明细条数有限（实测个位数），一次拉满不分页
    const res = await listFeedRecord({ ...detailQuery(), pageNum: 1, pageSize: 500 });
    detailList.value = (res.rows ?? res.data ?? []) as FeedRecordVO[];
  } finally {
    detailLoading.value = false;
  }
}

/** 导出当日明细（走原明细导出端点）。 */
function handleExportDetail() {
  proxy?.download('djs/warehouse/feedRecord/export', detailQuery(), `有机饲喂记录_${detailDate.value}.xlsx`);
}

function formatDateTime(v?: string): string {
  if (!v) return '';
  return parseTime(v, '{y}-{m}-{d} {h}:{i}:{s}') as string;
}

/** 重量格式化：甲方要求保留三位小数。后端 BigDecimal 序列化为 string，统一 Number 强转。 */
function formatWeight3(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${n.toFixed(3)} kg`;
}

/**
 * 框数格式化：甲方要求显示整数。
 * 列是 DECIMAL(10,2)、后端 BigDecimal 序列化成 string（"5.00"），直接渲染会带两位小数；
 * 录入侧已限整数，存量值也都是整数值，取整不改变实际语义。未确认显 '—'。
 */
function formatBoxCount(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : String(Math.round(n));
}

onMounted(() => {
  fetchList();
});
</script>
