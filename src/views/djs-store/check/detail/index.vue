<template>
  <el-drawer v-model="visible" :title="title" size="80%" append-to-body destroy-on-close>
    <el-table v-loading="loading" :data="lines" border stripe>
      <el-table-column type="index" :label="t('storeLedger.column.index')" width="60" align="center" />
      <el-table-column prop="productName" :label="t('storeLedger.column.productName')" min-width="160" show-overflow-tooltip />
      <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" width="80" align="center" />
      <el-table-column prop="openingQty" :label="t('storeLedger.column.openingQty')" width="100" align="right" />
      <el-table-column prop="inboundQty" :label="t('storeLedger.column.inboundQty')" width="100" align="right" />
      <el-table-column prop="saleQty" :label="t('storeLedger.column.saleQty')" width="90" align="right" />
      <el-table-column prop="giftQty" :label="t('storeLedger.column.giftQty')" width="90" align="right" />
      <el-table-column prop="returnQty" :label="t('storeLedger.column.returnQty')" width="90" align="right" />
      <el-table-column prop="lossQty" :label="t('storeLedger.column.lossQty')" width="90" align="right" />
      <el-table-column prop="closingQty" :label="t('storeLedger.column.closingQty')" width="110" align="right">
        <template #default="{ row }">
          <span class="closing">{{ row.closingQty }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !lines.length" :description="t('common.empty')" />
  </el-drawer>
</template>

<script setup name="StoreLedgerDetail" lang="ts">
import { getStoreLedgerDetail } from '@/api/djs-store/ledger';
import type { StoreLedgerLineVO } from '@/api/djs-store/ledger/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const lines = ref<StoreLedgerLineVO[]>([]);
const currentStoreName = ref('');
const currentDate = ref('');

const title = computed(() =>
  t('storeLedger.detail.title', { store: currentStoreName.value || '-', date: currentDate.value || '-' })
);

async function open(storeId: string, ledgerDate: string) {
  currentDate.value = ledgerDate;
  currentStoreName.value = '';
  visible.value = true;
  loading.value = true;
  try {
    const res = await getStoreLedgerDetail(storeId, ledgerDate);
    lines.value = (res.data ?? []) as StoreLedgerLineVO[];
    currentStoreName.value = lines.value[0]?.storeName ?? '';
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.closing {
  font-weight: 600;
}
</style>
