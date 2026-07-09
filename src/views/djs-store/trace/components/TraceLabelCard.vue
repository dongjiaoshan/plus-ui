<template>
  <!-- 结构化标签卡：顶部 生产编码 + 生产日期，下方 左大二维码 + 右字段。预览与打印共用同一份标签结构。 -->
  <div class="trace-label">
    <div class="trace-label__top">
      <div class="trace-label__top-item">
        <span class="k">{{ t('storeTrace.label.serialNo') }}</span>
        <span class="v">{{ data.serialNo || '-' }}</span>
      </div>
      <div class="trace-label__top-item">
        <span class="k">{{ t('storeTrace.label.produceDate') }}</span>
        <span class="v">{{ data.produceDate || '-' }}</span>
      </div>
    </div>
    <div class="trace-label__body">
      <div class="trace-label__qr">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="qr" class="qr-img" />
        <div class="qr-hint">{{ t('storeTrace.label.traceCaption') }}</div>
      </div>
      <div class="trace-label__fields">
        <div class="trace-label__row">
          <span class="k">{{ t('storeTrace.label.productName') }}</span>
          <span class="v">{{ data.productName || '-' }}</span>
        </div>
        <div class="trace-label__row">
          <span class="k">{{ t('storeTrace.label.productWeight') }}</span>
          <span class="v">{{ weightText }}</span>
        </div>
        <div class="trace-label__row">
          <span class="k">{{ data.sourceLabel || (data.earNo ? t('storeTrace.label.earNo') : t('storeTrace.label.plotNo')) }}</span>
          <span class="v">{{ data.sourceValue || '-' }}</span>
        </div>
        <div class="trace-label__row">
          <span class="k">{{ t('storeTrace.label.storeName') }}</span>
          <span class="v">{{ data.storeName || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TraceLabelData } from './TraceLabelDialog.vue';

defineProps<{
  /** 标签 8 字段数据 */
  data: TraceLabelData;
  /** 已按业态换算好的重量文案（kg / g） */
  weightText: string;
  /** 二维码 dataURL */
  qrDataUrl: string;
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.trace-label {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  background: #fff;
}
/* 顶部：生产编码 + 生产日期 一行两列 */
.trace-label__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}
.trace-label__top-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.trace-label__top-item .k {
  color: #909399;
}
.trace-label__top-item .v {
  color: #303133;
  font-weight: 600;
}
/* 下方：左大二维码 + 右字段 */
.trace-label__body {
  display: flex;
  gap: 16px;
  align-items: center;
}
.trace-label__qr {
  flex: 0 0 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.qr-img {
  width: 130px;
  height: 130px;
}
.qr-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #909399;
  text-align: center;
}
.trace-label__fields {
  flex: 1;
  min-width: 0;
}
.trace-label__row {
  display: flex;
  font-size: 13px;
  line-height: 2;
}
.trace-label__row .k {
  flex: 0 0 72px;
  color: #909399;
}
.trace-label__row .v {
  flex: 1;
  color: #303133;
  word-break: break-all;
  font-weight: 500;
}
</style>
