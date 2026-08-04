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
      <!-- row198：顶部右侧显示出库单号 -->
      <span class="ml-auto text-gray-500">{{ t('vegOut.column.batchNo') }}：{{ batchNo || '-' }}</span>
    </div>
    <el-table v-loading="loading" :data="rows" border size="small" max-height="420">
      <el-table-column :label="t('vegOut.detail.productName')" prop="productName" min-width="160" show-overflow-tooltip />
      <el-table-column :label="t('vegOut.detail.productSpec')" prop="productSpec" width="120" align="center">
        <template #default="{ row }">{{ row.productSpec || '-' }}</template>
      </el-table-column>
      <!-- row193：去掉地块编号列（干货/蛋类本就没有地块，果蔬也按甲方要求不再显示） -->
      <el-table-column :label="t('vegOut.detail.outWeight')" prop="outWeight" width="120" align="center">
        <template #default="{ row }">{{ fmtQty(row) }}</template>
      </el-table-column>
      <el-table-column :label="t('vegOut.detail.outUnitPrice')" prop="outUnitPrice" width="110" align="center">
        <template #default="{ row }">{{ fmtMoney(row.outUnitPrice) }}</template>
      </el-table-column>
      <!-- 甲方原文「出库总价（出库单价*出库单价）」是笔误，按 单价 × 重量 算 -->
      <el-table-column :label="t('vegOut.detail.outAmount')" prop="outAmount" width="110" align="center">
        <template #default="{ row }">{{ fmtMoney(row.outAmount) }}</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <!-- row198：详情页补打（D8）。出库单已生成，重打不消耗新单号、不改任何数据 -->
      <el-button type="primary" icon="Printer" :disabled="!rows.length" @click="handleReprint">
        {{ t('vegOut.detail.reprint') }}
      </el-button>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getVegOutDetail } from '@/api/djs-warehouse/vegOut';
import type { VegOutBatchVO, VegOutDetailVO } from '@/api/djs-warehouse/vegOut/types';
import { formatQtyByUnit } from '@/utils/weight';
import { printVegOutSheet } from '../printSheet';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const loading = ref(false);
const batchNo = ref('');
const productName = ref('');
const rows = ref<VegOutDetailVO[]>([]);
/** 重打需要的单头信息（明细接口只返行，单头由列表行带入）。 */
const header = ref<{ outDate: string; customerName: string }>({ outDate: '', customerName: '' });

/** 金额展示（后端 BigDecimal 序列化为 string，统一 Number 强转两位小数） */
function fmtMoney(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `¥${n.toFixed(2)}`;
}

/**
 * 出库量展示：kg 行走 3 位小数 + kg；计件行显示原单位（如「3 袋」）。
 *
 * ⚠️ 不能恒按 kg —— row194 起候选扩到了干货库 / 蛋类库，单位有 袋 / 桶 / 罐 / 枚，
 * 恒 kg 会把「2 袋大米」印成「2.000kg」。与新增抽屉 fmtQty 同一口径。
 */
function fmtQty(row: VegOutDetailVO): string {
  const v = row.outWeight;
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  const unit = (row.productUnit || '').trim();
  return unit.toLowerCase() === 'kg' || !unit ? `${formatQtyByUnit(n, 'kg')}kg` : `${n} ${unit}`;
}

/** row198：按当前明细重打这张出库单（不落库、不取新号）。 */
function handleReprint() {
  printVegOutSheet({
    batchNo: batchNo.value,
    outDate: header.value.outDate,
    customerName: header.value.customerName,
    rows: rows.value.map((r) => ({
      productName: r.productName,
      productSpec: r.productSpec,
      productUnit: r.productUnit,
      quantity: Number(r.outWeight) || 0,
      unitPrice: Number(r.outUnitPrice) || 0
    }))
  });
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

const open = (row: VegOutBatchVO, destLabel: string) => {
  batchNo.value = row.batchNo;
  header.value = { outDate: String(row.outDate ?? '').slice(0, 10), customerName: destLabel };
  productName.value = '';
  rows.value = [];
  visible.value = true;
  load();
};
defineExpose({ open });

const handleClosed = () => {
  batchNo.value = '';
  header.value = { outDate: '', customerName: '' };
  productName.value = '';
  rows.value = [];
};
</script>
