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
    <div class="page-title">{{ t('demand.confirmPage.title') }}</div>

    <!-- 筛选区：产品名 / 门店 / 状态 -->
    <el-form :model="searchModel" inline class="search-bar">
      <el-form-item :label="t('demand.confirmPage.filter.productName')">
        <el-input
          v-model="searchModel.productName"
          :placeholder="t('demand.confirmPage.filter.productNamePh')"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
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
          <el-option v-for="d in djs_demand_status" :key="d.value" :label="d.label" :value="d.value" />
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
      <el-table-column :label="t('demand.confirmPage.column.productName')" prop="productName" min-width="140" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.productSpec')" prop="productSpec" width="110" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.demandQuantity')" prop="demandQuantity" width="100" align="right">
        <template #default="{ row }">{{ formatQty(row.demandQuantity) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.productUnit')" prop="productUnit" width="70" align="center" />
      <el-table-column :label="t('demand.confirmPage.column.storeName')" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ storeNameOf(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.demandRemark')" prop="demandRemark" min-width="140" show-overflow-tooltip />
      <el-table-column :label="t('demand.confirmPage.column.demandStatus')" width="100" align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_demand_status" :value="row.demandStatus" />
        </template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.confirmerTime')" prop="confirmerTime" width="160" align="center">
        <template #default="{ row }">{{ row.confirmerTime ? proxy?.parseTime?.(row.confirmerTime) : '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.demandConfirmer')" width="100" align="center">
        <template #default="{ row }">{{ row.demandConfirmerName || '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.pigAssigned')" width="100" align="center">
        <template #default="{ row }">{{ pigAssignedLabel(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.confirmPage.column.actions')" width="240" fixed="right" align="center">
        <template #default="{ row }">
          <el-button v-if="canConfirm(row)" link type="success" size="small" @click="onConfirm(row)">
            {{ t('demand.action.confirm') }}
          </el-button>
          <el-button v-if="canAdjust(row)" link type="primary" size="small" @click="onAdjust(row)">
            {{ t('demand.confirmPage.action.adjust') }}
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

    <!-- 调整弹窗：仅改需求量（对齐原型 488ff646 单一 step input）-->
    <el-dialog v-model="adjustVisible" :title="t('demand.confirmPage.adjust.title')" width="420px" destroy-on-close append-to-body>
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="80px">
        <el-form-item :label="t('demand.confirmPage.adjust.demandQuantity')" prop="demandQuantity">
          <el-input-number v-model="adjustForm.demandQuantity" :min="0.01" :step="1" :precision="2" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="adjustSubmitting" @click="submitAdjust">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 指定猪只弹窗（沿用现成组件；面包屑不做到第 4 级，按 §6.13 用弹窗）-->
    <PigAssignDialog ref="pigDialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="DemandConfirm" lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { FormInstance, FormRules } from 'element-plus';
import PigAssignDialog from '../components/PigAssignDialog.vue';
import { useDemandProducts } from '../composables/useDemandProducts';
import { confirmDemand, getDemandSummary, listDemand, removeDemand, updateDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageForm, DemandManageQuery, DemandManageVO, DemandProductType, DemandStatusCode } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();
const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_demand_status } = toRefs<any>(proxy?.useDict('djs_demand_status'));

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

const searchModel = reactive<{ productName?: string; storeId?: string; demandStatus?: string }>({
  productName: undefined,
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

// 操作列按状态：待确认(SUBMITTED) → 确认/调整/指定猪只(仅白条猪)/删除；已确认(CONFIRMED) → 调整；其他态 无
function canConfirm(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED';
}
function canAdjust(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED' || row.demandStatus === 'CONFIRMED';
}
function canAssignPig(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED' && (productType === 'white_bar' || productType === 'pig');
}
function canDelete(row: DemandManageVO): boolean {
  return row.demandStatus === 'SUBMITTED';
}
function hasAnyAction(row: DemandManageVO): boolean {
  return canConfirm(row) || canAdjust(row) || canAssignPig(row) || canDelete(row);
}

async function fetchList() {
  loading.value = true;
  try {
    const query: DemandManageQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      productId: productId || undefined,
      demandDate: demandDate || undefined,
      productName: searchModel.productName || undefined,
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
  searchModel.productName = undefined;
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

// -------- 调整弹窗：仅改需求量 --------
const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();
const adjustVisible = ref(false);
const adjustSubmitting = ref(false);
const adjustFormRef = ref<FormInstance>();
const adjustRow = ref<DemandManageVO | null>(null);
const adjustForm = reactive<{ demandQuantity: number }>({ demandQuantity: 1 });
const adjustRules: FormRules = {
  demandQuantity: [{ required: true, message: t('demand.field.demandQuantity.required'), trigger: 'blur' }]
};

function onAdjust(row: DemandManageVO) {
  adjustRow.value = row;
  adjustForm.demandQuantity = Number(row.demandQuantity ?? 1);
  adjustVisible.value = true;
}

async function submitAdjust() {
  if (!adjustFormRef.value || !adjustRow.value) return;
  await adjustFormRef.value.validate();
  const row = adjustRow.value;
  // edit 端点要求全字段 BO（productName/storeId/productId/productType/productUnit 必填），从原行带回，只改需求量
  const payload: DemandManageForm = {
    id: row.id,
    demandDate: row.demandDate,
    storeId: row.storeId,
    productId: row.productId,
    productName: row.productName,
    productType: row.productType,
    productSpec: row.productSpec,
    demandQuantity: adjustForm.demandQuantity,
    productUnit: row.productUnit,
    rawMaterial: row.rawMaterial,
    materialQty: row.materialQty != null ? Number(row.materialQty) : undefined,
    demandRemark: row.demandRemark,
    demandExplain: row.demandExplain,
    expectedArriveDate: row.expectedArriveDate,
    remark: row.remark
  };
  adjustSubmitting.value = true;
  try {
    await updateDemand(payload);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    adjustVisible.value = false;
    fetchList();
  } finally {
    adjustSubmitting.value = false;
  }
}

onMounted(async () => {
  await loadStoreOptions();
  await Promise.all([fetchList(), loadAvailablePigs()]);
});
</script>

<style scoped>
.demand-confirm {
  background: var(--el-bg-color);
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 4px 0 12px;
}
.search-bar {
  margin-bottom: 8px;
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
