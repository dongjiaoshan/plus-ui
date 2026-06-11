<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_planting_season', 'djs_pick_status']"
      :page-num="1"
      :page-size="list.length || 10"
      row-key="rowKey"
      perm-prefix="djs:plant:pick"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #cell-expectedYield="{ row }">{{ row.expectedYield != null ? `${row.expectedYield} kg` : '-' }}</template>
      <template #cell-actualYield="{ row }">{{ row.actualYield != null ? `${row.actualYield} kg` : '-' }}</template>
      <template #cell-activityPlotCount="{ row }">
        <el-tag v-if="row.activityPlotCount > 0" type="warning" size="small">{{ row.activityPlotCount }}</el-tag>
        <span v-else>-</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:pick:adjust']" link type="primary" size="small" @click="handleAdjust(row as PlanRow)">
          {{ t('pickPlan.action.adjust') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="PickPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPickPlan } from '@/api/djs-plant/pick';
import type { PickPlanGroupVO, PickPlanQuery } from '@/api/djs-plant/pick/types';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const tableRef = ref<BizTableExpose>();

interface PlanRow extends PickPlanGroupVO {
  rowKey: string;
}

const list = ref<PlanRow[]>([]);
const total = ref(0);
const loading = ref(false);

const searchModel = reactive<Record<string, any>>({
  planYear: undefined,
  planSeason: undefined,
  harvestStatus: undefined
});

// 计划年份下拉：当前年起往前 6 年（K203 改计数器为下拉）
const yearOptions = computed(() => {
  const cur = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => ({ label: String(cur - i), value: cur - i }));
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'planYear', label: t('pickPlan.field.planYear'), type: 'select', options: yearOptions.value },
  { field: 'planSeason', label: t('pickPlan.field.planSeason'), type: 'select', dictType: 'djs_planting_season' },
  { field: 'harvestStatus', label: t('pickPlan.field.harvestStatus'), type: 'select', dictType: 'djs_pick_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'planNo', label: t('pickPlan.column.planNo'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'planYear', label: t('pickPlan.column.planYear'), minWidth: 80, align: 'center' },
  { prop: 'planSeason', label: t('pickPlan.column.planSeason'), minWidth: 100, align: 'center', dictType: 'djs_planting_season' },
  { prop: 'cropName', label: t('pickPlan.column.crop'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'plotCount', label: t('pickPlan.column.plotCount'), minWidth: 80, align: 'center' },
  { prop: 'planEarliest', label: t('pickPlan.column.planEarliest'), minWidth: 120, align: 'center' },
  { prop: 'planLatest', label: t('pickPlan.column.planLatest'), minWidth: 120, align: 'center' },
  { prop: 'actualBegin', label: t('pickPlan.column.actualBegin'), minWidth: 120, align: 'center' },
  { prop: 'actualEnd', label: t('pickPlan.column.actualEnd'), minWidth: 120, align: 'center' },
  { prop: 'expectedYield', label: t('pickPlan.column.expectedYield'), minWidth: 120, align: 'right' },
  { prop: 'actualYield', label: t('pickPlan.column.actualYield'), minWidth: 120, align: 'right' },
  { prop: 'activityPlotCount', label: t('pickPlan.column.activityPlotCount'), minWidth: 120, align: 'center' }
]);

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickPlan({ ...searchModel } as PickPlanQuery);
    // res.data 是 List<PickPlanGroupVO>（无分页）— rowKey = plantId_cropId
    const rows = (res.data || []) as PickPlanGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: `${r.plantId}_${r.cropId}` }));
    total.value = list.value.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
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
