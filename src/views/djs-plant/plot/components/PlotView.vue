<template>
  <el-dialog v-model="visible" :title="t('plantPlot.title.view')" destroy-on-close append-to-body width="820px">
    <el-tabs v-model="activeTab">
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
            <dict-tag :options="djs_yes_no" :value="data.isLease" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotArea')">{{
            data.plotArea != null ? `${data.plotArea} 亩` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.currentCropName')">{{ data.currentCropName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.soilType')">
            <dict-tag :options="djs_soil_type" :value="data.soilType" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.soilFertility')">
            <dict-tag :options="djs_soil_fertility" :value="data.soilFertility" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.soilPh')">{{ data.soilPh ?? '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.terrainCondition')">
            <dict-tag :options="djs_terrain_condition" :value="data.terrainCondition" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.lightCondition')">
            <dict-tag :options="djs_light_condition" :value="data.lightCondition" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.drainCondition')">
            <dict-tag :options="djs_drain_condition" :value="data.drainCondition" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotLocationDesc')" :span="2">{{ data.plotLocationDesc || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotImageUrl')" :span="2">
            <image-preview v-if="plotImageUrl" :src="plotImageUrl" :width="160" :height="120" />
            <el-text v-else type="info">-</el-text>
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantPlot.field.plotRemark')" :span="2">{{ data.plotRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="t('plantPlot.title.zoneInfo')" name="zone">
        <el-descriptions v-if="zone.id" :column="2" border>
          <el-descriptions-item :label="t('plantZone.field.zoneCode')">{{ zone.zoneCode || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantZone.field.zoneName')">{{ zone.zoneName || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantZone.field.zoneBelong')">{{ zone.zoneBelong || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('plantZone.field.zoneStatus')">
            <dict-tag :options="sys_normal_disable" :value="zone.zoneStatus" />
          </el-descriptions-item>
          <el-descriptions-item :label="t('plantZone.field.zoneDesc')" :span="2">{{ zone.zoneDesc || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else :description="t('plantPlot.zoneEmpty')" :image-size="60" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getPlot } from '@/api/djs-plant/plot';
import { getZone } from '@/api/djs-plant/zone';
import type { PlotInfoVO } from '@/api/djs-plant/plot/types';
import type { PlotZoneVO } from '@/api/djs-plant/zone/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {
  djs_plot_type,
  djs_plot_status,
  djs_yes_no,
  djs_soil_type,
  djs_soil_fertility,
  djs_terrain_condition,
  djs_light_condition,
  djs_drain_condition,
  sys_normal_disable
} = toRefs<any>(
  proxy?.useDict(
    'djs_plot_type',
    'djs_plot_status',
    'djs_yes_no',
    'djs_soil_type',
    'djs_soil_fertility',
    'djs_terrain_condition',
    'djs_light_condition',
    'djs_drain_condition',
    'sys_normal_disable'
  )
);

const visible = ref(false);
const activeTab = ref('info');
const data = ref<Partial<PlotInfoVO>>({});
const zone = ref<Partial<PlotZoneVO>>({});
const plotImageUrl = ref<string>('');

const open = async (id: number | string) => {
  const res = await getPlot(id);
  data.value = res.data || {};
  zone.value = {};
  plotImageUrl.value = '';
  activeTab.value = 'info';
  visible.value = true;
  // VO 已 enrich plotImageUrl 则直用；否则用 plotImagePreview(ossId) 回查
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
  // 拉所属片区详情
  if (data.value.zoneId) {
    try {
      const zoneRes = await getZone(data.value.zoneId);
      zone.value = zoneRes.data || {};
    } catch (e) {
      console.warn('[PlotView] getZone failed for zoneId', data.value.zoneId, e);
    }
  }
};

defineExpose({ open });
</script>
