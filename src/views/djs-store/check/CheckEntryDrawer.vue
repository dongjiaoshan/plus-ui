<template>
  <!-- 新增当日盘点：宽抽屉整表录入，点蒙层可关（保持 Element Plus 默认）。对齐原型「门店盘点>新增当日盘点」矩阵。 -->
  <el-drawer v-model="visible" :title="t('storeLedger.entry.title')" direction="rtl" size="80%" append-to-body destroy-on-close>
    <div class="ledger-entry">
      <div class="entry-tools">
        <el-select
          v-model="storeId"
          filterable
          :placeholder="t('storeLedger.entry.storePlaceholder')"
          class="store-select"
          @change="loadCandidates"
        >
          <el-option v-for="s in storeOptions" :key="s.id" :label="s.storeName" :value="String(s.id)" />
        </el-select>
        <el-date-picker
          v-model="ledgerDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('storeLedger.entry.datePlaceholder')"
          :clearable="false"
          @change="loadCandidates"
        />
      </div>

      <el-table v-loading="loading" :data="rows" border stripe class="entry-table">
        <el-table-column prop="productName" :label="t('storeLedger.column.productName')" min-width="140" show-overflow-tooltip fixed="left" align="center" header-align="center" />
        <el-table-column prop="productUnit" :label="t('storeLedger.column.unit')" width="90" align="center" header-align="center" />
        <el-table-column :label="t('storeLedger.column.openingQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.openingQty" :min="0" :precision="2" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.inboundQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.inboundQty" :min="0" :precision="2" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.saleQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.saleQty" :min="0" :precision="2" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.giftQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.giftQty" :min="0" :precision="2" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.returnQty')" width="130" align="center" header-align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.returnQty" :min="0" :precision="2" :controls="false" class="cell-num" @change="recalc(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.returnedQty')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ row.whReturnQty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.lossQty')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span class="text-muted">{{ row.lossQty }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('storeLedger.column.closingQty')" width="110" align="center" header-align="center" fixed="right">
          <template #default="{ row }">
            <span class="closing">{{ row.closingQty }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !rows.length" :description="t('storeLedger.entry.emptyCandidates')" />
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="!rows.length || !storeId" @click="handleSubmit">
        {{ t('storeLedger.entry.submit') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup name="StoreCheckEntryDrawer" lang="ts">
import { listStoreLedgerCandidates, batchSaveStoreLedger } from '@/api/djs-store/ledger';
import type { StoreLedgerBatchItem, StoreLedgerCandidateVO } from '@/api/djs-store/ledger/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emit = defineEmits<{ saved: [] }>();

interface EntryRow {
  productId: string;
  productName: string;
  productUnit: string;
  openingQty: number;
  inboundQty: number;
  saleQty: number;
  giftQty: number;
  returnQty: number;
  /** 退回量（门店退回仓库，原型只读，后端预填） */
  whReturnQty: number;
  /** 损耗量（原型只读，V1 默认 0） */
  lossQty: number;
  closingQty: number;
}

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const visible = ref(false);
const storeId = ref<string>();
const ledgerDate = ref<string>(todayStr());
const loading = ref(false);
const submitLoading = ref(false);
const storeOptions = ref<StoreVO[]>([]);
const rows = ref<EntryRow[]>([]);

function nz(v: number | string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

function recalc(row: EntryRow) {
  row.closingQty = Number(
    (
      nz(row.openingQty) +
      nz(row.inboundQty) -
      nz(row.saleQty) -
      nz(row.giftQty) -
      nz(row.returnQty) -
      nz(row.whReturnQty) -
      nz(row.lossQty)
    ).toFixed(2)
  );
}

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreCheckEntryDrawer] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadCandidates() {
  if (!storeId.value) {
    rows.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await listStoreLedgerCandidates(storeId.value, ledgerDate.value);
    const candidates = (res.data ?? []) as StoreLedgerCandidateVO[];
    rows.value = candidates.map((c) => {
      const r: EntryRow = {
        productId: String(c.productId),
        productName: c.productName ?? '',
        productUnit: c.productUnit ?? '',
        openingQty: 0,
        inboundQty: nz(c.inboundQty),
        saleQty: nz(c.saleQty),
        giftQty: 0,
        returnQty: nz(c.returnQty),
        whReturnQty: nz(c.whReturnQty),
        lossQty: 0,
        closingQty: 0
      };
      recalc(r);
      return r;
    });
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!storeId.value || !rows.value.length) {
    return;
  }
  await proxy?.$modal.confirm(t('storeLedger.entry.submitConfirm', { n: rows.value.length }));
  const items: StoreLedgerBatchItem[] = rows.value.map((r) => ({
    productId: r.productId,
    openingQty: r.openingQty,
    inboundQty: r.inboundQty,
    saleQty: r.saleQty,
    giftQty: r.giftQty,
    returnQty: r.returnQty,
    whReturnQty: r.whReturnQty,
    lossQty: r.lossQty
  }));
  submitLoading.value = true;
  try {
    await batchSaveStoreLedger({ storeId: storeId.value, ledgerDate: ledgerDate.value, items });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('saved');
  } finally {
    submitLoading.value = false;
  }
}

async function open() {
  storeId.value = undefined;
  ledgerDate.value = todayStr();
  rows.value = [];
  visible.value = true;
  await loadStoreOptions();
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.ledger-entry {
  .entry-tools {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .store-select {
      width: 220px;
    }
  }

  .entry-table {
    .cell-num {
      width: 100%;
    }
  }

  .closing {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .text-muted {
    color: #909399;
  }
}
</style>
