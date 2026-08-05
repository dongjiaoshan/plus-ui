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
        <div class="right-title">{{ t('vegOut.create.selected') }}</div>
        <el-empty v-if="!selectedRows.length" :description="t('vegOut.create.selectedEmpty')" :image-size="70" />
        <!-- row195：不显示地块；重量挪到原地块位置；原重量位置改显销售总价；汇总加总价之和 -->
        <div v-else class="selected-list">
          <div v-for="row in selectedRows" :key="row.stockId" class="selected-item">
            <div class="truncate">
              <span>{{ row.productName }}</span>
              <span class="plot">{{ fmtQty(quantityMap[row.stockId], row) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="qty">{{ fmtMoney(lineAmount(row)) }}</span>
              <el-icon class="del" @click="clearLine(row)"><CircleClose /></el-icon>
            </div>
          </div>
          <div class="selected-total">
            {{ t('vegOut.create.totalKinds', { n: selectedRows.length }) }} · {{ fmtKg(totalWeight) }} ·
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
import { CircleClose } from '@element-plus/icons-vue';
import { listVegOutCandidates, submitVegOutBatch } from '@/api/djs-warehouse/vegOut';
import { printVegOutSheet } from '../printSheet';
import type { VegOutCandidateVO } from '@/api/djs-warehouse/vegOut/types';
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

const today = () => new Date().toISOString().slice(0, 10);
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

/** 已选 = 填了正数出库量的行（右侧实时反映） */
const selectedRows = computed(() => candidates.value.filter((r) => Number(quantityMap[r.stockId]) > 0));
// row194 混单位（Kevin 2026-08-03 定 D7）：**重量合计只累加 kg 行**——干货有袋/桶/罐、蛋类是「枚」，
// 「3 袋 + 2kg」加不到一起。金额是钱，三类都能加，故 totalAmount 全量累加。
const totalWeight = computed(() =>
  selectedRows.value.filter(isKgRow).reduce((s, r) => s + Number(quantityMap[r.stockId] || 0), 0)
);
const totalAmount = computed(() => selectedRows.value.reduce((s, r) => s + lineAmount(r), 0));

async function loadCandidates() {
  loading.value = true;
  try {
    const res = await listVegOutCandidates(productName.value || undefined);
    candidates.value = (res.data ?? []) as VegOutCandidateVO[];
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
  visible.value = true;
  loadCandidates();
};
defineExpose({ open });

const handleClosed = () => {
  candidates.value = [];
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
  submitting.value = true;
  try {
    const res = await submitVegOutBatch({
      outDate: form.outDate,
      outDest: form.outDest,
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
        rows: selectedRows.value.map((r) => ({
          productName: r.productName,
          productSpec: r.productSpec,
          productUnit: r.productUnit,
          quantity: Number(quantityMap[r.stockId] || 0),
          unitPrice: Number(priceMap[r.stockId] || 0)
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
