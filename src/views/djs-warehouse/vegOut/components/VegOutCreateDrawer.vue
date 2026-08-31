<template>
  <!--
    row187 新增：右侧全屏抽屉，形态对齐门店「需求下单-新增订单」——
    左侧条件 + 产品搜索 + 可选产品表（填出库量），右侧「操作」栏实时显示已选产品与重量，底部确认出库。
  -->
  <el-drawer v-model="visible" :title="t('vegOut.create.title')" size="88%" destroy-on-close @closed="handleClosed">
    <div class="veg-out-create">
      <div class="left">
        <el-form :model="form" inline label-width="88px" class="mb-2">
          <el-form-item :label="t('vegOut.create.outDate')" required>
            <el-date-picker v-model="form.outDate" type="date" value-format="YYYY-MM-DD" style="width: 180px" />
          </el-form-item>
          <el-form-item :label="t('vegOut.create.outDest')" required>
            <el-select
              v-model="form.outDest"
              filterable
              clearable
              :placeholder="t('vegOut.create.outDestPlaceholder')"
              style="width: 220px"
            >
              <el-option v-for="d in djs_stock_out_dest" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="mb-2 flex items-center gap-2">
          <el-input
            v-model="productName"
            clearable
            :placeholder="t('vegOut.create.productNamePlaceholder')"
            style="width: 240px"
            @keyup.enter="loadCandidates"
            @clear="loadCandidates"
          />
          <el-button type="primary" icon="Search" @click="loadCandidates">{{ t('common.search') }}</el-button>
          <!-- row197：红框位置显示本单出库单号（打开抽屉时预取） -->
          <span class="ml-auto text-gray-500">
            {{ t('vegOut.column.batchNo') }}：{{ previewNo || t('vegOut.create.noAfterSubmit') }}
          </span>
        </div>

        <el-table v-loading="loading" :data="candidates" border size="small" height="calc(100vh - 320px)">
          <!-- row194：产品名称后加规格列；出库量后加销售单价、销售总价；各列同宽（统一 min-width） -->
          <el-table-column :label="t('vegOut.create.productName')" prop="productName" :min-width="COL_MIN_WIDTH" show-overflow-tooltip />
          <el-table-column :label="t('vegOut.create.productSpec')" prop="productSpec" :min-width="COL_MIN_WIDTH" align="center">
            <template #default="{ row }">{{ row.productSpec || '-' }}</template>
          </el-table-column>
          <!-- row99：规格与库存重量之间加「地块」列。列名与取值都走 plotTag —— 与库存查询 / 入库记录 /
               出库记录三页同一个真相源，别在这里另起 key（同一个 label 两处定义早晚会分叉）。
               三期货无 plot_id、显示「三期」；干货 / 蛋类本就没有地块，显示占位符。
               长地块名（线上最长 11 字「长廊1（水泥长廊）1号」）在 130px 列宽下会折行，故与产品名称列同样挂 tooltip。 -->
          <el-table-column :label="t('plotTag.column')" :min-width="COL_MIN_WIDTH" align="center" show-overflow-tooltip>
            <template #default="{ row }">{{ formatPlotLabel(row) }}</template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.stockWeight')" prop="stockWeight" :min-width="COL_MIN_WIDTH" align="center">
            <template #default="{ row }">{{ fmtStock(row) }}</template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.outQuantity')" :min-width="COL_MIN_WIDTH" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="quantityMap[row.stockId]"
                :min="0"
                :max="Number(row.stockWeight)"
                :precision="3"
                :step="1"
                :disabled="qtyDisabled(row)"
                size="small"
                controls-position="right"
                style="width: 130px"
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.unitPrice')" :min-width="COL_MIN_WIDTH" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="priceMap[row.stockId]"
                :min="0"
                :precision="2"
                :step="0.1"
                size="small"
                controls-position="right"
                style="width: 120px"
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.lineAmount')" :min-width="COL_MIN_WIDTH" align="center">
            <template #default="{ row }">{{ fmtMoney(lineAmount(row)) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div class="right">
        <div class="right-title">
          {{ t('vegOut.create.selected') }}
          <!-- 打印单一页只有 10 行，所以这里也只收 10 个：选满后左侧未选行的出库量输入框会禁用 -->
          <span class="max-tip" :class="{ 'is-full': selectionFull }">
            {{ t('vegOut.create.maxProductsTip', { n: MAX_SELECTED_PRODUCTS }) }}
          </span>
        </div>
        <el-empty v-if="!selectedGroups.length" :description="t('vegOut.create.selectedEmpty')" :image-size="70" />
        <!-- row195：不显示地块；重量挪到原地块位置；原重量位置改显销售总价；汇总加总价之和
             V6 row108：一个产品一条 —— 同产品不同地块的几个库存篮在这里累计成一条，品类数也按产品数算 -->
        <div v-else class="selected-list">
          <div v-for="g in selectedGroups" :key="g.key" class="selected-item">
            <div class="truncate">
              <span>{{ g.productName }}</span>
              <span class="plot">{{ fmtQty(g.quantity, g.rows[0]) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="qty">{{ fmtMoney(g.amount) }}</span>
              <el-icon class="del" @click="clearGroup(g)"><CircleClose /></el-icon>
            </div>
          </div>
          <div class="selected-total">
            {{ t('vegOut.create.totalKinds', { n: selectedGroups.length }) }} · {{ fmtKg(totalWeight) }} ·
            {{ fmtMoney(totalAmount) }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <!-- row195③：去掉「取消」按钮（抽屉点蒙层/右上角 × 即可关）
           row196 + Kevin D8：双按钮，照抄果蔬打包页「确认并打印」范式，落单成功后才打印 -->
      <div class="flex items-center justify-end gap-2">
        <el-button type="primary" plain :loading="submitting" @click="submit(true)">
          {{ t('vegOut.create.confirmAndPrint') }}
        </el-button>
        <el-button type="primary" :loading="submitting" @click="submit(false)">{{ t('vegOut.create.confirm') }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { todayYmd } from '@/utils/date';
import { CircleClose } from '@element-plus/icons-vue';
import { listVegOutCandidates, submitVegOutBatch } from '@/api/djs-warehouse/vegOut';
import { printVegOutSheet, ROWS_PER_PAGE } from '../printSheet';
import { productMergeKey, uniformUnitPrice } from '../mergeByProduct';
import type { VegOutCandidateVO } from '@/api/djs-warehouse/vegOut/types';
import { formatPlotLabel } from '@/utils/plotTag';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
/** r194「列表宽度保持一致」：候选表六列统一列宽（与出库单列表页 COL_MIN_WIDTH 同口径）。 */
const COL_MIN_WIDTH = 130;

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 出库去向：甲方 row187 明确「下拉框为所有出库去向的字典项内容」，故不过滤 HIDDEN_OUT_DEST
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const productName = ref('');
const candidates = ref<VegOutCandidateVO[]>([]);
/** stockId → 出库量。用 map 而非改行对象，切换搜索条件后已填的量不丢。 */
const quantityMap = reactive<Record<string, number | undefined>>({});

const today = () => todayYmd();
const form = reactive<{ outDate: string; outDest: string }>({ outDate: today(), outDest: '' });

function fmtKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '0kg';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${formatQtyByUnit(n, 'kg')}kg`;
}

/**
 * 出库去向 code → 中文（打印单的「客户名称」= 出库去向，甲方原文第 4 点）。
 * 字典项由 useDict 提供，未命中回落原 code。
 */
function destLabel(code: string): string {
  const opt = (djs_stock_out_dest.value ?? []).find((d: any) => d.value === code);
  return opt?.label ?? code;
}

/**
 * 本单出库单号（row197 顶部展示）。
 *
 * ⚠️ 不做「打开抽屉即预取号」：单号是终生递增的业务序号，预取会真消耗一个号，
 * 开一次抽屉关掉就断一个号，而且预取到的号和提交时生成的号还不是同一个（两次生成）。
 * 故新增态显示占位「提交后生成」，提交成功后回填真实单号。
 */
const previewNo = ref('');

/** stockId → 销售单价（row194）。默认取产品 sale_price，用户可改；提交时逐行带上作快照。 */
const priceMap = reactive<Record<string, number | undefined>>({});

/** 产品配置的销售价（t_warehouse_product_info.sale_price）；未配置 / 非数值返回 undefined。 */
function defaultPrice(row: VegOutCandidateVO): number | undefined {
  const v = row.salePrice;
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * 按产品配置的销售价预填单价（已有值的不覆盖 —— 用户手改过的、或换搜索条件前填的都保留）。
 * 候选列表每次加载完逐行调用，抽屉一打开单价列即有默认值，用户可再调整。
 */
function ensurePrice(row: VegOutCandidateVO) {
  if (priceMap[row.stockId] === undefined) {
    const p = defaultPrice(row);
    if (p !== undefined) priceMap[row.stockId] = p;
  }
}

/** 清掉一行：出库量清空，单价回落产品默认销售价（与加载时预填同口径，不留空）。 */
function clearLine(row: VegOutCandidateVO) {
  quantityMap[row.stockId] = undefined;
  priceMap[row.stockId] = defaultPrice(row);
}

/** 行销售总价 = 出库量 × 销售单价。 */
function lineAmount(row: VegOutCandidateVO): number {
  return Number(quantityMap[row.stockId] || 0) * Number(priceMap[row.stockId] || 0);
}

/** 该行是否按 kg 计量（干货库有袋/桶/罐、蛋类是「枚」，只有 kg 行进重量合计）。 */
function isKgRow(row: VegOutCandidateVO): boolean {
  return (row.productUnit || '').trim().toLowerCase() === 'kg';
}

/** 库存量展示：kg 行走 3 位小数 + kg；计件行显示原单位（如「3 袋」）。 */
function fmtStock(row: VegOutCandidateVO): string {
  return fmtQty(row.stockWeight, row);
}

/** 数量展示（单位感知）。 */
function fmtQty(v: number | string | undefined | null, row: VegOutCandidateVO): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return isKgRow(row) ? `${formatQtyByUnit(n, 'kg')}kg` : `${n} ${row.productUnit || ''}`.trim();
}

/** 金额展示。 */
function fmtMoney(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '¥0.00';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `¥${n.toFixed(2)}`;
}

/**
 * 见过的所有候选行（跨搜索累积，按首次出现顺序）。
 *
 * ⚠️ **「已选」绝不能从 `candidates` 里 filter** —— `candidates` 每次搜索都被整体替换，而
 * `quantityMap` 是跨搜索保留的。用 candidates 去 filter 会让「已选」变成「当前候选 ∩ 已填量」：
 * 换个搜索词，之前填的行就从已选里消失 → ① 每个搜索态各自能吃满 10 个，上限被绕过；
 * ② 更糟的是提交时 `items` 也只带当前候选那几行，其它搜索态填过的量被静默丢弃，用户零感知。
 * 故这里把见过的行快照留下来，已选一律以 `quantityMap` 全集为准。
 */
const knownRows = ref<VegOutCandidateVO[]>([]);
function rememberRows(rows: VegOutCandidateVO[]) {
  const seen = new Set(knownRows.value.map((r) => String(r.stockId)));
  rows.forEach((r) => {
    if (!seen.has(String(r.stockId))) {
      knownRows.value.push(r);
      seen.add(String(r.stockId));
    }
  });
}

/** 已选 = 填了正数出库量的行（跨搜索全集，右侧实时反映）。量清 0 / 清空即视为不出库该产品。 */
const selectedRows = computed(() => knownRows.value.filter((r) => Number(quantityMap[r.stockId]) > 0));

/** 已选产品合并组（V6 row108）：同一产品编号的多个地块篮在右侧与打印单上合成一条。 */
interface SelectedGroup {
  key: string;
  productName: string;
  productSpec?: string;
  productUnit?: string;
  /** 组内库存行（清整组、逐行提交都要用它） */
  rows: VegOutCandidateVO[];
  /** 累计出库量 */
  quantity: number;
  /** 累计销售总价 = Σ(行出库量 × 行单价)，不是「合并量 × 某个单价」 */
  amount: number;
  /** 组内各行单价一致时为该单价，否则 undefined（打印单价列留白） */
  unitPrice?: number;
  /** 是否按 kg 计量（决定进不进重量合计） */
  isKg: boolean;
}

/**
 * 已选产品（按产品编号合并）—— 甲方 V6 row108：
 * 「同一个产品属于不同地块时…只按产品编号进行累计，同一个产品不用多条记录，记录为一个重量显示」。
 *
 * ⚠️ 合并只在这层做，**提交仍按 stockId 逐行**（见 submit）：后端扣的是具体那个地块篮的库存。
 */
const selectedGroups = computed<SelectedGroup[]>(() => {
  const map = new Map<string, SelectedGroup>();
  selectedRows.value.forEach((r) => {
    const key = productMergeKey(r);
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        productName: r.productName,
        productSpec: r.productSpec,
        productUnit: r.productUnit,
        rows: [],
        quantity: 0,
        amount: 0,
        unitPrice: undefined,
        isKg: isKgRow(r)
      };
      map.set(key, g);
    }
    g.rows.push(r);
    g.quantity += Number(quantityMap[r.stockId] || 0);
    g.amount += lineAmount(r);
  });
  return [...map.values()].map((g) => ({
    ...g,
    unitPrice: uniformUnitPrice(g.rows.map((r) => Number(priceMap[r.stockId] || 0)))
  }));
});

/** 已选产品的合并键集合（判断左侧某行所属产品是否已在单上）。 */
const selectedGroupKeys = computed(() => new Set(selectedGroups.value.map((g) => g.key)));

/** 清掉整个产品：组内每个地块篮的出库量都清空（右侧一条对应的就是这几行）。 */
function clearGroup(g: SelectedGroup) {
  g.rows.forEach(clearLine);
}

/**
 * 一单最多 10 个产品 —— 与打印模板 {@link ROWS_PER_PAGE} 同一个数：
 * 241×140mm 的三联单一页只印得下 10 行，超了就得分页，甲方不接受一单打两张纸。
 *
 * ⚠️ 数的是**产品**不是库存行（V6 row108 合并后一个产品只占一行）：按库存行数会让
 * 「同一个红薯选 3 个地块」白白吃掉 3 个名额，而单子上它就是一行。
 */
const MAX_SELECTED_PRODUCTS = ROWS_PER_PAGE;
const selectionFull = computed(() => selectedGroups.value.length >= MAX_SELECTED_PRODUCTS);

/**
 * 选满 10 个产品后，**产品尚未在单上**的行禁用（不允许再录第 11 个产品）。
 * 已在单上的产品其余地块篮不禁用 —— 那不新增品类，只是同一行的量往上加；
 * 已填量的行也不禁用，否则用户既改不了量、也清不掉，会卡死在满员状态。
 */
function qtyDisabled(row: VegOutCandidateVO): boolean {
  return selectionFull.value && !selectedGroupKeys.value.has(productMergeKey(row));
}
// row194 混单位（Kevin 2026-08-03 定 D7）：**重量合计只累加 kg 行**——干货有袋/桶/罐、蛋类是「枚」，
// 「3 袋 + 2kg」加不到一起。金额是钱，三类都能加，故 totalAmount 全量累加。
const totalWeight = computed(() => selectedGroups.value.filter((g) => g.isKg).reduce((s, g) => s + g.quantity, 0));
const totalAmount = computed(() => selectedGroups.value.reduce((s, g) => s + g.amount, 0));

async function loadCandidates() {
  loading.value = true;
  try {
    const res = await listVegOutCandidates(productName.value || undefined);
    candidates.value = (res.data ?? []) as VegOutCandidateVO[];
    // 记进跨搜索快照：换搜索词后「已选」与上限判定仍要看得见之前填过的行
    rememberRows(candidates.value);
    // 单价默认带出产品配置的销售价：加载即预填，不等用户先填出库量
    candidates.value.forEach((row) => ensurePrice(row));
  } finally {
    loading.value = false;
  }
}

const emit = defineEmits<{ (e: 'success'): void }>();

const open = async () => {
  form.outDate = today();
  form.outDest = '';
  productName.value = '';
  previewNo.value = '';
  Object.keys(quantityMap).forEach((k) => delete quantityMap[k]);
  Object.keys(priceMap).forEach((k) => delete priceMap[k]);
  knownRows.value = [];
  visible.value = true;
  loadCandidates();
};
defineExpose({ open });

const handleClosed = () => {
  candidates.value = [];
  knownRows.value = [];
  Object.keys(quantityMap).forEach((k) => delete quantityMap[k]);
  Object.keys(priceMap).forEach((k) => delete priceMap[k]);
};

async function submit(print: boolean) {
  if (!form.outDate) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.outDate'));
    return;
  }
  if (!form.outDest) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.outDest'));
    return;
  }
  if (!selectedRows.value.length) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.items'));
    return;
  }
  // 兜底：selectedRows 已改成跨搜索全集，输入框禁用理论上挡得住；这里再拦一道防边界情况。
  // 按合并后的产品数判（与打印行数、与后端 MAX_PRODUCTS_PER_SHEET 同一口径）
  if (selectedGroups.value.length > MAX_SELECTED_PRODUCTS) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.maxProducts', { n: MAX_SELECTED_PRODUCTS }));
    return;
  }
  submitting.value = true;
  try {
    const res = await submitVegOutBatch({
      outDate: form.outDate,
      outDest: form.outDest,
      // ⚠️ 提交按**库存行**逐条走，不按右侧合并后的产品走（V6 row108 的合并只在展示 / 打印层）：
      // 后端扣的是具体那个「产品 × 地块」篮的库存，合并成一条它就不知道从哪个篮扣、
      // 也写不出正确的地块流水（月台待收货、地块追溯都依赖流水上的 plot_id）。
      items: selectedRows.value.map((r) => ({
        stockId: r.stockId,
        quantity: Number(quantityMap[r.stockId]),
        // row194：单价随行提交，后端落成流水快照（改产品价格不影响历史单）
        outUnitPrice: priceMap[r.stockId] === undefined ? undefined : Number(priceMap[r.stockId])
      }))
    });
    const batchNo = String((res as any)?.data ?? '');
    previewNo.value = batchNo;
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    // row196：先落单再打印 —— 打印单上要有真实出库单号，且不能出现「打了单却没出库」
    if (print) {
      printVegOutSheet({
        batchNo,
        outDate: form.outDate,
        customerName: destLabel(form.outDest),
        // V6 row108：一个产品打一行（同产品不同地块的量已在 selectedGroups 里累计）。
        // 金额直接给组内真实小计之和，不让打印模板按「合并量 × 单价」倒算。
        rows: selectedGroups.value.map((g) => ({
          productName: g.productName,
          productSpec: g.productSpec,
          productUnit: g.productUnit,
          quantity: g.quantity,
          unitPrice: g.unitPrice,
          amount: g.amount
        }))
      });
    }
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.veg-out-create {
  display: flex;
  gap: 16px;
  height: 100%;
}
.left {
  flex: 1;
  min-width: 0;
}
.right {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid var(--el-border-color-light);
  padding-left: 16px;
}
.right-title {
  font-weight: 500;
  margin-bottom: 12px;
}
/* 满员前是灰色提示，满员后转警示色，让「为什么输入框不能填了」有个就近解释 */
.max-tip {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.max-tip.is-full {
  color: var(--el-color-warning);
}
.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}
.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  font-size: 13px;
}
.selected-item .plot {
  margin-left: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.selected-item .qty {
  color: var(--el-color-primary);
  white-space: nowrap;
}
.selected-item .del {
  cursor: pointer;
  color: var(--el-color-danger);
}
.selected-total {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-light);
  text-align: right;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
