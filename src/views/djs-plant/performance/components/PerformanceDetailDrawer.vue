<template>
  <el-drawer v-model="visible" size="640px" destroy-on-close>
    <template #header>
      <div class="flex items-center justify-between w-full pr-4">
        <span class="text-base font-medium">{{ t('plantPerformance.detail.title') }}</span>
        <el-button v-hasPermi="['djs:plantPerformance:export']" size="small" type="primary" icon="Download" @click="handleExportDetail">
          {{ t('biz.table.action.export') }}
        </el-button>
      </div>
    </template>
    <el-tabs v-model="activeTab">
      <!-- tab1 产量绩效：按作物分行（采摘量 × 单价快照 = 该作物绩效额） -->
      <el-tab-pane :label="t('plantPerformance.detail.tabYield')" name="yield">
        <el-table v-loading="loading" :data="cropRows" border size="small" show-summary :summary-method="yieldSummary">
          <el-table-column prop="cropName" :label="t('plantPerformance.detail.cropName')" min-width="120" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column :label="t('plantPerformance.detail.cropPickWeight')" width="130" align="center" header-align="center">
            <template #default="{ row }">{{ row.pickWeight != null ? `${Number(row.pickWeight).toFixed(3)} 公斤` : '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('plantPerformance.detail.cropUnitPrice')" width="130" align="center" header-align="center">
            <template #default="{ row }">{{ row.unitPriceSnapshot != null ? `${row.unitPriceSnapshot} 元/公斤` : '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('plantPerformance.detail.cropAmount')" width="130" align="center" header-align="center">
            <template #default="{ row }">
              <span class="font-bold text-red-500">{{ row.performanceAmount != null ? `¥${row.performanceAmount}` : '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- tab2 农事记录（按班组 + 月份过滤，复用 PLT-WORK-002 接口） -->
      <el-tab-pane :label="t('plantPerformance.detail.tabFarm')" name="farm">
        <el-table v-loading="farmLoading" :data="farmList" border size="small" height="480">
          <el-table-column prop="recordNo" :label="t('plantPerformance.detail.recordNo')" min-width="150" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="farmType" :label="t('plantPerformance.detail.farmType')" width="110" align="center" header-align="center">
            <template #default="{ row }">
              <dict-tag :options="farmWorkTypeDict" :value="row.farmType" />
            </template>
          </el-table-column>
          <el-table-column prop="plotName" :label="t('plantPerformance.detail.plot')" min-width="120" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="farmDate" :label="t('plantPerformance.detail.farmDate')" width="120" align="center" header-align="center" />
        </el-table>
        <div class="mt-2 text-xs text-gray-400">{{ t('plantPerformance.detail.farmCount', { count: farmList.length }) }}</div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup name="PerformanceDetailDrawer" lang="ts">
import { getCropRows } from '@/api/djs-plant/performance';
import type { PlantWorkPerformanceVO } from '@/api/djs-plant/performance/types';
import { listFarmRecords } from '@/api/djs-plant/farm-records';
import type { FarmRecordQuery, FarmRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { TableColumnCtx } from 'element-plus';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { djs_farm_work_type: farmWorkTypeDict } = toRefs<Record<string, DictDataOption[]>>(proxy?.useDict('djs_farm_work_type') as never);

const visible = ref(false);
const activeTab = ref<'yield' | 'farm'>('yield');
/** 当前打开的班组 / 结算月份，供右上「导出」按钮用。 */
const curTeamId = ref<string>('');
const curStatMonth = ref<string>('');
const loading = ref(false);
const farmLoading = ref(false);
const cropRows = ref<PlantWorkPerformanceVO[]>([]);
const farmList = ref<FarmRecordVO[]>([]);

/** 产量绩效表合计行：采摘量合计 + 绩效额合计（单价列无意义合计，留空）。 */
function yieldSummary({ columns }: { columns: TableColumnCtx<PlantWorkPerformanceVO>[] }): string[] {
  const sums: string[] = [];
  const weightSum = cropRows.value.reduce((acc, r) => acc + Number(r.pickWeight ?? 0), 0);
  const amountSum = cropRows.value.reduce((acc, r) => acc + Number(r.performanceAmount ?? 0), 0);
  columns.forEach((_col, idx) => {
    if (idx === 0) {
      sums[idx] = t('plantPerformance.detail.totalAmount');
    } else if (idx === 1) {
      sums[idx] = `${weightSum.toFixed(3)} 公斤`;
    } else if (idx === 2) {
      sums[idx] = '';
    } else {
      sums[idx] = `¥${amountSum.toFixed(2)}`;
    }
  });
  return sums;
}

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

function handleExportDetail() {
  proxy?.download(
    'djs/plant/work-performance/export-detail',
    { teamId: curTeamId.value, statMonth: curStatMonth.value },
    `${t('plantPerformance.detail.title')}_${curStatMonth.value}.xlsx`
  );
}

async function open(teamId: string, statMonth: string) {
  visible.value = true;
  activeTab.value = 'yield';
  curTeamId.value = teamId;
  curStatMonth.value = statMonth;
  loading.value = true;
  cropRows.value = [];
  farmList.value = [];
  try {
    const res = await getCropRows(teamId, statMonth);
    cropRows.value = (res.data as PlantWorkPerformanceVO[]) || [];
    await loadFarmRecords(teamId, statMonth);
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>
