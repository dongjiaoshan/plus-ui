<template>
  <div class="return-record-list">
    <!-- 退回记录（只读 + 仓库确认入库）。猪肉 / 果蔬 / 其他 三 tab 按产品归属下推后端过滤（row10）：
         「其他」= 其余全部（干货 / 蛋类 / 礼盒 / 其他 / 归属为空），保证任何一条记录都能被看到 -->
    <el-tabs v-model="activeTab" class="return-tabs" @tab-change="handleTabChange">
      <el-tab-pane :label="t('storeReturn.tab.pork')" name="pork" />
      <el-tab-pane :label="t('storeReturn.tab.vegetable')" name="vegetable" />
      <el-tab-pane :label="t('storeReturn.tab.other')" name="other" />
    </el-tabs>
    <BizTable
      ref="tableRef"
      :data="displayList"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_store_return_status', 'djs_belong_type']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :selectable="false"
      :show-add="false"
      :show-row-edit="false"
      :show-row-del="false"
      :show-batch-del="false"
      :show-export="true"
      perm-prefix="djs:store:return"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup name="StoreReturnRecordList" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listStoreReturn, exportStoreReturn } from '@/api/djs-store/return';
import type { StoreReturnQuery, StoreReturnVO } from '@/api/djs-store/return/types';
import { blobValidate } from '@/utils/ruoyi';
import { formatQtyByUnit, formatReceivedAmount } from '@/utils/weight';
import FileSaver from 'file-saver';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const tableRef = ref<BizTableExpose>();

const list = ref<StoreReturnVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

type ReturnTab = 'pork' | 'vegetable' | 'other';
const activeTab = ref<ReturnTab>('pork');

// 归属类型/代码/单位/原材料单位由后端 VO 直接回填（belongType/productCode/productUnit/materialUnit）。
// tab 过滤已下推后端（belongCategory 参数）——前端不再对当前页切片，分页 total/每页行数才正确。
// row10：「退回产品类型」列不再贴二值 label（此前干货/蛋类/礼盒一律被写成「果蔬产品」），
// 改按 belongType 走 djs_belong_type 字典显示真实业态；归属为空的行（归「其他」tab）显示为「其他」。
const displayList = computed<StoreReturnVO[]>(() => {
  return list.value.map((row) => {
    return {
      ...row,
      unit: row.productUnit,
      belongType: row.belongType || 'other'
    } as StoreReturnVO & { unit?: string };
  });
});

const searchModel = reactive<Record<string, unknown>>({
  returnStatus: undefined,
  productName: undefined,
  returnDateRange: undefined
});

// 搜索：退货日期（区间）/ 产品名称 / 退货状态（产品类型走 tab，不入搜索栏）
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDateRange', label: t('storeReturn.field.returnDate'), type: 'daterange' },
  { field: 'productName', label: t('storeReturn.column.productName'), type: 'input' },
  { field: 'returnStatus', label: t('storeReturn.column.returnStatus'), type: 'select', dictType: 'djs_store_return_status' }
]);

// 仓库实收量（row14 统一模型）：计量单位由**原材料单位**决定 —— 原材料按 kg 的产品（含 80g 干货礼盒
// 这种「产品按份、原材料按 kg」）显 `X.XXXkg`；原材料非 kg 的显「整数 + 产品单位」（1枚 / 30份）。空值 —。
function formatReceivedWeight(row: { receivedWeight?: number | string | null; unit?: string | null; materialUnit?: string | null }): string {
  return formatReceivedAmount(row.receivedWeight, row.unit, row.materialUnit) || '—';
}

// 「退回记录」列：退回日期/产品类型/产品名称/退货量/单位/仓库实收量/退货状态
// r86：去掉「产品代码」列；所有列统一 minWidth，宽度保持一致，由 el-table 均分富余宽度
// row54：退货量按单位分流（KG→3 位小数 / 非 KG→整数）；去掉「货物重量」「仓库实收量」两列
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnDate', label: t('storeReturn.column.returnDate'), minWidth: 130, align: 'center', formatter: 'datetime' },
  // row10：真实业态（djs_belong_type 字典），不再是「猪肉/果蔬」二值 label
  { prop: 'belongType', label: t('storeReturn.column.productType'), minWidth: 130, align: 'center', dictType: 'djs_belong_type' },
  { prop: 'productName', label: t('storeReturn.column.productName'), minWidth: 130, align: 'center', showOverflowTooltip: true },
  { prop: 'returnQuantity', label: t('storeReturn.column.returnQuantity'), minWidth: 130, align: 'center', formatter: (row) => formatQtyByUnit(row.returnQuantity, row.unit) },
  { prop: 'unit', label: t('storeReturn.column.unit'), minWidth: 130, align: 'center' },
  // row14：列头「仓库实收量」，单位跟在每行数值后面
  { prop: 'receivedWeight', label: t('storeReturn.column.receivedWeight'), minWidth: 130, align: 'center', formatter: (row) => formatReceivedWeight(row) },
  { prop: 'returnStatus', label: t('storeReturn.column.returnStatus'), minWidth: 130, align: 'center', dictType: 'djs_store_return_status' }
]);

// 退回日期区间：daterange 回写 [from, to]，拆成后端两个字段
function resolveDateRange(): { returnDateFrom?: string; returnDateTo?: string } {
  const range = searchModel.returnDateRange as [string, string] | undefined;
  return {
    returnDateFrom: range?.[0] || undefined,
    returnDateTo: range?.[1] || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const query: StoreReturnQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      returnStatus: (searchModel.returnStatus as string) || undefined,
      productName: (searchModel.productName as string) || undefined,
      belongCategory: activeTab.value,
      ...resolveDateRange()
    };
    const res = await listStoreReturn(query);
    list.value = (res.rows ?? res.data ?? []) as StoreReturnVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  tableRef.value?.clearSelection?.();
  // tab 过滤在后端（belongCategory）：切 tab 回第 1 页重拉，total/行数按 tab 独立
  pageNum.value = 1;
  fetchList();
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
// 导出走后端 GET /djs/store/return/export（与 api/djs-store/return.ts exportStoreReturn 对齐；
// 不用 proxy.download —— 那是 POST，后端 export 是 GET，会报 "Request method 'POST' is not supported"）
async function handleExport() {
  const loading = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  try {
    const params: StoreReturnQuery = {
      returnStatus: (searchModel.returnStatus as string) || undefined,
      productName: (searchModel.productName as string) || undefined,
      belongCategory: activeTab.value,
      ...resolveDateRange()
    };
    const data = await exportStoreReturn(params);
    if (blobValidate(data)) {
      FileSaver.saveAs(new Blob([data as unknown as BlobPart]), `store_return_${new Date().getTime()}.xlsx`);
    } else {
      proxy?.$modal.msgError(t('storeReturn.export.failed'));
    }
  } catch (e) {
    console.error('[ReturnRecordList] export failed', e);
    proxy?.$modal.msgError(t('storeReturn.export.failed'));
  } finally {
    loading.close();
  }
}

onMounted(() => {
  fetchList();
});
</script>
