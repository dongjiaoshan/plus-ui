<template>
  <el-dialog v-model="visible" :title="t('demand.detail.title')" destroy-on-close append-to-body width="640px">
    <div class="detail-head">
      <span class="detail-product">{{ productName }}</span>
      <el-tag size="small" type="info">{{ t('demand.detail.storeCount', { count: rows.length }) }}</el-tag>
    </div>
    <el-table v-loading="loading" :data="rows" border :empty-text="t('demand.detail.empty')">
      <el-table-column :label="t('demand.detail.storeName')" prop="storeName" min-width="160" show-overflow-tooltip />
      <el-table-column :label="t('demand.detail.demandQuantity')" prop="demandQuantity" width="140" align="right">
        <template #default="{ row }">{{ formatQty(row.demandQuantity) }}</template>
      </el-table-column>
      <el-table-column :label="t('demand.detail.demandCount')" prop="demandCount" width="120" align="center" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getProductStoreDetail } from '@/api/djs-warehouse/demand';
import type { DemandProductStoreDetailVO } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const productName = ref('');
const rows = ref<DemandProductStoreDetailVO[]>([]);

function formatQty(v: number | string): string {
  return Number(v ?? 0).toFixed(2);
}

async function open(productId: string, name: string) {
  productName.value = name;
  rows.value = [];
  visible.value = true;
  loading.value = true;
  try {
    const res = await getProductStoreDetail(productId);
    rows.value = ((res as any).data ?? []) as DemandProductStoreDetailVO[];
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.detail-product {
  font-size: 15px;
  font-weight: 600;
}
</style>
