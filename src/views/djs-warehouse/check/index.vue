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
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="checkId"
      perm-prefix="djs:warehouse:check"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #action="{ row }">
        <el-button type="primary" link @click="openDetailDialog(row as StockCheckHeaderVO)">
          {{ t('djs.warehouse.check.detail') }}
        </el-button>
      </template>
    </BizTable>

    <CheckDetailDialog v-model="detailVisible" :header="currentRow" />
  </div>
</template>

<script setup name="StockCheck" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listCheck } from '@/api/djs-warehouse/check';
import type { StockCheckHeaderVO, StockCheckQuery } from '@/api/djs-warehouse/check/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import CheckDetailDialog from './components/CheckDetailDialog.vue';
import { lastMonthRange } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const tableRef = ref<BizTableExpose>();

const list = ref<StockCheckHeaderVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  // 盘点日期范围（daterange，默认近一月；loadList 拆成 From/To）
  checkDateRange: lastMonthRange(),
  // 盘点仓库（库位 ID，R70 实体下拉多选）
  locationId: [],
  // 盘点人（按发起人姓名模糊）
  checkByName: undefined
});

// 盘点仓库下拉选项（库位）
const locationOptions = ref<Array<{ label: string; value: string }>>([]);
async function loadLocationOptions() {
  const res: any = await listLocation({ pageNum: 1, pageSize: 500 });
  locationOptions.value = ((res.rows ?? []) as LocationInfoVO[]).map((l) => ({
    label: `${l.locationName}（${l.locationCode}）`,
    value: String(l.id)
  }));
}

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'checkDateRange', label: t('djs.warehouse.check.checkDate'), type: 'daterange' },
  { field: 'locationId', label: t('djs.warehouse.check.checkWarehouse'), type: 'select', multiple: true, options: locationOptions.value },
  { field: 'checkByName', label: t('djs.warehouse.check.checkBy'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'checkDate', label: t('djs.warehouse.check.checkDate'), minWidth: 140, align: 'center', formatter: 'date' },
  { prop: 'locationName', label: t('djs.warehouse.check.checkWarehouse'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'lineCount', label: t('djs.warehouse.check.goodsCount'), minWidth: 140, align: 'center' },
  { prop: 'abnormalCount', label: t('djs.warehouse.check.abnormalCount'), minWidth: 140, align: 'center' },
  { prop: 'checkByName', label: t('djs.warehouse.check.checkBy'), minWidth: 140, align: 'center' },
  { prop: 'createTime', label: t('djs.warehouse.check.createTime'), minWidth: 140, align: 'center', formatter: 'datetime' }
]);

// 详情（盘点记录只读：仅查看小程序端提交的盘点，不允许新增 / 完成 / 取消）
const detailVisible = ref(false);
const currentRow = ref<StockCheckHeaderVO | null>(null);
function openDetailDialog(row: StockCheckHeaderVO) {
  currentRow.value = row;
  detailVisible.value = true;
}

async function loadList() {
  loading.value = true;
  try {
    // 盘点日期范围 → From 00:00:00 ~ To 23:59:59
    const range = (searchModel.checkDateRange as string[] | undefined) ?? [];
    const params: StockCheckQuery = {
      // R70 盘点仓库多选 → locationIds 数组（删单值 locationId 发送）
      locationIds: Array.isArray(searchModel.locationId) && searchModel.locationId.length ? searchModel.locationId : undefined,
      checkByName: searchModel.checkByName || undefined,
      checkDateFrom: range[0] ? `${range[0]} 00:00:00` : undefined,
      checkDateTo: range[1] ? `${range[1]} 23:59:59` : undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listCheck(params);
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
  // 盘点仓库多选重置成空数组（el-select 多选）
  searchModel.locationId = [];
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  const range = (searchModel.checkDateRange as string[] | undefined) ?? [];
  proxy?.download(
    '/djs/warehouse/check/export',
    {
      // R70 盘点仓库多选 → 导出走同一 mapper，发 locationIds 数组
      locationIds: Array.isArray(searchModel.locationId) && searchModel.locationId.length ? searchModel.locationId : undefined,
      checkByName: searchModel.checkByName || undefined,
      checkDateFrom: range[0] ? `${range[0]} 00:00:00` : undefined,
      checkDateTo: range[1] ? `${range[1]} 23:59:59` : undefined
    },
    `库存盘点_${new Date().getTime()}.xlsx`
  );
}

/**
 * 从库存查询页"盘点记录"钻取而来：按库位预过滤。
 * locationId 是雪花 ID，保持 string —— Number() 会丢精度（coder-djs-cross-layer-contract）。
 * 返回是否应用了新的钻取参数（同一份参数不重复覆盖用户手动筛选）。
 */
let appliedDrillKey: string | null = null;
function syncDrillFromQuery(): boolean {
  const key = String(route.query.locationId ?? '');
  if (key === appliedDrillKey) {
    return false;
  }
  appliedDrillKey = key;
  // 盘点仓库改多选后 drill 预过滤也用数组（单库位钻入 → 单元素数组）
  searchModel.locationId = route.query.locationId ? [String(route.query.locationId)] : [];
  return true;
}

onMounted(() => {
  loadLocationOptions();
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
