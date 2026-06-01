<template>
  <div class="warehouse-dashboard p-2">
    <!-- KPI 横条 -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('warehouse.dashboard.todayDemand') }}</div>
          <div class="kpi-value">{{ summary?.todayDemandQuantity ?? '-' }}</div>
          <div class="kpi-unit">{{ t('warehouse.dashboard.todayDemandUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('warehouse.dashboard.todayProduction') }}</div>
          <div class="kpi-value">{{ summary?.todayProductionCount ?? '-' }}</div>
          <div class="kpi-unit">{{ t('warehouse.dashboard.todayProductionUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('warehouse.dashboard.stockCheck') }}</div>
          <div class="kpi-value">
            {{ summary?.stockCheckNormal ?? 0 }} / {{ summary?.stockCheckAbnormal ?? 0 }} / {{ summary?.stockCheckLoss ?? 0 }}
          </div>
          <div class="kpi-unit">
            {{ t('warehouse.dashboard.monthAbnormalLocation', { count: summary?.monthAbnormalLocationCount ?? 0 }) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库位概览 -->
    <el-card shadow="never" class="location-overview">
      <template #header>
        <div class="card-header">
          <span class="title">{{ t('warehouse.dashboard.locationOverview') }}</span>
          <el-button size="small" :loading="loading" @click="load">{{ t('warehouse.dashboard.refresh') }}</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="summary?.locationOverview ?? []" border>
        <el-table-column prop="locationName" :label="t('warehouse.dashboard.colLocation')" min-width="160" />
        <el-table-column prop="locationType" :label="t('warehouse.dashboard.colType')" width="120" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_location_type" :value="row.locationType" />
          </template>
        </el-table-column>
        <el-table-column prop="currentStock" :label="t('warehouse.dashboard.colStock')" width="140" align="right" />
        <el-table-column prop="status" :label="t('warehouse.dashboard.colStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'abnormal' ? 'danger' : 'success'">
              {{ row.status === 'abnormal' ? t('warehouse.dashboard.statusAbnormal') : t('warehouse.dashboard.statusNormal') }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="t('warehouse.dashboard.emptyLocation')" />
        </template>
      </el-table>
    </el-card>

    <el-alert type="info" :closable="false" class="placeholder-hint" :title="t('warehouse.dashboard.fullVersionHint')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getWarehouseDashboardSummary, type WarehouseDashboardSummaryVo } from '@/api/djs-warehouse/dashboard';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_location_type } = toRefs<any>(proxy?.useDict('djs_location_type'));

const summary = ref<WarehouseDashboardSummaryVo | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await getWarehouseDashboardSummary();
    summary.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.warehouse-dashboard {
  .kpi-row {
    margin-bottom: 16px;
  }

  .kpi-card {
    text-align: center;

    .kpi-label {
      font-size: 14px;
      color: #909399;
    }

    .kpi-value {
      margin: 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    .kpi-unit {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .location-overview {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-weight: 600;
      }
    }
  }

  .placeholder-hint {
    margin-top: 16px;
  }
}
</style>
