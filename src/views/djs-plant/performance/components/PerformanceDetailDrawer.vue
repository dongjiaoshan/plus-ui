<template>
  <el-drawer v-model="visible" :title="t('plantPerformance.detail.title')" size="640px" destroy-on-close>
    <el-tabs v-model="activeTab">
      <!-- tab1 产量绩效 -->
      <el-tab-pane :label="t('plantPerformance.detail.tabYield')" name="yield">
        <el-descriptions v-loading="loading" :column="1" border>
          <el-descriptions-item :label="t('plantPerformance.column.statMonth')">{{ detail?.statMonth ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.column.team')">{{ detail?.teamName ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.column.crop')">{{ detail?.cropName ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.column.pickWeight')">
            {{ detail?.pickWeight != null ? `${detail.pickWeight} 斤` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.column.unitPrice')">
            {{ detail?.unitPriceSnapshot != null ? `¥${detail.unitPriceSnapshot}/斤` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.column.amount')">
            <span class="font-bold text-red-500">{{ detail?.performanceAmount != null ? `¥${detail.performanceAmount}` : '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPerformance.detail.rule')">{{ detail?.performanceRule ?? '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- tab2 农事记录（按班组 + 月份过滤，复用 PLT-WORK-002 接口） -->
      <el-tab-pane :label="t('plantPerformance.detail.tabFarm')" name="farm">
        <el-table v-loading="farmLoading" :data="farmList" border size="small" height="480">
          <el-table-column prop="recordNo" :label="t('plantPerformance.detail.recordNo')" min-width="150" show-overflow-tooltip />
          <el-table-column prop="farmType" :label="t('plantPerformance.detail.farmType')" width="110" align="center">
            <template #default="{ row }">
              <dict-tag :options="farmWorkTypeDict" :value="row.farmType" />
            </template>
          </el-table-column>
          <el-table-column prop="plotName" :label="t('plantPerformance.detail.plot')" min-width="120" show-overflow-tooltip />
          <el-table-column prop="farmDate" :label="t('plantPerformance.detail.farmDate')" width="120" align="center" />
        </el-table>
        <div class="mt-2 text-xs text-gray-400">{{ t('plantPerformance.detail.farmCount', { count: farmList.length }) }}</div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup name="PerformanceDetailDrawer" lang="ts">
import { getPerformance } from '@/api/djs-plant/performance';
import type { PlantWorkPerformanceVO } from '@/api/djs-plant/performance/types';
import { listFarmRecords } from '@/api/djs-plant/farm-records';
import type { FarmRecordQuery, FarmRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { djs_farm_work_type: farmWorkTypeDict } = toRefs<Record<string, DictDataOption[]>>(proxy?.useDict('djs_farm_work_type') as never);

const visible = ref(false);
const activeTab = ref<'yield' | 'farm'>('yield');
const loading = ref(false);
const farmLoading = ref(false);
const detail = ref<PlantWorkPerformanceVO>();
const farmList = ref<FarmRecordVO[]>([]);

/** 由月份 yyyy-MM 推算当月起止日（含闰月），给农事记录按日期范围过滤。 */
function monthRange(statMonth: string): { begin: string; end: string } {
  const [y, m] = statMonth.split('-').map((n) => Number(n));
  const begin = `${statMonth}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${statMonth}-${String(lastDay).padStart(2, '0')}`;
  return { begin, end };
}

async function loadFarmRecords(teamId?: string, statMonth?: string) {
  if (!teamId || !statMonth) {
    farmList.value = [];
    return;
  }
  farmLoading.value = true;
  try {
    const { begin, end } = monthRange(statMonth);
    const query: FarmRecordQuery = {
      pageNum: 1,
      pageSize: 200,
      farmBy: teamId,
      farmDateBegin: begin,
      farmDateEnd: end
    };
    const res = await listFarmRecords(query);
    farmList.value = (res.rows as FarmRecordVO[]) || [];
  } finally {
    farmLoading.value = false;
  }
}

async function open(id: string) {
  visible.value = true;
  activeTab.value = 'yield';
  loading.value = true;
  farmList.value = [];
  try {
    const res = await getPerformance(id);
    detail.value = res.data as PlantWorkPerformanceVO;
    await loadFarmRecords(detail.value?.teamId, detail.value?.statMonth);
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>
