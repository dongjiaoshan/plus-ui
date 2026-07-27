<!--
  需求确认抽屉（右侧 el-drawer）。

  从需求管理列表（grouped）点「查看需求」打开，open(row) 传入 demandDate + productId + productType + productName，
  展示该需求日期下该需求产品的所有需求订单明细（逐门店 + 状态机操作）。

  为什么用抽屉而非整页子路由：
   - 整页子路由(menu 9055 demand-confirm)被 keep-alive 缓存，再次查看另一条需求时显示上一条的旧数据；
   - 抽屉每次 open() 重新 fetchList，无缓存，且符合 CLAUDE.md §6.13「详情用抽屉 + 点蒙层自动关闭」。
   - close-on-click-modal 用 el-drawer 默认 true（点蒙层关闭），故不显式设 false。

  原型权威源 doc/origin/prototype/admin/_real_screenshots/origin_screenshots/仓库管理/需求管理/
    2130cced（确认页本体）+ 379d541d（指定猪只子页）。
  数据源：GET /djs/warehouse/demand/list（productId + demandDate 精确过滤 + storeId/demandStatus 筛选）。
-->
<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    direction="rtl"
    size="75%"
    destroy-on-close
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div class="demand-confirm">
      <!-- 当日该产品上下文 + 刷新 -->
      <div class="ctx-header">
        <span class="ctx-text">{{ productName }} · {{ demandDate }}</span>
        <el-button circle :icon="Refresh" :title="t('common.refresh')" @click="fetchList" />
      </div>

      <!-- 筛选区：门店 / 状态 -->
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
        <el-table-column :label="t('demand.confirmPage.column.demandStatus')" min-width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="storeStatusTagType(row.demandStatus)" effect="light">{{ storeStatusLabel(row.demandStatus) }}</el-tag>
          </template>
        </el-table-column>
        <!-- 需求日期列（row196）：本抽屉锁定单一需求日期，逐行显式展示 demand_date，避免把「需求最终确认时间」误读成需求日期（次日预约单常见：确认于前一天、需求日期为次日）。 -->
        <el-table-column :label="t('demand.confirmPage.column.demandDate')" prop="demandDate" min-width="110" align="center" header-align="center" />
        <el-table-column :label="t('demand.confirmPage.column.productName')" prop="productName" min-width="120" align="center" header-align="center" show-overflow-tooltip />
        <el-table-column :label="t('demand.confirmPage.column.productSpec')" prop="productSpec" min-width="120" align="center" header-align="center" show-overflow-tooltip />
        <el-table-column :label="t('demand.confirmPage.column.demandQuantity')" prop="demandQuantity" min-width="120" align="center" header-align="center">
          <template #default="{ row }">{{
            productType === 'white_bar'
              ? formatOrderQuantity(row.demandQuantity, row.productUnit, true)
              : formatQty(row.demandQuantity, row.productUnit)
          }}</template>
        </el-table-column>
        <el-table-column :label="t('demand.confirmPage.column.productUnit')" width="70" align="center" header-align="center">
          <template #default="{ row }">{{ productType === 'white_bar' ? t('demand.kpi.unitHead') : (row.productUnit || '-') }}</template>
        </el-table-column>
        <el-table-column :label="t('demand.confirmPage.column.storeName')" min-width="120" align="center" header-align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ storeNameOf(row) }}</template>
        </el-table-column>
        <el-table-column :label="t('demand.confirmPage.column.demandRemark')" prop="demandRemark" min-width="120" align="center" header-align="center" show-overflow-tooltip />
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

      <!-- 指定猪只弹窗（沿用现成组件）-->
      <PigAssignDialog ref="pigDialogRef" @success="onChanged" />
    </div>
  </el-drawer>
</template>

<script setup name="DemandConfirmDrawer" lang="ts">
import { useI18n } from 'vue-i18n';
import { Refresh } from '@element-plus/icons-vue';
import { formatOrderQuantity, isKgUnit } from '@/utils/weight';
import PigAssignDialog from './PigAssignDialog.vue';
import { useDemandProducts } from '../composables/useDemandProducts';
import { confirmDemand, getDemandSummary, listDemand, removeDemand } from '@/api/djs-warehouse/demand';
import type { DemandGroupVO, DemandManageQuery, DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emit = defineEmits<{ (e: 'changed'): void }>();

const visible = ref(false);

/** open() 传入的需求日期 + 产品上下文（每次打开重置，不缓存——修复整页子路由的旧数据缓存 bug）。 */
const demandDate = ref('');
const productId = ref('');
const productType = ref<DemandProductType | ''>('');
const productName = ref('');

const drawerTitle = computed(() => t('demand.confirmPage.title'));

/**
 * row46：表格「需求状态」列文案与筛选下拉门店视角（confirmPage.storeStatus）保持一致。
 * 仓库 7 态 → 门店视角文案映射（避免「已提交 vs 待确认」双名）。
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
 * 状态筛选下拉门店视角裁剪为 4 态（待确认/已确认/已发货/确认到店）。
 * value 用原始仓库 demand_status 码，命中后端 list 端点的 .eq 等值过滤。
 */
const statusFilterOptions = computed(() => [
  { label: t('demand.confirmPage.storeStatus.SUBMITTED'), value: 'SUBMITTED' },
  { label: t('demand.confirmPage.storeStatus.CONFIRMED'), value: 'CONFIRMED' },
  { label: t('demand.confirmPage.storeStatus.SHIPPED'), value: 'PARTIAL_SHIPPED' },
  { label: t('demand.confirmPage.storeStatus.ARRIVED'), value: 'COMPLETED' }
]);

/** 白条 / 猪业态才展示「可出栏猪只提示」板块。 */
const showPigTip = computed(() => productType.value === 'white_bar' || productType.value === 'pig');
const availablePigs = ref(0);

const { storeOptions, loadStoreOptions } = useDemandProducts();
let storeLoaded = false;

const list = ref<DemandManageVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<{ storeId?: string; demandStatus?: string }>({
  storeId: undefined,
  demandStatus: undefined
});

/** 需求量按产品单位分流：kg（含公斤）保留三位小数，其余取整不留小数。 */
function formatQty(v: number | string | undefined, unit?: string | null): string {
  const n = Number(v ?? 0);
  return isKgUnit(unit) ? n.toFixed(3) : String(Math.round(n));
}

/** storeId → storeName（从 storeOptions map；无匹配回退 storeId 文本）。 */
function storeNameOf(row: DemandManageVO): string {
  const s = storeOptions.value.find((x) => String(x.id) === String(row.storeId));
  return s?.storeName ?? (row.storeId ? String(row.storeId) : '—');
}

/** 是否指定猪只：白条/猪业态显「是/否」，其他业态不适用显「—」。 */
function pigAssignedLabel(row: DemandManageVO): string {
  if (productType.value !== 'white_bar' && productType.value !== 'pig') {
    return '—';
  }
  return row.pigAssigned ? t('demand.confirmPage.yes') : t('demand.confirmPage.no');
}

// 操作列按状态：待确认(SUBMITTED) → 确认/指定猪只(仅白条猪)/删除；其他态 无
function canConfirm(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED';
}
function canAssignPig(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED' && (productType.value === 'white_bar' || productType.value === 'pig');
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
      productId: productId.value || undefined,
      demandDate: demandDate.value || undefined,
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
  if (!showPigTip.value) {
    availablePigs.value = 0;
    return;
  }
  try {
    const res: any = await getDemandSummary('white_bar');
    availablePigs.value = Number(res.data?.availablePigs ?? 0);
  } catch (e) {
    console.warn('[DemandConfirmDrawer] loadAvailablePigs failed', e);
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

/** 状态机操作成功后：刷新抽屉内列表 + 通知父列表重拉（确认率/状态联动）。 */
function onChanged() {
  fetchList();
  emit('changed');
}

async function onConfirm(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirm.confirm', { no: row.demandNo }));
  await confirmDemand(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  onChanged();
}

async function onDelete(row: DemandManageVO) {
  await proxy?.$modal.confirm(t('demand.confirmPage.confirmDelete'));
  await removeDemand(row.id);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  onChanged();
}

function onAssignPig(row: DemandManageVO) {
  const required = Number(row.demandQuantity ?? 0);
  pigDialogRef.value?.open(row.id, row.demandNo, required);
}

const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();

/** 列表「查看需求」调用：设上下文 → 重置筛选/分页 → 打开 → 拉数据（每次都重拉，无缓存）。 */
async function open(row: DemandGroupVO) {
  demandDate.value = row.demandDate ?? '';
  productId.value = row.productId != null ? String(row.productId) : '';
  productType.value = (row.productType ?? '') as DemandProductType | '';
  productName.value = row.productName ?? '';
  searchModel.storeId = undefined;
  searchModel.demandStatus = undefined;
  pageNum.value = 1;
  visible.value = true;
  if (!storeLoaded) {
    await loadStoreOptions();
    storeLoaded = true;
  }
  await Promise.all([fetchList(), loadAvailablePigs()]);
}

defineExpose({ open });
</script>

<style scoped>
.demand-confirm {
  width: 100%;
  box-sizing: border-box;
}
.ctx-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.ctx-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
