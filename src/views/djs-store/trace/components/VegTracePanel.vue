<template>
  <BizTable
    :data="list"
    :total="total"
    :loading="loading"
    :columns="columns"
    :search-schema="searchSchema"
    :search-model="searchModel"
    :page-num="pageNum"
    :page-size="pageSize"
    :action-width="200"
    row-key="id"
    :selectable="false"
    :show-add="false"
    :show-row-edit="false"
    :show-batch-del="false"
    :show-export="false"
    perm-prefix="djs:warehouse:trace"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
  >
    <template #action="{ row }">
      <el-button v-hasPermi="['djs:warehouse:trace:print']" link type="primary" icon="View" @click="handlePreview(row)">
        {{ t('storeTrace.label.preview') }}
      </el-button>
      <el-button v-hasPermi="['djs:warehouse:trace:print']" link type="primary" icon="Printer" @click="handlePrint(row)">
        {{ t('storeTrace.veg.print') }}
      </el-button>
    </template>
  </BizTable>

  <!-- 追溯码打印弹框（录重量 + 结构化标签卡 + 二维码） -->
  <TraceLabelDialog ref="labelDialogRef" />
</template>

<script setup name="VegTracePanel" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listTrace } from '@/api/warehouse/trace';
import type { TraceCodeVO, TraceCodeQuery } from '@/api/warehouse/trace/types';
import TraceLabelDialog, { type TraceLabelData } from './TraceLabelDialog.vue';
import { useI18n } from 'vue-i18n';
import { lastNDaysRange } from '@/utils/ruoyi';
import { formatKgToG } from '@/utils/weight';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const labelDialogRef = ref<InstanceType<typeof TraceLabelDialog>>();

const list = ref<TraceCodeVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 搜索：到店日期范围（daterange，默认近 10 天）/ 产品名称。去掉「序号」搜索条件（row139 ②）
const searchModel = reactive<Record<string, unknown>>({ arrivalDateRange: lastNDaysRange(10), productName: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'arrivalDateRange', label: t('storeTrace.veg.arrivalDate'), type: 'daterange', clearable: true },
  { field: 'productName', label: t('storeTrace.veg.productName'), type: 'input' }
]);

// 原型「果蔬追溯码管理」列：到店日期/生产编号/产品名称/产品规格/实际重量(g)/来源地块/采摘时间/月台接收时间/发货时间
// 去掉「序号」列（row139 ②）；实际重量转克显示（row139 ③）
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'arrivalDate', label: t('storeTrace.veg.arrivalDate'), width: 120, align: 'center' },
  { prop: 'produceNo', label: t('storeTrace.veg.produceNo'), width: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'productName', label: t('storeTrace.veg.productName'), minWidth: 110, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeTrace.veg.productSpec'), width: 100, align: 'center' },
  { prop: 'actualWeight', label: t('storeTrace.veg.actualWeight'), width: 100, align: 'right', formatter: (row: BizRow) => formatKgToG(row.actualWeight) },
  { prop: 'plotName', label: t('storeTrace.veg.plotName'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'pickTime', label: t('storeTrace.veg.pickTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'platformReceiveTime', label: t('storeTrace.veg.platformReceiveTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'shipTime', label: t('storeTrace.veg.shipTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const range = (searchModel.arrivalDateRange as string[] | undefined) ?? [];
    const query: TraceCodeQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      codeType: 'veg',
      productName: (searchModel.productName as string) || undefined,
      // 到店日期范围（row139 ①）：daterange [start, end] → arrivalBeginDate/arrivalEndDate（后端按 trace_event arrival 到店事件过滤）
      arrivalBeginDate: range[0] ? `${range[0]} 00:00:00` : undefined,
      arrivalEndDate: range[1] ? `${range[1]} 23:59:59` : undefined
      // TODO(后端轨 WS6): row139 ④「只显示有发货时间的数据」需后端在 veg 追溯列表加 shipTime 非空过滤（默认 shipTimeNotNull=true 或独立参数），前端不 mock 过滤。
    };
    const res = await listTrace(query);
    list.value = (res.rows ?? res.data ?? []) as TraceCodeVO[];
    total.value = res.total ?? 0;
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

// 标签 8 字段 payload（预览 / 打印共用）。无追溯码返回 null。
function buildLabel(row: BizRow): { payload: TraceLabelData; weight?: number } | null {
  const r = row as unknown as TraceCodeVO;
  const code = String(r.produceCode ?? '');
  if (!code) {
    proxy?.$modal.msgWarning(t('storeTrace.veg.noCode'));
    return null;
  }
  return {
    payload: {
      productCode: r.produceCode,
      // 生产序号展示生产编号（produceNo）值
      serialNo: r.produceNo,
      packCode: r.produceNo,
      produceDate: r.arrivalDate,
      productName: r.productName,
      storeName: r.storeName,
      sourceLabel: t('storeTrace.label.plotNo'),
      sourceValue: r.plotName,
      produceCode: r.produceCode,
      traceType: 'veg'
    },
    weight: r.actualWeight
  };
}

// 预览：弹出追溯码标签卡（二维码 + 8 字段），可再点「确认并打印」
function handlePreview(row: BizRow) {
  const l = buildLabel(row);
  if (l) labelDialogRef.value?.open(l.payload, l.weight);
}

// 追溯码打印：不弹预览框，直接送打印（浏览器 kiosk-printing 模式下无原生对话框，静默打印）
function handlePrint(row: BizRow) {
  const l = buildLabel(row);
  if (l) labelDialogRef.value?.printDirect(l.payload, l.weight);
}

onMounted(() => fetchList());
</script>
