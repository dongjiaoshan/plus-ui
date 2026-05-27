<template>
  <div class="p-2">
    <el-row :gutter="16">
      <!-- 左栏：片区树（6 列） -->
      <el-col :span="6">
        <el-card class="zone-card" shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">{{ t('plantZone.column.zoneName') }}</span>
              <el-button v-hasPermi="['djs:plant:zone:add']" type="primary" size="small" :icon="Plus" @click="handleAddZone">
                {{ t('common.add') }}
              </el-button>
            </div>
          </template>
          <el-input v-model="zoneFilterText" :placeholder="t('plantZone.placeholder.search')" clearable class="mb-2" />
          <el-tree
            ref="zoneTreeRef"
            :data="zoneTreeData"
            node-key="id"
            :filter-node-method="filterZoneNode"
            highlight-current
            :expand-on-click-node="false"
            class="zone-tree"
            @node-click="onZoneSelect"
          >
            <template #default="{ data }">
              <div class="zone-node flex justify-between items-center w-full">
                <span :class="{ 'is-disabled-zone': data.zoneStatus === 2 }">
                  {{ data.zoneName }}
                  <el-tag v-if="data.zoneStatus === 2" size="small" type="info">{{ t('common.disabled') }}</el-tag>
                </span>
                <div class="zone-actions">
                  <el-button v-hasPermi="['djs:plant:zone:edit']" link type="primary" :icon="Edit" @click.stop="handleEditZone(data)" />
                  <el-button v-hasPermi="['djs:plant:zone:remove']" link type="danger" :icon="Delete" @click.stop="handleDelZone(data)" />
                </div>
              </div>
            </template>
          </el-tree>
          <el-empty v-if="zoneTreeData.length === 0" :description="t('plantZone.empty')" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 右栏：当前片区下的地块 BizTable（18 列） -->
      <el-col :span="18">
        <BizTable
          ref="plotTableRef"
          :data="plotList"
          :total="plotTotal"
          :loading="plotLoading"
          :columns="plotColumns"
          :search-schema="plotSearchSchema"
          :search-model="plotSearchModel"
          :dict-types="['djs_plot_type', 'djs_plot_status', 'djs_yes_no', 'djs_soil_type', 'djs_soil_fertility']"
          :page-num="plotPageNum"
          :page-size="plotPageSize"
          row-key="id"
          selectable
          show-export
          :show-add="!!selectedZoneId"
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
          <template #empty>
            <el-empty :description="selectedZoneId ? t('plantPlot.empty') : t('plantPlot.selectZoneFirst')" :image-size="80" />
          </template>
        </BizTable>

        <PlotForm ref="plotFormRef" :zone-list="zoneTreeData" :default-zone-id="selectedZoneId" @success="fetchPlots" />
        <ZoneForm ref="zoneFormRef" @success="refreshZoneTree" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="PlotIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PlotForm from './components/PlotForm.vue';
import ZoneForm from './components/ZoneForm.vue';
import { listAllZone, delZone } from '@/api/djs-plant/zone';
import { listPlot, delPlot } from '@/api/djs-plant/plot';
import type { PlotZoneVO } from '@/api/djs-plant/zone/types';
import type { PlotInfoQuery, PlotInfoVO } from '@/api/djs-plant/plot/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// ===== 片区树 =====
const zoneTreeData = ref<PlotZoneVO[]>([]);
const zoneTreeRef = ref();
const zoneFilterText = ref('');
const selectedZoneId = ref<number | string | null>(null);
const zoneFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

watch(zoneFilterText, (val) => zoneTreeRef.value?.filter(val));
watch(selectedZoneId, () => {
  plotPageNum.value = 1;
  fetchPlots();
});

const filterZoneNode = (value: string, data: PlotZoneVO) => !value || data.zoneName.includes(value);

async function refreshZoneTree() {
  try {
    const res = await listAllZone();
    zoneTreeData.value = (res.data ?? []) as PlotZoneVO[];
    // 首次默认选中第一个片区
    if (!selectedZoneId.value && zoneTreeData.value.length > 0) {
      selectedZoneId.value = zoneTreeData.value[0].id;
      await nextTick();
      zoneTreeRef.value?.setCurrentKey(selectedZoneId.value);
    }
  } catch (e) {
    console.warn('[Plot] listAllZone failed', e);
  }
}

function onZoneSelect(data: PlotZoneVO) {
  selectedZoneId.value = data.id;
}

function handleAddZone() {
  zoneFormRef.value?.openCreate();
}
function handleEditZone(data: PlotZoneVO) {
  zoneFormRef.value?.openEdit(data.id);
}
async function handleDelZone(data: PlotZoneVO) {
  try {
    await proxy?.$modal.confirm(t('plantZone.confirm.del', { count: 1 }));
    await delZone([data.id]);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    if (selectedZoneId.value === data.id) {
      selectedZoneId.value = null;
    }
    refreshZoneTree();
  } catch (err: any) {
    if (err && err !== 'cancel') {
      const msg = err?.response?.data?.msg || err?.message;
      if (msg) proxy?.$modal.msgError(msg);
    }
  }
}

// ===== 地块右栏 =====
const plotTableRef = ref<BizTableExpose>();
const plotFormRef = ref<{ openCreate: (zoneId?: number | string) => void; openEdit: (id: number | string) => void }>();

const plotList = ref<PlotInfoVO[]>([]);
const plotTotal = ref(0);
const plotLoading = ref(false);
const plotPageNum = ref(1);
const plotPageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});

const plotSearchModel = reactive<Record<string, any>>({
  plotCode: undefined,
  plotName: undefined,
  plotType: undefined,
  plotStatus: undefined,
  isLease: undefined
});

const plotSearchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'plotCode', label: t('plantPlot.field.plotCode'), type: 'input' },
  { field: 'plotName', label: t('plantPlot.field.plotName'), type: 'input' },
  { field: 'plotType', label: t('plantPlot.field.plotType'), type: 'select', dictType: 'djs_plot_type' },
  { field: 'plotStatus', label: t('plantPlot.field.plotStatus'), type: 'select', dictType: 'djs_plot_status' },
  { field: 'isLease', label: t('plantPlot.field.isLease'), type: 'select', dictType: 'djs_yes_no' }
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
  { prop: 'isLease', label: t('plantPlot.column.isLease'), width: 80, align: 'center', dictType: 'djs_yes_no' },
  { prop: 'createTime', label: t('plantPlot.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchPlots() {
  if (!selectedZoneId.value) {
    plotList.value = [];
    plotTotal.value = 0;
    return;
  }
  plotLoading.value = true;
  try {
    const query: PlotInfoQuery = {
      pageNum: plotPageNum.value,
      pageSize: plotPageSize.value,
      zoneId: selectedZoneId.value,
      plotCode: plotSearchModel.plotCode || undefined,
      plotName: plotSearchModel.plotName || undefined,
      plotType: plotSearchModel.plotType || undefined,
      plotStatus: plotSearchModel.plotStatus === undefined || plotSearchModel.plotStatus === '' ? undefined : Number(plotSearchModel.plotStatus),
      isLease: plotSearchModel.isLease === undefined || plotSearchModel.isLease === '' ? undefined : Number(plotSearchModel.isLease)
    };
    const res = await listPlot(query);
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
  if (!selectedZoneId.value) {
    proxy?.$modal.msgWarning(t('plantPlot.selectZoneFirst'));
    return;
  }
  plotFormRef.value?.openCreate(selectedZoneId.value);
}
function handleEditPlot(row: BizRow) {
  plotFormRef.value?.openEdit(row.id);
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
      zoneId: selectedZoneId.value,
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
  refreshZoneTree();
});
</script>

<style scoped>
.zone-card {
  height: calc(100vh - 130px);
  overflow: auto;
}
.zone-tree {
  margin-top: 4px;
}
.zone-node {
  padding-right: 8px;
  width: 100%;
}
.zone-node .zone-actions {
  visibility: hidden;
  display: inline-flex;
  gap: 4px;
}
.zone-node:hover .zone-actions {
  visibility: visible;
}
.is-disabled-zone {
  color: #909399;
}
</style>
