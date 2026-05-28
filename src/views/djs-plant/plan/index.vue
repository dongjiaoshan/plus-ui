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
      :dict-types="['djs_plant_plan_status', 'djs_planting_season']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:plant:plan"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-action="{ row }">
        <el-button link type="primary" size="small" @click="handleDetail(row)">
          {{ t('plantPlan.action.detail') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="PlantPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { delPlan, listPlan } from '@/api/djs-plant/plan';
import type { PlantPlanQuery, PlantPlanVO } from '@/api/djs-plant/plan/types';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PlantPlanVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, unknown>>({
  planNo: undefined,
  planYear: undefined,
  planSeason: undefined,
  plantStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'planNo', label: t('plantPlan.field.planNo'), type: 'input' },
  { field: 'planYear', label: t('plantPlan.field.planYear'), type: 'input' },
  { field: 'planSeason', label: t('plantPlan.field.planSeason'), type: 'select', dictType: 'djs_planting_season' },
  { field: 'plantStatus', label: t('plantPlan.field.plantStatus'), type: 'select', dictType: 'djs_plant_plan_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'planNo', label: t('plantPlan.column.planNo'), width: 160, showOverflowTooltip: true },
  { prop: 'planYear', label: t('plantPlan.column.planYear'), width: 80, align: 'center' },
  { prop: 'planSeason', label: t('plantPlan.column.planSeason'), width: 100, align: 'center', dictType: 'djs_planting_season' },
  { prop: 'cropName', label: t('plantPlan.column.crop'), width: 140, showOverflowTooltip: true },
  {
    prop: 'totalArea',
    label: t('plantPlan.column.totalArea'),
    width: 110,
    align: 'right',
    formatter: (r: BizRow) => (r.totalArea != null ? `${r.totalArea} 亩` : '-')
  },
  {
    prop: 'totalPlot',
    label: t('plantPlan.column.totalPlot'),
    width: 100,
    align: 'center',
    formatter: (r: BizRow) => (r.totalPlot != null ? String(r.totalPlot) : '-')
  },
  { prop: 'earliestHarvestdate', label: t('plantPlan.column.earliestHarvestdate'), width: 130, align: 'center' },
  { prop: 'lastHarvestdate', label: t('plantPlan.column.lastHarvestdate'), width: 130, align: 'center' },
  { prop: 'plantStatus', label: t('plantPlan.column.plantStatus'), width: 100, align: 'center', dictType: 'djs_plant_plan_status' },
  { prop: 'action', label: t('plantPlan.column.action'), width: 100, align: 'center', fixed: 'right' }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PlantPlanQuery = { ...searchModel, pageNum: pageNum.value, pageSize: pageSize.value };
    const res = await listPlan(params);
    list.value = (res.rows as PlantPlanVO[]) || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

const handleSearch = () => {
  pageNum.value = 1;
  loadList();
};

const handleReset = () => {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  handleSearch();
};

const handlePageChange = ({ pageNum: pn, pageSize: ps }: { pageNum: number; pageSize: number }) => {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
};

const handleAdd = () => {
  router.push('/djs-plant/plan/wizard');
};

const handleEdit = (row: BizRow) => {
  router.push(`/djs-plant/plan/detail?id=${row.id}&edit=1`);
};

const handleDetail = (row: BizRow) => {
  router.push(`/djs-plant/plan/detail?id=${row.id}`);
};

const handleDel = async (rows: BizRow[]) => {
  if (!rows.length) return;
  await ElMessageBox.confirm(t('plantPlan.confirm.del', { count: rows.length }), t('common.tip'), { type: 'warning' });
  await delPlan(rows.map((r) => r.id as string));
  ElMessage.success(t('common.deleteSuccess'));
  loadList();
};

const handleExport = () => {
  proxy?.download(
    'djs/plant/plan/export',
    { ...searchModel },
    `${t('plantPlan.pageTitle')}_${new Date().getTime()}.xlsx`
  );
};

onMounted(loadList);
</script>
