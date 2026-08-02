<template>
  <!-- row187：出库单详情，弹框形式，可按产品名筛 -->
  <el-dialog v-model="visible" :title="t('vegOut.detail.title')" width="640px" append-to-body destroy-on-close @closed="handleClosed">
    <div class="mb-3 flex items-center gap-2">
      <el-input
        v-model="productName"
        clearable
        :placeholder="t('vegOut.detail.productNamePlaceholder')"
        style="width: 240px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-button type="primary" icon="Search" @click="load">{{ t('common.search') }}</el-button>
    </div>
    <el-table v-loading="loading" :data="rows" border size="small" max-height="420">
      <el-table-column :label="t('vegOut.detail.productName')" prop="productName" min-width="160" show-overflow-tooltip />
      <el-table-column :label="t('vegOut.detail.productSpec')" prop="productSpec" width="120" align="center">
        <template #default="{ row }">{{ row.productSpec || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('vegOut.detail.plotCode')" prop="plotCode" width="120" align="center">
        <template #default="{ row }">{{ row.plotCode || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('vegOut.detail.outWeight')" prop="outWeight" width="130" align="center">
        <template #default="{ row }">{{ fmtKg(row.outWeight) }}</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getVegOutDetail } from '@/api/djs-warehouse/vegOut';
import type { VegOutDetailVO } from '@/api/djs-warehouse/vegOut/types';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const batchNo = ref('');
const productName = ref('');
const rows = ref<VegOutDetailVO[]>([]);

/** 果蔬统一 kg 口径，恒 3 位小数（与库存/流水对账一致） */
function fmtKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${formatQtyByUnit(n, 'kg')}kg`;
}

async function load() {
  loading.value = true;
  try {
    const res = await getVegOutDetail(batchNo.value, productName.value || undefined);
    rows.value = (res.data ?? []) as VegOutDetailVO[];
  } finally {
    loading.value = false;
  }
}

const open = (no: string) => {
  batchNo.value = no;
  productName.value = '';
  rows.value = [];
  visible.value = true;
  load();
};
defineExpose({ open });

const handleClosed = () => {
  batchNo.value = '';
  productName.value = '';
  rows.value = [];
};
</script>
