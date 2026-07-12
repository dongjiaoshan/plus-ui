<template>
  <!-- 查看详情：只读 10 列矩阵，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>当日盘点只读」。 -->
  <el-drawer v-model="visible" :title="title" direction="rtl" size="80%" append-to-body destroy-on-close>
    <!-- 品类切换：猪肉产品 / 果蔬产品 / 其他产品（DENGBO-R10），与新增当日盘点一致 -->
    <el-tabs v-model="activeTab" class="belong-tabs">
      <el-tab-pane v-for="tab in TABS" :key="tab" :name="tab" :label="`${t(`storeLedger.belongTab.${tab}`)} (${tabCount[tab]})`" />
    </el-tabs>
    <el-table v-loading="loading" :data="filteredLines" border stripe>
      <el-table-column prop="productName" :label="t('storeLedger.column.productName')" min-width="140" show-overflow-tooltip fixed="left" align="center" header-align="center" />
      <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" width="90" align="center" header-align="center" />
      <el-table-column prop="openingQty" :label="t('storeLedger.column.openingQty')" width="110" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="inboundQty" :label="t('storeLedger.column.inboundQty')" width="110" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="saleQty" :label="t('storeLedger.column.saleQty')" width="100" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="giftQty" :label="t('storeLedger.column.giftQty')" width="100" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="returnQty" :label="t('storeLedger.column.returnQty')" width="100" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="whReturnQty" :label="t('storeLedger.column.returnedQty')" width="100" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="lossQty" :label="t('storeLedger.column.lossQty')" width="100" align="center" header-align="center" :formatter="qtyFormatter" />
      <el-table-column prop="closingQty" :label="t('storeLedger.column.closingQty')" width="110" align="center" header-align="center" fixed="right">
        <template #default="{ row }">
          <span class="closing">{{ fmtQty(row.closingQty, row.materialUnit || row.productUnit) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !lines.length" :description="t('common.empty')" />
  </el-drawer>
</template>

<script setup name="StoreCheckDetailDrawer" lang="ts">
import { getStoreLedgerDetail } from '@/api/djs-store/ledger';
import type { StoreLedgerBelongTab, StoreLedgerLineVO } from '@/api/djs-store/ledger/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const lines = ref<StoreLedgerLineVO[]>([]);
const currentDate = ref('');

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

/** el-table 列 formatter 适配（row / column / cellValue / index）。白条产品行按原材料单位（materialUnit）判重量口径。 */
function qtyFormatter(row: StoreLedgerLineVO, _column: unknown, cellValue: number | string | null | undefined): string {
  return fmtQty(cellValue, row.materialUnit || row.productUnit);
}

const title = computed(() => t('storeLedger.detail.titleByDate', { date: currentDate.value || '-' }));

async function open(storeId: string, ledgerDate: string) {
  currentDate.value = ledgerDate;
  visible.value = true;
  loading.value = true;
  try {
    const res = await getStoreLedgerDetail(storeId, ledgerDate);
    lines.value = (res.data ?? []) as StoreLedgerLineVO[];
    // 默认落在第一个有数据的品类页签
    activeTab.value = TABS.find((tab) => lines.value.some((l) => (l.belongTab ?? 'other') === tab)) ?? 'pork';
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.closing {
  font-weight: 600;
}
</style>
