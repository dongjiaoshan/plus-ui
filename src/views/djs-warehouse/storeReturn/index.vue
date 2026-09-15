<template>
  <div class="p-2">
    <!--
      STR-RETURN-OPS-001 · 门店退回操作（仓库 → 库存管理，menu_id 9152）

      一行 = 一张退回单（退回类型 + 退回日期 + 门店/退回单位），不是一条产品。
      待处理 → 操作列「退回处理」（右侧抽屉逐行确认）；已处理 → 「查看详情」（同一抽屉只读）。
      「新增」建一张**单位退回**单（直接已处理 + 未丢弃行写入库）。

      聚合读后端 /djs/store/return/store-daily（与仓库「退回记录」同一份真相源，不另起一套聚合）；
      三个品类数由后端算，前端不做任何 filter —— 前端 filter 当前页在分页/导出时必错。
    -->
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
      :dict-types="['djs_store_return_type', 'djs_store_return_status']"
      row-key="_rowKey"
      perm-prefix="djs:warehouse:storeReturn"
      show-add
      show-export
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-min-width="120"
      @search="handleSearch"
      @reset="handleReset"
      @add="openCreate"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <!-- 退回门店：单位退回展示退回单位名（后端已统一回填到 storeName），前端不再分叉 -->
      <template #cell-storeName="{ row }">
        <span>{{ (row as ReturnStoreDailyVO).storeName || '—' }}</span>
      </template>

      <!-- 操作：待处理 → 退回处理；已处理 → 查看详情 -->
      <template #action="{ row }">
        <el-button
          v-if="(row as ReturnStoreDailyVO).returnStatus !== 'received'"
          v-hasPermi="['djs:warehouse:storeReturn:confirm']"
          type="primary"
          link
          @click="openDrawer(row as ReturnStoreDailyVO, 'handle')"
        >
          {{ t('djs.warehouse.storeReturn.handle') }}
        </el-button>
        <el-button
          v-else
          v-hasPermi="['djs:warehouse:storeReturn:query']"
          type="primary"
          link
          @click="openDrawer(row as ReturnStoreDailyVO, 'detail')"
        >
          {{ t('djs.warehouse.storeReturn.viewDetail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 退回处理 / 查看详情：右侧抽屉，同一个组件 -->
    <ReturnOpsDrawer v-model="drawerVisible" :mode="drawerMode" :row="currentRow" @done="loadList" />

    <!-- 新增单位退回 -->
    <UnitReturnCreateDialog v-model="createVisible" @done="loadList" />
  </div>
</template>

<script setup name="StoreReturnOps" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listReturnStoreDaily } from '@/api/djs-warehouse/return';
import type { ReturnProductQuery, ReturnStoreDailyVO } from '@/api/djs-warehouse/return/types';
import { listReturnOwnerOptions } from '@/api/djs-store/return';
import type { StoreReturnOwnerOptionVO } from '@/api/djs-store/return/types';
import ReturnOpsDrawer from './components/ReturnOpsDrawer.vue';
import UnitReturnCreateDialog from './components/UnitReturnCreateDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_store_return_type } = toRefs<any>(proxy?.useDict('djs_store_return_type'));

const tableRef = ref<BizTableExpose>();

const list = ref<ReturnStoreDailyVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  returnDate: undefined,
  returnType: undefined,
  owner: undefined,
  returnStatus: undefined
});

/**
 * 退回门店下拉数据源（row222）：现有退回记录里出现过的门店 / 退回单位去重，不是全量门店档案。
 *
 * 一个下拉里混着两种主体，故 value 带前缀区分：`store:<门店id>` / `unit:<退回单位字典value>`，
 * 提交查询时再拆回 storeId / returnUnit 两个互斥条件。不做成两个下拉：列表上它们本来就共用
 * 「退回门店」一列，拆成两个筛选框反而要用户先判断这一行是哪种类型。
 */
const ownerOptions = ref<StoreReturnOwnerOptionVO[]>([]);
const OWNER_STORE = 'store';
const ownerSearchOptions = computed(() =>
  ownerOptions.value.map((o) => ({
    label: o.label,
    value: o.returnType === OWNER_STORE ? `store:${o.storeId}` : `unit:${o.returnUnit}`
  }))
);

/** 退回类型下拉：走字典（store=门店退回 / unit=单位退回），不硬编码文案。 */
const returnTypeOptions = computed<Array<{ label: string; value: string }>>(() =>
  (djs_store_return_type?.value ?? []).map((d: any) => ({ label: d.label, value: d.value }))
);

/** 四个搜索条件（甲方 row213 第 2 条）：退回日期 / 退回类型 / 退回门店 / 状态。 */
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDate', label: t('djs.warehouse.storeReturn.returnDate'), type: 'daterange' },
  { field: 'returnType', label: t('djs.warehouse.storeReturn.returnType'), type: 'select', options: returnTypeOptions.value },
  {
    field: 'owner',
    label: t('djs.warehouse.storeReturn.returnStore'),
    type: 'select',
    options: ownerSearchOptions.value,
    clearable: true
    // 不再按退回类型置灰：下拉里现在两种主体都有（门店项与单位项），
    // 选中哪一项就下推哪一个条件，选「单位退回」时按单位筛是合法组合。
  },
  { field: 'returnStatus', label: t('djs.warehouse.storeReturn.returnStatus'), type: 'select', dictType: 'djs_store_return_status' }
]);

/** 12 列（甲方 row213 第 3 条），末列由 BizTable 的操作列提供。 */
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'returnDate', label: t('djs.warehouse.storeReturn.returnDate'), minWidth: 110 },
  { prop: 'returnType', label: t('djs.warehouse.storeReturn.returnType'), minWidth: 100, dictType: 'djs_store_return_type' },
  { prop: 'storeName', label: t('djs.warehouse.storeReturn.returnStore'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'returnStatus', label: t('djs.warehouse.storeReturn.returnStatus'), minWidth: 100, dictType: 'djs_store_return_status' },
  { prop: 'porkKindCount', label: t('djs.warehouse.storeReturn.porkKindCount'), minWidth: 130 },
  { prop: 'vegKindCount', label: t('djs.warehouse.storeReturn.vegKindCount'), minWidth: 130 },
  { prop: 'otherKindCount', label: t('djs.warehouse.storeReturn.otherKindCount'), minWidth: 130 },
  { prop: 'operatorName', label: t('djs.warehouse.storeReturn.operatorName'), minWidth: 110 },
  { prop: 'returnTime', label: t('djs.warehouse.storeReturn.returnTime'), minWidth: 160 },
  { prop: 'confirmUserName', label: t('djs.warehouse.storeReturn.confirmUserName'), minWidth: 110 },
  { prop: 'confirmTime', label: t('djs.warehouse.storeReturn.confirmTime'), minWidth: 160 }
]);

// 抽屉 / 新增弹框
const drawerVisible = ref(false);
const drawerMode = ref<'handle' | 'detail'>('handle');
const currentRow = ref<ReturnStoreDailyVO | null>(null);
const createVisible = ref(false);

function openDrawer(row: ReturnStoreDailyVO, mode: 'handle' | 'detail') {
  currentRow.value = row;
  drawerMode.value = mode;
  drawerVisible.value = true;
}

function openCreate() {
  createVisible.value = true;
}

// searchModel → 后端 query（退回日期 daterange 拆成 returnDateFrom/returnDateTo）
function buildQueryParams(): ReturnProductQuery {
  const range = (searchModel.returnDate as string[] | undefined) ?? [];
  const returnType = searchModel.returnType || undefined;
  // row222：下拉 value 形如 `store:<id>` / `unit:<字典value>`，在这里拆回两个互斥条件。
  // 单位 value 本身可能含冒号，故只按**第一个**冒号切，右半原样保留。
  const owner = (searchModel.owner as string | undefined) || '';
  const sep = owner.indexOf(':');
  const ownerKind = sep < 0 ? '' : owner.slice(0, sep);
  const ownerVal = sep < 0 ? '' : owner.slice(sep + 1);
  return {
    returnType,
    storeId: ownerKind === OWNER_STORE ? ownerVal || undefined : undefined,
    returnUnit: ownerKind === 'unit' ? ownerVal || undefined : undefined,
    returnStatus: searchModel.returnStatus || undefined,
    returnDateFrom: range[0] || undefined,
    returnDateTo: range[1] || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res: any = await listReturnStoreDaily({
      ...buildQueryParams(),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    const rows: ReturnStoreDailyVO[] = res?.rows ?? [];
    rows.forEach((r) => {
      // 行键 = 类型 + 日期 + 门店/退回单位：单位退回没有 storeId，只靠日期会与门店行撞键，
      // el-table 会按 index 复用行、把 A 单的输入框挂到 B 单上。
      r._rowKey = `${r.returnType ?? 'store'}|${r.returnDate}|${r.storeId ?? r.returnUnit ?? ''}`;
    });
    list.value = rows;
    total.value = res?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  // row222 起「退回门店」下拉里同时有门店项与退回单位项，「单位退回 + 某个单位」是**合法组合**，
  // 不能再像以前那样一选单位退回就把它清掉（清掉等于把用户刚选的条件在他眼前抹了，还静默少筛一道）。
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

/** 导出外层汇总（与列表同口径、同筛选条件）。 */
function handleExport() {
  proxy?.download(
    'djs/store/return/store-daily/export',
    buildQueryParams(),
    `${t('djs.warehouse.storeReturn.title')}_${new Date().getTime()}.xlsx`
  );
}

async function loadOwnerOptions() {
  const res: any = await listReturnOwnerOptions();
  ownerOptions.value = res?.data ?? [];
}

onMounted(() => {
  loadList();
  loadOwnerOptions();
});
</script>
