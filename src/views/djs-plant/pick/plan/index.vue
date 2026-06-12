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
      :page-num="1"
      :page-size="list.length || 10"
      row-key="rowKey"
      perm-prefix="djs:plant:pick"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    >
      <template #cell-cropImageUrl="{ row }">
        <ImagePreview
          v-if="row.cropImageUrl"
          :width="40"
          :height="40"
          :src="row.cropImageUrl"
          :preview-src-list="[row.cropImageUrl]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #cell-totalAcreage="{ row }">{{ row.totalAcreage != null ? `${row.totalAcreage} 亩` : '-' }}</template>
      <template #cell-demandQty="{ row }">{{ row.demandQty != null ? `${row.demandQty} kg` : '-' }}</template>
      <template #cell-actualYield="{ row }">{{ row.actualYield != null ? `${row.actualYield} kg` : '-' }}</template>
      <template #cell-disasterLoss="{ row }">{{ row.disasterLoss != null ? `${row.disasterLoss} kg` : '-' }}</template>
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

    <!-- 采摘计划调整抽屉（§6.13：详情/录入走 drawer，不做整页路由页） -->
    <PickAdjustDrawer ref="adjustDrawerRef" />
  </div>
</template>

<script setup name="PickPlanIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import PickAdjustDrawer from './components/PickAdjustDrawer.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPickPlan } from '@/api/djs-plant/pick';
import type { PickPlanGroupVO, PickPlanQuery } from '@/api/djs-plant/pick/types';
import { listCrop } from '@/api/djs-plant/crop';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const adjustDrawerRef = ref<InstanceType<typeof PickAdjustDrawer>>();

interface PlanRow extends PickPlanGroupVO {
  rowKey: string;
}

const list = ref<PlanRow[]>([]);
const total = ref(0);
const loading = ref(false);

const searchModel = reactive<Record<string, any>>({
  cropId: undefined
});

// 作物名称下拉选项（原型唯一主筛选「请选择农作物」）
const cropOptions = ref<Array<{ label: string; value: string | number }>>([]);

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'cropId',
    label: t('pickPlan.field.cropName'),
    type: 'select',
    placeholder: t('pickPlan.placeholder.cropName'),
    options: cropOptions.value
  }
]);

// 列序对齐原型：作物图片 / 作物名称 / 最早开始 / 最晚截止 / 当前种植亩数 /
// 预计需求量 / 当年已采摘量 / 当年种植地块总数 / 预计灾害损失量 / 采摘活动地块数 / 操作
const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropImageUrl', label: t('pickPlan.column.cropImage'), width: 80, align: 'center' },
  { prop: 'cropName', label: t('pickPlan.column.cropName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'planEarliest', label: t('pickPlan.column.planEarliest'), minWidth: 120, align: 'center' },
  { prop: 'planLatest', label: t('pickPlan.column.planLatest'), minWidth: 120, align: 'center' },
  { prop: 'totalAcreage', label: t('pickPlan.column.totalAcreage'), minWidth: 120, align: 'right' },
  { prop: 'demandQty', label: t('pickPlan.column.demandQty'), minWidth: 120, align: 'right' },
  { prop: 'actualYield', label: t('pickPlan.column.actualYield'), minWidth: 130, align: 'right' },
  { prop: 'plotTotalCount', label: t('pickPlan.column.plotTotalCount'), minWidth: 130, align: 'center' },
  { prop: 'disasterLoss', label: t('pickPlan.column.disasterLoss'), minWidth: 130, align: 'right' },
  { prop: 'activityPlotCount', label: t('pickPlan.column.activityPlotCount'), minWidth: 120, align: 'center' }
]);

async function loadCropOptions() {
  try {
    const res = await listCrop({ pageNum: 1, pageSize: 200 });
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; cropName: string }>;
    cropOptions.value = rows.map((r) => ({ label: r.cropName, value: r.id }));
  } catch (e) {
    console.warn('[PickPlan] listCrop failed', e);
    cropOptions.value = [];
  }
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listPickPlan({ ...searchModel } as PickPlanQuery);
    // res.data 是 List<PickPlanGroupVO>（无分页）— 按作物纯聚合，rowKey = cropId
    const rows = (res.data || []) as PickPlanGroupVO[];
    list.value = rows.map((r) => ({ ...r, rowKey: String(r.cropId) }));
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
  searchModel.cropId = undefined;
  loadList();
}

function handleExport() {
  proxy?.download(
    'djs/plant/pick/plan/export',
    { cropId: searchModel.cropId || undefined },
    `pick_plan_${new Date().getTime()}.xlsx`
  );
}

function handleAdjust(row: PlanRow) {
  adjustDrawerRef.value?.open({ cropId: row.cropId, cropName: row.cropName });
}

onMounted(() => {
  loadCropOptions();
  loadList();
});
</script>
