<template>
  <el-dialog v-model="visible" :title="t('plantCrop.title.view')" destroy-on-close append-to-body width="1200px">
    <el-tabs v-model="activeTab">
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
          <el-descriptions-item :label="t('plantCrop.field.predictedPer')">{{
            data.predictedPer != null ? `${Number(data.predictedPer).toFixed(3)} kg/亩` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.pickUnitPrice')">{{
            data.pickUnitPrice != null ? `¥${data.pickUnitPrice}/斤` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.relatedProduct')">{{ data.relatedProductName ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.cropImageUrl')" :span="2">
            <image-preview v-if="cropImageUrl" :src="cropImageUrl" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.qualityDesc')" :span="2">{{ data.qualityDesc || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="t('plantCrop.tab.planting')" name="planting">
        <el-table :data="plantingList" v-loading="subLoading" border size="small" max-height="520">
          <el-table-column type="index" :label="t('plantCrop.sub.index')" width="55" align="center" />
          <el-table-column prop="plantDate" :label="t('plantCrop.planting.plantDate')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.plantDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="plotCode" :label="t('plantCrop.planting.plotCode')" min-width="100" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="plotName" :label="t('plantCrop.planting.plotName')" min-width="110" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="plantTeamName" :label="t('plantCrop.planting.plantTeamName')" min-width="100" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="predictedPer" :label="t('plantCrop.planting.predictedPer')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ row.predictedPer != null ? `${Number(row.predictedPer).toFixed(3)} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="actualYield" :label="t('plantCrop.planting.actualYield')" min-width="110" align="center" header-align="center">
            <template #default="{ row }">{{ row.actualYield != null ? `${Number(row.actualYield).toFixed(3)} kg` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="actualPer" :label="t('plantCrop.planting.actualPer')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ row.actualPer != null ? `${Number(row.actualPer).toFixed(3)} kg/亩` : '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickStartDate" :label="t('plantCrop.planting.pickStartDate')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.pickStartDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickEndDate" :label="t('plantCrop.planting.pickEndDate')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.pickEndDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="pickTeamName" :label="t('plantCrop.planting.pickTeamName')" min-width="100" show-overflow-tooltip align="center" header-align="center" />
          <template #empty>
            <el-empty :description="t('plantCrop.planting.empty')" :image-size="60" />
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane :label="t('plantCrop.tab.farmwork')" name="farmwork">
        <el-table :data="farmworkList" v-loading="subLoading" border size="small" max-height="520">
          <el-table-column type="index" :label="t('plantCrop.sub.index')" width="55" align="center" />
          <el-table-column prop="farmDate" :label="t('plantCrop.farmwork.farmDate')" min-width="120" align="center" header-align="center">
            <template #default="{ row }">{{ proxy?.parseTime?.(row.farmDate, '{y}-{m}-{d}') || '-' }}</template>
          </el-table-column>
          <el-table-column prop="farmType" :label="t('plantCrop.farmwork.farmType')" min-width="110" align="center" header-align="center">
            <template #default="{ row }">
              <dict-tag :options="djs_farm_work_type" :value="row.farmType" />
            </template>
          </el-table-column>
          <el-table-column prop="plotName" :label="t('plantCrop.farmwork.plotName')" min-width="110" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="teamName" :label="t('plantCrop.farmwork.teamName')" min-width="110" show-overflow-tooltip align="center" header-align="center" />
          <el-table-column prop="remark" :label="t('plantCrop.farmwork.remark')" min-width="160" show-overflow-tooltip align="center" header-align="center" />
          <template #empty>
            <el-empty :description="t('plantCrop.farmwork.empty')" :image-size="60" />
          </template>
        </el-table>
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
const activeTab = ref('info');
const data = ref<Partial<CropInfoVO>>({});
const cropImageUrl = ref<string>('');
const plantingList = ref<CropPlantingRecordVO[]>([]);
const farmworkList = ref<CropFarmworkVO[]>([]);
const subLoading = ref(false);

const cycleText = computed(() => {
  const { minCycle, maxCycle } = data.value;
  return minCycle != null && maxCycle != null ? `${minCycle}-${maxCycle} 天` : '-';
});

const open = async (id: number | string) => {
  const res = await getCrop(id);
  data.value = res.data || {};
  cropImageUrl.value = '';
  plantingList.value = [];
  farmworkList.value = [];
  activeTab.value = 'info';
  visible.value = true;
  // 单图展示：优先后端 resolver 已回填的 imageUrl（public url）；
  // 否则用单 ossId（cropImagePreview 新口径，兼容旧 imageOssId / cropImageUrl 首图）回查 url
  if (data.value.imageUrl) {
    cropImageUrl.value = data.value.imageUrl;
  } else {
    const previewOssId = data.value.cropImagePreview || data.value.imageOssId || data.value.cropImageUrl?.split(',')[0];
    if (previewOssId) {
      try {
        const ossRes = await listOssByIds(String(previewOssId));
        cropImageUrl.value = ossRes.data?.[0]?.url ?? '';
      } catch (e) {
        console.warn('[CropView] listOssByIds failed for crop image', previewOssId, e);
      }
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
