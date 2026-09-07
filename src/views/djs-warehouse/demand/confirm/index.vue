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
          v-model="searchModel.storeDemandStatus"
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
      <!-- 到店量（V6-R197）：需求量右边，= 该需求下已发货清点的成品条数，与需求量同单位；没发过车显 0 -->
      <el-table-column :label="t('demand.confirmPage.column.arrivedQuantity')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">{{ formatQty(row.arrivedQuantity ?? 0) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.productUnit')" prop="productUnit" width="70" align="center" header-align="center" />
      <el-table-column :label="t('demand.confirmPage.column.storeName')" min-width="120" align="center" header-align="center" show-overflow-tooltip>
        <template #default="{ row }">{{ storeNameOf(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.demandRemark')" prop="demandRemark" min-width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.demandStatus')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">
          <!-- V6-R197：渲染后端派生的门店态 storeDemandStatus，前端不再自己映射仓库 7 态 -->
          <dict-tag :options="djs_store_demand_status" :value="row.storeDemandStatus" />
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
import type { DemandManageQuery, DemandManageVO, DemandProductType, StoreDemandViewStatusCode } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();
const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * 需求状态列 / 筛选下拉都走门店视角派生态字典 djs_store_demand_status（V6-R197）。
 *
 * 前端不再自己把仓库 7 态映射成门店文案：那份映射把 COMPLETED 一律算成「确认到店」，
 * 缺量出车（COMPLETED 但一件都没到店）的行也显示确认到店 —— 甲方 row197 报的就是这个。
 * 状态由后端 StoreDemandStatusMapping 一处算完回填 storeDemandStatus，筛选把门店态原样回传
 * （storeDemandStatuses），读与筛同源，与 DemandConfirmDrawer 逐字一致。
 */
const { djs_store_demand_status } = toRefs<any>(proxy?.useDict('djs_store_demand_status'));

/** 状态筛选下拉 = 字典项去掉「已删除」（门店端不提供已删除查询，后端 mapping 对它直接报错）。 */
const statusFilterOptions = computed<{ label: string; value: string }[]>(() =>
  ((djs_store_demand_status.value ?? []) as { label: string; value: string }[])
    .filter((d) => d.value !== 'DELETED')
    .map((d) => ({ label: d.label, value: d.value }))
);

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

const searchModel = reactive<{ storeId?: string; storeDemandStatus?: string }>({
  storeId: undefined,
  storeDemandStatus: undefined
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
      // 门店视角态筛选（V6-R197）：传门店态给后端按 StoreDemandStatusMapping 下推
      storeDemandStatuses: searchModel.storeDemandStatus ? [searchModel.storeDemandStatus as StoreDemandViewStatusCode] : undefined
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
  searchModel.storeDemandStatus = undefined;
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
