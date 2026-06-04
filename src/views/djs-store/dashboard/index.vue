<template>
  <div class="store-dashboard p-2">
    <!-- KPI 横条：6 卡 -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todaySale') }}</div>
          <div class="kpi-value">{{ summary?.todaySaleAmount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthSale') }}</div>
          <div class="kpi-value">{{ summary?.monthSaleAmount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.amountUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.todayOrder') }}</div>
          <div class="kpi-value">{{ summary?.todayOrderCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.monthOrder') }}</div>
          <div class="kpi-value">{{ summary?.monthOrderCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.pendingShip') }}</div>
          <div class="kpi-value warn">{{ summary?.pendingShipCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">{{ t('storeDashboard.kpi.pendingPurchase') }}</div>
          <div class="kpi-value warn">{{ summary?.pendingPurchaseCount ?? 0 }}</div>
          <div class="kpi-unit">{{ t('storeDashboard.kpi.orderUnit') }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 当日产品结构（按业态，进度条降级，ECharts 饼图推 V1.x） -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="block-card">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('storeDashboard.title.productStructure') }}</span>
              <el-button size="small" :loading="loading" @click="load">{{ t('storeDashboard.action.refresh') }}</el-button>
            </div>
          </template>
          <el-table v-loading="loading" :data="summary?.productStructure ?? []" border>
            <el-table-column prop="key" :label="t('storeDashboard.column.productType')" min-width="120">
              <template #default="{ row }">
                <dict-tag :options="djs_demand_product_type" :value="row.key" />
              </template>
            </el-table-column>
            <el-table-column prop="value" :label="t('storeDashboard.column.qty')" width="120" align="right" />
            <template #empty>
              <el-empty :description="t('storeDashboard.empty.productStructure')" />
            </template>
          </el-table>
        </el-card>
      </el-col>

      <!-- 当月 TOP10 产品排行 -->
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="block-card">
          <template #header>
            <span class="title">{{ t('storeDashboard.title.top10') }}</span>
          </template>
          <el-table v-loading="loading" :data="summary?.top10Products ?? []" border>
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="productName" :label="t('storeDashboard.column.productName')" min-width="160" />
            <el-table-column prop="saleAmount" :label="t('storeDashboard.column.saleAmount')" width="140" align="right" sortable />
            <el-table-column prop="saleQty" :label="t('storeDashboard.column.saleQty')" width="140" align="right" />
            <template #empty>
              <el-empty :description="t('storeDashboard.empty.top10')" />
            </template>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近 10 日趋势 -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <span class="title">{{ t('storeDashboard.title.trend') }}</span>
      </template>
      <el-table v-loading="loading" :data="summary?.trend10Days ?? []" border>
        <el-table-column prop="date" :label="t('storeDashboard.column.date')" min-width="140" />
        <el-table-column prop="orderCount" :label="t('storeDashboard.column.orderCount')" width="120" align="right" />
        <el-table-column prop="saleAmount" :label="t('storeDashboard.column.saleAmount')" width="160" align="right" />
        <el-table-column prop="avgPrice" :label="t('storeDashboard.column.avgPrice')" width="160" align="right" />
        <template #empty>
          <el-empty :description="t('storeDashboard.empty.trend')" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getStoreDashboardSummary, type StoreDashboardSummaryVo } from '@/api/djs-store/dashboard';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_demand_product_type } = toRefs<any>(proxy?.useDict('djs_demand_product_type'));

const summary = ref<StoreDashboardSummaryVo | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await getStoreDashboardSummary();
    summary.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.store-dashboard {
  .kpi-row {
    margin-bottom: 16px;
  }

  .kpi-card {
    text-align: center;

    .kpi-label {
      font-size: 13px;
      color: #909399;
    }

    .kpi-value {
      margin: 6px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;

      &.warn {
        color: #e6a23c;
      }
    }

    .kpi-unit {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .block-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-weight: 600;
    }
  }
}
</style>
