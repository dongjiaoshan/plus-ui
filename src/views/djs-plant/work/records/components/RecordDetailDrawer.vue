<template>
  <el-drawer v-model="innerVisible" :title="t('plantWork.detail.title')" size="560px" :destroy-on-close="true">
    <el-skeleton v-if="loading" :rows="6" animated />
    <template v-else-if="detail">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="t('plantWork.column.recordNo')">{{ detail.recordNo }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.farmType')">
          <dict-tag :options="dict.djs_farm_work_type" :value="detail.farmType" />
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.farmDate')">{{ detail.farmDate ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.plotName')">{{ detail.plotName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.plotCode')">{{ detail.plotCode ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.cropName')">{{ detail.cropName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.teamName')">{{ detail.teamName ?? '-' }}</el-descriptions-item>

        <!-- 移栽类专属 -->
        <el-descriptions-item v-if="detail.transplantPlotName" :label="t('plantWork.detail.transplantPlotName')">
          {{ detail.transplantPlotName }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.transplantPercent != null" :label="t('plantWork.detail.transplantPercent')">
          {{ detail.transplantPercent }}%
        </el-descriptions-item>

        <!-- 灾害类专属 -->
        <el-descriptions-item v-if="detail.disasterType" :label="t('plantWork.column.disasterType')">
          <dict-tag :options="dict.djs_disaster_type" :value="detail.disasterType" />
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.lossRate != null" :label="t('plantWork.column.lossRate')"> {{ detail.lossRate }}% </el-descriptions-item>
        <el-descriptions-item v-if="detail.lossYield != null" :label="t('plantWork.column.lossYield')">
          {{ Number(detail.lossYield).toFixed(3) }} kg
        </el-descriptions-item>

        <el-descriptions-item :label="t('plantWork.detail.remark')">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantWork.column.createTime')">
          {{ detail.createTime ? proxy?.parseTime?.(detail.createTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
    <el-empty v-else :description="t('plantWork.detail.notFound')" />
  </el-drawer>
</template>

<script setup name="RecordDetailDrawer" lang="ts">
import { getFarmRecordDetail } from '@/api/djs-plant/farm-records';
import type { FarmRecordVO } from '@/api/djs-plant/farm-records/types';
import { useI18n } from 'vue-i18n';
import { useDict } from '@/utils/dict';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const dict = useDict('djs_farm_work_type', 'djs_disaster_type');

const props = defineProps<{
  visible: boolean;
  id: string;
}>();
const emits = defineEmits<{
  (e: 'update:visible', v: boolean): void;
}>();

const innerVisible = computed({
  get: () => props.visible,
  set: (v) => emits('update:visible', v)
});

const loading = ref(false);
const detail = ref<FarmRecordVO | null>(null);

watch(
  () => [props.visible, props.id] as const,
  ([visible, id]) => {
    if (visible && id) {
      loadDetail(id);
    }
  }
);

async function loadDetail(id: string) {
  loading.value = true;
  detail.value = null;
  try {
    const res = await getFarmRecordDetail(id);
    detail.value = (res.data ?? null) as FarmRecordVO | null;
  } catch (e) {
    console.warn('[FarmRecord] getFarmRecordDetail failed', e);
    detail.value = null;
  } finally {
    loading.value = false;
  }
}
</script>
