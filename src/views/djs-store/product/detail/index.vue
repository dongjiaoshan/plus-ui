<template>
  <el-drawer v-model="visible" :title="t('storeProduct.detail.title')" size="80%" append-to-body destroy-on-close>
    <!-- 产品信息头部 -->
    <el-descriptions :column="3" border class="mb-4">
      <el-descriptions-item :label="t('storeProduct.column.productName')">{{ product?.productName ?? '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeProduct.detail.productCode')">{{ product?.productId ?? '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeProduct.column.productType')">
        <dict-tag :options="djs_product_type" :value="product?.productType" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('storeProduct.column.productSpec')">{{ product?.productSpec ?? '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeProduct.column.unit')">{{ product?.productUnit ?? '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('storeProduct.column.productStatus')">
        <dict-tag :options="sys_normal_disable" :value="product?.productStatus" />
      </el-descriptions-item>
    </el-descriptions>

    <!-- 盘点历史 -->
    <div class="history-bar">
      <span class="history-title">{{ t('storeProduct.detail.history') }}</span>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        :start-placeholder="t('storeLedger.field.dateFrom')"
        :end-placeholder="t('storeLedger.field.dateTo')"
        :clearable="true"
        @change="loadHistory"
      />
    </div>

    <el-table v-loading="loading" :data="history" border stripe>
      <el-table-column prop="ledgerDate" :label="t('storeLedger.column.ledgerDate')" width="130" align="center" />
      <el-table-column prop="storeName" :label="t('storeLedger.column.storeName')" min-width="120" show-overflow-tooltip />
      <el-table-column prop="openingQty" :label="t('storeLedger.column.openingQty')" width="100" align="right" />
      <el-table-column prop="inboundQty" :label="t('storeLedger.column.inboundQty')" width="100" align="right" />
      <el-table-column prop="saleQty" :label="t('storeLedger.column.saleQty')" width="90" align="right" />
      <el-table-column prop="giftQty" :label="t('storeLedger.column.giftQty')" width="90" align="right" />
      <el-table-column prop="returnQty" :label="t('storeLedger.column.returnQty')" width="90" align="right" />
      <el-table-column prop="lossQty" :label="t('storeLedger.column.lossQty')" width="90" align="right" />
      <el-table-column prop="closingQty" :label="t('storeLedger.column.closingQty')" width="110" align="right" />
    </el-table>
    <el-empty v-if="!loading && !history.length" :description="t('storeProduct.detail.noHistory')" />
  </el-drawer>
</template>

<script setup name="StoreProductLedgerDetail" lang="ts">
import { listStoreLedgerHistory } from '@/api/djs-store/ledger';
import type { StoreLedgerLineVO, StoreLedgerQuery } from '@/api/djs-store/ledger/types';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_product_type, sys_normal_disable } = toRefs<Record<string, Array<{ label: string; value: string }>>>(
  proxy?.useDict('djs_product_type', 'sys_normal_disable')
);

const visible = ref(false);
const loading = ref(false);
const product = ref<ProductInfoVO | null>(null);
const history = ref<StoreLedgerLineVO[]>([]);
const dateRange = ref<[string, string] | null>(null);

async function loadHistory() {
  if (!product.value?.id) {
    return;
  }
  loading.value = true;
  try {
    const query: StoreLedgerQuery = {
      productId: String(product.value.id),
      ledgerDateFrom: dateRange.value?.[0] || undefined,
      ledgerDateTo: dateRange.value?.[1] || undefined
    };
    const res = await listStoreLedgerHistory(query);
    history.value = (res.data ?? []) as StoreLedgerLineVO[];
  } finally {
    loading.value = false;
  }
}

async function open(p: ProductInfoVO) {
  product.value = p;
  dateRange.value = null;
  history.value = [];
  visible.value = true;
  await loadHistory();
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.history-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .history-title {
    font-weight: 600;
  }
}
</style>
