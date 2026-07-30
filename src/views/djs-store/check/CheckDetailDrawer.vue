<template>
  <!-- 查看详情：只读 9 列矩阵，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>当日盘点只读」。 -->
  <el-drawer v-model="visible" :title="title" direction="rtl" size="80%" append-to-body destroy-on-close>
    <!-- 品类切换：猪肉产品 / 果蔬产品 / 其他产品（DENGBO-R10），与新增当日盘点一致 -->
    <!-- 页签右侧（row49）：当日白条分割损耗 = max(0, 白条到店重 − 白条分割产品总重)，后端权威计算；当天无白条到店则不显示。 -->
    <div class="tabs-band">
      <el-tabs v-model="activeTab" class="belong-tabs">
        <el-tab-pane v-for="tab in TABS" :key="tab" :name="tab" :label="`${t(`storeLedger.belongTab.${tab}`)} (${tabCount[tab]})`" />
      </el-tabs>
      <div v-if="showWhiteBarSplitLoss" class="white-bar-split-loss">
        {{ t('storeLedger.entry.whiteBarSplitLoss') }}<span class="value">{{ whiteBarSplitLoss.toFixed(3) }}</span> kg
      </div>
    </div>
    <!-- row120：所有列同一 min-width（el-table 按比例分配 → 等宽），产品名称不再独占大半；「退货量」(returnQty，顾客退货) 隐藏，只留「退回量」(whReturnQty，门店退回仓库)。 -->
    <el-table v-loading="loading" :data="filteredLines" border stripe>
      <el-table-column prop="productName" :label="t('storeLedger.column.productName')" min-width="120" show-overflow-tooltip fixed="left" align="center" header-align="center" />
      <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" min-width="120" align="center" header-align="center" />
      <!-- 计量列配色（admin row150/151）：>0 蓝色高亮、0 灰色；损耗量单独红色（负损耗=盘盈用橙色） -->
      <el-table-column v-for="col in QTY_COLUMNS" :key="col.prop" :prop="col.prop" :label="t(col.label)" min-width="120" align="center" header-align="center">
        <template #default="{ row }">
          <span :class="qtyClass(row[col.prop])">{{ qtyText(row, col.prop) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lossQty" :label="t('storeLedger.column.lossQty')" min-width="120" align="center" header-align="center">
        <template #default="{ row }">
          <span class="loss" :class="{ 'loss-negative': Number(row.lossQty) < 0, 'is-zero': !Number(row.lossQty) }">{{ qtyText(row, 'lossQty') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="closingQty" :label="t('storeLedger.column.closingQty')" min-width="120" align="center" header-align="center" fixed="right">
        <template #default="{ row }">
          <span class="closing" :class="qtyClass(row.closingQty)">{{ fmtQty(row.closingQty, row.materialUnit || row.productUnit) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !lines.length" :description="t('common.empty')" />
  </el-drawer>
</template>

<script setup name="StoreCheckDetailDrawer" lang="ts">
import { getStoreLedgerDetail } from '@/api/djs-store/ledger';
import type { StoreLedgerBelongTab, StoreLedgerLineVO } from '@/api/djs-store/ledger/types';
import { getWhiteBarSplitLoss } from '@/api/djs-store/loss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const lines = ref<StoreLedgerLineVO[]>([]);
const currentDate = ref('');

/**
 * 当日白条分割损耗（row49）：查看详情打开时后端拉取，口径同 white_bar_split_loss 定时任务
 * （splitLoss = max(0, 白条到店重 − 白条分割产品总重)）。当天无白条到店（到店重=0）则不显示。
 * 后端 BigDecimal 序列化成字符串，Number() 强转。
 */
const arriveWeight = ref(0);
const whiteBarSplitLoss = ref(0);
/** 当天有白条到店（到店重 > 0）才显示「当日白条分割损耗」整块。 */
const showWhiteBarSplitLoss = computed<boolean>(() => arriveWeight.value > 0);

function nz(v: number | string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

/** 产品品类页签（DENGBO-R10）：猪肉 / 果蔬 / 其他，与新增当日盘点一致。 */
const TABS: StoreLedgerBelongTab[] = ['pork', 'veg', 'other'];
const activeTab = ref<StoreLedgerBelongTab>('pork');
const tabCount = computed<Record<StoreLedgerBelongTab, number>>(() => {
  const c: Record<StoreLedgerBelongTab, number> = { pork: 0, veg: 0, other: 0 };
  for (const l of lines.value) c[(l.belongTab ?? 'other') as StoreLedgerBelongTab] += 1;
  return c;
});
const filteredLines = computed<StoreLedgerLineVO[]>(() => lines.value.filter((l) => (l.belongTab ?? 'other') === activeTab.value));

/** 是否 kg（重量）单位：kg / KG / 公斤 视为重量列，保留 3 位小数。 */
function isKgUnit(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'kg' || u === '公斤';
}

/** kg 单位数值保留 3 位小数；非 kg（计件）单位原样展示；空值显示 '-'。 */
function fmtQty(value: number | string | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (!isKgUnit(unit)) {
    // 计件（份 / 盒等）：去尾零显整数（DENGBO-R10，如 3.000 → 3）
    return String(Number(value));
  }
  const n = Number(value);
  return Number.isNaN(n) ? '-' : n.toFixed(3);
}

/** 期初 / 入库 / 销售 / 赠送 / 退回 五个通用计量列（损耗、期末另有配色规则，单独声明）。 */
const QTY_COLUMNS: Array<{ prop: keyof StoreLedgerLineVO & string; label: string }> = [
  { prop: 'openingQty', label: 'storeLedger.column.openingQty' },
  { prop: 'inboundQty', label: 'storeLedger.column.inboundQty' },
  { prop: 'saleQty', label: 'storeLedger.column.saleQty' },
  { prop: 'giftQty', label: 'storeLedger.column.giftQty' },
  { prop: 'whReturnQty', label: 'storeLedger.column.returnedQty' }
];

/** 单元格文案：白条产品行按原材料单位（materialUnit）判重量口径。 */
function qtyText(row: StoreLedgerLineVO, prop: string): string {
  return fmtQty((row as Record<string, unknown>)[prop] as number | string | null | undefined, row.materialUnit || row.productUnit);
}

/**
 * 计量格配色（admin row150）：数值 > 0 蓝色高亮、0 / 空值灰色，
 * 让操作员一眼扫出哪几行当天真有出入库，不用逐格读 0.000。
 */
function qtyClass(value: number | string | null | undefined): string {
  return Number(value) > 0 ? 'qty-positive' : 'is-zero';
}

const title = computed(() => t('storeLedger.detail.titleByDate', { date: currentDate.value || '-' }));

async function open(storeId: string, ledgerDate: string) {
  currentDate.value = ledgerDate;
  visible.value = true;
  loading.value = true;
  arriveWeight.value = 0;
  whiteBarSplitLoss.value = 0;
  // 当日白条分割损耗（row49）与明细并行拉取，不互相阻塞
  void loadWhiteBarSplitLoss(storeId, ledgerDate);
  try {
    const res = await getStoreLedgerDetail(storeId, ledgerDate);
    lines.value = (res.data ?? []) as StoreLedgerLineVO[];
    // 默认落在第一个有数据的品类页签
    activeTab.value = TABS.find((tab) => lines.value.some((l) => (l.belongTab ?? 'other') === tab)) ?? 'pork';
  } finally {
    loading.value = false;
  }
}

/** 拉取当日白条分割损耗（无门店 / 无日期 → 0）。 */
async function loadWhiteBarSplitLoss(storeId: string, ledgerDate: string) {
  if (!storeId || !ledgerDate) {
    arriveWeight.value = 0;
    whiteBarSplitLoss.value = 0;
    return;
  }
  const res = await getWhiteBarSplitLoss(storeId, ledgerDate);
  const data = (res as unknown as { data?: { arriveWeight?: number | string; splitLoss?: number | string } }).data;
  arriveWeight.value = nz(data?.arriveWeight);
  whiteBarSplitLoss.value = nz(data?.splitLoss);
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.tabs-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .belong-tabs {
    flex: 1;
    min-width: 0;
  }

  .white-bar-split-loss {
    flex-shrink: 0;
    padding-bottom: 8px;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;

    .value {
      margin: 0 2px 0 4px;
      font-weight: 600;
      color: var(--el-color-danger);
    }
  }
}

/* 期末库存恒加粗：.is-zero / .qty-positive 与 .closing 同权重且后声明，会盖掉 font-weight，
   这里靠组合选择器提高特异度锁住加粗，颜色仍交给 .is-zero / .qty-positive */
.closing {
  font-weight: 600;

  &.is-zero,
  &.qty-positive {
    font-weight: 600;
  }
}

/* 计量格配色（admin row150/151）：>0 蓝、=0 灰、损耗红（负损耗=盘盈橙） */
.qty-positive {
  font-weight: 600;
  color: var(--el-color-primary);
}

.is-zero {
  color: #909399;
  font-weight: 400;
}

.loss {
  font-weight: 600;
  color: var(--el-color-danger);

  &.loss-negative {
    color: var(--el-color-warning);
  }
}
</style>
