<template>
  <!-- 库存查询行钻取：入库 / 出库 / 盘点记录就地弹窗（只看本产品/本库位，不再跳菜单页）。规则1：close-on-click-modal 默认开 -->
  <el-dialog v-model="visible" :title="dialogTitle" width="1100px" append-to-body destroy-on-close :close-on-click-modal="true">
    <div v-if="anchor" class="mb-2 text-sm text-gray-500">
      {{ t('stock.column.productName') }}：{{ anchor.productName }}
      <template v-if="anchor.productCode">&nbsp;|&nbsp;{{ t('stock.column.productCode') }}：{{ anchor.productCode }}</template>
      <template v-if="anchor.locationName">&nbsp;|&nbsp;{{ t('stock.column.locationName') }}：{{ anchor.locationName }}</template>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 入库记录 -->
      <el-tab-pane :label="t('stock.action.flowIn')" name="in">
        <el-table v-loading="inLoading" :data="inList" border max-height="460">
          <el-table-column prop="flowDate" :label="t('djs.warehouse.flowIn.flowDate')" min-width="160" align="center" header-align="center">
            <template #default="{ row }">{{ formatDateTime(row.flowDate) }}</template>
          </el-table-column>
          <el-table-column prop="flowNo" :label="t('djs.warehouse.flowIn.flowNo')" min-width="160" align="center" header-align="center" />
          <el-table-column prop="flowType" :label="t('djs.warehouse.flowIn.inMode')" min-width="110" align="center" header-align="center">
            <template #default="{ row }"><dict-tag :options="djs_flow_type" :value="row.flowType" /></template>
          </el-table-column>
          <el-table-column prop="locationName" :label="t('djs.warehouse.flowIn.location')" min-width="120" align="center" header-align="center" />
          <el-table-column prop="changeQuantity" :label="t('djs.warehouse.flowIn.changeQuantity')" min-width="110" align="center" header-align="center" />
          <el-table-column prop="productUnit" :label="t('djs.warehouse.flowIn.productUnit')" min-width="80" align="center" header-align="center" />
          <el-table-column prop="operatorName" :label="t('djs.warehouse.flowIn.operator')" min-width="100" align="center" header-align="center" />
        </el-table>
      </el-tab-pane>

      <!-- 出库记录（出库口径文案 + 出库去向列） -->
      <el-tab-pane :label="t('stock.action.flowOut')" name="out">
        <el-table v-loading="outLoading" :data="outList" border max-height="460">
          <el-table-column prop="flowDate" :label="t('djs.warehouse.flowOut.flowDate')" min-width="160" align="center" header-align="center">
            <template #default="{ row }">{{ formatDateTime(row.flowDate) }}</template>
          </el-table-column>
          <el-table-column prop="flowNo" :label="t('djs.warehouse.flowOut.flowNo')" min-width="160" align="center" header-align="center" />
          <el-table-column prop="flowType" :label="t('djs.warehouse.flowOut.outMode')" min-width="110" align="center" header-align="center">
            <template #default="{ row }"><dict-tag :options="djs_flow_type" :value="row.flowType" /></template>
          </el-table-column>
          <el-table-column prop="stockOutDest" :label="t('djs.warehouse.flowOut.stockOutDest')" min-width="110" align="center" header-align="center">
            <template #default="{ row }"><dict-tag :options="djs_stock_out_dest" :value="row.stockOutDest" /></template>
          </el-table-column>
          <el-table-column prop="locationName" :label="t('djs.warehouse.flowOut.location')" min-width="120" align="center" header-align="center" />
          <el-table-column prop="changeQuantity" :label="t('djs.warehouse.flowOut.changeQuantity')" min-width="110" align="center" header-align="center" />
          <el-table-column prop="productUnit" :label="t('djs.warehouse.flowOut.productUnit')" min-width="80" align="center" header-align="center" />
          <el-table-column prop="operatorName" :label="t('djs.warehouse.flowOut.operator')" min-width="100" align="center" header-align="center" />
        </el-table>
      </el-tab-pane>

      <!-- 盘点记录（按库位拉明细 → 前端按本产品 productId 过滤，只看本产品的盘点行） -->
      <el-tab-pane :label="t('stock.action.checkRecord')" name="check">
        <el-table v-loading="checkLoading" :data="checkList" border max-height="460">
          <el-table-column prop="checkDate" :label="t('stock.column.latestCheckTime')" min-width="160" align="center" header-align="center">
            <template #default="{ row }">{{ formatDateTime(row.checkDate) }}</template>
          </el-table-column>
          <el-table-column prop="checkId" :label="t('stock.recordDialog.checkId')" min-width="160" align="center" header-align="center" />
          <el-table-column prop="locationName" :label="t('stock.column.locationName')" min-width="120" align="center" header-align="center" />
          <el-table-column prop="sysStock" :label="t('stock.recordDialog.sysStock')" min-width="110" align="center" header-align="center" />
          <el-table-column prop="checkStock" :label="t('stock.recordDialog.checkStock')" min-width="110" align="center" header-align="center" />
          <el-table-column prop="diffStock" :label="t('stock.recordDialog.diffStock')" min-width="100" align="center" header-align="center" />
          <el-table-column prop="checkResultType" :label="t('stock.column.checkResult')" min-width="100" align="center" header-align="center">
            <template #default="{ row }"><dict-tag :options="djs_check_result" :value="row.checkResultType" /></template>
          </el-table-column>
          <el-table-column prop="checkByName" :label="t('stock.recordDialog.checkBy')" min-width="100" align="center" header-align="center" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="StockRecordDialog" lang="ts">
import { listFlowIn, listFlowOut } from '@/api/djs-warehouse/stockFlow';
import type { StockFlowVO } from '@/api/djs-warehouse/stockFlow/types';
import { listCheckLines } from '@/api/djs-warehouse/check';
import type { StockCheckRecordVO } from '@/api/djs-warehouse/check/types';
import type { LocationStockVO } from '@/api/djs-warehouse/stock/types';
import { parseTime } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_flow_type, djs_check_result, djs_stock_out_dest } = toRefs<Record<string, any>>(
  proxy?.useDict('djs_flow_type', 'djs_check_result', 'djs_stock_out_dest')
);

const visible = ref(false);
const activeTab = ref<'in' | 'out' | 'check'>('in');
const anchor = ref<LocationStockVO | null>(null);

const inList = ref<StockFlowVO[]>([]);
const outList = ref<StockFlowVO[]>([]);
const checkList = ref<StockCheckRecordVO[]>([]);
const inLoading = ref(false);
const outLoading = ref(false);
const checkLoading = ref(false);

const dialogTitle = computed(() => t('stock.recordDialog.title'));

function formatDateTime(v?: string): string {
  if (!v) return '-';
  return parseTime(v, '{y}-{m}-{d} {h}:{i}:{s}') as string;
}

async function loadIn() {
  if (!anchor.value?.productId) {
    inList.value = [];
    return;
  }
  inLoading.value = true;
  try {
    const res = await listFlowIn({ productId: String(anchor.value.productId), pageNum: 1, pageSize: 200 });
    inList.value = (res as any).rows ?? [];
  } finally {
    inLoading.value = false;
  }
}

async function loadOut() {
  if (!anchor.value?.productId) {
    outList.value = [];
    return;
  }
  outLoading.value = true;
  try {
    const res = await listFlowOut({ productId: String(anchor.value.productId), pageNum: 1, pageSize: 200 });
    outList.value = (res as any).rows ?? [];
  } finally {
    outLoading.value = false;
  }
}

async function loadCheck() {
  if (!anchor.value?.locationId) {
    checkList.value = [];
    return;
  }
  checkLoading.value = true;
  try {
    // 盘点单为库位级，按 locationId 拉明细后按本产品 productId 过滤（只看本产品的盘点记录）
    const res = await listCheckLines({ locationId: anchor.value.locationId });
    const rows = ((res as any).rows ?? (res as any).data ?? []) as StockCheckRecordVO[];
    const pid = String(anchor.value.productId ?? '');
    checkList.value = pid ? rows.filter((r) => String(r.productId) === pid && r.isHeader !== 1) : rows.filter((r) => r.isHeader !== 1);
  } finally {
    checkLoading.value = false;
  }
}

function open(row: LocationStockVO, kind: 'in' | 'out' | 'check') {
  anchor.value = row;
  activeTab.value = kind;
  inList.value = [];
  outList.value = [];
  checkList.value = [];
  visible.value = true;
  loadIn();
  loadOut();
  loadCheck();
}

defineExpose({ open });
</script>
