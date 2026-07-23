<template>
  <!-- 新增当日盘点 / 修改盘点：宽抽屉整表录入，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>新增当日盘点」矩阵。 -->
  <el-drawer v-model="visible" :title="drawerTitle" direction="rtl" size="85%" append-to-body destroy-on-close>
    <div class="ledger-entry">
      <div class="entry-tools">
        <!-- 门店由顶部全局选择器（StoreSwitcher）统一控制，本抽屉不再让用户改门店。修改模式锁定盘点日期不可改。 -->
        <el-date-picker
          v-model="ledgerDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('storeLedger.entry.datePlaceholder')"
          :clearable="false"
          :disabled="editMode"
          @change="loadCandidates"
        />
      </div>

      <!-- 品类切换：猪肉产品 / 果蔬产品 / 其他产品（DENGBO-R10）。切换只过滤视图，提交保存全部行。 -->
      <!-- 页签右侧（row140）：当日白条分割损耗 = max(0, 当日白条到店重 − 白条退回产品入库重)，后端权威计算（口径同定时任务，退回入库重取自 t_store_return 门店退货入库）；当天无白条到店则不显示。 -->
      <div class="tabs-band">
        <el-tabs v-model="activeTab" class="belong-tabs">
          <el-tab-pane v-for="tab in TABS" :key="tab" :name="tab" :label="`${t(`storeLedger.belongTab.${tab}`)} (${tabCount[tab]})`" />
        </el-tabs>
        <div v-if="showWhiteBarSplitLoss" class="white-bar-split-loss">
          {{ t('storeLedger.entry.whiteBarSplitLoss') }}<span class="value">{{ whiteBarSplitLoss.toFixed(3) }}</span> kg
        </div>
      </div>

      <!-- row31：必须 row-key=productId——否则切 tab 时 el-table 按 index 复用 el-input-number 实例，
           precision prop 虽更新但 modelValue 恒 0 不触发内部重排，「份」行沿用上一「kg」行的陈旧 "0.000" 显示。
           按产品身份重挂行 → 输入框重挂、以 precision=0 重排 → 非 kg 显整数。 -->
      <el-table v-loading="loading" :data="filteredRows" row-key="productId" border stripe class="entry-table">
        <el-table-column prop="productName" :label="t('storeLedger.column.productName')" width="160" show-overflow-tooltip fixed="left" align="center" header-align="center" />
        <!-- 流程性问题 row14：去掉「类别」列 -->
        <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" width="90" align="center" header-align="center" />
        <!-- 期初：只读（库存表结存） -->
        <el-table-column :label="t('storeLedger.column.openingQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ fmtQty(row.openingQty, row) }}</span>
          </template>
        </el-table-column>
        <!-- 新到货：新到货行只读（发货量）；猪肉行可编辑 -->
        <el-table-column :label="t('storeLedger.column.inboundQty')" width="120" align="center" header-align="center">
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
        <el-table-column :label="t('storeLedger.column.returnedQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ fmtQty(row.returnWhQty, row) }}</span>
          </template>
        </el-table-column>
        <!-- 期末：手动实盘录入 -->
        <el-table-column :label="t('storeLedger.column.closingQty')" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.closingQty" :min="0" :precision="kgPrecision(row)" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <!-- 损耗：只读（后端公式计算，前端同步展示） -->
        <el-table-column :label="t('storeLedger.column.lossQty')" width="120" align="center" header-align="center" fixed="right">
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
import { listStoreLedgerCandidates, batchSaveStoreLedger, getStoreLedgerDetail } from '@/api/djs-store/ledger';
import type { StoreLedgerBatchItem, StoreLedgerBelongTab, StoreLedgerCandidateVO, StoreLedgerCategory, StoreLedgerLineVO } from '@/api/djs-store/ledger/types';
import { getWhiteBarSplitLoss } from '@/api/djs-store/loss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 门店从父页/顶部上下文（StoreSwitcher）固定传入，本抽屉不再提供门店选择
const props = defineProps<{ storeId?: string }>();

const emit = defineEmits<{ saved: [] }>();

interface EntryRow {
  productId: string;
  productName: string;
  /** 产品单位（份 / kg 等）：展示精度按此分流——kg（白条按重量盘点）保留 3 位小数，其余（份 / 盒）整数。 */
  productUnit: string;
  /** 产品对应原材料单位（VO 透传，暂不参与展示精度判定）。 */
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
/** 修改模式（DENGBO-R13）：对已盘记录更正，锁定日期、叠加已保存值、提交 edit=true 允许覆盖。 */
const editMode = ref(false);

const drawerTitle = computed(() =>
  editMode.value ? t('storeLedger.entry.editTitle', { date: ledgerDate.value }) : t('storeLedger.entry.title')
);

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

/**
 * 当日白条分割损耗（row140）：抽屉打开 / 门店 / 日期变化时后端拉取，口径同 white_bar_split_loss 定时任务。
 * 白条退回入库重来自门店退货入库流水 t_store_return（门店退回仓库、已入库、白条退回产品字典），
 * 不是本盘点抽屉的「退回量」列——所以由后端权威计算、前端直接展示，不在前端重算。
 * 后端 BigDecimal 序列化成字符串，Number() 强转。
 */
const arriveWeight = ref(0);
const whiteBarSplitLoss = ref(0);

/** 当天有白条到店（到店重 > 0）即显示「当日白条分割损耗」整块（row66：新增/修改盘点均显示，与查看明细一致）。 */
const showWhiteBarSplitLoss = computed<boolean>(() => arriveWeight.value > 0);

/** 拉取当日白条分割损耗（无门店 / 无日期 → 0，不阻断录入）。 */
async function loadWhiteBarSplitLoss() {
  if (!storeId.value || !ledgerDate.value) {
    arriveWeight.value = 0;
    whiteBarSplitLoss.value = 0;
    return;
  }
  const res = await getWhiteBarSplitLoss(storeId.value, ledgerDate.value);
  const data = (res as unknown as { data?: { arriveWeight?: number | string; splitLoss?: number | string } }).data;
  arriveWeight.value = nz(data?.arriveWeight);
  whiteBarSplitLoss.value = nz(data?.splitLoss);
}

function nz(v: number | string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

/** 是否 kg（重量）单位：kg / KG / 公斤 视为重量单位。 */
function isKgUnit(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'kg' || u === '公斤';
}

/**
 * 数据量口径依据「产品单位」（productUnit）判定：
 * - 产品单位 = kg（白条，按重量盘点）→ 按重量列处理（kg，保留 3 位小数）；
 * - 产品单位 = 其他（份 / 盒等，猪肉 / 果蔬按份盘点）→ 计件整数，不保留小数。
 * 只按产品单位分流：单位是「份」的猪肉 / 果蔬即使底层原材料称重（materialUnit=kg/g）也按份显示整数。
 */
function isWeightRow(row: { productUnit?: string }): boolean {
  return isKgUnit(row.productUnit);
}

/**
 * 只读量列展示：产品单位为 kg → kg（保留 3 位小数）；
 * 否则（份 / 盒等）按整数原样（计件件数）。空值显示 '-'。
 */
function fmtQty(value: number | string | null | undefined, row: { productUnit?: string }): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (isWeightRow(row)) {
    // 白条按 kg 盘点：保留 3 位小数（带 kg 单位）
    return `${Number(value).toFixed(3)} kg`;
  }
  // 计件（份 / 盒等）：去尾零显整数（DENGBO-R10：到店量按份显示，如 demand 3.000 → 3）
  return String(Math.round(Number(value)));
}

/** 可编辑量输入框小数位：产品单位为 kg（白条按重量盘点）→ 3 位小数；否则（份 / 盒等）0 位整数。 */
function kgPrecision(row: { productUnit?: string }): number {
  return isWeightRow(row) ? 3 : 0;
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
    arriveWeight.value = 0;
    whiteBarSplitLoss.value = 0;
    return;
  }
  // 当日白条分割损耗（row140）与候选并行拉取，不互相阻塞
  void loadWhiteBarSplitLoss();
  loading.value = true;
  try {
    const res = await listStoreLedgerCandidates(storeId.value, ledgerDate.value);
    const candidates = (res.data ?? []) as StoreLedgerCandidateVO[];
    // 修改模式（DENGBO-R13）：叠加已保存的盘点值，让用户在上次结果基础上更正。
    const savedList: StoreLedgerLineVO[] = editMode.value
      ? (((await getStoreLedgerDetail(storeId.value, ledgerDate.value)).data ?? []) as StoreLedgerLineVO[])
      : [];
    const savedByProduct = new Map<string, StoreLedgerLineVO>(savedList.map((s) => [String(s.productId), s]));
    const candidateRows = candidates.map((c) => {
      // 入库只读：后端 inboundReadonly 为准；猪肉成品 / 白条产品行（DENGBO-R12）可手动编辑。
      const inboundReadonly = c.inboundReadonly !== false && c.category !== 'pork' && c.category !== 'white_bar';
      const saved = savedByProduct.get(String(c.productId));
      const r: EntryRow = {
        productId: String(c.productId),
        productName: c.productName ?? '',
        productUnit: c.productUnit ?? '',
        materialUnit: c.materialUnit ?? '',
        category: c.category,
        belongTab: c.belongTab ?? 'other',
        // 修改模式取已保存值（更正上次结果）；新增模式取候选预填。
        openingQty: saved ? nz(saved.openingQty) : nz(c.openingQty),
        inboundQty: saved ? nz(saved.inboundQty) : nz(c.inboundQty),
        inboundReadonly,
        saleQty: saved ? nz(saved.saleQty) : nz(c.saleQty),
        giftQty: saved ? nz(saved.giftQty) : 0,
        returnSaleQty: saved ? nz(saved.returnQty) : nz(c.returnSaleQty),
        // row53：退回量（门店退回仓库，只读）恒取候选实时值——退回是当日退货模块聚合的客观量，
        // 不随「上次盘点已保存值」回落（否则当日有退回却显 0）。退货量 returnSaleQty 仍保留 saved 优先（可手填）。
        returnWhQty: nz(c.returnWhQty),
        closingQty: saved ? nz(saved.closingQty) : 0,
        lossQty: 0
      };
      recalc(r);
      return r;
    });
    // 修改模式（DENGBO-R13）：已保存但当前已不在候选集里的产品（字典/库存/到货变化导致掉出候选）
    // 仍需能被更正 → 用已保存明细补齐成可编辑行，避免上次盘过的产品在修改时消失。
    const candidateIds = new Set(candidateRows.map((r) => r.productId));
    const extraRows = savedList.filter((s) => !candidateIds.has(String(s.productId))).map(savedToRow);
    rows.value = [...candidateRows, ...extraRows];
    // 默认落在第一个有数据的 tab（猪肉→果蔬→其他），避免开在空页签
    activeTab.value = TABS.find((tab) => rows.value.some((r) => r.belongTab === tab)) ?? 'pork';
  } finally {
    loading.value = false;
  }
}

/**
 * 已保存明细行 → 可编辑行（修改模式补齐当前非候选的历史盘点产品，DENGBO-R13）。
 * 明细 VO 无 category / inboundReadonly：按品类推断——猪肉品类沿用「入库可编辑」口径，其余入库只读。
 */
function savedToRow(s: StoreLedgerLineVO): EntryRow {
  const belongTab = (s.belongTab ?? 'other') as StoreLedgerBelongTab;
  const r: EntryRow = {
    productId: String(s.productId),
    productName: s.productName ?? '',
    productUnit: s.productUnit ?? '',
    materialUnit: s.materialUnit ?? '',
    category: belongTab === 'pork' ? 'pork' : 'stock',
    belongTab,
    openingQty: nz(s.openingQty),
    inboundQty: nz(s.inboundQty),
    inboundReadonly: belongTab !== 'pork',
    saleQty: nz(s.saleQty),
    giftQty: nz(s.giftQty),
    returnSaleQty: nz(s.returnQty),
    returnWhQty: nz(s.whReturnQty),
    closingQty: nz(s.closingQty),
    lossQty: 0
  };
  recalc(r);
  return r;
}

async function handleSubmit() {
  if (!storeId.value || !rows.value.length) {
    return;
  }
  await proxy?.$modal.confirm(
    editMode.value
      ? t('storeLedger.entry.editConfirm', { n: rows.value.length })
      : t('storeLedger.entry.submitConfirm', { n: rows.value.length })
  );
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
    await batchSaveStoreLedger({ storeId: storeId.value, ledgerDate: ledgerDate.value, edit: editMode.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('saved');
  } finally {
    submitLoading.value = false;
  }
}

/**
 * 打开抽屉。
 * @param editCtx 传入即「修改」模式（DENGBO-R13）：锁定该盘点日期、叠加已保存值、提交 edit=true 覆盖更正。
 *                不传则「新增当日盘点」（日期默认今天，可改）。
 */
async function open(editCtx?: { ledgerDate: string }) {
  // 门店从父页传入（顶部 StoreSwitcher 当前门店），open 时预置，用户不可改
  storeId.value = props.storeId ? String(props.storeId) : undefined;
  editMode.value = !!editCtx;
  ledgerDate.value = editCtx?.ledgerDate ?? todayStr();
  rows.value = [];
  arriveWeight.value = 0;
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
