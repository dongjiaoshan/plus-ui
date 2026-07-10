<template>
  <!-- 追溯码贴纸：3cm×3cm 定尺，顶「东角山有机追溯码」+ 二维码 + 底「生产编码-门店名称」。预览与打印共用同一份结构。 -->
  <div class="trace-label">
    <div class="trace-label__title">{{ t('storeTrace.label.traceCaption') }}</div>
    <img v-if="qrDataUrl" :src="qrDataUrl" alt="qr" class="trace-label__qr" />
    <div v-else class="trace-label__qr trace-label__qr--empty">-</div>
    <div class="trace-label__foot">{{ footText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TraceLabelData } from './TraceLabelDialog.vue';

const props = defineProps<{
  /** 标签数据 */
  data: TraceLabelData;
  /** 已按业态换算好的重量文案（紧凑贴纸不展示，保留 prop 兼容调用方） */
  weightText: string;
  /** 二维码 dataURL */
  qrDataUrl: string;
}>();

const { t } = useI18n();

/** 底部单行「生产编码-门店名称」；无门店只显生产编码。 */
const footText = computed(() => {
  const serial = props.data.serialNo != null ? String(props.data.serialNo) : '';
  const store = props.data.storeName || '';
  return store ? `${serial}-${store}` : serial;
});
</script>

<style lang="scss" scoped>
/* 3cm×3cm 追溯码贴纸（顶标题 + 二维码 + 底 生产编码-门店），row33 */
.trace-label {
  box-sizing: border-box;
  width: 30mm;
  height: 30mm;
  padding: 1mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  color: #000;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.trace-label__title {
  width: 100%;
  font-size: 2.5mm;
  font-weight: 700;
  line-height: 1.05;
  text-align: center;
  letter-spacing: 0.1mm;
}
.trace-label__qr {
  width: 19mm;
  height: 19mm;
  display: block;
}
.trace-label__qr--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 0.2mm dashed #ccc;
}
.trace-label__foot {
  width: 100%;
  font-size: 2.1mm;
  line-height: 1.05;
  text-align: center;
  word-break: break-all;
}
</style>
