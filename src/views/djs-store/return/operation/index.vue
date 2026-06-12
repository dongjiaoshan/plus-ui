<template>
  <div class="p-2 return-operation">
    <el-card shadow="never">
      <template #header>
        <div class="op-header">
          <span class="title">{{ t('storeReturn.operation.title') }}</span>
          <el-select
            v-model="storeId"
            filterable
            :placeholder="t('storeReturn.placeholder.store')"
            class="store-select"
            @change="handleStoreChange"
          >
            <el-option v-for="s in storeOptions" :key="s.id" :label="s.storeName" :value="String(s.id)" />
          </el-select>
        </div>
      </template>

      <!-- 猪肉产品 / 果蔬产品 tab（对齐原型「退回操作」分类） -->
      <el-tabs v-model="activeTab" class="op-tabs">
        <el-tab-pane :label="t('storeReturn.tab.pork')" name="pork" />
        <el-tab-pane :label="t('storeReturn.tab.vegetable')" name="vegetable" />
      </el-tabs>

      <el-table v-loading="loading" :data="currentRows" border class="op-table">
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

      <el-empty v-if="!loading && !currentRows.length" :description="t('storeReturn.operation.emptyCandidates')" />

      <div class="op-footer">
        <el-button type="primary" :loading="submitLoading" :disabled="!filledCount" @click="handleSubmit">
          {{ t('storeReturn.operation.submit') }}<template v-if="filledCount">（{{ filledCount }}）</template>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="StoreReturnOperation" lang="ts">
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
  category: 'pork' | 'vegetable';
  returnWeight?: number;
}

const storeId = ref<string>();
const activeTab = ref<'pork' | 'vegetable'>('pork');
const loading = ref(false);
const submitLoading = ref(false);
const storeOptions = ref<StoreVO[]>([]);
const rows = ref<MatrixRow[]>([]);

// 产品 snowflake id → belongType（用于 pork/veg 分类）
const belongTypeMap = ref<Map<string, string | undefined>>(new Map());

const currentRows = computed(() => rows.value.filter((r) => r.category === activeTab.value));
const filledCount = computed(() => rows.value.filter((r) => (r.returnWeight ?? 0) > 0).length);

function categoryOf(belongType?: string): 'pork' | 'vegetable' {
  return belongType && PORK_BELONG_TYPES.includes(belongType) ? 'pork' : 'vegetable';
}

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreReturnOperation] loadStoreOptions failed', e);
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
    console.warn('[StoreReturnOperation] loadProductMeta failed', e);
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
      category: categoryOf(belongTypeMap.value.get(String(r.productId))),
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
    .filter((r) => (r.returnWeight ?? 0) > 0)
    .map((r) => ({ productId: r.productId, returnWeight: r.returnWeight }));
  if (!storeId.value || !items.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeReturn.operation.submitConfirm', { n: items.length }));
  submitLoading.value = true;
  try {
    await batchCreateStoreReturn({ storeId: storeId.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    // 提交后清空已录入的重量
    rows.value.forEach((r) => (r.returnWeight = undefined));
  } finally {
    submitLoading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadStoreOptions(), loadProductMeta()]);
});
</script>

<style lang="scss" scoped>
.return-operation {
  .op-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-weight: 600;
    }

    .store-select {
      width: 220px;
    }
  }

  .op-table {
    margin-top: 8px;
  }

  .op-footer {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
