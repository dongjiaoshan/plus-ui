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
    :show-export="false"
    perm-prefix="djs:warehouse:trace"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
  >
    <template #action="{ row }">
      <el-button v-hasPermi="['djs:warehouse:trace:print']" link type="primary" icon="Printer" @click="handlePrint(row)">
        {{ t('storeTrace.veg.print') }}
      </el-button>
    </template>
  </BizTable>
</template>

<script setup name="VegTracePanel" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { listTrace } from '@/api/warehouse/trace';
import type { TraceCodeVO, TraceCodeQuery } from '@/api/warehouse/trace/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const list = ref<TraceCodeVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 原型搜索：到店日期 / 序号 / 产品名称
const searchModel = reactive<Record<string, unknown>>({ arrivalDate: undefined, serialNo: undefined, productName: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'arrivalDate', label: t('storeTrace.veg.arrivalDate'), type: 'date' },
  { field: 'serialNo', label: t('storeTrace.veg.serialNo'), type: 'input' },
  { field: 'productName', label: t('storeTrace.veg.productName'), type: 'input' }
]);

// 原型「果蔬追溯码管理」列：到店日期/生产编号/序号/产品名称/产品规格/实际重量/来源地块/采摘时间/月台接收时间/发货时间
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'arrivalDate', label: t('storeTrace.veg.arrivalDate'), width: 120, align: 'center' },
  { prop: 'produceNo', label: t('storeTrace.veg.produceNo'), width: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'serialNo', label: t('storeTrace.veg.serialNo'), width: 70, align: 'center' },
  { prop: 'productName', label: t('storeTrace.veg.productName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'productSpec', label: t('storeTrace.veg.productSpec'), width: 100, align: 'center' },
  { prop: 'actualWeight', label: t('storeTrace.veg.actualWeight'), width: 100, align: 'right' },
  { prop: 'plotName', label: t('storeTrace.veg.plotName'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'pickTime', label: t('storeTrace.veg.pickTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'platformReceiveTime', label: t('storeTrace.veg.platformReceiveTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'shipTime', label: t('storeTrace.veg.shipTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const arrival = (searchModel.arrivalDate as string) || undefined;
    const query: TraceCodeQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      codeType: 'veg',
      productName: (searchModel.productName as string) || undefined,
      // 到店日期：单日 → beginDate/endDate 同日（后端按生成时间区间过滤）
      beginDate: arrival ? `${arrival} 00:00:00` : undefined,
      endDate: arrival ? `${arrival} 23:59:59` : undefined
    };
    // 序号精确查：后端 TraceCodeQuery 暂无 serialNo 过滤（backendGap），先随参带上，后端补后即生效
    const serialNo = (searchModel.serialNo as string) || undefined;
    const res = await listTrace({ ...query, serialNo } as TraceCodeQuery & { serialNo?: string });
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

// 追溯码打印：浏览器打印一张含追溯码的标签（V1 简版）
function handlePrint(row: BizRow) {
  const code = String((row as unknown as TraceCodeVO).produceCode ?? '');
  const name = String((row as unknown as TraceCodeVO).productName ?? '');
  if (!code) {
    proxy?.$modal.msgWarning(t('storeTrace.veg.noCode'));
    return;
  }
  const w = window.open('', '_blank', 'width=420,height=320');
  if (!w) return;
  w.document.write(
    `<html><head><title>${code}</title></head><body style="font-family:sans-serif;text-align:center;padding:24px">` +
      `<h3 style="margin:0 0 12px">${name}</h3>` +
      `<div style="font-size:20px;letter-spacing:1px;border:1px dashed #333;padding:16px;border-radius:8px">${code}</div>` +
      `</body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
}

onMounted(() => fetchList());
</script>
