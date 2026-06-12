<template>
  <el-dialog v-model="visible" :title="t('plantCrop.title.view')" destroy-on-close append-to-body width="900px">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('plantCrop.tab.planting')" name="planting">
        <el-table :data="plantingList" v-loading="subLoading" border size="small" max-height="360">
          <el-table-column type="index" :label="t('plantCrop.sub.index')" width="55" align="center" />
          <el-table-column prop="plantDate" :label="t('plantCrop.planting.plantDate')" min-width="120" align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.plantDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="plotName" :label="t('plantCrop.planting.plotName')" min-width="110" show-overflow-tooltip />
          <el-table-column prop="plantTeamName" :label="t('plantCrop.planting.plantTeamName')" min-width="100" show-overflow-tooltip />
          <el-table-column prop="predictedPer" :label="t('plantCrop.planting.predictedPer')" min-width="120" align="right">
            <template #default="{ row }">{{ row.predictedPer != null ? `${row.predictedPer} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="earliestHarvestDate" :label="t('plantCrop.planting.earliestHarvestDate')" min-width="140" align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.earliestHarvestDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="actualPer" :label="t('plantCrop.planting.actualPer')" min-width="120" align="right">
            <template #default="{ row }">{{ row.actualPer != null ? `${row.actualPer} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickStartDate" :label="t('plantCrop.planting.pickStartDate')" min-width="120" align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.pickStartDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickEndDate" :label="t('plantCrop.planting.pickEndDate')" min-width="120" align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.pickEndDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickTeamName" :label="t('plantCrop.planting.pickTeamName')" min-width="100" show-overflow-tooltip />
          <template #empty>
            <el-empty :description="t('plantCrop.planting.empty')" :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane :label="t('plantCrop.tab.farmwork')" name="farmwork">
        <el-table :data="farmworkList" v-loading="subLoading" border size="small" max-height="360">
          <el-table-column type="index" :label="t('plantCrop.sub.index')" width="55" align="center" />
          <el-table-column prop="farmDate" :label="t('plantCrop.farmwork.farmDate')" min-width="120" align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.farmDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="farmType" :label="t('plantCrop.farmwork.farmType')" min-width="110" align="center">
            <template #default="{ row }">
              <dict-tag :options="djs_farm_work_type" :value="row.farmType" />
            </template>
          </el-table-column>
          <el-table-column prop="plotName" :label="t('plantCrop.farmwork.plotName')" min-width="110" show-overflow-tooltip />
          <el-table-column prop="teamName" :label="t('plantCrop.farmwork.teamName')" min-width="110" show-overflow-tooltip />
          <el-table-column prop="remark" :label="t('plantCrop.farmwork.remark')" min-width="160" show-overflow-tooltip />
          <template #empty>
            <el-empty :description="t('plantCrop.farmwork.empty')" :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane :label="t('plantCrop.title.baseInfo')" name="info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('plantCrop.field.cropCode')">{{ data.cropCode || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.cropName')">{{ data.cropName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.varietyName')">{{ data.varietyName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.varietyOrigin')">{{ data.varietyOrigin || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.cropFamily')">
            <dict-tag :options="djs_crop_family" :value="data.cropFamily" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.plantingSeason')">
            <dict-tag :options="djs_planting_season" :value="data.plantingSeason" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.sowingPeriod')">{{ data.sowingPeriod || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.column.cycle')">{{ cycleText }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.fertilizationInterval')">{{
            intervalText(data.fertilizationInterval)
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.irrigationInterval')">{{ intervalText(data.irrigationInterval) }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.predictedPer')">{{
            data.predictedPer != null ? `${data.predictedPer} kg/亩` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.pickUnitPrice')">{{
            data.pickUnitPrice != null ? `¥${data.pickUnitPrice}/斤` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.relatedProduct')">{{ data.relatedProduct ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.cropImageUrl')" :span="2">
            <image-preview v-if="cropImageUrl" :src="cropImageUrl" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.qualityDesc')" :span="2">{{ data.qualityDesc || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getCrop, listFarmworkByCrop, listPlantingByCrop } from '@/api/djs-plant/crop';
import type { CropFarmworkVO, CropInfoVO, CropPlantingRecordVO } from '@/api/djs-plant/crop/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_crop_family, djs_planting_season, djs_farm_work_type } = toRefs<any>(
  proxy?.useDict('djs_crop_family', 'djs_planting_season', 'djs_farm_work_type')
);

const visible = ref(false);
const activeTab = ref('planting');
const data = ref<Partial<CropInfoVO>>({});
const cropImageUrl = ref<string>('');
const plantingList = ref<CropPlantingRecordVO[]>([]);
const farmworkList = ref<CropFarmworkVO[]>([]);
const subLoading = ref(false);

const cycleText = computed(() => {
  const { minCycle, maxCycle } = data.value;
  return minCycle != null && maxCycle != null ? `${minCycle}-${maxCycle} 天` : '-';
});

const intervalText = (v?: number) => (v != null ? `${v} 天` : '-');

const open = async (id: number | string) => {
  const res = await getCrop(id);
  data.value = res.data || {};
  cropImageUrl.value = '';
  plantingList.value = [];
  farmworkList.value = [];
  activeTab.value = 'planting';
  visible.value = true;
  // VO 已 enrich cropImageUrl 则直用；否则用 cropImagePreview(ossId) 回查
  if (data.value.cropImageUrl) {
    cropImageUrl.value = data.value.cropImageUrl;
  } else if (data.value.cropImagePreview) {
    try {
      const ossRes = await listOssByIds(data.value.cropImagePreview);
      cropImageUrl.value = ossRes.data?.[0]?.url ?? '';
    } catch (e) {
      console.warn('[CropView] listOssByIds failed for cropImagePreview', data.value.cropImagePreview, e);
    }
  }
  // 并发拉两张子表
  subLoading.value = true;
  try {
    const [pRes, fRes] = await Promise.all([listPlantingByCrop(id), listFarmworkByCrop(id)]);
    plantingList.value = (pRes.data ?? []) as CropPlantingRecordVO[];
    farmworkList.value = (fRes.data ?? []) as CropFarmworkVO[];
  } catch (e) {
    console.warn('[CropView] load sub tables failed', e);
  } finally {
    subLoading.value = false;
  }
};

defineExpose({ open });
</script>
