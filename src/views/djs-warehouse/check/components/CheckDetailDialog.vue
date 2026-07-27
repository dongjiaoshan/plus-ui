<template>
  <el-dialog v-model="visible" :title="t('djs.warehouse.check.detailTitle')" destroy-on-close append-to-body width="1100px">
    <el-descriptions :column="3" border class="mb-3">
      <el-descriptions-item :label="t('djs.warehouse.check.checkWarehouse')">{{ header?.locationName }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.checkDate')">{{ header?.checkDate ? proxy?.parseTime?.(header.checkDate, '{y}-{m}-{d}') : '' }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.goodsCount')">{{ header?.stockProductCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.checkedProductCount')">{{ header?.lineCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.abnormalCount')">{{ header?.abnormalCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.checkBy')">{{ header?.checkByName }}</el-descriptions-item>
    </el-descriptions>

    <el-table v-loading="loading" :data="lines" border max-height="560">
      <el-table-column :label="t('djs.warehouse.check.checkDate')" prop="checkDate" width="120" align="center" header-align="center">
        <template #default="{ row }">{{ row.checkDate ? proxy?.parseTime?.(row.checkDate, '{y}-{m}-{d}') : '' }}</template>
      </el-table-column>
      <el-table-column :label="t('djs.warehouse.check.productCode')" prop="productCode" width="110" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('djs.warehouse.check.productName')" prop="productName" min-width="150" show-overflow-tooltip align="center" header-align="center" />
      <el-table-column :label="t('djs.warehouse.check.productUnit')" prop="productUnit" width="80" align="center" header-align="center" />
      <el-table-column :label="t('djs.warehouse.check.checkResultType')" width="90" align="center" header-align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_check_result" :value="String(row.checkResultType)" />
        </template>
      </el-table-column>
      <el-table-column :label="t('djs.warehouse.check.sysStock')" prop="sysStock" width="100" align="center" header-align="center" />
      <el-table-column :label="t('djs.warehouse.check.checkStock')" prop="checkStock" width="120" align="center" header-align="center" />
      <el-table-column :label="t('djs.warehouse.check.diffStock')" width="90" align="center" header-align="center">
        <template #default="{ row }">
          <span :class="diffClass(diffQty(row))">{{ diffQty(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('djs.warehouse.check.createTime')" prop="createTime" width="160" align="center" header-align="center" />
    </el-table>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { listCheckLines } from '@/api/djs-warehouse/check';
import type { StockCheckHeaderVO, StockCheckRecordVO } from '@/api/djs-warehouse/check/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_check_result } = toRefs<any>(proxy?.useDict('djs_check_result'));

const visible = defineModel<boolean>({ required: true });
const props = defineProps<{ header: StockCheckHeaderVO | null }>();

const lines = ref<StockCheckRecordVO[]>([]);
const loading = ref(false);

/** diff = 盘点前库存 − 实盘量：正数为盘亏（实盘少于账面，标红）、负数为盘盈（标绿）。 */
function diffClass(diff: number | string): string {
  const n = Number(diff);
  if (n > 0) return 'diff-deficit';
  if (n < 0) return 'diff-surplus';
  return '';
}

/**
 * 差异量 = 盘点前库存 − 实盘量（sysStock − checkStock，带符号）。
 * 正数为盘盈、负数为盘亏；对所有盘点结果统一按此口径展示。
 */
function diffQty(row: StockCheckRecordVO): number {
  return Number(row.sysStock ?? 0) - Number(row.checkStock ?? 0);
}

async function loadLines() {
  if (!props.header?.checkId) return;
  loading.value = true;
  try {
    const res = await listCheckLines({ checkId: props.header.checkId });
    lines.value = (res.data ?? []) as StockCheckRecordVO[];
  } finally {
    loading.value = false;
  }
}

watch(visible, (v) => {
  if (v) {
    lines.value = [];
    loadLines();
  }
});
</script>

<style scoped>
.diff-surplus {
  color: var(--el-color-success);
  font-weight: 600;
}
.diff-deficit {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
