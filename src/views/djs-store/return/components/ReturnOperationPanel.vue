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

    <!-- 猪肉产品：产品名称 / 退回量 / 单位（row221：候选 = 退回产品清单 ∪ 当日到店的生产产品，两半规则不同，见 maxOf / precisionOf） -->
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
            :precision="precisionOf(row)"
            :step="1"
            :placeholder="t('storeReturn.operation.quantityPlaceholder')"
            controls-position="right"
            style="width: 180px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
    </el-table>

    <!-- 果蔬产品：产品名称 / 退回量 / 单位（row221：同猪肉，候选是清单 ∪ 当日到店生产产品的并集） -->
    <el-table v-else-if="activeCat === 'vegetable'" v-loading="loading" :data="vegRows" border class="op-table">
      <el-table-column
        :label="t('storeReturn.column.productName')"
        prop="productName"
        min-width="180"
        show-overflow-tooltip
        align="center"
        header-align="center"
      />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :max="maxOf(row)"
            :precision="precisionOf(row)"
            :step="1"
            :placeholder="t('storeReturn.operation.quantityPlaceholder')"
            controls-position="right"
            style="width: 180px"
          />
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
    </el-table>

    <!-- 其他产品（row214：非猪肉非果蔬的一律落这里，列与逻辑与果蔬完全一致） -->
    <el-table v-else v-loading="loading" :data="otherRows" border class="op-table">
      <el-table-column
        :label="t('storeReturn.column.productName')"
        prop="productName"
        min-width="180"
        show-overflow-tooltip
        align="center"
        header-align="center"
      />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :max="maxOf(row)"
            :precision="precisionOf(row)"
            :step="1"
            :placeholder="t('storeReturn.operation.quantityPlaceholder')"
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
  /** 当日到店量：仅「当日到店的生产产品」行有值（清单产品不封顶，后端恒下发 null） */
  arrivedQuantity?: number;
  /** 今日已退量 */
  returnedQuantity?: number;
  /** 这一行是不是「退回产品清单」里的产品（row221：候选是两个来源的并集，规则按来源分流） */
  inReturnList?: boolean;
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
 * 该行的退回量上限（row221）。
 *
 * - 清单产品（`inReturnList`）：**不封顶**，甲方 row214 原话「对于其退回量不做限制」（D-0055）。
 * - 当日到店的生产产品：上限 = 当日到店量 − 今日已退。后端提交时会再算一遍同一条式子，
 *   前端这道只是别让工人白填；两处算错一处都会被另一处兜住。
 *
 * 算出 0 时输入框会被禁掉，那正是「今天到的货已经退完了」该有的样子。
 */
function maxOf(row: MatrixRow): number | undefined {
  if (row.inReturnList) return undefined;
  if (row.arrivedQuantity === undefined || row.arrivedQuantity === null) return undefined;
  return Math.max(0, Number(row.arrivedQuantity) - Number(row.returnedQuantity ?? 0));
}

/**
 * 该行的录入精度（row221 把两套精度口径同时摆进了一张表）。
 *
 * - 清单产品：无论什么单位都两位小数（甲方 row214 / D-0054）。
 * - 其余（当日到店的生产产品）：回到 D-0017 —— kg 类三位小数、计数类整数。
 */
function precisionOf(row: MatrixRow): number {
  if (isKg(row.productUnit)) return 3;
  return row.inReturnList ? 2 : 0;
}

/** 猪肉 tab：后端按字典「退回产品清单」里 belong_type=pork/white_bar 的产品返回候选（未选门店 → 空）。 */
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
      inReturnList: p.inReturnList,
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
      inReturnList: p.inReturnList,
      returnQuantity: undefined,
      returnWeight: undefined
    }));
  } finally {
    loading.value = false;
  }
}

/** 其他产品 tab（row214）：非猪肉非果蔬的产品一律落这里，候选与另两 tab 同源（退回产品清单）。 */
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
      inReturnList: p.inReturnList,
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
    // 重拉候选刷新「今日已退」展示值。
    // 三个 tab 必须全刷：漏掉任一个，那个 tab 的输入框不清空、:max 也不收缩，
    // 按钮继续亮着，再点一次就会把同一行重复提交出去（后端每次重算额度所以不会破顶，
    // 但只要剩余额度够就会真生成第二条退回记录）。
    await Promise.all([loadPorkCandidates(), loadVegRows(), loadOtherRows()]);
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
