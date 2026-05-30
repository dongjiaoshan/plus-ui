<template>
  <div class="p-2">
    <el-card shadow="never" class="mb-3">
      <el-form :inline="true" :model="searchModel">
        <el-form-item :label="t('pickPlan.field.planYear')">
          <el-input-number v-model="searchModel.planYear" :min="2020" :max="2099" controls-position="right" />
        </el-form-item>
        <el-form-item :label="t('pickPlan.field.planSeason')">
          <el-select v-model="searchModel.planSeason" :placeholder="t('pickPlan.placeholder.planSeason')" clearable style="width: 160px">
            <el-option v-for="d in djs_planting_season" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('pickPlan.field.harvestStatus')">
          <el-select v-model="searchModel.harvestStatus" :placeholder="t('pickPlan.placeholder.harvestStatus')" clearable style="width: 160px">
            <el-option v-for="d in djs_pick_status" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" border stripe row-key="rowKey" :empty-text="t('common.empty')">
        <el-table-column :label="t('pickPlan.column.planNo')" prop="planNo" width="160" show-overflow-tooltip />
        <el-table-column :label="t('pickPlan.column.planYear')" prop="planYear" width="80" align="center" />
        <el-table-column :label="t('pickPlan.column.planSeason')" prop="planSeason" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_planting_season" :value="row.planSeason" />
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.column.crop')" prop="cropName" width="120" show-overflow-tooltip />
        <el-table-column :label="t('pickPlan.column.plotCount')" prop="plotCount" width="80" align="center" />
        <el-table-column :label="t('pickPlan.column.planEarliest')" prop="planEarliest" width="120" align="center" />
        <el-table-column :label="t('pickPlan.column.planLatest')" prop="planLatest" width="120" align="center" />
        <el-table-column :label="t('pickPlan.column.actualBegin')" prop="actualBegin" width="120" align="center" />
        <el-table-column :label="t('pickPlan.column.actualEnd')" prop="actualEnd" width="120" align="center" />
        <el-table-column :label="t('pickPlan.column.expectedYield')" prop="expectedYield" width="120" align="right">
          <template #default="{ row }">{{ row.expectedYield != null ? `${row.expectedYield} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.column.actualYield')" prop="actualYield" width="120" align="right">
          <template #default="{ row }">{{ row.actualYield != null ? `${row.actualYield} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.column.activityPlotCount')" prop="activityPlotCount" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.activityPlotCount > 0" type="warning" size="small">{{ row.activityPlotCount }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.column.action')" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-hasPermi="['djs:plant:pick:adjust']" link type="primary" size="small" @click="handleAdjust(row)">
              {{ t('pickPlan.action.adjust') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="PickPlanIndex" lang="ts">
import { listPickPlan } from '@/api/djs-plant/pick';
import type { PickPlanGroupVO, PickPlanQuery } from '@/api/djs-plant/pick/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const { djs_planting_season, djs_pick_status } = useDict('djs_planting_season', 'djs_pick_status');

interface PlanRow extends PickPlanGroupVO {
  rowKey: string;
}

const list = ref<PlanRow[]>([]);
const loading = ref(false);

const searchModel = reactive<PickPlanQuery>({
  planYear: undefined,
  planSeason: undefined,
  harvestStatus: undefined
});

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickPlan({ ...searchModel });
    // res.data 是 List<PickPlanGroupVO>（无分页）— rowKey = plantId_cropId
    const rows = (res.data || []) as PickPlanGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: `${r.plantId}_${r.cropId}` }));
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  loadList();
}

function handleReset() {
  searchModel.planYear = undefined;
  searchModel.planSeason = undefined;
  searchModel.harvestStatus = undefined;
  loadList();
}

function handleAdjust(row: PlanRow) {
  router.push(
    `/djs-plant/pick/adjust?planId=${row.plantId}&cropId=${row.cropId}&planNo=${encodeURIComponent(row.planNo)}&cropName=${encodeURIComponent(row.cropName || '')}`
  );
}

onMounted(loadList);
</script>
