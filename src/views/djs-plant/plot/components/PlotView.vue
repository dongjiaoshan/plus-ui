<template>
  <el-dialog v-model="visible" :title="t('plantPlot.title.view')" destroy-on-close append-to-body width="1200px">
    <el-tabs v-model="activeTab">
      <!-- Tab 1：种植信息（默认选中，11 列） -->
      <el-tab-pane :label="t('plantPlot.tab.planting')" name="planting">
        <el-table :data="plantingList" border size="small" max-height="560">
          <el-table-column :label="t('plantPlot.planting.plantDate')" prop="plantDate" width="120" align="center" header-align="center" />
          <el-table-column :label="t('plantPlot.planting.cropImage')" width="70" align="center" header-align="center">
            <template #default="{ row }">
              <ImagePreview
                v-if="row.cropImage && cropImgUrlMap[String(row.cropImage)]"
                :width="36"
                :height="36"
                :src="cropImgUrlMap[String(row.cropImage)]"
                :preview-src-list="[cropImgUrlMap[String(row.cropImage)]]"
              />
              <span v-else class="text-gray-400">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('plantPlot.planting.cropName')" prop="cropName" min-width="120" align="center" header-align="center" show-overflow-tooltip />
          <el-table-column :label="t('plantPlot.planting.plantByName')" prop="plantByName" width="120" align="center" header-align="center" show-overflow-tooltip />
          <el-table-column :label="t('plantPlot.planting.expectedYield')" prop="expectedYield" width="120" align="center" header-align="center">
            <template #default="{ row }">{{ row.expectedYield != null ? `${Number(row.expectedYield).toFixed(3)} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('plantPlot.planting.actualProduction')" prop="actualProduction" width="120" align="center" header-align="center">
            <template #default="{ row }">{{ row.actualProduction != null ? `${Number(row.actualProduction).toFixed(3)} kg` : '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('plantPlot.planting.actualYield')" prop="actualYield" width="120" align="center" header-align="center">
            <template #default="{ row }">{{ row.actualYield != null ? `${Number(row.actualYield).toFixed(3)} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column :label="t('plantPlot.planting.beginHarvestdate')" prop="beginHarvestdate" width="120" align="center" header-align="center" />
          <el-table-column :label="t('plantPlot.planting.endHarvestdate')" prop="endHarvestdate" width="120" align="center" header-align="center" />
          <el-table-column :label="t('plantPlot.planting.harvestByName')" prop="harvestByName" width="120" align="center" header-align="center" show-overflow-tooltip />
          <template #empty>
            <el-empty :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- Tab 2：农事信息 -->
      <el-tab-pane :label="t('plantPlot.tab.farmwork')" name="farmwork">
        <el-table :data="farmworkList" border size="small" max-height="560">
          <el-table-column :label="t('plantPlot.farmwork.farmDate')" prop="farmDate" width="120" align="center" header-align="center" />
          <el-table-column :label="t('plantPlot.farmwork.farmType')" width="120" align="center" header-align="center">
            <template #default="{ row }">
              <dict-tag :options="djs_farm_work_type" :value="row.farmType" />
            </template>
          </el-table-column>
          <el-table-column :label="t('plantPlot.farmwork.plotName')" prop="plotName" min-width="140" align="center" header-align="center" show-overflow-tooltip />
          <el-table-column :label="t('plantPlot.farmwork.farmByName')" prop="farmByName" width="120" align="center" header-align="center" show-overflow-tooltip />
          <el-table-column :label="t('plantPlot.farmwork.remark')" prop="remark" min-width="180" align="center" header-align="center" show-overflow-tooltip />
          <template #empty>
            <el-empty :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <!-- Tab 3：基础信息 -->
      <el-tab-pane :label="t('plantPlot.title.baseInfo')" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('plantPlot.field.plotCode')">{{ data.plotCode || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotName')">{{ data.plotName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.column.zoneName')">{{ data.zoneName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotType')">
            <dict-tag :options="djs_plot_type" :value="data.plotType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotStatus')">
            <dict-tag :options="djs_plot_status" :value="data.plotStatus" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.isLease')">
            <dict-tag :options="djs_plot_lease" :value="data.isLease" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotArea')">{{
            data.plotArea != null ? `${data.plotArea} 亩` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.currentCropName')">{{ data.currentCropName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.soilPh')">{{ data.soilPh ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotLocationDesc')" :span="2">{{ data.plotLocationDesc || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotImage')" :span="2">
            <image-preview v-if="plotImageUrl" :src="plotImageUrl" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotRemark')" :span="2">{{ data.plotRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getPlot, listPlantingByPlot, listFarmworkByPlot } from '@/api/djs-plant/plot';
import type { PlotFarmworkRecordVO, PlotInfoVO, PlotPlantingRecordVO } from '@/api/djs-plant/plot/types';
import ImagePreview from '@/components/ImagePreview/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {
  djs_plot_type,
  djs_plot_status,
  djs_plot_lease,
  djs_farm_work_type
} = toRefs<any>(
  proxy?.useDict(
    'djs_plot_type',
    'djs_plot_status',
    'djs_plot_lease',
    'djs_farm_work_type'
  )
);

const visible = ref(false);
const activeTab = ref('planting');
const data = ref<Partial<PlotInfoVO>>({});
const plotImageUrl = ref<string>('');
const plantingList = ref<PlotPlantingRecordVO[]>([]);
const farmworkList = ref<PlotFarmworkRecordVO[]>([]);
const cropImgUrlMap = ref<Record<string, string>>({});

const open = async (id: number | string) => {
  data.value = {};
  plotImageUrl.value = '';
  plantingList.value = [];
  farmworkList.value = [];
  cropImgUrlMap.value = {};
  activeTab.value = 'planting';
  visible.value = true;

  const res = await getPlot(id);
  data.value = res.data || {};

  // 主图回填（VO 已 enrich plotImageUrl 则直用；否则用 plotImagePreview(ossId) 回查）
  if (data.value.plotImageUrl) {
    plotImageUrl.value = data.value.plotImageUrl;
  } else if (data.value.plotImagePreview) {
    try {
      const ossRes = await listOssByIds(data.value.plotImagePreview);
      plotImageUrl.value = ossRes.data?.[0]?.url ?? '';
    } catch (e) {
      console.warn('[PlotView] listOssByIds failed for plotImagePreview', data.value.plotImagePreview, e);
    }
  }

  // 并发拉 2 张子表
  const [planting, farmwork] = await Promise.all([
    listPlantingByPlot(id).catch((e) => {
      console.warn('[PlotView] listPlantingByPlot failed', e);
      return { data: [] } as any;
    }),
    listFarmworkByPlot(id).catch((e) => {
      console.warn('[PlotView] listFarmworkByPlot failed', e);
      return { data: [] } as any;
    })
  ]);
  plantingList.value = (planting.data ?? []) as PlotPlantingRecordVO[];
  farmworkList.value = (farmwork.data ?? []) as PlotFarmworkRecordVO[];

  await loadCropImgUrls();
};

/** 种植子表「作物图片」字段是 OSS id（image_oss_id / crop_image_preview），批量换 URL。 */
async function loadCropImgUrls() {
  const ids = Array.from(new Set(plantingList.value.map((r) => r.cropImage).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    cropImgUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    cropImgUrlMap.value = map;
  } catch (e) {
    console.warn('[PlotView] crop image listOssByIds failed', e);
    cropImgUrlMap.value = {};
  }
}

defineExpose({ open });
</script>
