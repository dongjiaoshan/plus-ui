<template>
  <div class="p-2">
    <!-- 顶部操作条：选月份 + 生成结算 + 导出 -->
    <el-card shadow="never" class="mb-2">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm">{{ t('plantPerformance.toolbar.statMonth') }}</span>
        <el-date-picker
          v-model="genMonth"
          type="month"
          value-format="YYYY-MM"
          :placeholder="t('plantPerformance.toolbar.pickMonth')"
          style="width: 160px"
        />
        <el-button v-hasPermi="['djs:plantPerformance:generate']" type="primary" :loading="generating" @click="handleGenerate">
          {{ t('plantPerformance.toolbar.generate') }}
        </el-button>
        <span class="text-xs text-gray-400">{{ t('plantPerformance.toolbar.hint') }}</span>
      </div>
    </el-card>

    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="listKey"
      show-export
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:plantPerformance"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button link type="primary" size="small" @click="handleDetail(row)">
          {{ t('plantPerformance.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <PerformanceDetailDrawer ref="drawerRef" />
  </div>
</template>

<script setup name="PlantPerformanceIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PerformanceDetailDrawer from './components/PerformanceDetailDrawer.vue';
import { generatePerformance, listPerformance } from '@/api/djs-plant/performance';
import type { PerfListRowVO, PlantWorkPerformanceQuery } from '@/api/djs-plant/performance/types';
import { listAllTeam } from '@/api/djs-plant/team';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const drawerRef = ref<InstanceType<typeof PerformanceDetailDrawer>>();

/** 列表行 = 聚合行 + 复合 row-key（列表无唯一单列 id）。 */
type PerfRow = PerfListRowVO & { listKey: string };

const list = ref<PerfRow[]>([]);
const total = ref(0);
const loading = ref(false);
const generating = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 顶部"生成结算"独立月份（与筛选月份解耦）。 */
const genMonth = ref<string>('');

/** 班组筛选下拉数据。 */
const teamOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchModel = reactive<Record<string, unknown>>({
  statMonth: undefined,
  teamId: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'statMonth', label: t('plantPerformance.field.statMonth'), type: 'month', placeholder: t('plantPerformance.toolbar.pickMonth') },
  { field: 'teamId', label: t('plantPerformance.field.team'), type: 'select', options: teamOptions.value }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'statMonth', label: t('plantPerformance.column.statMonth'), minWidth: 120, align: 'center' },
  { prop: 'teamName', label: t('plantPerformance.column.team'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'teamMemberCount', label: t('plantPerformance.column.teamMemberCount'), minWidth: 110, align: 'center' },
  {
    prop: 'totalPickWeight',
    label: t('plantPerformance.column.pickWeight'),
    minWidth: 140,
    align: 'center',
    formatter: (r: BizRow) => (r.totalPickWeight != null ? `${Number(r.totalPickWeight).toFixed(3)} 斤` : '-')
  },
  {
    prop: 'teamMonthAmount',
    label: t('plantPerformance.column.amount'),
    minWidth: 140,
    align: 'center',
    formatter: (r: BizRow) => (r.teamMonthAmount != null ? `¥${r.teamMonthAmount}` : '-')
  },
  { prop: 'farmCount', label: t('plantPerformance.column.farmCount'), minWidth: 130, align: 'center' }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PlantWorkPerformanceQuery = { ...searchModel, pageNum: pageNum.value, pageSize: pageSize.value };
    const res = await listPerformance(params);
    list.value = ((res.rows as PerfListRowVO[]) || []).map((r) => ({ ...r, listKey: `${r.statMonth}|${r.teamId ?? ''}` }));
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  const teamRes = await listAllTeam();
  teamOptions.value = (teamRes.data || []).map((it) => ({ label: it.teamName, value: it.id }));
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

const handleGenerate = async () => {
  if (!genMonth.value) {
    ElMessage.warning(t('plantPerformance.tip.monthRequired'));
    return;
  }
  await ElMessageBox.confirm(t('plantPerformance.confirm.generate', { month: genMonth.value }), t('common.tip'), { type: 'warning' });
  generating.value = true;
  try {
    const res = await generatePerformance(genMonth.value);
    const count = (res.data as number) ?? 0;
    ElMessage.success(t('plantPerformance.tip.generateSuccess', { count }));
    // 生成后把筛选月份对齐到刚生成的月，刷新列表
    searchModel.statMonth = genMonth.value;
    pageNum.value = 1;
    await loadList();
  } finally {
    generating.value = false;
  }
};

const handleDetail = (row: BizRow) => {
  drawerRef.value?.open(row.teamId as string, row.statMonth as string);
};

const handleExport = () => {
  proxy?.download('djs/plant/work-performance/export', { ...searchModel }, `${t('plantPerformance.pageTitle')}_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  loadOptions();
  loadList();
});
</script>
