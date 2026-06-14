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
      row-key="id"
      perm-prefix="djs:warehouse:check"
      show-export
      :show-add="true"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="openCreateDialog"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #action="{ row }">
        <el-button type="primary" link @click="openDetailDialog(row as StockCheckHeaderVO)">
          {{ t('djs.warehouse.check.detail') }}
        </el-button>
        <el-button
          v-if="(row as StockCheckHeaderVO).checkStatus === 'in_progress'"
          v-hasPermi="['djs:warehouse:check:complete']"
          type="success"
          link
          @click="handleComplete(row as StockCheckHeaderVO)"
        >
          {{ t('djs.warehouse.check.complete') }}
        </el-button>
        <el-button
          v-if="(row as StockCheckHeaderVO).checkStatus === 'in_progress'"
          v-hasPermi="['djs:warehouse:check:cancel']"
          type="warning"
          link
          @click="handleCancel(row as StockCheckHeaderVO)"
        >
          {{ t('djs.warehouse.check.cancel') }}
        </el-button>
      </template>
    </BizTable>

    <CheckCreateDialog v-model="createVisible" @success="onCreated" />
    <CheckDetailDialog v-model="detailVisible" :header="currentRow" />
  </div>
</template>

<script setup name="StockCheck" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { cancelCheck, completeCheck, listCheck } from '@/api/djs-warehouse/check';
import type { StockCheckHeaderVO, StockCheckQuery } from '@/api/djs-warehouse/check/types';
import { listLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoVO } from '@/api/djs-warehouse/location/types';
import CheckCreateDialog from './components/CheckCreateDialog.vue';
import CheckDetailDialog from './components/CheckDetailDialog.vue';
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
  // 盘点日期（单日，loadList 拆成当天 From/To）
  checkDate: undefined,
  // 盘点仓库（库位 ID）
  locationId: undefined,
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
  { field: 'checkDate', label: t('djs.warehouse.check.checkDate'), type: 'date' },
  { field: 'locationId', label: t('djs.warehouse.check.checkWarehouse'), type: 'select', options: locationOptions.value },
  { field: 'checkByName', label: t('djs.warehouse.check.checkBy'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'checkDate', label: t('djs.warehouse.check.checkDate'), minWidth: 160, align: 'center', formatter: 'date' },
  { prop: 'locationName', label: t('djs.warehouse.check.checkWarehouse'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'lineCount', label: t('djs.warehouse.check.goodsCount'), width: 120, align: 'center' },
  { prop: 'abnormalCount', label: t('djs.warehouse.check.abnormalCount'), width: 120, align: 'center' },
  { prop: 'checkByName', label: t('djs.warehouse.check.checkBy'), minWidth: 100, align: 'center' },
  { prop: 'createTime', label: t('djs.warehouse.check.createTime'), minWidth: 160, align: 'center', formatter: 'datetime' }
]);

// 新建盘点单
const createVisible = ref(false);
function openCreateDialog() {
  createVisible.value = true;
}
function onCreated() {
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.createSuccess'));
  loadList();
}

// 详情
const detailVisible = ref(false);
const currentRow = ref<StockCheckHeaderVO | null>(null);
function openDetailDialog(row: StockCheckHeaderVO) {
  currentRow.value = row;
  detailVisible.value = true;
}

// 完成盘点
async function handleComplete(row: StockCheckHeaderVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.check.completeConfirm', { no: row.checkId }));
  await completeCheck(row.id);
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.completeSuccess'));
  await loadList();
}

// 取消盘点
async function handleCancel(row: StockCheckHeaderVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.check.cancelConfirm', { no: row.checkId }));
  await cancelCheck(row.id);
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.cancelSuccess'));
  await loadList();
}

async function loadList() {
  loading.value = true;
  try {
    // 盘点日期单日 → 当天 00:00:00 ~ 23:59:59 范围
    const day = searchModel.checkDate ? String(searchModel.checkDate) : undefined;
    const params: StockCheckQuery = {
      locationId: searchModel.locationId || undefined,
      checkByName: searchModel.checkByName || undefined,
      checkDateFrom: day ? `${day} 00:00:00` : undefined,
      checkDateTo: day ? `${day} 23:59:59` : undefined,
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
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  const day = searchModel.checkDate ? String(searchModel.checkDate) : undefined;
  proxy?.download(
    '/djs/warehouse/check/export',
    {
      locationId: searchModel.locationId || undefined,
      checkByName: searchModel.checkByName || undefined,
      checkDateFrom: day ? `${day} 00:00:00` : undefined,
      checkDateTo: day ? `${day} 23:59:59` : undefined
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
  searchModel.locationId = route.query.locationId ? String(route.query.locationId) : undefined;
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
