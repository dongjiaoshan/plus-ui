<template>
  <div class="cohort-ledger p-2">
    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('cohortLedger.title') }}</span>
          <div class="actions">
            <el-select v-model="year" style="width: 120px" @change="loadAll">
              <el-option v-for="y in yearOptions" :key="y" :label="String(y)" :value="y" />
            </el-select>
            <el-button size="small" :loading="loading" @click="loadAll">{{ t('cohortLedger.refresh') }}</el-button>
          </div>
        </div>
      </template>

      <el-alert :title="t('cohortLedger.judgeHint')" type="info" :closable="false" show-icon class="mb-3" />

      <el-table v-loading="loading" :data="ledger" border stripe :empty-text="t('cohortLedger.empty')">
        <el-table-column prop="breedMonth" :label="t('cohortLedger.breedMonth')" width="110" fixed />
        <el-table-column prop="bred" :label="t('cohortLedger.bred')" width="100" align="right" />
        <el-table-column prop="matured" :label="t('cohortLedger.matured')" width="100" align="right" />
        <el-table-column prop="farrow" :label="t('cohortLedger.farrow')" width="110" align="right" />
        <el-table-column prop="farrowLate" :label="t('cohortLedger.farrowLate')" width="110" align="right">
          <template #default="{ row }">
            <span :class="{ warn: row.farrowLate > 0 }">{{ row.farrowLate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="returnCount" :label="t('cohortLedger.returnCount')" width="90" align="right" />
        <el-table-column prop="emptyCount" :label="t('cohortLedger.emptyCount')" width="90" align="right" />
        <el-table-column prop="abortCount" :label="t('cohortLedger.abortCount')" width="90" align="right" />
        <el-table-column prop="goneCount" :label="t('cohortLedger.goneCount')" width="110" align="right" />
        <el-table-column prop="undecided" :label="t('cohortLedger.undecided')" width="130" align="right">
          <template #default="{ row }">
            <span :class="{ danger: row.undecided > 0 }">{{ row.undecided }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pending" :label="t('cohortLedger.pending')" width="120" align="right" />
        <el-table-column :label="t('cohortLedger.deadlineRange')" width="200" align="center">
          <template #default="{ row }">{{ row.firstDeadline }} ~ {{ row.lastDeadline }}</template>
        </el-table-column>
        <el-table-column :label="t('cohortLedger.farrowRate')" width="110" align="right" fixed="right">
          <template #default="{ row }">
            <!-- 未到期批次不参与分娩率：matured=0 时显示 — 而不是 0%，否则会被当成「这批全军覆没」 -->
            <span v-if="row.matured > 0">{{ row.farrowRate }}%</span>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="title">
          {{ t('cohortLedger.overdueTitle') }}
          <el-tag v-if="overdue.length" type="danger" size="small">{{ overdue.length }}</el-tag>
        </span>
      </template>

      <el-alert :title="t('cohortLedger.overdueHint')" type="warning" :closable="false" show-icon class="mb-3" />

      <el-table v-loading="loading" :data="overdue" border stripe :empty-text="t('cohortLedger.empty')">
        <el-table-column prop="earNo" :label="t('cohortLedger.earNo')" min-width="170" />
        <el-table-column prop="breedingDate" :label="t('cohortLedger.breedingDate')" width="120" />
        <el-table-column prop="deadline" :label="t('cohortLedger.deadline')" width="120" />
        <el-table-column prop="overdueDays" :label="t('cohortLedger.overdueDays')" width="120" align="right">
          <template #default="{ row }"><span class="danger">{{ row.overdueDays }}</span></template>
        </el-table-column>
        <el-table-column prop="parity" :label="t('cohortLedger.parity')" width="80" align="right" />
        <el-table-column :label="t('cohortLedger.barnPen')" min-width="150">
          <template #default="{ row }">{{ [row.barnName, row.penName].filter(Boolean).join(' / ') || '—' }}</template>
        </el-table-column>
        <el-table-column prop="currentStatus" :label="t('cohortLedger.currentStatus')" width="110" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="BreedCohortLedger" lang="ts">
import { useI18n } from 'vue-i18n';
import { getCohortLedger, listOverdueUndecided, CohortLedgerVO, OverdueUndecidedVO } from '@/api/djs-breed/dashboard';

const { t } = useI18n();

const loading = ref(false);
const year = ref(new Date().getFullYear());
const ledger = ref<CohortLedgerVO[]>([]);
const overdue = ref<OverdueUndecidedVO[]>([]);

const yearOptions = computed(() => {
  const now = new Date().getFullYear();
  return [now, now - 1, now - 2];
});

async function loadAll() {
  loading.value = true;
  try {
    const [l, o] = await Promise.all([getCohortLedger(year.value), listOverdueUndecided()]);
    ledger.value = l.data ?? [];
    overdue.value = o.data ?? [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-header .actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.title {
  font-weight: 600;
}
.mb-3 {
  margin-bottom: 12px;
}
.warn {
  color: var(--el-color-warning);
}
.danger {
  color: var(--el-color-danger);
  font-weight: 600;
}
.muted {
  color: var(--el-text-color-placeholder);
}
</style>
