<template>
  <!--
    row187 新增：右侧全屏抽屉，形态对齐门店「需求下单-新增订单」——
    左侧条件 + 产品搜索 + 可选产品表（填出库量），右侧「操作」栏实时显示已选产品与重量，底部确认出库。
  -->
  <el-drawer v-model="visible" :title="t('vegOut.create.title')" size="88%" destroy-on-close @closed="handleClosed">
    <div class="veg-out-create">
      <div class="left">
        <el-form :model="form" inline label-width="88px" class="mb-2">
          <el-form-item :label="t('vegOut.create.outDate')" required>
            <el-date-picker v-model="form.outDate" type="date" value-format="YYYY-MM-DD" style="width: 180px" />
          </el-form-item>
          <el-form-item :label="t('vegOut.create.outDest')" required>
            <el-select
              v-model="form.outDest"
              filterable
              clearable
              :placeholder="t('vegOut.create.outDestPlaceholder')"
              style="width: 220px"
            >
              <el-option v-for="d in djs_stock_out_dest" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="mb-2 flex items-center gap-2">
          <el-input
            v-model="productName"
            clearable
            :placeholder="t('vegOut.create.productNamePlaceholder')"
            style="width: 240px"
            @keyup.enter="loadCandidates"
            @clear="loadCandidates"
          />
          <el-button type="primary" icon="Search" @click="loadCandidates">{{ t('common.search') }}</el-button>
        </div>

        <el-table v-loading="loading" :data="candidates" border size="small" height="calc(100vh - 320px)">
          <el-table-column :label="t('vegOut.create.productName')" prop="productName" min-width="150" show-overflow-tooltip />
          <el-table-column :label="t('vegOut.create.stockWeight')" prop="stockWeight" width="130" align="center">
            <template #default="{ row }">{{ fmtKg(row.stockWeight) }}</template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.plotCode')" prop="plotCode" width="120" align="center">
            <template #default="{ row }">{{ row.plotCode || '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('vegOut.create.outQuantity')" width="190" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="quantityMap[row.stockId]"
                :min="0"
                :max="Number(row.stockWeight)"
                :precision="3"
                :step="1"
                size="small"
                controls-position="right"
                style="width: 160px"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="right">
        <div class="right-title">{{ t('vegOut.create.selected') }}</div>
        <el-empty v-if="!selectedRows.length" :description="t('vegOut.create.selectedEmpty')" :image-size="70" />
        <div v-else class="selected-list">
          <div v-for="row in selectedRows" :key="row.stockId" class="selected-item">
            <div class="truncate">
              <span>{{ row.productName }}</span>
              <span v-if="row.plotCode" class="plot">{{ row.plotCode }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="qty">{{ fmtKg(quantityMap[row.stockId]) }}</span>
              <el-icon class="del" @click="quantityMap[row.stockId] = undefined"><CircleClose /></el-icon>
            </div>
          </div>
          <div class="selected-total">
            {{ t('vegOut.create.totalKinds', { n: selectedRows.length }) }} · {{ fmtKg(totalWeight) }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('vegOut.create.confirm') }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { CircleClose } from '@element-plus/icons-vue';
import { listVegOutCandidates, submitVegOutBatch } from '@/api/djs-warehouse/vegOut';
import type { VegOutCandidateVO } from '@/api/djs-warehouse/vegOut/types';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 出库去向：甲方 row187 明确「下拉框为所有出库去向的字典项内容」，故不过滤 HIDDEN_OUT_DEST
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const productName = ref('');
const candidates = ref<VegOutCandidateVO[]>([]);
/** stockId → 出库量。用 map 而非改行对象，切换搜索条件后已填的量不丢。 */
const quantityMap = reactive<Record<string, number | undefined>>({});

const today = () => new Date().toISOString().slice(0, 10);
const form = reactive<{ outDate: string; outDest: string }>({ outDate: today(), outDest: '' });

function fmtKg(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '0kg';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : `${formatQtyByUnit(n, 'kg')}kg`;
}

/** 已选 = 填了正数出库量的行（右侧实时反映） */
const selectedRows = computed(() => candidates.value.filter((r) => Number(quantityMap[r.stockId]) > 0));
const totalWeight = computed(() => selectedRows.value.reduce((s, r) => s + Number(quantityMap[r.stockId] || 0), 0));

async function loadCandidates() {
  loading.value = true;
  try {
    const res = await listVegOutCandidates(productName.value || undefined);
    candidates.value = (res.data ?? []) as VegOutCandidateVO[];
  } finally {
    loading.value = false;
  }
}

const emit = defineEmits<{ (e: 'success'): void }>();

const open = () => {
  form.outDate = today();
  form.outDest = '';
  productName.value = '';
  Object.keys(quantityMap).forEach((k) => delete quantityMap[k]);
  visible.value = true;
  loadCandidates();
};
defineExpose({ open });

const handleClosed = () => {
  candidates.value = [];
  Object.keys(quantityMap).forEach((k) => delete quantityMap[k]);
};

async function submit() {
  if (!form.outDate) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.outDate'));
    return;
  }
  if (!form.outDest) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.outDest'));
    return;
  }
  if (!selectedRows.value.length) {
    proxy?.$modal.msgWarning(t('vegOut.create.rule.items'));
    return;
  }
  submitting.value = true;
  try {
    await submitVegOutBatch({
      outDate: form.outDate,
      outDest: form.outDest,
      items: selectedRows.value.map((r) => ({ stockId: r.stockId, quantity: Number(quantityMap[r.stockId]) }))
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.veg-out-create {
  display: flex;
  gap: 16px;
  height: 100%;
}
.left {
  flex: 1;
  min-width: 0;
}
.right {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid var(--el-border-color-light);
  padding-left: 16px;
}
.right-title {
  font-weight: 500;
  margin-bottom: 12px;
}
.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}
.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  font-size: 13px;
}
.selected-item .plot {
  margin-left: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.selected-item .qty {
  color: var(--el-color-primary);
  white-space: nowrap;
}
.selected-item .del {
  cursor: pointer;
  color: var(--el-color-danger);
}
.selected-total {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-light);
  text-align: right;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
