<template>
  <el-drawer v-model="visible" :title="t('warehouseTrace.detail.title')" size="820px" destroy-on-close>
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions :title="t('warehouseTrace.detail.groupBasic')" :column="2" border size="small" class="mb-3">
        <el-descriptions-item :label="t('warehouseTrace.field.produceCode')">{{ detail?.produceCode || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.codeType')">
          <dict-tag :options="djs_trace_code_type" :value="detail?.codeType" />
        </el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.productName')">{{ detail?.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.productSpec')">{{ detail?.productSpec || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.harvestDate')">{{ detail?.harvestDate || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.plantDays')">{{ detail?.plantDays ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.creatorName')">{{ detail?.creatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.createTime')">{{ detail?.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 关联信息 -->
      <el-descriptions :title="t('warehouseTrace.detail.groupRelation')" :column="2" border size="small" class="mb-3">
        <el-descriptions-item :label="t('warehouseTrace.field.pigEarNo')">{{ detail?.pigEarNo || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.plotName')">{{ detail?.plotName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.farmName')">{{ detail?.farmName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.storeName')">{{ detail?.storeName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('warehouseTrace.field.remark')" :span="2">{{ detail?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 产品图 -->
      <el-card v-if="productImageUrl" shadow="never" class="mb-3">
        <template #header>
          <span class="font-medium">{{ t('warehouseTrace.detail.groupImage') }}</span>
        </template>
        <image-preview :src="productImageUrl" :width="120" :height="120" />
      </el-card>

      <!-- 事件时间轴 -->
      <el-card shadow="never">
        <template #header>
          <span class="font-medium">{{ t('warehouseTrace.detail.groupTimeline') }}</span>
        </template>
        <TraceEventTimeline :events="detail?.events" />
      </el-card>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup name="TraceDetailDrawer" lang="ts">
import { getTraceDetail } from '@/api/warehouse/trace';
import type { TraceCodeDetailVO } from '@/api/warehouse/trace/types';
import { listByIds } from '@/api/system/oss';
import TraceEventTimeline from './TraceEventTimeline.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_trace_code_type } = toRefs<any>(proxy?.useDict('djs_trace_code_type'));

const visible = ref(false);
const loading = ref(false);
const detail = ref<TraceCodeDetailVO>();
const productImageUrl = ref('');

async function open(id: string) {
  visible.value = true;
  loading.value = true;
  detail.value = undefined;
  productImageUrl.value = '';
  try {
    const res = await getTraceDetail(String(id));
    detail.value = res.data;
    await loadProductImage(res.data?.productImg);
  } finally {
    loading.value = false;
  }
}

/** productImg 是 OSS ID（数字串），非 URL → listByIds 反查真实 url 再交 ImagePreview。 */
async function loadProductImage(ossId?: string) {
  if (!ossId) {
    return;
  }
  try {
    const res = await listByIds(String(ossId));
    const urls = (res.data ?? []).map((o) => o.url).filter((u): u is string => !!u);
    productImageUrl.value = urls.join(',');
  } catch (e) {
    console.warn('[TraceDetailDrawer] loadProductImage failed', e);
    productImageUrl.value = '';
  }
}

defineExpose({ open });
</script>
