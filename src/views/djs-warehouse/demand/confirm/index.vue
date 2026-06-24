<!--
  需求确认页（0613-11，C 档整页新建）。

  从需求管理列表（0613-10 grouped）点「查看需求」下钻而来，路由 query 携 demandDate + productId
  （+productName/productType）。展示该需求日期下该需求产品的所有需求订单明细（含全部需求状态）。

  原型权威源 doc/origin/prototype/admin/_real_screenshots/origin_screenshots/仓库管理/需求管理/
    2130cced（确认页本体）+ 488ff646（调整弹窗：单一需求量 step input）+ 379d541d（指定猪只子页）。
  目录树快照（IA）：仓库管理/需求管理/需求确认。

  本页是「整页带面包屑的子页」，属 CLAUDE.md §6.13 复杂场景例外，保持整页（非弹窗）。
  数据源：GET /djs/warehouse/demand/list（buildQueryWrapper 已支持 productId + demandDate 精确过滤
    + productName LIKE + storeId + demandStatus 筛选；后端带 productId 时回填 pigAssigned）。
  门店名前端用 useDemandProducts.loadStoreOptions 的 storeOptions map（storeId→storeName）。
-->
<template>
  <div class="p-2 demand-confirm">
    <div class="page-header">
      <div class="page-title">{{ t('demand.confirmPage.title') }}</div>
      <!-- row47：标题右侧刷新按钮，重拉当前筛选条件下的列表 -->
      <el-button circle :icon="Refresh" :title="t('common.refresh')" @click="fetchList" />
    </div>

    <!-- 筛选区：门店 / 状态（需求产品名称搜索框已按 row46 移除） -->
    <el-form :model="searchModel" inline class="search-bar">
      <el-form-item :label="t('demand.confirmPage.filter.storeId')">
        <el-select
          v-model="searchModel.storeId"
          :placeholder="t('demand.confirmPage.filter.storePh')"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('demand.confirmPage.filter.demandStatus')">
        <el-select
          v-model="searchModel.demandStatus"
          :placeholder="t('demand.confirmPage.filter.statusPh')"
          clearable
          style="width: 180px"
        >
          <el-option v-for="d in statusFilterOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
        <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 白条 / 猪业态才展示「可出栏猪只提示」板块 -->
    <div v-if="showPigTip" class="pig-tip">
      {{ t('demand.confirmPage.pigTip.prefix') }}
      <span class="pig-tip-num">{{ availablePigs }}</span>
      {{ t('demand.confirmPage.pigTip.suffix') }}
    </div>

    <el-table v-loading="loading" :data="list" border :empty-text="t('demand.confirmPage.empty')">
      <el-table-column :label="t('demand.confirmPage.column.productName')" prop="productName" min-width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.productSpec')" prop="productSpec" min-width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.demandQuantity')" prop="demandQuantity" min-width="120" align="center" header-align="center">
        <template #default="{ row }">{{ formatQty(row.demandQuantity) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.productUnit')" prop="productUnit" width="70" align="center" header-align="center" />
      <el-table-column :label="t('demand.confirmPage.column.storeName')" min-width="120" align="center" header-align="center" show-overflow-tooltip>
        <template #default="{ row }">{{ storeNameOf(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.demandRemark')" prop="demandRemark" min-width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.demandStatus')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">
          <!-- row46：表格状态文案与筛选下拉门店视角一致（同源 confirmPage.storeStatus 映射） -->
          <el-tag :type="storeStatusTagType(row.demandStatus)" effect="light">{{ storeStatusLabel(row.demandStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.confirmerTime')" prop="confirmerTime" min-width="120" align="center" header-align="center">
        <template #default="{ row }">{{ row.confirmerTime ? proxy?.parseTime?.(row.confirmerTime) : '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.demandConfirmer')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">{{ row.demandConfirmerName || '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.pigAssigned')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">{{ pigAssignedLabel(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.actions')" width="240" fixed="right" align="center" header-align="center">
        <template #default="{ row }">
          <el-button v-if="canConfirm(row)" link type="success" size="small" @click="onConfirm(row)">
            {{ t('demand.action.confirm') }}
          </el-button>
          <el-button v-if="canAssignPig(row)" link type="primary" size="small" @click="onAssignPig(row)">
            {{ t('demand.action.assignPig') }}
          </el-button>
          <el-button v-if="canDelete(row)" link type="danger" size="small" @click="onDelete(row)">
            {{ t('common.delete') }}
          </el-button>
          <span v-if="!hasAnyAction(row)" class="no-action">—</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchList" />

    <!-- 指定猪只弹窗（沿用现成组件；面包屑不做到第 4 级，按 §6.13 用弹窗）-->
    <PigAssignDialog ref="pigDialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="DemandConfirm" lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Refresh } from '@element-plus/icons-vue';
import PigAssignDialog from '../components/PigAssignDialog.vue';
import { useDemandProducts } from '../composables/useDemandProducts';
import { confirmDemand, getDemandSummary, listDemand, removeDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageQuery, DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();
const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * row46：表格「需求状态」列文案与筛选下拉门店视角（confirmPage.storeStatus）保持一致。
 * 仓库 7 态 → 门店视角文案映射（同 statusFilterOptions 口径，避免「已提交 vs 待确认」双名）。
 */
const STORE_STATUS_LABEL_KEY: Record<string, string> = {
  SUBMITTED: 'SUBMITTED', // 待确认
  CONFIRMED: 'CONFIRMED', // 已确认
  IN_PRODUCTION: 'SHIPPED', // 归「已发货」门店视角
  PARTIAL_SHIPPED: 'SHIPPED', // 已发货
  COMPLETED: 'ARRIVED' // 确认到店
};
function storeStatusLabel(code?: string): string {
  const key = code ? STORE_STATUS_LABEL_KEY[code] : undefined;
  return key ? t(`demand.confirmPage.storeStatus.${key}`) : '—';
}
function storeStatusTagType(code?: string): 'info' | 'success' | 'warning' | 'primary' {
  switch (code) {
    case 'CONFIRMED':
      return 'success';
    case 'IN_PRODUCTION':
    case 'PARTIAL_SHIPPED':
      return 'warning';
    case 'COMPLETED':
      return 'primary';
    case 'SUBMITTED':
    default:
      return 'info';
  }
}

/**
 * 状态筛选下拉门店视角裁剪为 4 态（待确认/已确认/已发货/确认到店），
 * 砍掉门店不关心的 DRAFT/IN_PRODUCTION/CANCELLED/DELETED。
 *
 * value 用原始仓库 demand_status 码，才能命中后端 list 端点的 .eq 等值过滤。
 * 映射：待确认=SUBMITTED；已确认=CONFIRMED；已发货=PARTIAL_SHIPPED；确认到店=COMPLETED。
 * 限制（后端纯前端范围内无法消除）：
 *  - 「已发货」门店语义实含 PARTIAL_SHIPPED + COMPLETED 两码，后端单值 .eq 只能匹配一个，
 *    本下拉用 PARTIAL_SHIPPED；COMPLETED 行归到「确认到店」option。
 *  - 「确认到店」真实定义是 received_time IS NOT NULL（派生态），list 端点无该过滤参数，
 *    此处以 COMPLETED 作就近代理，并非严格按收货时间筛选；如需精确筛选需后端补 received_time 参数。
 */
const statusFilterOptions = computed(() => [
  { label: t('demand.confirmPage.storeStatus.SUBMITTED'), value: 'SUBMITTED' },
  { label: t('demand.confirmPage.storeStatus.CONFIRMED'), value: 'CONFIRMED' },
  { label: t('demand.confirmPage.storeStatus.SHIPPED'), value: 'PARTIAL_SHIPPED' },
  { label: t('demand.confirmPage.storeStatus.ARRIVED'), value: 'COMPLETED' }
]);

/** 路由 query 锁定的需求日期 + 产品（确认页只看某日某产品的所有门店需求单）。 */
const demandDate = String(route.query.demandDate ?? '');
const productId = String(route.query.productId ?? '');
const productType = String(route.query.productType ?? '') as DemandProductType;

/** 白条 / 猪业态才展示「可出栏猪只提示」板块。 */
const showPigTip = computed(() => productType === 'white_bar' || productType === 'pig');
const availablePigs = ref(0);

const { storeOptions, loadStoreOptions } = useDemandProducts();

const list = ref<DemandManageVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<{ storeId?: string; demandStatus?: string }>({
  storeId: undefined,
  demandStatus: undefined
});

function formatQty(v: number | string | undefined): string {
  return Number(v ?? 0).toFixed(2);
}

/** storeId → storeName（从 storeOptions map；无匹配回退 storeId 文本）。 */
function storeNameOf(row: DemandManageVO): string {
  const s = storeOptions.value.find((x) => String(x.id) === String(row.storeId));
  return s?.storeName ?? (row.storeId ? String(row.storeId) : '—');
}

/** 是否指定猪只：白条/猪业态显「是/否」，其他业态不适用显「—」。 */
function pigAssignedLabel(row: DemandManageVO): string {
  if (productType !== 'white_bar' && productType !== 'pig') {
    return '—';
  }
  return row.pigAssigned ? t('demand.confirmPage.yes') : t('demand.confirmPage.no');
}

// 操作列按状态：待确认(SUBMITTED) → 确认/指定猪只(仅白条猪)/删除；其他态 无
// 「调整」已下线（仓库不改门店需求量；需调整由门店端自主改，仓库线下沟通——test/d6-15 后台 #54）
function canConfirm(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED';
}
function canAssignPig(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED' && (productType === 'white_bar' || productType === 'pig');
}
function canDelete(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED';
}
function hasAnyAction(row: DemandManageVO): boolean {
  return canConfirm(row) || canAssignPig(row) || canDelete(row);
}

async function fetchList() {
  loading.value = true;
  try {
    const query: DemandManageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productId: productId || undefined,
      demandDate: demandDate || undefined,
      storeId: searchModel.storeId || undefined,
      demandStatus: (searchModel.demandStatus || undefined) as DemandStatusCode | undefined
    };
    const res: any = await listDemand(query);
    list.value = (res.rows ?? res.data ?? []) as DemandManageVO[];
    total.value = Number(res.total ?? 0);
  } finally {
    loading.value = false;
  }
}

async function loadAvailablePigs() {
  if (!showPigTip.value) return;
  try {
    const res: any = await getDemandSummary('white_bar');
    availablePigs.value = Number(res.data?.availablePigs ?? 0);
  } catch (e) {
    console.warn('[DemandConfirm] loadAvailablePigs failed', e);
    availablePigs.value = 0;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  searchModel.storeId = undefined;
  searchModel.demandStatus = undefined;
  pageNum.value = 1;
  fetchList();
}

async function onConfirm(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.confirm', { no: row.demandNo }));
  await confirmDemand(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

async function onDelete(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirmPage.confirmDelete'));
  await removeDemand(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

function onAssignPig(row: DemandManageVO) {
  const required = Number(row.demandQuantity ?? 0);
  pigDialogRef.value?.open(row.id, row.demandNo, required);
}

const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();

onMounted(async () => {
  await loadStoreOptions();
  await Promise.all([fetchList(), loadAvailablePigs()]);
});
</script>

<style scoped>
.demand-confirm {
  background: var(--el-bg-color);
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0 12px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.search-bar {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  row-gap: 8px;
}
.search-bar :deep(.el-form-item__label) {
  white-space: nowrap;
}
.pig-tip {
  margin: 4px 0 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.pig-tip-num {
  color: var(--el-color-warning);
  font-weight: 700;
  font-size: 16px;
  margin: 0 2px;
}
.no-action {
  color: var(--el-text-color-placeholder);
}
</style>
