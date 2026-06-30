<template>
  <!-- 新增当日盘点：宽抽屉整表录入，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>新增当日盘点」矩阵。 -->
  <el-drawer v-model="visible" :title="t('storeLedger.entry.title')" direction="rtl" size="85%" append-to-body destroy-on-close>
    <div class="ledger-entry">
      <div class="entry-tools">
        <!-- 门店由顶部全局选择器（StoreSwitcher）统一控制，本抽屉不再让用户改门店 -->
        <el-date-picker
          v-model="ledgerDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('storeLedger.entry.datePlaceholder')"
          :clearable="false"
          @change="loadCandidates"
        />
      </div>

      <el-table v-loading="loading" :data="rows" border stripe class="entry-table">
        <el-table-column prop="productName" :label="t('storeLedger.column.productName')" min-width="140" show-overflow-tooltip fixed="left" align="center" header-align="center" />
        <el-table-column :label="t('storeLedger.column.category')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="categoryTagType(row.category)" disable-transitions>{{ categoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" width="80" align="center" header-align="center" />
        <!-- 期初：只读（库存表结存） -->
        <el-table-column :label="t('storeLedger.column.openingQty')" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ fmtQty(row.openingQty, row.productUnit) }}</span>
          </template>
        </el-table-column>
        <!-- 新到货：新到货行只读（发货量）；猪肉行可编辑 -->
        <el-table-column :label="t('storeLedger.column.inboundQty')" width="140" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number
              v-if="!row.inboundReadonly"
              v-model="row.inboundQty"
              :min="0"
              :precision="kgPrecision(row.productUnit)"
              :controls="false"
              class="cell-num"
              @change="recalc(row)"
            />
            <span v-else class="text-muted">{{ fmtQty(row.inboundQty, row.productUnit) }}</span>
          </template>
        </el-table-column>
        <!-- 销售：手动 -->
        <el-table-column :label="t('storeLedger.column.saleQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.saleQty" :min="0" :precision="kgPrecision(row.productUnit)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 赠送：手动 -->
        <el-table-column :label="t('storeLedger.column.giftQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.giftQty" :min="0" :precision="kgPrecision(row.productUnit)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 退货（顾客退货）：手动 -->
        <el-table-column :label="t('storeLedger.column.returnQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.returnSaleQty" :min="0" :precision="kgPrecision(row.productUnit)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 退回（门店退回仓库）：只读 -->
        <el-table-column :label="t('storeLedger.column.returnedQty')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ fmtQty(row.returnWhQty, row.productUnit) }}</span>
          </template>
        </el-table-column>
        <!-- 期末：手动实盘录入 -->
        <el-table-column :label="t('storeLedger.column.closingQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.closingQty" :min="0" :precision="kgPrecision(row.productUnit)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 损耗：只读（后端公式计算，前端同步展示） -->
        <el-table-column :label="t('storeLedger.column.lossQty')" width="100" align="center" header-align="center" fixed="right">
          <template #default="{ row }">
            <span class="loss" :class="{ 'loss-negative': row.lossQty < 0 }">{{ fmtQty(row.lossQty, row.productUnit) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !rows.length" :description="t('storeLedger.entry.emptyCandidates')" />
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="!rows.length || !storeId" @click="handleSubmit">
        {{ t('storeLedger.entry.submit') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup name="StoreCheckEntryDrawer" lang="ts">
import { listStoreLedgerCandidates, batchSaveStoreLedger } from '@/api/djs-store/ledger';
import type { StoreLedgerBatchItem, StoreLedgerCandidateVO, StoreLedgerCategory } from '@/api/djs-store/ledger/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 门店从父页/顶部上下文（StoreSwitcher）固定传入，本抽屉不再提供门店选择
const props = defineProps<{ storeId?: string }>();

const emit = defineEmits<{ saved: [] }>();

interface EntryRow {
  productId: string;
  productName: string;
  productUnit: string;
  category: StoreLedgerCategory;
  /** 期初库存（只读） */
  openingQty: number;
  /** 当日入库量（新到货只读 / 猪肉手动） */
  inboundQty: number;
  /** 入库是否只读 */
  inboundReadonly: boolean;
  /** 销售量（手动） */
  saleQty: number;
  /** 赠送量（手动） */
  giftQty: number;
  /** 退货量（顾客退货，手动） */
  returnSaleQty: number;
  /** 退回量（门店退回仓库，只读） */
  returnWhQty: number;
  /** 期末库存（手动实盘录入） */
  closingQty: number;
  /** 损耗（前端按公式同步展示，后端最终计算） */
  lossQty: number;
}

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const visible = ref(false);
const storeId = ref<string>();
const ledgerDate = ref<string>(todayStr());
const loading = ref(false);
const submitLoading = ref(false);
const rows = ref<EntryRow[]>([]);

function nz(v: number | string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

/** 是否 kg（重量）单位：kg / KG / 公斤 视为重量列，保留 3 位小数。 */
function isKgUnit(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'kg' || u === '公斤';
}

/** 只读量列展示：kg 单位保留 3 位小数；非 kg（计件）单位原样；空值显示 '-'。 */
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

/** 可编辑量输入框小数位：kg 单位 3 位，非 kg（计件）单位 0 位（整数件数）。 */
function kgPrecision(unit?: string): number {
  return isKgUnit(unit) ? 3 : 0;
}

function categoryLabel(c: StoreLedgerCategory): string {
  return t(`storeLedger.category.${c}`);
}

function categoryTagType(c: StoreLedgerCategory): 'success' | 'warning' | 'info' {
  if (c === 'pork') return 'success';
  if (c === 'inbound') return 'warning';
  return 'info';
}

/** 损耗 = 期初 + 入库 − 销售 − 赠送 + 退货 − 退回 − 期末（与后端公式一致）。 */
function recalc(row: EntryRow) {
  row.lossQty = Number(
    (
      nz(row.openingQty) +
      nz(row.inboundQty) -
      nz(row.saleQty) -
      nz(row.giftQty) +
      nz(row.returnSaleQty) -
      nz(row.returnWhQty) -
      nz(row.closingQty)
    ).toFixed(3)
  );
}

async function loadCandidates() {
  if (!storeId.value) {
    rows.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listStoreLedgerCandidates(storeId.value, ledgerDate.value);
    const candidates = (res.data ?? []) as StoreLedgerCandidateVO[];
    rows.value = candidates.map((c) => {
      // 入库只读：后端 inboundReadonly 为准；猪肉行（category=pork）可手动编辑。
      const inboundReadonly = c.inboundReadonly !== false && c.category !== 'pork';
      const r: EntryRow = {
        productId: String(c.productId),
        productName: c.productName ?? '',
        productUnit: c.productUnit ?? '',
        category: c.category,
        openingQty: nz(c.openingQty),
        inboundQty: nz(c.inboundQty),
        inboundReadonly,
        saleQty: nz(c.saleQty),
        giftQty: 0,
        returnSaleQty: nz(c.returnSaleQty),
        returnWhQty: nz(c.returnWhQty),
        closingQty: 0,
        lossQty: 0
      };
      recalc(r);
      return r;
    });
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!storeId.value || !rows.value.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeLedger.entry.submitConfirm', { n: rows.value.length }));
  const items: StoreLedgerBatchItem[] = rows.value.map((r) => ({
    productId: r.productId,
    openingQty: r.openingQty,
    inboundQty: r.inboundQty,
    saleQty: r.saleQty,
    giftQty: r.giftQty,
    returnSaleQty: r.returnSaleQty,
    returnWhQty: r.returnWhQty,
    closingQty: r.closingQty
  }));
  submitLoading.value = true;
  try {
    await batchSaveStoreLedger({ storeId: storeId.value, ledgerDate: ledgerDate.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('saved');
  } finally {
    submitLoading.value = false;
  }
}

async function open() {
  // 门店从父页传入（顶部 StoreSwitcher 当前门店），open 时预置，用户不可改
  storeId.value = props.storeId ? String(props.storeId) : undefined;
  ledgerDate.value = todayStr();
  rows.value = [];
  visible.value = true;
  if (storeId.value) {
    await loadCandidates();
  }
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.ledger-entry {
  .entry-tools {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .entry-table {
    .cell-num {
      width: 100%;
    }
  }

  .loss {
    font-weight: 600;
    color: var(--el-color-primary);

    &.loss-negative {
      color: var(--el-color-danger);
    }
  }

  .text-muted {
    color: #909399;
  }
}
</style>
