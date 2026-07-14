<template>
  <el-dialog v-model="visible" :title="t('store.title.view')" destroy-on-close append-to-body width="780px">
    <el-descriptions :column="2" border>
      <el-descriptions-item :label="t('store.field.storeCode')">{{ data.storeCode || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.storeName')">{{ data.storeName || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.shortName')">{{ data.shortName || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.storeType')">
        <dict-tag :options="djs_store_type" :value="data.storeType" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('store.field.businessStatus')">
        <dict-tag :options="djs_store_status" :value="data.businessStatus" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('store.field.openDate')">{{ data.openDate || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.managerName')">{{ data.managerName || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.managerPhone')">{{ data.managerPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.posSystemId')">{{ data.posSystemId || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.productionMarkCode')">{{ data.productionMarkCode || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.address')" :span="2">{{ data.address || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.field.image')" :span="2">
        <image-preview v-if="imageUrl" :src="imageUrl" :width="120" :height="120" />
        <el-text v-else type="info">-</el-text>
      </el-descriptions-item>
      <el-descriptions-item :label="t('store.field.remark')" :span="2">{{ data.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.column.createTime')">{{ data.createTime || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('store.column.updateTime')">{{ data.updateTime || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_store_type, djs_store_status } = toRefs<any>(proxy?.useDict('djs_store_type', 'djs_store_status'));

const visible = ref(false);
const data = ref<Partial<StoreVO>>({});
const imageUrl = ref<string>('');

const open = async (id: number | string) => {
  const res = await getStore(id);
  data.value = res.data || {};
  imageUrl.value = '';
  visible.value = true;
  const ossId = data.value.imageOssId;
  if (ossId) {
    try {
      const ossRes = await listOssByIds(ossId);
      imageUrl.value = ossRes.data?.[0]?.url ?? '';
    } catch (e) {
      console.warn('[StoreView] listOssByIds failed for imageOssId', ossId, e);
    }
  }
};

defineExpose({ open });
</script>
