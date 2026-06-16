<template>
  <div>
    <el-table v-loading="loading" :data="list" border stripe size="small" :empty-text="t('supplier.deal.empty')">
      <el-table-column :label="t('supplier.deal.dealDate')" prop="dealDate" width="140" align="center" header-align="center" />
      <el-table-column :label="t('supplier.deal.dealProduct')" prop="dealProduct" min-width="180" show-overflow-tooltip align="center" header-align="center" />
      <el-table-column :label="t('supplier.deal.dealQuantity')" prop="dealQuantity" width="120" align="center" header-align="center">
        <template #default="{ row }">{{ (row as SupplierDealVO).dealQuantity ?? '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('supplier.deal.dealUnit')" prop="dealUnit" width="90" align="center" header-align="center">
        <template #default="{ row }">{{ (row as SupplierDealVO).dealUnit || '-' }}</template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total > 0"
      class="mt-3 justify-end"
      :current-page="pageNum"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { listSupplierDeals } from '@/api/djs-common/supplier';
import type { SupplierDealVO } from '@/api/djs-common/supplier/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  /** 供应商 ID（snowflake，string/number 二态，契约 1 不做 Number() 转换） */
  supplierId?: number | string;
}>();

const list = ref<SupplierDealVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const fetchDeals = async () => {
  if (props.supplierId === undefined || props.supplierId === null || props.supplierId === '') {
    list.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const res = await listSupplierDeals(props.supplierId, { pageNum: pageNum.value, pageSize: pageSize.value });
    list.value = (res.rows ?? res.data ?? []) as SupplierDealVO[];
    total.value = res.total ?? 0;
  } catch (e) {
    console.warn('[DealHistoryTab] listSupplierDeals failed', props.supplierId, e);
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (pn: number) => {
  pageNum.value = pn;
  fetchDeals();
};

const handleSizeChange = (ps: number) => {
  pageSize.value = ps;
  pageNum.value = 1;
  fetchDeals();
};

// 供应商切换（父组件复用同一弹窗打开不同供应商）→ 重置到第 1 页重查
watch(
  () => props.supplierId,
  () => {
    pageNum.value = 1;
    fetchDeals();
  },
  { immediate: true }
);
</script>
