<template>
  <!-- 查看详情：只读 10 列矩阵，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>当日盘点只读」。 -->
  <el-drawer v-model="visible" :title="title" direction="rtl" size="80%" append-to-body destroy-on-close>
    <el-table v-loading="loading" :data="lines" border stripe>
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
          <span class="closing">{{ fmtQty(row.closingQty, row.productUnit) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !lines.length" :description="t('common.empty')" />
  </el-drawer>
</template>

<script setup name="StoreCheckDetailDrawer" lang="ts">
import { getStoreLedgerDetail } from '@/api/djs-store/ledger';
import type { StoreLedgerLineVO } from '@/api/djs-store/ledger/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const lines = ref<StoreLedgerLineVO[]>([]);
const currentDate = ref('');

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
    return String(value);
  }
  const n = Number(value);
  return Number.isNaN(n) ? '-' : n.toFixed(3);
}

/** el-table 列 formatter 适配（row / column / cellValue / index）。 */
function qtyFormatter(row: StoreLedgerLineVO, _column: unknown, cellValue: number | string | null | undefined): string {
  return fmtQty(cellValue, row.productUnit);
}

const title = computed(() => t('storeLedger.detail.titleByDate', { date: currentDate.value || '-' }));

async function open(storeId: string, ledgerDate: string) {
  currentDate.value = ledgerDate;
  visible.value = true;
  loading.value = true;
  try {
    const res = await getStoreLedgerDetail(storeId, ledgerDate);
    lines.value = (res.data ?? []) as StoreLedgerLineVO[];
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
