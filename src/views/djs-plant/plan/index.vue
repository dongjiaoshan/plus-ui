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
      :show-row-del="false"
      perm-prefix="djs:plant:plan"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:plan:list']" link type="primary" size="small" @click="handleDetail(row)">
          {{ t('plantPlan.action.detail') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:plan:edit']" link type="primary" size="small" icon="Edit" @click="handleEdit(row)" />
        <el-button v-hasPermi="['djs:plant:plan:remove']" link type="danger" size="small" icon="Delete" @click="handleDelOne(row)" />
      </template>
    </BizTable>
  </div>
</template>

<script setup name="PlantPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { delPlan, listPlan } from '@/api/djs-plant/plan';
import type { PlantPlanQuery, PlantPlanVO } from '@/api/djs-plant/plan/types';
import { PLAN_BASE } from './route';
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
  { prop: 'planNo', label: t('plantPlan.column.planNo'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'planYear', label: t('plantPlan.column.planYear'), minWidth: 80, align: 'center' },
  { prop: 'planSeason', label: t('plantPlan.column.planSeason'), minWidth: 100, align: 'center', dictType: 'djs_planting_season' },
  { prop: 'cropName', label: t('plantPlan.column.crop'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'plantDate', label: t('plantPlan.column.plantDate'), minWidth: 130, align: 'center', showOverflowTooltip: true },
  {
    prop: 'totalArea',
    label: t('plantPlan.column.totalArea'),
    minWidth: 110,
    align: 'right',
    formatter: (r: BizRow) => (r.totalArea != null ? `${r.totalArea} 亩` : '-')
  },
  {
    prop: 'totalPlot',
    label: t('plantPlan.column.totalPlot'),
    minWidth: 100,
    align: 'center',
    formatter: (r: BizRow) => (r.totalPlot != null ? String(r.totalPlot) : '-')
  },
  { prop: 'earliestHarvestdate', label: t('plantPlan.column.earliestHarvestdate'), minWidth: 130, align: 'center' },
  { prop: 'lastHarvestdate', label: t('plantPlan.column.lastHarvestdate'), minWidth: 130, align: 'center' },
  { prop: 'plantStatus', label: t('plantPlan.column.plantStatus'), minWidth: 100, align: 'center', dictType: 'djs_plant_plan_status' }
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

const handleSearch = (payload?: Record<string, any>) => {
  Object.assign(searchModel, payload ?? {});
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
  router.push(`${PLAN_BASE}/wizard`);
};

const handleEdit = (row: BizRow) => {
  router.push(`${PLAN_BASE}/detail?id=${row.id}&edit=1`);
};

const handleDetail = (row: BizRow) => {
  router.push(`${PLAN_BASE}/detail?id=${row.id}`);
};

const handleDel = async (rows: BizRow[]) => {
  if (!rows.length) return;
  await ElMessageBox.confirm(t('plantPlan.confirm.del', { count: rows.length }), t('common.tip'), { type: 'warning' });
  await delPlan(rows.map((r) => r.id as string));
  ElMessage.success(t('common.deleteSuccess'));
  loadList();
};

const handleDelOne = async (row: BizRow) => {
  await ElMessageBox.confirm(t('plantPlan.confirm.del', { count: 1 }), t('common.tip'), { type: 'warning' });
  await delPlan([row.id as string]);
  ElMessage.success(t('common.deleteSuccess'));
  loadList();
};

const handleExport = () => {
  proxy?.download('djs/plant/plan/export', { ...searchModel }, `${t('plantPlan.pageTitle')}_${new Date().getTime()}.xlsx`);
};

onMounted(loadList);
</script>
