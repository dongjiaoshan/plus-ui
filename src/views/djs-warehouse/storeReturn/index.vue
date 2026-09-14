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
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
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
  storeId: undefined,
  returnStatus: undefined
});

/** 退回门店下拉数据源（单位退回没有门店，选类型=单位退回时禁用该条件）。 */
const storeOptions = ref<StoreVO[]>([]);
const storeSearchOptions = computed(() => storeOptions.value.map((s) => ({ label: s.storeName, value: String(s.id) })));

/** 退回类型下拉：走字典（store=门店退回 / unit=单位退回），不硬编码文案。 */
const returnTypeOptions = computed<Array<{ label: string; value: string }>>(() =>
  (djs_store_return_type?.value ?? []).map((d: any) => ({ label: d.label, value: d.value }))
);

/** 四个搜索条件（甲方 row213 第 2 条）：退回日期 / 退回类型 / 退回门店 / 状态。 */
const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'returnDate', label: t('djs.warehouse.storeReturn.returnDate'), type: 'daterange' },
  { field: 'returnType', label: t('djs.warehouse.storeReturn.returnType'), type: 'select', options: returnTypeOptions.value },
  {
    field: 'storeId',
    label: t('djs.warehouse.storeReturn.returnStore'),
    type: 'select',
    options: storeSearchOptions.value,
    clearable: true,
    // 单位退回没有门店：选了「单位退回」还按门店筛必然查出空页，直接置灰比让用户白筛一次友好
    disabled: searchModel.returnType === 'unit'
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
  return {
    returnType,
    // 退回类型选了「单位退回」时丢弃门店条件：单位退回按定义没有门店，带着它只会查出空页
    storeId: returnType === 'unit' ? undefined : searchModel.storeId || undefined,
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
  // 退回类型 = 单位退回时清掉门店条件：单位退回按定义没有门店，留着旧值只会让人以为筛了门店，
  // 而 buildQueryParams 又会把它丢掉 —— 干脆清空，屏上与下推条件保持一致。
  if (searchModel.returnType === 'unit') {
    searchModel.storeId = undefined;
  }
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

async function loadStoreOptions() {
  const res: any = await listStore({ pageNum: 1, pageSize: 500 });
  storeOptions.value = res?.rows ?? [];
}

onMounted(() => {
  loadList();
  loadStoreOptions();
});
</script>
