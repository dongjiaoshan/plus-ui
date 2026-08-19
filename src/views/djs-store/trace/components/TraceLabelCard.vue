<template>
  <!-- 追溯码贴纸：3cm×3cm 定尺，顶标题按业态取（猪肉/果蔬/其余有机）+ 二维码 + 底「生产编码」「门店名称」两行。预览与打印共用同一份结构。 -->
  <div class="trace-label">
    <div class="trace-label__title">{{ caption }}</div>
    <img v-if="qrDataUrl" :src="qrDataUrl" alt="qr" class="trace-label__qr" />
    <div v-else class="trace-label__qr trace-label__qr--empty">-</div>
    <div class="trace-label__foot">
      <div class="trace-label__foot-line">{{ serialText }}</div>
      <div v-if="storeText" class="trace-label__foot-line">{{ storeText }}</div>
    </div>
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

/**
 * 底部两行：第一行生产编码、第二行门店名称（admin row147/148）。
 * 拼成一行会让门店名被 word-break 从中间硬拆（「东角」「山徐汇旗舰店」），故拆行渲染。
 */
const serialText = computed(() => (props.data.serialNo != null ? String(props.data.serialNo) : ''));
const storeText = computed(() => props.data.storeName || '');

/**
 * 贴纸顶部标题按业态取（V6 row122）：猪肉「东角山猪肉追溯码」/ 果蔬「东角山果蔬追溯码」。
 * 业态取 `data.traceType`（同二维码 URL `/trace/{type}/{code}` 的那个值）；
 * 取不到或是别的业态（礼盒等）保持原来的「东角山有机追溯码」。
 * 贴纸上产品名/别名与有机证书图的取舍在生码时已定格（trace_display_name），此处不重复判定。
 */
const caption = computed(() => {
  switch (props.data.traceType) {
    case 'pork':
      return t('storeTrace.label.traceCaptionPork');
    case 'veg':
      return t('storeTrace.label.traceCaptionVeg');
    default:
      return t('storeTrace.label.traceCaption');
  }
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
}
/* 生产编码 / 门店名各占一行；单行内仍允许超长时折行，但两者不再互相挤同一行 */
.trace-label__foot-line {
  width: 100%;
  word-break: break-all;
}
</style>
