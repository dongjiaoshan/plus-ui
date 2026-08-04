<template>
  <div class="return-operation-panel">
    <!-- 猪肉产品 / 果蔬产品 分段切换（对齐原型顶部段控） -->
    <div class="op-segment">
      <el-radio-group v-model="activeCat" size="large">
        <el-radio-button value="pork">{{ t('storeReturn.tab.pork') }}</el-radio-button>
        <el-radio-button value="vegetable">{{ t('storeReturn.tab.vegetable') }}</el-radio-button>
        <el-radio-button value="other">{{ t('storeReturn.tab.other') }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 猪肉产品：产品名称 / 退回量 / 单位（row119：退回量按「当日到店量 − 今日已退」封顶，上限 0 → 输入框禁用，上限本身不展示） -->
    <el-table v-if="activeCat === 'pork'" v-loading="loading" :data="porkRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" min-width="180" show-overflow-tooltip align="center" header-align="center">
        <template #default="{ row }">
          {{ row.productName }}
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :max="maxOf(row)"
            :disabled="maxOf(row) === 0"
            :precision="isKg(row.productUnit) ? 3 : 0"
            :step="1"
            :placeholder="placeholderOf(row)"
            controls-position="right"
            style="width: 180px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
    </el-table>

    <!-- 果蔬产品：产品名称 / 退回量 / 单位（row202：上限 = 期初+入库−已退） -->
    <el-table v-else-if="activeCat === 'vegetable'" v-loading="loading" :data="vegRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" prop="productName" min-width="180" show-overflow-tooltip align="center" header-align="center" />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :max="maxOf(row)"
            :disabled="maxOf(row) === 0"
            :precision="isKg(row.productUnit) ? 3 : 0"
            :step="1"
            :placeholder="placeholderOf(row)"
            controls-position="right"
            style="width: 180px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
    </el-table>

    <!-- 其他产品（row202：干货 / 鸡蛋 / 其他三业态，列与逻辑与果蔬完全一致） -->
    <el-table v-else v-loading="loading" :data="otherRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" prop="productName" min-width="180" show-overflow-tooltip align="center" header-align="center" />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :max="maxOf(row)"
            :disabled="maxOf(row) === 0"
            :precision="isKg(row.productUnit) ? 3 : 0"
            :step="1"
            :placeholder="placeholderOf(row)"
            controls-position="right"
            style="width: 180px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !currentRows.length" :description="t('storeReturn.operation.empty')" />

    <div class="op-footer">
      <el-button type="primary" :loading="submitLoading" :disabled="!filledCount" @click="handleSubmit">
        {{ t('storeReturn.operation.submit') }}<template v-if="filledCount">（{{ filledCount }}）</template>
      </el-button>
    </div>
  </div>
</template>

<script setup name="StoreReturnOperationPanel" lang="ts">
import { batchCreateStoreReturn, listOtherReturnCandidates, listPorkReturnCandidates, listVegReturnCandidates } from '@/api/djs-store/return';
import type { StoreReturnBatchItem, StoreReturnPorkSubCategory } from '@/api/djs-store/return/types';
import { useStoreContextStore } from '@/store/modules/storeContext';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

interface MatrixRow {
  productId: string;
  productName: string;
  productUnit?: string;
  /** 猪肉 tab 子类（DENGBO-R11）：pork=猪肉产品(按份) / white_bar=白条产品(按重量)；果蔬 tab 行不设 */
  subCategory?: StoreReturnPorkSubCategory;
  /** 退回量（果蔬/猪肉产品录入，份/把/盒等；白条产品不录） */
  returnQuantity?: number;
  /** 退回产品重量(kg) */
  returnWeight?: number;
  /** 到店量（退回量上限 rows40/41）：份数产品=当日到店需求订购份数 / 重量产品=当日到店重量；空 → 不封顶 */
  arrivedQuantity?: number;
  /** 今日已退量（row119）：可退上限 = 到店量 − 今日已退 */
  returnedQuantity?: number;
}

const storeContext = useStoreContextStore();
// 操作目标门店来自全局选择器（StoreSwitcher）；沿用 storeId 命名最小化改动
const { currentStoreId: storeId } = storeToRefs(storeContext);
const activeCat = ref<'pork' | 'vegetable' | 'other'>('pork');
const loading = ref(false);
const submitLoading = ref(false);

/** 猪肉产品：仅当该门店当日有白条到店时后端才返回字典项，否则空。 */
const porkRows = ref<MatrixRow[]>([]);
/** 果蔬产品：该门店当天已确认到店的需求产品（按 product_id 去重）。 */
const vegRows = ref<MatrixRow[]>([]);
// row202：其他产品（干货 / 鸡蛋 / 其他）候选，结构与果蔬一致
const otherRows = ref<MatrixRow[]>([]);

const currentRows = computed(() => {
  if (activeCat.value === 'pork') return porkRows.value;
  if (activeCat.value === 'vegetable') return vegRows.value;
  return otherRows.value;
});
/**
 * 三个 tab 的全部行。
 *
 * ⚠️ 「已填统计 / 超额校验 / 提交体」三处**必须都用它**，不能只拼 pork + veg —— row202 新增
 * 「其他产品」tab 后，漏掉 otherRows 会让干货 / 蛋类**填了也提交不出去**（按钮恒 disabled、
 * 超额不拦、items 里根本没有这些行）。曾经三处全漏，接口级测试完全发现不了，只有 UI E2E 能抓。
 */
const allRows = computed(() => [...porkRows.value, ...vegRows.value, ...otherRows.value]);

// 流程性问题 row15：唯一录入项是退回量，已填 = 退回量 > 0。
const filledCount = computed(() => allRows.value.filter((r) => (r.returnQuantity ?? 0) > 0).length);

/**
 * row178：礼盒（belong_type=gift_box）不可退回仓库。
 *
 * 礼盒是多种原料的组合装，退回入库拆不回单一原材料，仓库确认那一步必然报错（后端已硬拦）。
 * 这里在选品列表就滤掉，工人根本选不到，不会白填一遍再被拒。
 */
const BELONG_TYPE_GIFT_BOX = 'gift_box';

function isReturnable(belongType?: string): boolean {
  return belongType !== BELONG_TYPE_GIFT_BOX;
}

/** 单位是否 kg（不区分大小写，兼容「公斤」）——决定退回量精度与是否派生退回产品重量。 */
function isKg(unit?: string): boolean {
  const u = (unit ?? '').trim().toLowerCase();
  return u === 'kg' || u === '公斤';
}

/**
 * row119：该行可退上限 = 当日到店量 − 今日已退量（不小于 0）。
 * 后端候选接口给 arrivedQuantity / returnedQuantity，两端同一口径；到店量为空 = 该产品不封顶（Infinity）。
 */
function maxOf(row: MatrixRow): number {
  if (row.arrivedQuantity === undefined || row.arrivedQuantity === null) {
    return Infinity;
  }
  return Math.max(0, Number(row.arrivedQuantity) - Number(row.returnedQuantity ?? 0));
}

/** 可退上限文案（超限提示用）：不封顶 → '—'；kg 保留 3 位、计件去尾零。 */
function limitText(row: MatrixRow): string {
  const max = maxOf(row);
  if (!Number.isFinite(max)) {
    return '—';
  }
  return isKg(row.productUnit) ? max.toFixed(3) : String(Number(max.toFixed(0)));
}

/** 上限为 0（当日没到店 / 今日已退完）时，输入框直接禁用并说明原因。 */
function placeholderOf(row: MatrixRow): string {
  return maxOf(row) === 0 ? t('storeReturn.operation.noReturnable') : t('storeReturn.operation.quantityPlaceholder');
}

/** 猪肉 tab：后端按「该门店当日是否有白条到店」决定是否返回字典项候选（无到店 / 未选门店 → 空）。 */
async function loadPorkCandidates() {
  if (!storeId.value) {
    porkRows.value = [];
    return;
  }
  try {
    const res = await listPorkReturnCandidates(storeId.value);
    const list = (res.data ?? []).filter((p) => isReturnable(p.belongType));
    porkRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
      subCategory: p.subCategory ?? 'pork',
      arrivedQuantity: p.arrivedQuantity,
      returnedQuantity: p.returnedQuantity,
      returnQuantity: undefined,
      returnWeight: undefined
    }));
  } catch (e) {
    console.warn('[ReturnOperationPanel] loadPorkCandidates failed', e);
    porkRows.value = [];
  }
}

/** 果蔬 tab：该门店当天已确认到店的需求产品（按 product_id 去重，由后端聚合）。 */
async function loadVegRows() {
  if (!storeId.value) {
    vegRows.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listVegReturnCandidates(storeId.value);
    const list = (res.data ?? []).filter((p) => isReturnable(p.belongType));
    vegRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
      arrivedQuantity: p.arrivedQuantity,
      returnedQuantity: p.returnedQuantity,
      returnQuantity: undefined,
      returnWeight: undefined
    }));
  } finally {
    loading.value = false;
  }
}

/** 其他产品 tab（row202）：干货 / 鸡蛋 / 其他三业态，取数与果蔬同口径（台账 期初+入库）。 */
async function loadOtherRows() {
  if (!storeId.value) {
    otherRows.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listOtherReturnCandidates(storeId.value);
    const list = (res.data ?? []).filter((p) => isReturnable(p.belongType));
    otherRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
      arrivedQuantity: p.arrivedQuantity,
      returnedQuantity: p.returnedQuantity,
      returnQuantity: undefined,
      returnWeight: undefined
    }));
  } finally {
    loading.value = false;
  }
}

// 全局门店切换 → 重拉该门店猪肉/果蔬退回候选（navbar 切换会刷新页面，watch 兜底同页响应）
watch(storeId, () => {
  loadPorkCandidates();
  loadVegRows();
  loadOtherRows();
});

async function handleSubmit() {
  if (!storeId.value) {
    return;
  }
  // row119：提交前再拦一次超限（input :max 挡键盘输入，粘贴 / 上限刷新后仍可能越界；后端同口径二次把关）。
  const over = allRows.value.find((r) => (r.returnQuantity ?? 0) > maxOf(r));
  if (over) {
    proxy?.$modal.msgError(t('storeReturn.operation.overLimit', { name: over.productName, limit: limitText(over), unit: over.productUnit ?? '' }));
    return;
  }
  // 流程性问题 row15：唯一录入项是退回量。退回产品重量由前端按单位派生——
  //   产品单位为 kg → 退回产品重量 = 退回量；非 kg → 退回产品重量 = 0。
  const items: StoreReturnBatchItem[] = allRows.value
    .filter((r) => (r.returnQuantity ?? 0) > 0)
    .map((r) => ({
      productId: r.productId,
      returnQuantity: r.returnQuantity,
      returnWeight: isKg(r.productUnit) ? r.returnQuantity : 0
    }));
  if (!items.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeReturn.operation.submitConfirm', { n: items.length }));
  submitLoading.value = true;
  try {
    await batchCreateStoreReturn({ storeId: storeId.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    // row119：重拉候选刷新「今日已退」→ 可退上限随之收缩，避免连续提交累计越界。
    await Promise.all([loadPorkCandidates(), loadVegRows()]);
  } finally {
    submitLoading.value = false;
  }
}

onMounted(async () => {
  await loadPorkCandidates();
  if (storeId.value) {
    await loadVegRows();
    await loadOtherRows();
  }
});
</script>

<style lang="scss" scoped>
.return-operation-panel {
  .op-segment {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .op-table {
    margin: 0 auto;
    max-width: 900px;
  }

  .op-footer {
    margin-top: 24px;
    text-align: center;
  }

  .sub-tag {
    margin-left: 6px;
  }

  .text-muted {
    color: #909399;
  }
}
</style>
