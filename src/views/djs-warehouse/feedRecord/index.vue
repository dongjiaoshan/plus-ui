<template>
  <div class="p-2">
    <!-- 搜索区：日期范围 + 作物名称模糊 + 提供位置（字典 djs_feed_type） -->
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
        <el-form-item :label="t('feedRecord.field.cropName')">
          <el-input
            v-model="query.cropName"
            :placeholder="t('feedRecord.field.cropNamePlaceholder')"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="t('feedRecord.field.feedType')">
          <el-select v-model="query.feedType" :placeholder="t('feedRecord.field.feedTypePlaceholder')" clearable style="width: 200px">
            <el-option v-for="d in djs_feed_type" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">{{ t('feedRecord.action.search') }}</el-button>
          <el-button icon="Refresh" @click="handleReset">{{ t('feedRecord.action.reset') }}</el-button>
          <el-button type="warning" icon="Download" @click="handleExport">{{ t('feedRecord.action.export') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <!-- row76：列等宽平均分布（各列同 min-width，el-table 按比例均分剩余宽度） -->
      <el-table v-loading="loading" :data="list" border>
        <el-table-column :label="t('feedRecord.column.feedDate')" prop="feedDate" min-width="160" align="center" header-align="center">
          <template #default="{ row }">{{ formatDateTime(row.feedDate) }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.cropImage')" prop="cropImageOssId" min-width="160" align="center" header-align="center">
          <template #default="{ row }">
            <ImagePreview
              v-if="row.cropImageOssId && imageUrlMap[String(row.cropImageOssId)]"
              :width="40"
              :height="40"
              :src="imageUrlMap[String(row.cropImageOssId)]"
              :preview-src-list="[imageUrlMap[String(row.cropImageOssId)]]"
            />
            <el-icon v-else class="text-gray-300" :size="28"><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('feedRecord.column.cropName')"
          prop="cropName"
          min-width="160"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.cropName || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.feedWeight')" prop="feedWeight" min-width="160" align="center" header-align="center">
          <template #default="{ row }">{{ formatWeight(row.feedWeight) }}</template>
        </el-table-column>
        <el-table-column :label="t('feedRecord.column.feedType')" prop="feedType" min-width="160" align="center" header-align="center">
          <template #default="{ row }"><dict-tag :options="djs_feed_type" :value="row.feedType" /></template>
        </el-table-column>
        <el-table-column
          :label="t('feedRecord.column.operator')"
          prop="operatorName"
          min-width="160"
          align="center"
          header-align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.operatorName || '—' }}</template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchList" />
    </el-card>
  </div>
</template>

<script setup name="FeedRecord" lang="ts">
import ImagePreview from '@/components/ImagePreview/index.vue';
import { listFeedRecord, type FeedRecordVO } from '@/api/djs-warehouse/feedRecord';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { parseTime, lastMonthRange } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_feed_type } = toRefs<Record<string, any>>(proxy?.useDict('djs_feed_type'));

/** 日期范围（默认近一个月，'YYYY-MM-DD' 二元组）。 */
const dateRange = ref<[string, string] | undefined>(lastMonthRange());

const loading = ref(false);
const list = ref<FeedRecordVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

/** ossId(string) → url（作物图批量解析，仓库来源行无图） */
const imageUrlMap = ref<Record<string, string>>({});

const query = reactive<{ cropName?: string; feedType?: string }>({
  cropName: undefined,
  feedType: undefined
});

/** 构建查询参数（含日期范围拆 from/to）。 */
function buildQuery() {
  const range = dateRange.value ?? [];
  return {
    cropName: query.cropName || undefined,
    feedType: query.feedType || undefined,
    dateFrom: range[0] || undefined,
    dateTo: range[1] || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listFeedRecord({
      ...buildQuery(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    list.value = (res.rows ?? res.data ?? []) as FeedRecordVO[];
    total.value = res.total ?? 0;
    await loadImageUrls();
  } finally {
    loading.value = false;
  }
}

/** 批量把 cropImageOssId 解析成可预览 url（一次 listByIds 拉全量、去重）。 */
async function loadImageUrls() {
  const ossIds = Array.from(new Set(list.value.map((r) => r.cropImageOssId).filter((id): id is string => !!id)));
  if (ossIds.length === 0) {
    imageUrlMap.value = {};
    return;
  }
  const res = await listOssByIds(ossIds.join(','));
  const map: Record<string, string> = {};
  (res.data ?? []).forEach((o: any) => {
    if (o?.ossId != null && o?.url) {
      map[String(o.ossId)] = o.url;
    }
  });
  imageUrlMap.value = map;
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}

function handleReset() {
  query.cropName = undefined;
  query.feedType = undefined;
  dateRange.value = lastMonthRange();
  pageNum.value = 1;
  fetchList();
}

/** 导出（按当前搜索条件，含日期范围）。 */
function handleExport() {
  proxy?.download('djs/warehouse/feedRecord/export', buildQuery(), `有机饲喂记录_${Date.now()}.xlsx`);
}

function formatDateTime(v?: string): string {
  if (!v) return '';
  return parseTime(v, '{y}-{m}-{d} {h}:{i}:{s}') as string;
}

/** 饲喂量格式化：后端 BigDecimal 序列化为 string，统一 Number 强转保两位小数。 */
function formatWeight(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : n.toFixed(2);
}

onMounted(() => {
  fetchList();
});
</script>
