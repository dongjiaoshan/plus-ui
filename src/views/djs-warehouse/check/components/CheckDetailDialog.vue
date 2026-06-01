<template>
  <el-dialog
    v-model="visible"
    :title="t('djs.warehouse.check.detailTitle')"
    destroy-on-close
    append-to-body
    width="820px"
  >
    <el-descriptions :column="3" border class="mb-3">
      <el-descriptions-item :label="t('djs.warehouse.check.checkId')">{{ header?.checkId }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.locationName')">{{ header?.locationName }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.checkStatus')">
        <dict-tag :options="checkStatusDict" :value="header?.checkStatus" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.lineCount')">{{ header?.lineCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.diffSum')">{{ header?.diffSum ?? 0 }}</el-descriptions-item>
      <el-descriptions-item :label="t('djs.warehouse.check.checkDate')">{{ header?.checkDate }}</el-descriptions-item>
    </el-descriptions>

    <el-table v-loading="loading" :data="lines" border max-height="420">
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column :label="t('djs.warehouse.check.productName')" prop="productName" min-width="160" show-overflow-tooltip />
      <el-table-column :label="t('djs.warehouse.check.productUnit')" prop="productUnit" width="80" align="center" />
      <el-table-column :label="t('djs.warehouse.check.sysStock')" prop="sysStock" width="100" align="right" />
      <el-table-column :label="t('djs.warehouse.check.checkStock')" prop="checkStock" width="100" align="right" />
      <el-table-column :label="t('djs.warehouse.check.diffStock')" width="100" align="right">
        <template #default="{ row }">
          <span :class="diffClass(row.diffStock)">{{ row.diffStock }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('djs.warehouse.check.checkResultType')" width="90" align="center">
        <template #default="{ row }">
          <dict-tag :options="checkResultDict" :value="String(row.checkResultType)" />
        </template>
      </el-table-column>
      <el-table-column :label="t('djs.warehouse.check.diffReason')" prop="diffReason" min-width="140" show-overflow-tooltip />
      <el-table-column :label="t('djs.warehouse.check.checkBy')" prop="checkByName" width="100" align="center" />
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

const visible = defineModel<boolean>({ required: true });
const props = defineProps<{ header: StockCheckHeaderVO | null }>();

const lines = ref<StockCheckRecordVO[]>([]);
const loading = ref(false);

const checkStatusDict = [
  { label: '草稿', value: 'draft' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'done' }
];
const checkResultDict = [
  { label: '正常', value: '1' },
  { label: '异常', value: '2' },
  { label: '计损', value: '3' }
];

function diffClass(diff: number | string): string {
  const n = Number(diff);
  if (n > 0) return 'diff-surplus';
  if (n < 0) return 'diff-deficit';
  return '';
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
