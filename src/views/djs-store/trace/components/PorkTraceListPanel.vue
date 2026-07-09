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
    row-key="id"
    :selectable="false"
    :show-add="false"
    :show-row-edit="false"
    :show-batch-del="false"
    :show-export="false"
    perm-prefix="djs:store:trace"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
  >
    <template #action="{ row }">
      <el-button v-hasPermi="['djs:store:trace:print']" link type="primary" icon="View" @click="handlePreview(row)">
        {{ t('storeTrace.label.preview') }}
      </el-button>
      <el-button v-hasPermi="['djs:store:trace:print']" link type="primary" icon="Printer" @click="handlePrint(row)">
        {{ t('storeTrace.pork.genPrint') }}
      </el-button>
    </template>
  </BizTable>

  <!-- 追溯码打印弹框（录重量 + 结构化标签卡 + 二维码） -->
  <TraceLabelDialog ref="labelDialogRef" />
</template>

<script setup name="PorkTraceListPanel" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listStorePorkTrace } from '@/api/djs-store/trace';
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

// 搜索：生成来源（仓库/门店）/ 到店日期范围（daterange，默认近 10 天，row140 ①）/ 产品名称（恒 codeType=pork，进入即展示仓库发来 + 门店分割）
const searchModel = reactive<Record<string, unknown>>({ source: undefined, arrivalDateRange: lastNDaysRange(10), productName: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'source',
    label: t('storeTrace.pork.sourceCol'),
    type: 'select',
    clearable: true,
    options: [
      { label: t('storeTrace.pork.sourceWarehouse'), value: 'warehouse' },
      { label: t('storeTrace.pork.sourceStore'), value: 'store' }
    ]
  },
  { field: 'arrivalDateRange', label: t('storeTrace.veg.arrivalDate'), type: 'daterange', clearable: true },
  { field: 'productName', label: t('storeTrace.veg.productName'), type: 'input' }
]);

// 猪肉追溯码列表：到店日期/生成来源/生产编号/产品名称/产品规格/实际重量(g)/来源耳号/备注/生成时间
// row140 ②：「生成来源」列移到「到店日期」列右侧；row140 ④：「产品」文案改「产品名称」（codeProductName 已改值）；row140 ⑤：实际重量转克
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'arrivalDate', label: t('storeTrace.veg.arrivalDate'), width: 110, align: 'center' },
  { prop: 'sourceLabel', label: t('storeTrace.pork.sourceCol'), width: 90, align: 'center' },
  { prop: 'produceNo', label: t('storeTrace.veg.produceNo'), width: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'productName', label: t('storeTrace.pork.codeProductName'), minWidth: 110, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeTrace.veg.productSpec'), width: 90, align: 'center' },
  { prop: 'actualWeight', label: t('storeTrace.veg.actualWeight'), width: 90, align: 'right', formatter: (row: BizRow) => formatKgToG(row.actualWeight) },
  { prop: 'pigEarNo', label: t('storeTrace.pork.pigEarNo'), width: 150, align: 'center', showOverflowTooltip: true },
  { prop: 'remark', label: t('storeTrace.pork.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('storeTrace.pork.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const range = (searchModel.arrivalDateRange as string[] | undefined) ?? [];
    const query: TraceCodeQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      codeType: 'pork',
      source: (searchModel.source as string) || undefined,
      productName: (searchModel.productName as string) || undefined,
      // 到店日期范围（row140 ①）：daterange [start, end] → arrivalBeginDate/arrivalEndDate
      arrivalBeginDate: range[0] ? `${range[0]} 00:00:00` : undefined,
      arrivalEndDate: range[1] ? `${range[1]} 23:59:59` : undefined
      // TODO(后端轨): row140 ③「列表不显示白条产品」需后端在 pork 追溯列表过滤掉 belong_type='white_bar' 的产品行。
      // 前端不能过滤：TraceCodeVO 未返回 belongType/belong_type 字段（列表只有 codeType=pork），无判据；后端在 SQL 排除白条即可，前端零改。
    };
    const res = await listStorePorkTrace(query);
    const rows = (res.rows ?? res.data ?? []) as TraceCodeVO[];
    // 来源中文标签（store=门店现场分割打包 / warehouse=仓库）
    list.value = rows.map((r) => ({
      ...r,
      sourceLabel: r.source === 'store' ? t('storeTrace.pork.sourceStore') : t('storeTrace.pork.sourceWarehouse')
    })) as TraceCodeVO[];
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
    proxy?.$modal.msgWarning(t('storeTrace.pork.noCode'));
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
      sourceLabel: t('storeTrace.label.earNo'),
      sourceValue: r.pigEarNo,
      produceCode: r.produceCode,
      traceType: 'pork'
    },
    weight: r.actualWeight
  };
}

// 预览：弹出追溯码标签卡（二维码 + 8 字段），可再点「确认并打印」
function handlePreview(row: BizRow) {
  const l = buildLabel(row);
  if (l) labelDialogRef.value?.open(l.payload, l.weight);
}

// 追溯码打印（重打印）：不弹预览框，直接送打印（浏览器 kiosk-printing 模式下无原生对话框，静默打印）
function handlePrint(row: BizRow) {
  const l = buildLabel(row);
  if (l) labelDialogRef.value?.printDirect(l.payload, l.weight);
}

onMounted(() => fetchList());
</script>
