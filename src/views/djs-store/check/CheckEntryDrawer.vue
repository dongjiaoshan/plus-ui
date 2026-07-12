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

      <!-- 品类切换：猪肉产品 / 果蔬产品 / 其他产品（DENGBO-R10）。切换只过滤视图，提交保存全部行。 -->
      <el-tabs v-model="activeTab" class="belong-tabs">
        <el-tab-pane v-for="tab in TABS" :key="tab" :name="tab" :label="`${t(`storeLedger.belongTab.${tab}`)} (${tabCount[tab]})`" />
      </el-tabs>

      <el-table v-loading="loading" :data="filteredRows" border stripe class="entry-table">
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
            <span class="text-muted">{{ fmtQty(row.openingQty, row) }}</span>
          </template>
        </el-table-column>
        <!-- 新到货：新到货行只读（发货量）；猪肉行可编辑 -->
        <el-table-column :label="t('storeLedger.column.inboundQty')" width="140" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number
              v-if="!row.inboundReadonly"
              v-model="row.inboundQty"
              :min="0"
              :precision="kgPrecision(row)"
              :controls="false"
              class="cell-num"
              @change="recalc(row)"
            />
            <span v-else class="text-muted">{{ fmtQty(row.inboundQty, row) }}</span>
          </template>
        </el-table-column>
        <!-- 销售：手动 -->
        <el-table-column :label="t('storeLedger.column.saleQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.saleQty" :min="0" :precision="kgPrecision(row)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 赠送：手动 -->
        <el-table-column :label="t('storeLedger.column.giftQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.giftQty" :min="0" :precision="kgPrecision(row)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 退货（顾客退货）：手动 -->
        <el-table-column :label="t('storeLedger.column.returnQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.returnSaleQty" :min="0" :precision="kgPrecision(row)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 退回（门店退回仓库）：只读 -->
        <el-table-column :label="t('storeLedger.column.returnedQty')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ fmtQty(row.returnWhQty, row) }}</span>
          </template>
        </el-table-column>
        <!-- 期末：手动实盘录入 -->
        <el-table-column :label="t('storeLedger.column.closingQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.closingQty" :min="0" :precision="kgPrecision(row)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 损耗：只读（后端公式计算，前端同步展示） -->
        <el-table-column :label="t('storeLedger.column.lossQty')" width="100" align="center" header-align="center" fixed="right">
          <template #default="{ row }">
            <span class="loss" :class="{ 'loss-negative': row.lossQty < 0 }">{{ fmtQty(row.lossQty, row) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !filteredRows.length" :description="t('storeLedger.entry.emptyCandidates')" />
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
import type { StoreLedgerBatchItem, StoreLedgerBelongTab, StoreLedgerCandidateVO, StoreLedgerCategory } from '@/api/djs-store/ledger/types';
import { formatKg } from '@/utils/weight';
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
  /** 产品对应原材料单位：KG → 数据量按 kg 展示；其他 → 按产品单位换算成 g。空时回落 productUnit 口径。 */
  materialUnit: string;
  category: StoreLedgerCategory;
  /** 产品品类页签（DENGBO-R10）：pork=猪肉 / veg=果蔬 / other=其他 */
  belongTab: StoreLedgerBelongTab;
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

/** 产品品类页签（DENGBO-R10）：猪肉 / 果蔬 / 其他。切换只过滤视图，提交仍保存全部行。 */
const TABS: StoreLedgerBelongTab[] = ['pork', 'veg', 'other'];
const activeTab = ref<StoreLedgerBelongTab>('pork');
/** 各 tab 行数（页签标题带计数） */
const tabCount = computed<Record<StoreLedgerBelongTab, number>>(() => {
  const c: Record<StoreLedgerBelongTab, number> = { pork: 0, veg: 0, other: 0 };
  for (const r of rows.value) c[r.belongTab] = (c[r.belongTab] ?? 0) + 1;
  return c;
});
/** 当前 tab 过滤后的行（表格 :data 绑这个） */
const filteredRows = computed<EntryRow[]>(() => rows.value.filter((r) => r.belongTab === activeTab.value));

function nz(v: number | string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

/** 是否 kg（重量）单位：kg / KG / 公斤 视为重量单位。 */
function isKgUnit(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'kg' || u === '公斤';
}

/** 是否 g（克）单位：g / G / 克 视为克重量单位（admin row7：原材料单位 g 时各项数据量带 g 展示）。 */
function isGramUnit(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'g' || u === '克';
}

/**
 * 数据量口径依据「产品对应原材料单位」（materialUnit）判定：
 * - 原材料单位 = KG → 按重量列处理（kg，保留 3 位）；
 * - 原材料单位 = 其他 → 按产品单位（计件：份 / 盒等，整数原样）。
 * materialUnit 缺省时回落到 productUnit（TODO(后端轨)：候选 VO 补 materialUnit 后此回落自然消除）。
 */
function isWeightRow(row: { materialUnit?: string; productUnit?: string }): boolean {
  return isKgUnit(row.materialUnit || row.productUnit);
}

/**
 * 只读量列展示：原材料单位为 KG → kg（保留 3 位，走 @/utils/weight formatKg）；
 * 否则按产品单位原样（计件件数）。空值显示 '-'。
 */
function fmtQty(value: number | string | null | undefined, row: { materialUnit?: string; productUnit?: string }): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (isWeightRow(row)) {
    return formatKg(value);
  }
  // admin row7：原材料单位为 g（克）→ 各项数据量带 g 单位展示（保留原数值小数，如 3.95 g）
  if (isGramUnit(row.materialUnit || row.productUnit)) {
    return `${Number(value)} g`;
  }
  // 计件（份 / 盒等）：去尾零显整数（DENGBO-R10：到店量按份显示，如 demand 3.000 → 3）
  return String(Number(value));
}

/** 可编辑量输入框小数位：原材料单位为 KG / g（克，如 3.95）→ 3 位小数，否则 0 位（整数件数）。 */
function kgPrecision(row: { materialUnit?: string; productUnit?: string }): number {
  if (isWeightRow(row) || isGramUnit(row.materialUnit || row.productUnit)) {
    return 3;
  }
  return 0;
}

function categoryLabel(c: StoreLedgerCategory): string {
  return t(`storeLedger.category.${c}`);
}

function categoryTagType(c: StoreLedgerCategory): 'success' | 'warning' | 'info' | 'primary' {
  if (c === 'pork') return 'success';
  if (c === 'white_bar') return 'primary';
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
      // 入库只读：后端 inboundReadonly 为准；猪肉成品 / 白条产品行（DENGBO-R12）可手动编辑。
      const inboundReadonly = c.inboundReadonly !== false && c.category !== 'pork' && c.category !== 'white_bar';
      const r: EntryRow = {
        productId: String(c.productId),
        productName: c.productName ?? '',
        productUnit: c.productUnit ?? '',
        // TODO(后端轨)：候选 VO 补 materialUnit 后，数据量口径按原材料单位（KG→kg / 其他→产品单位）判定；缺省回落 productUnit。
        materialUnit: c.materialUnit ?? '',
        category: c.category,
        belongTab: c.belongTab ?? 'other',
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
    // 默认落在第一个有数据的 tab（猪肉→果蔬→其他），避免开在空页签
    activeTab.value = TABS.find((tab) => rows.value.some((r) => r.belongTab === tab)) ?? 'pork';
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
