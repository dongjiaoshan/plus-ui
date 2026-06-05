<template>
  <el-dialog v-model="visible" :title="t('plantCrop.title.view')" destroy-on-close append-to-body width="820px">
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
          <el-descriptions-item :label="t('plantCrop.field.cropImageUrl')" :span="2">
            <image-preview v-if="cropImageUrl" :src="cropImageUrl" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantCrop.field.qualityDesc')" :span="2">{{ data.qualityDesc || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="t('plantCrop.title.related')" name="related">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="t('plantCrop.field.relatedProduct')">{{ data.relatedProduct ?? '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty :description="t('plantCrop.organicEmpty')" :image-size="60" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getCrop } from '@/api/djs-plant/crop';
import type { CropInfoVO } from '@/api/djs-plant/crop/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_crop_family, djs_planting_season } = toRefs<any>(proxy?.useDict('djs_crop_family', 'djs_planting_season'));

const visible = ref(false);
const activeTab = ref('info');
const data = ref<Partial<CropInfoVO>>({});
const cropImageUrl = ref<string>('');

const cycleText = computed(() => {
  const { minCycle, maxCycle } = data.value;
  return minCycle != null && maxCycle != null ? `${minCycle}-${maxCycle} 天` : '-';
});

const intervalText = (v?: number) => (v != null ? `${v} 天` : '-');

const open = async (id: number | string) => {
  const res = await getCrop(id);
  data.value = res.data || {};
  cropImageUrl.value = '';
  activeTab.value = 'info';
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
};

defineExpose({ open });
</script>
