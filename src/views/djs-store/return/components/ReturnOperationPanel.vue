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
import { batchCreateStoreReturn } from '@/api/djs-store/return';
import type { StoreReturnBatchItem } from '@/api/djs-store/return/types';
import { listStoreRelation } from '@/api/djs-store/operation/relation';
import type { StoreProductRelationVO } from '@/api/djs-store/operation/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const PORK_BELONG_TYPES = ['pork', 'white_bar'];

interface MatrixRow {
  productId: string;
  productName: string;
  productUnit?: string;
  category: 'pork' | 'vegetable';
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
const rows = ref<MatrixRow[]>([]);

// 产品 snowflake id → belongType（pork/veg 分类）
const belongTypeMap = ref<Map<string, string | undefined>>(new Map());

const porkRows = computed(() => rows.value.filter((r) => r.category === 'pork'));
const vegRows = computed(() => rows.value.filter((r) => r.category === 'vegetable'));
const currentRows = computed(() => (activeCat.value === 'pork' ? porkRows.value : vegRows.value));
const filledCount = computed(() => rows.value.filter((r) => (r.returnWeight ?? 0) > 0 || (r.returnQuantity ?? 0) > 0).length);

function categoryOf(belongType?: string): 'pork' | 'vegetable' {
  return belongType && PORK_BELONG_TYPES.includes(belongType) ? 'pork' : 'vegetable';
}

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[ReturnOperationPanel] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadProductMeta() {
  try {
    const res = await listProduct({ pageNum: 1, pageSize: 500 });
    const products = ((res as unknown as { rows?: ProductInfoVO[]; data?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
    const m = new Map<string, string | undefined>();
    products.forEach((p) => m.set(String(p.id), p.belongType));
    belongTypeMap.value = m;
  } catch (e) {
    console.warn('[ReturnOperationPanel] loadProductMeta failed', e);
  }
}

async function loadCandidates() {
  if (!storeId.value) {
    rows.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listStoreRelation(storeId.value);
    const relations = (res.data ?? []) as StoreProductRelationVO[];
    rows.value = relations.map((r) => ({
      productId: String(r.productId),
      productName: r.productName ?? '',
      productUnit: r.productUnit,
      category: categoryOf(belongTypeMap.value.get(String(r.productId))),
      returnQuantity: undefined,
      returnWeight: undefined
    }));
  } finally {
    loading.value = false;
  }
}

function handleStoreChange() {
  loadCandidates();
}

async function handleSubmit() {
  const items: StoreReturnBatchItem[] = rows.value
    .filter((r) => (r.returnWeight ?? 0) > 0 || (r.returnQuantity ?? 0) > 0)
    .map((r) => ({ productId: r.productId, returnQuantity: r.returnQuantity, returnWeight: r.returnWeight }));
  if (!storeId.value || !items.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeReturn.operation.submitConfirm', { n: items.length }));
  submitLoading.value = true;
  try {
    await batchCreateStoreReturn({ storeId: storeId.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    rows.value.forEach((r) => {
      r.returnQuantity = undefined;
      r.returnWeight = undefined;
    });
  } finally {
    submitLoading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadStoreOptions(), loadProductMeta()]);
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
