<!--
  需求单打印弹框（V7-R8，仓库 › 需求管理）。

  搜索：需求日期区间（默认今日 ~ 明日）+ 需求门店（多选）。
  列表：需求日期 / 需求品类数 / 需求门店 / 操作（打印），全部居中。一行 = 一张门店订货单（需求日期 × 门店）。
  打印：拉该门店该日明细 → printDemandSheet 生成 A4 横向订货单 → 浏览器打印。
  数据源：GET /djs/warehouse/demand/print/list、/print/detail（口径同需求管理汇总列表：排除已取消 / 已删除）。
-->
<template>
  <el-dialog v-model="visible" :title="t('demandPrint.title')" width="760px" append-to-body destroy-on-close>
    <el-form :inline="true" class="print-search" @submit.prevent>
      <el-form-item :label="t('demandPrint.field.demandDate')">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :start-placeholder="t('demandPrint.placeholder.begin')"
          :end-placeholder="t('demandPrint.placeholder.end')"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item :label="t('demandPrint.field.store')">
        <el-select
          v-model="storeIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          clearable
          :placeholder="t('demandPrint.placeholder.store')"
          style="width: 220px"
        >
          <el-option v-for="opt in storeOptions" :key="String(opt.value)" :label="opt.label" :value="String(opt.value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">{{ t('demandPrint.action.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('demandPrint.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border :empty-text="t('demandPrint.empty')">
      <el-table-column :label="t('demandPrint.column.demandDate')" prop="demandDate" min-width="130" align="center" header-align="center" />
      <el-table-column :label="t('demandPrint.column.categoryCount')" prop="categoryCount" min-width="110" align="center" header-align="center" />
      <el-table-column
        :label="t('demandPrint.column.storeName')"
        prop="storeName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('demandPrint.column.actions')" width="110" align="center" header-align="center">
        <template #default="{ row }">
          <el-button link type="primary" :loading="printingKey === keyOf(row)" @click="onPrint(row)">
            {{ t('demandPrint.action.print') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" :auto-scroll="false" @pagination="fetchList" />
  </el-dialog>
</template>

<script setup lang="ts">
import { getDemandPrintDetail, listDemandPrintSheet, type DemandPrintSheetVO } from '@/api/djs-warehouse/demandPrint';
import { shiftYmd, todayYmd } from '@/utils/date';
import { printDemandSheet, type DemandSheetLabels } from '../printDemandSheet';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'DemandPrintDialog' });

/** 需求门店下拉 options：复用需求管理页已拉好的门店列表，不再重复请求。 */
const props = defineProps<{ storeOptions: { label: string; value: number | string }[] }>();
const storeOptions = computed(() => props.storeOptions);

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const list = ref<DemandPrintSheetVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const dateRange = ref<string[]>([]);
const storeIds = ref<string[]>([]);
/** 正在拉明细的那一行（防连点 + 按钮 loading） */
const printingKey = ref('');

/** 默认需求日期区间：今日 ~ 明日（甲方原文）。 */
function defaultRange(): string[] {
  return [todayYmd(), shiftYmd(1)];
}

function keyOf(row: DemandPrintSheetVO): string {
  return `${row.demandDate}_${row.storeId}`;
}

async function fetchList() {
  loading.value = true;
  try {
    const [beginDate, endDate] = dateRange.value?.length === 2 ? dateRange.value : [undefined, undefined];
    const res = await listDemandPrintSheet({
      beginDate,
      endDate,
      storeIds: storeIds.value.length ? storeIds.value : undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    list.value = res.rows ?? [];
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
  dateRange.value = defaultRange();
  storeIds.value = [];
  handleSearch();
}

/** 打印页固定文案（走 i18n，传给纯 TS 的打印模块）。 */
function sheetLabels(): DemandSheetLabels {
  return {
    titleSuffix: t('demandPrint.sheet.titleSuffix'),
    demandDate: t('demandPrint.sheet.demandDate'),
    storeName: t('demandPrint.sheet.storeName'),
    categoryCount: t('demandPrint.sheet.categoryCount'),
    seq: t('demandPrint.sheet.seq'),
    productName: t('demandPrint.sheet.productName'),
    productSpec: t('demandPrint.sheet.productSpec'),
    demandQuantity: t('demandPrint.sheet.demandQuantity'),
    unit: t('demandPrint.sheet.unit'),
    remark: t('demandPrint.sheet.remark'),
    prepared: t('demandPrint.sheet.prepared'),
    unitHead: t('demandPrint.sheet.unitHead')
  };
}

async function onPrint(row: DemandPrintSheetVO) {
  if (printingKey.value) return;
  printingKey.value = keyOf(row);
  try {
    const res = await getDemandPrintDetail(row.demandDate, row.storeId);
    const detail = res.data;
    // 列表到点打印之间需求可能被取消光；空单不唤起打印框
    if (!detail || !detail.items?.length) {
      proxy?.$modal.msgWarning(t('demandPrint.emptySheet'));
      return;
    }
    printDemandSheet(detail, sheetLabels());
  } finally {
    printingKey.value = '';
  }
}

/** 打开弹框：每次重置为默认条件（今日 ~ 明日、全部门店）并重拉。 */
function open() {
  dateRange.value = defaultRange();
  storeIds.value = [];
  list.value = [];
  total.value = 0;
  pageNum.value = 1;
  visible.value = true;
  fetchList();
}

defineExpose({ open });
</script>

<style scoped>
.print-search :deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
