<template>
  <div class="return-operation-panel">
    <!-- 猪肉产品 / 果蔬产品 分段切换（对齐原型顶部段控） -->
    <div class="op-segment">
      <el-radio-group v-model="activeCat" size="large">
        <el-radio-button value="pork">{{ t('storeReturn.tab.pork') }}</el-radio-button>
        <el-radio-button value="vegetable">{{ t('storeReturn.tab.vegetable') }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 猪肉产品：产品名称 / 退回量 / 单位 / 退回产品重量(KG)（DENGBO-R11：与果蔬一致；猪肉产品按份录退回量，白条产品仅按重量） -->
    <el-table v-if="activeCat === 'pork'" v-loading="loading" :data="porkRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" min-width="180" show-overflow-tooltip align="center" header-align="center">
        <template #default="{ row }">
          {{ row.productName }}
          <el-tag v-if="row.subCategory === 'white_bar'" size="small" type="warning" class="sub-tag" disable-transitions>{{ t('storeReturn.subCategory.white_bar') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="200" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-if="row.subCategory !== 'white_bar'"
            v-model="row.returnQuantity"
            :min="0"
            :precision="2"
            :step="1"
            :placeholder="t('storeReturn.operation.quantityPlaceholder')"
            controls-position="right"
            style="width: 160px"
          />
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.operation.returnWeight')" width="260" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnWeight"
            :min="0"
            :precision="3"
            :step="1"
            :placeholder="t('storeReturn.operation.weightPlaceholder')"
            controls-position="right"
            style="width: 220px"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 果蔬产品：产品名称 / 退回量 / 单位 / 退回产品重量(KG) -->
    <el-table v-else v-loading="loading" :data="vegRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" prop="productName" min-width="180" show-overflow-tooltip align="center" header-align="center" />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnQuantity"
            :min="0"
            :precision="2"
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
      <el-table-column :label="t('storeReturn.operation.returnWeight')" width="280" align="center" header-align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnWeight"
            :min="0"
            :precision="3"
            :step="1"
            :placeholder="t('storeReturn.operation.weightPlaceholder')"
            controls-position="right"
            style="width: 220px"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !currentRows.length" :description="t('storeReturn.operation.emptyCandidates')" />

    <div class="op-footer">
      <el-button type="primary" :loading="submitLoading" :disabled="!filledCount" @click="handleSubmit">
        {{ t('storeReturn.operation.submit') }}<template v-if="filledCount">（{{ filledCount }}）</template>
      </el-button>
    </div>
  </div>
</template>

<script setup name="StoreReturnOperationPanel" lang="ts">
import { batchCreateStoreReturn, listPorkReturnCandidates, listVegReturnCandidates } from '@/api/djs-store/return';
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
}

const storeContext = useStoreContextStore();
// 操作目标门店来自全局选择器（StoreSwitcher）；沿用 storeId 命名最小化改动
const { currentStoreId: storeId } = storeToRefs(storeContext);
const activeCat = ref<'pork' | 'vegetable'>('pork');
const loading = ref(false);
const submitLoading = ref(false);

/** 猪肉产品：仅当该门店当日有白条到店时后端才返回字典项，否则空。 */
const porkRows = ref<MatrixRow[]>([]);
/** 果蔬产品：该门店当天已确认到店的需求产品（按 product_id 去重）。 */
const vegRows = ref<MatrixRow[]>([]);

const currentRows = computed(() => (activeCat.value === 'pork' ? porkRows.value : vegRows.value));
const filledCount = computed(
  () => [...porkRows.value, ...vegRows.value].filter((r) => (r.returnWeight ?? 0) > 0 || (r.returnQuantity ?? 0) > 0).length
);

/** 猪肉 tab：后端按「该门店当日是否有白条到店」决定是否返回字典项候选（无到店 / 未选门店 → 空）。 */
async function loadPorkCandidates() {
  if (!storeId.value) {
    porkRows.value = [];
    return;
  }
  try {
    const res = await listPorkReturnCandidates(storeId.value);
    const list = res.data ?? [];
    porkRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
      subCategory: p.subCategory ?? 'pork',
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
    const list = res.data ?? [];
    vegRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
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
});

async function handleSubmit() {
  if (!storeId.value) {
    return;
  }
  // 果蔬行 + 猪肉产品行（subCategory=pork）：退回量 + 退回产品重量两值都必填（DENGBO-R11 猪肉与果蔬一致）。
  // 白条产品行（subCategory=white_bar）：仅按重量退货，不校验退回量。
  const bothRequiredRows = [...vegRows.value, ...porkRows.value.filter((r) => r.subCategory !== 'white_bar')];
  const partial = bothRequiredRows.find(
    (r) => ((r.returnQuantity ?? 0) > 0 || (r.returnWeight ?? 0) > 0) && !((r.returnQuantity ?? 0) > 0 && (r.returnWeight ?? 0) > 0)
  );
  if (partial) {
    proxy?.$modal.msgWarning(t('storeReturn.operation.vegBothRequired', { name: partial.productName }));
    return;
  }
  const items: StoreReturnBatchItem[] = [...porkRows.value, ...vegRows.value]
    .filter((r) => (r.returnWeight ?? 0) > 0 || (r.returnQuantity ?? 0) > 0)
    .map((r) => ({ productId: r.productId, returnQuantity: r.returnQuantity, returnWeight: r.returnWeight }));
  if (!items.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeReturn.operation.submitConfirm', { n: items.length }));
  submitLoading.value = true;
  try {
    await batchCreateStoreReturn({ storeId: storeId.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    [...porkRows.value, ...vegRows.value].forEach((r) => {
      r.returnQuantity = undefined;
      r.returnWeight = undefined;
    });
  } finally {
    submitLoading.value = false;
  }
}

onMounted(async () => {
  await loadPorkCandidates();
  if (storeId.value) await loadVegRows();
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
