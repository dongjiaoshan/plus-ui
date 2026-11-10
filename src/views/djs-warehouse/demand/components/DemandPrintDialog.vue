<!-- 单日门店需求列表；普通与汇总打印仅输出已确认内容。 -->
<template>
  <el-dialog v-model="visible" :title="t('demandPrint.title')" width="760px" append-to-body destroy-on-close>
    <template #header="{ titleId, titleClass }">
      <div class="print-dialog-heading">
        <span :id="titleId" :class="titleClass">{{ t('demandPrint.title') }}</span>
        <small class="print-confirmed-hint">{{ t('demandPrint.confirmedOnlyHint') }}</small>
      </div>
    </template>
    <el-form :inline="true" class="print-search" @submit.prevent>
      <el-form-item :label="t('demandPrint.field.demandDate')">
        <el-date-picker v-model="demandDate" type="date" :clearable="false" value-format="YYYY-MM-DD" style="width: 180px" />
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
        <el-button type="primary" plain icon="Printer" :loading="summaryPrinting" @click="onPrintSummary">
          {{ t('demandPrint.action.summaryPrint') }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-alert v-if="summaryError" :title="summaryError" type="error" show-icon class="summary-error" />

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
import { getDemandPrintDetail, getDemandPrintSummary, listDemandPrintSheet, type DemandPrintSheetVO } from '@/api/djs-warehouse/demandPrint';
import { shiftYmd, todayYmd } from '@/utils/date';
import { useUserStore } from '@/store/modules/user';
import { printDemandSheet, printDemandSummary, type DemandSheetLabels } from '../printDemandSheet';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'DemandPrintDialog' });

/** 需求门店下拉 options：复用需求管理页已拉好的门店列表，不再重复请求。 */
const props = defineProps<{ storeOptions: { label: string; value: number | string }[] }>();
const storeOptions = computed(() => props.storeOptions);

const { t } = useI18n();
const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const list = ref<DemandPrintSheetVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const demandDate = ref(shiftYmd(1));
const summaryPrinting = ref(false);
const summaryError = ref('');
const storeIds = ref<string[]>([]);
/** 正在拉明细的那一行（防连点 + 按钮 loading） */
const printingKey = ref('');

function keyOf(row: DemandPrintSheetVO): string {
  return `${row.demandDate}_${row.storeId}`;
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listDemandPrintSheet({
      demandDate: demandDate.value,
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
  summaryError.value = '';
  pageNum.value = 1;
  fetchList();
}

function handleReset() {
  demandDate.value = shiftYmd(1);
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
    unitHead: t('demandPrint.sheet.unitHead'),
    preparedBy: t('demandPrint.sheet.preparedBy'),
    printDate: t('demandPrint.sheet.printDate'),
    footerStore: t('demandPrint.sheet.footerStore')
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
    printDemandSheet(detail, sheetLabels(), {
      preparedBy: userStore.nickname || userStore.name,
      printDate: todayYmd()
    });
  } finally {
    printingKey.value = '';
  }
}

async function onPrintSummary() {
  if (summaryPrinting.value) return;
  summaryPrinting.value = true;
  summaryError.value = '';
  try {
    const res = await getDemandPrintSummary(demandDate.value, storeIds.value.length ? storeIds.value : undefined);
    if (!res.data?.items?.length) {
      proxy?.$modal.msgWarning(t('demandPrint.emptySummary'));
      return;
    }
    printDemandSummary(res.data, {
      titleSuffix: t('demandPrint.summary.titleSuffix'),
      productName: t('demandPrint.sheet.productName'),
      productSpec: t('demandPrint.summary.productSpec'),
      demandQuantity: t('demandPrint.sheet.demandQuantity'),
      unit: t('demandPrint.sheet.unit'),
      rawMaterialName: t('demandPrint.summary.rawMaterialName')
    });
  } catch (error) {
    // 请求层已展示服务端具体原因；保留可见失败状态并允许修正条件后重试。
    summaryError.value = error instanceof Error ? error.message : t('demandPrint.summaryFailed');
  } finally {
    summaryPrinting.value = false;
  }
}

/** 每次打开重置为明日与全部门店，并重新查询。 */
function open() {
  summaryError.value = '';
  demandDate.value = shiftYmd(1);
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
.print-dialog-heading {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}
.print-confirmed-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.summary-error {
  margin-bottom: 12px;
}
.print-search :deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
