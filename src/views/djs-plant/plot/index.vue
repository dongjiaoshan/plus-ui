<template>
  <div class="p-2">
    <BizTable
      ref="plotTableRef"
      :data="plotList"
      :total="plotTotal"
      :loading="plotLoading"
      :columns="plotColumns"
      :search-schema="plotSearchSchema"
      :search-model="plotSearchModel"
      :dict-types="['djs_plot_type', 'djs_plot_status', 'djs_plot_lease', 'djs_soil_type', 'djs_soil_fertility']"
      :page-num="plotPageNum"
      :page-size="plotPageSize"
      row-key="id"
      selectable
      show-export
      :show-add="true"
      perm-prefix="djs:plant:plot"
      @search="handlePlotSearch"
      @reset="handlePlotReset"
      @add="handleAddPlot"
      @edit="handleEditPlot"
      @del="handleDelPlot"
      @export="handleExportPlot"
      @page-change="handlePlotPageChange"
    >
      <template #cell-plotImagePreview="{ row }">
        <ImagePreview
          v-if="row.plotImagePreview && thumbUrlMap[String(row.plotImagePreview)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(row.plotImagePreview)]"
          :preview-src-list="[thumbUrlMap[String(row.plotImagePreview)]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.view')" placement="top">
          <el-button v-hasPermi="['djs:plant:plot:list']" link type="primary" icon="View" @click="handleViewPlot(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:plant:plot:edit']" link type="primary" icon="Edit" @click="handleEditPlot(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:plant:plot:remove']" link type="danger" icon="Delete" @click="handleDelPlot(row)" />
        </el-tooltip>
      </template>
      <template #empty>
        <el-empty :description="t('plantPlot.empty')" :image-size="80" />
      </template>
    </BizTable>

    <PlotForm ref="plotFormRef" :zone-list="zoneOptions" @success="fetchPlots" />
    <PlotView ref="plotViewRef" />
  </div>
</template>

<script setup name="PlotIndex" lang="ts">
/**
 * 地块管理独立列表页（FIX-PLT-AD-ZONE-001）。
 *
 * 拆掉原双栏（左片区树 + 右地块表）联动：地块全量加载，片区降为筛选 select。
 * 片区列表迁至独立 djs-plant/zone/index.vue。
 */
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PlotForm from './components/PlotForm.vue';
import PlotView from './components/PlotView.vue';
import { listAllZone } from '@/api/djs-plant/zone';
import { listPlot, delPlot } from '@/api/djs-plant/plot';
import type { PlotZoneVO } from '@/api/djs-plant/zone/types';
import type { PlotInfoQuery, PlotInfoVO } from '@/api/djs-plant/plot/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 片区选项（筛选 select + 新增/编辑表单下拉）
const zoneOptions = ref<PlotZoneVO[]>([]);

const plotTableRef = ref<BizTableExpose>();
const plotFormRef = ref<{ openCreate: (zoneId?: number | string) => void; openEdit: (id: number | string) => void }>();
const plotViewRef = ref<{ open: (id: number | string) => void }>();

const plotList = ref<PlotInfoVO[]>([]);
const plotTotal = ref(0);
const plotLoading = ref(false);
const plotPageNum = ref(1);
const plotPageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});

const plotSearchModel = reactive<Record<string, any>>({
  zoneId: undefined,
  plotCode: undefined,
  plotName: undefined,
  plotType: undefined,
  plotStatus: undefined,
  isLease: undefined
});

const plotSearchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'zoneId',
    label: t('plantPlot.field.zoneId'),
    type: 'select',
    clearable: true,
    options: zoneOptions.value.map((z) => ({ label: z.zoneName, value: z.id }))
  },
  { field: 'plotCode', label: t('plantPlot.field.plotCode'), type: 'input' },
  { field: 'plotName', label: t('plantPlot.field.plotName'), type: 'input' },
  { field: 'plotType', label: t('plantPlot.field.plotType'), type: 'select', dictType: 'djs_plot_type' },
  { field: 'plotStatus', label: t('plantPlot.field.plotStatus'), type: 'select', dictType: 'djs_plot_status' },
  { field: 'isLease', label: t('plantPlot.field.isLease'), type: 'select', dictType: 'djs_plot_lease' }
]);

const plotColumns = computed<BizTableColumn[]>(() => [
  { prop: 'plotCode', label: t('plantPlot.column.plotCode'), width: 120, showOverflowTooltip: true },
  { prop: 'plotName', label: t('plantPlot.column.plotName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'zoneName', label: t('plantPlot.column.zoneName'), width: 130, showOverflowTooltip: true },
  { prop: 'plotType', label: t('plantPlot.column.plotType'), width: 90, align: 'center', dictType: 'djs_plot_type' },
  { prop: 'soilType', label: t('plantPlot.column.soilType'), width: 100, align: 'center', dictType: 'djs_soil_type' },
  { prop: 'soilFertility', label: t('plantPlot.column.soilFertility'), width: 100, align: 'center', dictType: 'djs_soil_fertility' },
  { prop: 'plotImagePreview', label: t('plantPlot.column.plotImage'), width: 80, align: 'center' },
  { prop: 'plotStatus', label: t('plantPlot.column.plotStatus'), width: 90, align: 'center', dictType: 'djs_plot_status' },
  {
    prop: 'plotArea',
    label: t('plantPlot.column.plotArea'),
    width: 100,
    align: 'right',
    formatter: (r: BizRow) => (r.plotArea != null ? `${r.plotArea} 亩` : '-')
  },
  { prop: 'isLease', label: t('plantPlot.column.isLease'), width: 80, align: 'center', dictType: 'djs_plot_lease' },
  { prop: 'createTime', label: t('plantPlot.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'updateTime', label: t('plantPlot.column.updateTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('common.updateByName'), width: 100, align: 'center' }
]);

function buildQuery(): PlotInfoQuery {
  return {
    pageNum: plotPageNum.value,
    pageSize: plotPageSize.value,
    zoneId: plotSearchModel.zoneId || undefined,
    plotCode: plotSearchModel.plotCode || undefined,
    plotName: plotSearchModel.plotName || undefined,
    plotType: plotSearchModel.plotType || undefined,
    plotStatus: plotSearchModel.plotStatus === undefined || plotSearchModel.plotStatus === '' ? undefined : Number(plotSearchModel.plotStatus),
    isLease: plotSearchModel.isLease === undefined || plotSearchModel.isLease === '' ? undefined : Number(plotSearchModel.isLease)
  };
}

async function fetchPlots() {
  plotLoading.value = true;
  try {
    const res = await listPlot(buildQuery());
    plotList.value = (res.rows ?? res.data ?? []) as PlotInfoVO[];
    plotTotal.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    plotLoading.value = false;
  }
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(plotList.value.map((r) => r.plotImagePreview).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    thumbUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[Plot] listOssByIds failed', e);
    thumbUrlMap.value = {};
  }
}

async function loadZoneOptions() {
  try {
    const res = await listAllZone();
    zoneOptions.value = (res.data ?? []) as PlotZoneVO[];
  } catch (e) {
    console.warn('[Plot] listAllZone failed', e);
    zoneOptions.value = [];
  }
}

function handlePlotSearch(payload: Record<string, any>) {
  Object.assign(plotSearchModel, payload);
  plotPageNum.value = 1;
  fetchPlots();
}
function handlePlotReset() {
  Object.keys(plotSearchModel).forEach((k) => (plotSearchModel[k] = undefined));
  plotPageNum.value = 1;
  fetchPlots();
}
function handlePlotPageChange(p: number, s: number) {
  plotPageNum.value = p;
  plotPageSize.value = s;
  fetchPlots();
}
function handleAddPlot() {
  plotFormRef.value?.openCreate(plotSearchModel.zoneId || undefined);
}
function handleEditPlot(row: BizRow) {
  plotFormRef.value?.openEdit(row.id);
}
function handleViewPlot(row: BizRow) {
  plotViewRef.value?.open(row.id);
}
async function handleDelPlot(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('plantPlot.confirm.del', { count: ids.length }));
  await delPlot(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchPlots();
}
function handleExportPlot() {
  proxy?.download(
    'djs/plant/plot/export',
    {
      zoneId: plotSearchModel.zoneId || undefined,
      plotCode: plotSearchModel.plotCode || undefined,
      plotName: plotSearchModel.plotName || undefined,
      plotType: plotSearchModel.plotType || undefined,
      plotStatus: plotSearchModel.plotStatus === undefined || plotSearchModel.plotStatus === '' ? undefined : Number(plotSearchModel.plotStatus),
      isLease: plotSearchModel.isLease === undefined || plotSearchModel.isLease === '' ? undefined : Number(plotSearchModel.isLease)
    },
    `plot_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  loadZoneOptions();
  fetchPlots();
});
</script>
