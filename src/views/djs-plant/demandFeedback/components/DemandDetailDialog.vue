<template>
  <el-dialog v-model="visible" :title="t('cropDemand.title.detail')" destroy-on-close append-to-body width="720px">
    <el-descriptions v-loading="loading" :column="2" border>
      <el-descriptions-item :label="t('cropDemand.field.demandDate')">
        {{ detail?.demandDate || '—' }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.demandCategory')">
        <dict-tag v-if="detail?.demandCategory" :options="djs_plant_demand_category" :value="detail.demandCategory" />
        <span v-else>—</span>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.demandStatus')">
        <dict-tag v-if="detail?.demandStatus" :options="djs_plant_demand_status" :value="detail.demandStatus" />
        <span v-else>—</span>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.createByName')">
        {{ detail?.createByName || '—' }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.createTime')" :span="2">
        {{ detail?.createTime || '—' }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.demandContent')" :span="2">
        <div class="demand-text">{{ detail?.demandContent || '—' }}</div>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.imageOssIds')" :span="2">
        <div v-if="imageUrls.length > 0" class="demand-images">
          <ImagePreview v-for="url in imageUrls" :key="url" :src="url" :width="88" :height="88" />
        </div>
        <span v-else>{{ t('cropDemand.empty.images') }}</span>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.replyContent')" :span="2">
        <div class="demand-text">{{ detail?.replyContent || t('cropDemand.empty.reply') }}</div>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.replyTime')">
        {{ detail?.replyTime || '—' }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.replyByName')">
        {{ detail?.replyByName || '—' }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import ImagePreview from '@/components/ImagePreview/index.vue';
import { getCropDemand } from '@/api/djs-plant/cropDemand';
import type { CropDemandVO } from '@/api/djs-plant/cropDemand/types';
import { resolveDemandImageUrls, DEMAND_CATEGORY_DICT, DEMAND_STATUS_DICT } from './demandShared';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { djs_plant_demand_category, djs_plant_demand_status } = toRefs(useDict(DEMAND_CATEGORY_DICT, DEMAND_STATUS_DICT));

const visible = ref(false);
const loading = ref(false);
const detail = ref<CropDemandVO | undefined>(undefined);
const imageUrls = ref<string[]>([]);

const open = async (id: number | string) => {
  visible.value = true;
  loading.value = true;
  detail.value = undefined;
  imageUrls.value = [];
  try {
    const res = await getCropDemand(id);
    detail.value = res.data;
    imageUrls.value = await resolveDemandImageUrls(res.data?.imageOssIds);
  } finally {
    loading.value = false;
  }
};

defineExpose({ open });
</script>

<style scoped>
.demand-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.demand-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
