<template>
  <el-drawer v-model="innerVisible" :title="t('plantDisaster.detail.title')" size="560px" :destroy-on-close="true">
    <el-skeleton v-if="loading" :rows="6" animated />
    <template v-else-if="detail">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="t('plantDisaster.column.recordNo')">{{ detail.recordNo }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.farmDate')">{{ detail.farmDate ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.disasterType')">
          <dict-tag :options="djs_disaster_type" :value="detail.disasterType" />
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.plotName')">{{ detail.plotName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.plotCode')">{{ detail.plotCode ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.cropName')">{{ detail.cropName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.lossRate')">
          {{ detail.lossRate != null ? `${detail.lossRate}%` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.lossYield')">
          {{ detail.lossYield != null ? `${Number(detail.lossYield).toFixed(3)} kg` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.teamName')">{{ detail.teamName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.detail.remark')">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantDisaster.column.createTime')">
          {{ detail.createTime ? proxy?.parseTime?.(detail.createTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-4">
        <div class="mb-2 font-bold">{{ t('plantDisaster.detail.proof') }}</div>
        <div v-if="proofUrls.length > 0" class="flex flex-wrap gap-2">
          <ImagePreview v-for="(url, idx) in proofUrls" :key="idx" :width="88" :height="88" :src="url" />
        </div>
        <el-empty v-else :description="t('plantDisaster.detail.noProof')" :image-size="60" />
      </div>
    </template>
    <el-empty v-else :description="t('plantDisaster.detail.notFound')" />
  </el-drawer>
</template>

<script setup name="DisasterDetailDrawer" lang="ts">
import ImagePreview from '@/components/ImagePreview/index.vue';
import { getDisasterDetail } from '@/api/djs-plant/farm-records';
import type { DisasterRecordVO } from '@/api/djs-plant/farm-records/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';
import { useDict } from '@/utils/dict';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_disaster_type } = toRefs(useDict('djs_disaster_type'));

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
const detail = ref<DisasterRecordVO | null>(null);
const proofUrls = ref<string[]>([]);

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
  proofUrls.value = [];
  try {
    const res = await getDisasterDetail(id);
    detail.value = (res.data ?? null) as DisasterRecordVO | null;
    await loadProofUrls();
  } catch (e) {
    console.warn('[Disaster] getDisasterDetail failed', e);
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadProofUrls() {
  const ossIds = (detail.value?.proofOssIds ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (ossIds.length === 0) {
    proofUrls.value = [];
    return;
  }
  try {
    const res = await listOssByIds(ossIds.join(','));
    proofUrls.value = (res.data ?? []).map((o: any) => o?.url).filter((u: string): u is string => !!u);
  } catch (e) {
    console.warn('[Disaster] listOssByIds failed', e);
    proofUrls.value = [];
  }
}
</script>
