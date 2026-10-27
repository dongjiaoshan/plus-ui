<template>
  <div class="p-2">
    <!-- 单根节点：布局 <transition mode="out-in"> 遇多根会让下一个标签页渲染空白 -->
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
      perm-prefix="djs:warehouse:cutOutDaily"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="100"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:warehouse:cutOutDaily:query']" link type="primary" size="small" @click="handleView(row as CutOutDailyVO)">
          {{ t('cutOutDaily.action.view') }}
        </el-button>
      </template>
    </BizTable>

    <CutOutDetailDrawer ref="drawerRef" />
  </div>
</template>

<script setup name="CutOutDaily" lang="ts">
/**
 * 猪肉日分割出库统计（V7-R6，挂【库存管理】）。
 *
 * 一行 = 一天 × 一个去向：
 * - 仓库出库（白条分割出库管理选「仓库出库」）按出库去向汇总，出库门店列显示「—」；
 * - 门店需求（白条分割出库管理选「门店需求」+ 白条发门店）按门店汇总，出库去向列显示「门店需求」。
 * 出库去向 label、重量 3 位小数都在后端完成；「查看」打开右侧抽屉看逐条明细并可导出。
 */
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listCutOutDaily, OUT_DEST_STORE_DEMAND, type CutOutDailyQuery, type CutOutDailyVO } from '@/api/djs-warehouse/cutOutDaily';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import CutOutDetailDrawer from './components/CutOutDetailDrawer.vue';
import { todayYmd } from '@/utils/date';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_stock_out_dest } = toRefs<Record<string, DictDataOption[]>>(proxy?.useDict('djs_stock_out_dest'));

/** 分页响应实际结构（request 拦截器已剥掉 axios 外壳） */
interface DailyListPayload {
  rows?: CutOutDailyVO[];
  total?: number;
}

/** 搜索表单（type 而非 interface：BizTable 的 searchModel 是索引签名对象） */
type SearchModel = {
  dateRange: string[];
  outDest: string;
  storeId: string;
};

const tableRef = ref<BizTableExpose>();
const drawerRef = ref<{ open: (row: CutOutDailyVO) => void }>();

const list = ref<CutOutDailyVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const storeOptions = ref<StoreVO[]>([]);

/** 甲方：统计日期默认当天（今天 ~ 今天）；重置也回到当天 */
const todayRange = (): string[] => [todayYmd(), todayYmd()];

const searchModel = reactive<SearchModel>({
  dateRange: todayRange(),
  outDest: '',
  storeId: ''
});

/** 出库去向下拉 = 「门店需求」+ 字典 djs_stock_out_dest 全部去向 */
const outDestOptions = computed(() => [
  { label: t('cutOutDaily.storeDemand'), value: OUT_DEST_STORE_DEMAND },
  ...(djs_stock_out_dest.value ?? []).map((d) => ({ label: d.label, value: d.value }))
]);

const storeSelectOptions = computed(() => storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) })));

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'dateRange', label: t('cutOutDaily.field.statDate'), type: 'daterange' },
  { field: 'outDest', label: t('cutOutDaily.field.outDest'), type: 'select', options: outDestOptions.value, clearable: true },
  { field: 'storeId', label: t('cutOutDaily.field.store'), type: 'select', options: storeSelectOptions.value, clearable: true }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statDate', label: t('cutOutDaily.column.statDate'), minWidth: 120, align: 'center' },
  { prop: 'outDestLabel', label: t('cutOutDaily.column.outDest'), minWidth: 140, align: 'center', showOverflowTooltip: true },
  {
    prop: 'storeName',
    label: t('cutOutDaily.column.store'),
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true,
    // 仓库出库行没有门店（甲方：仓库出库统计去向，门店需求才统计门店）
    formatter: (row: BizRow) => (row.storeName ? String(row.storeName) : t('cutOutDaily.emptyText'))
  },
  {
    prop: 'totalWeight',
    label: t('cutOutDaily.column.totalWeight'),
    minWidth: 140,
    align: 'center',
    formatter: (row: BizRow) => formatQtyByUnit(row.totalWeight, 'kg')
  }
]);

/** searchModel → 后端 query（daterange 拆 beginDate / endDate；空串归一 undefined） */
function buildQuery(): Omit<CutOutDailyQuery, 'pageNum' | 'pageSize'> {
  const [from, to] = searchModel.dateRange?.length === 2 ? searchModel.dateRange : [undefined, undefined];
  return {
    beginDate: from || undefined,
    endDate: to || undefined,
    outDest: searchModel.outDest || undefined,
    storeId: searchModel.storeId || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    // request 拦截器已把响应拆成业务体（TableDataInfo），声明的 AxiosPromise 泛型对不上，按实际结构收窄
    const res = (await listCutOutDaily({ ...buildQuery(), pageNum: pageNum.value, pageSize: pageSize.value })) as unknown as DailyListPayload;
    list.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadStoreOptions() {
  const res = (await listStore({ pageNum: 1, pageSize: 500 })) as unknown as { rows?: StoreVO[] };
  storeOptions.value = res.rows ?? [];
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

/** 重置回「当天」（清空日期 = 统计全历史，不是甲方要的默认） */
function handleReset() {
  searchModel.dateRange = todayRange();
  searchModel.outDest = '';
  searchModel.storeId = '';
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleView(row: CutOutDailyVO) {
  drawerRef.value?.open(row);
}

onMounted(() => {
  loadList();
  loadStoreOptions();
});
</script>
