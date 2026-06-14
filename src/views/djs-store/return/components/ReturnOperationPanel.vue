<template>
  <div class="return-operation-panel">
    <div class="op-toolbar">
      <el-select
        v-model="storeId"
        filterable
        clearable
        :placeholder="t('storeReturn.placeholder.store')"
        class="store-select"
        @change="handleStoreChange"
      >
        <el-option v-for="s in storeOptions" :key="s.id" :label="s.storeName" :value="String(s.id)" />
      </el-select>
    </div>

    <!-- 猪肉产品 / 果蔬产品 分段切换（对齐原型顶部段控） -->
    <div class="op-segment">
      <el-radio-group v-model="activeCat" size="large">
        <el-radio-button value="pork">{{ t('storeReturn.tab.pork') }}</el-radio-button>
        <el-radio-button value="vegetable">{{ t('storeReturn.tab.vegetable') }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 猪肉产品：产品名称 / 退回产品重量(KG) -->
    <el-table v-if="activeCat === 'pork'" v-loading="loading" :data="porkRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" prop="productName" min-width="200" show-overflow-tooltip />
      <el-table-column :label="t('storeReturn.operation.returnWeight')" width="320" align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnWeight"
            :min="0"
            :precision="2"
            :step="1"
            :placeholder="t('storeReturn.operation.weightPlaceholder')"
            controls-position="right"
            style="width: 260px"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 果蔬产品：产品名称 / 退回量 / 单位 / 退回产品重量(KG) -->
    <el-table v-else v-loading="loading" :data="vegRows" border class="op-table">
      <el-table-column :label="t('storeReturn.column.productName')" prop="productName" min-width="180" show-overflow-tooltip />
      <el-table-column :label="t('storeReturn.column.returnQuantity')" width="220" align="center">
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
      <el-table-column :label="t('storeReturn.column.unit')" prop="productUnit" width="100" align="center">
        <template #default="{ row }">{{ row.productUnit || '—' }}</template>
      </el-table-column>
      <el-table-column :label="t('storeReturn.operation.returnWeight')" width="280" align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.returnWeight"
            :min="0"
            :precision="2"
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
import type { StoreReturnBatchItem } from '@/api/djs-store/return/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

interface MatrixRow {
  productId: string;
  productName: string;
  productUnit?: string;
  /** 退回量（果蔬录入，份/把/盒等） */
  returnQuantity?: number;
  /** 退回产品重量(kg) */
  returnWeight?: number;
}

const storeId = ref<string>();
const activeCat = ref<'pork' | 'vegetable'>('pork');
const loading = ref(false);
const submitLoading = ref(false);
const storeOptions = ref<StoreVO[]>([]);

/** 猪肉产品：固定候选（belong_type IN pork/white_bar，与门店关联无关，原型「字典固定展示」口径）。 */
const porkRows = ref<MatrixRow[]>([]);
/** 果蔬产品：该门店当天已确认到店的需求产品（按 product_id 去重）。 */
const vegRows = ref<MatrixRow[]>([]);

const currentRows = computed(() => (activeCat.value === 'pork' ? porkRows.value : vegRows.value));
const filledCount = computed(
  () => [...porkRows.value, ...vegRows.value].filter((r) => (r.returnWeight ?? 0) > 0 || (r.returnQuantity ?? 0) > 0).length
);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[ReturnOperationPanel] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

/** 猪肉 tab：从后端固定候选拉取（与门店无关，进入页面即固定展示）。 */
async function loadPorkCandidates() {
  try {
    const res = await listPorkReturnCandidates();
    const list = res.data ?? [];
    porkRows.value = list.map((p) => ({
      productId: String(p.productId),
      productName: p.productName ?? '',
      productUnit: p.productUnit,
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

function handleStoreChange() {
  loadVegRows();
}

async function handleSubmit() {
  if (!storeId.value) {
    return;
  }
  // 果蔬行：退回量 + 退回产品重量两值都必填（原型「果蔬同时录入退回量和对应重量」口径）
  const vegPartial = vegRows.value.find(
    (r) => ((r.returnQuantity ?? 0) > 0 || (r.returnWeight ?? 0) > 0) && !((r.returnQuantity ?? 0) > 0 && (r.returnWeight ?? 0) > 0)
  );
  if (vegPartial) {
    proxy?.$modal.msgWarning(t('storeReturn.operation.vegBothRequired', { name: vegPartial.productName }));
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
  await Promise.all([loadStoreOptions(), loadPorkCandidates()]);
});
</script>

<style lang="scss" scoped>
.return-operation-panel {
  .op-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;

    .store-select {
      width: 240px;
    }
  }

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
}
</style>
