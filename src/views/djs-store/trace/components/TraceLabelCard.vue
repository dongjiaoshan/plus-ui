<template>
  <!-- 追溯码贴纸：3cm×3cm 版式（按 10 倍稿 300px 画，见 style 注释），顶标题按业态取（猪肉/果蔬/其余有机）+ 二维码 + 底「生产编码」「门店名称」两行。预览与打印共用同一份结构。 -->
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
/* 追溯码贴纸版式：**按 1mm = 10px 的 10 倍稿画**，最终由调用方缩到 3cm 见方
   （预览直接看这张 300px 的放大稿，打印是 html2canvas 快照缩到 2.8cm）。

   ⚠️ 不要把这些尺寸改回 mm。「门店名下半截被裁」返工三轮，有**两个各自独立的成因**，
   本版是同时堵住两个才成立的，只堵一个会再犯：

   成因① 浏览器最小字号。`font-size: 2.1mm` = 7.94px，低于 **Chrome 中文默认的 12px 最小字号**，
     浏览器把它顶到 12px 渲染，底部两行凭空长 14px，最后一行被挤出 30mm 贴纸盒裁掉下缘。
     实测：minimumFontSize=12 下 html2canvas 产物 228×228、底部留白 0px（贴边裁断）。
   成因② 纯内容超长。**不加任何最小字号设置**的基线浏览器上，店名 18 字以上 / 生产编码 25 位时
     折行后内容高度照样超过写死的 30mm，一样裁。跟浏览器怪癖无关。

   本版：字号全部 ≥21px（免疫①）+ 二维码 aspect-ratio 等比让位（吸收②）。
   实测新版 600×600、底部留白 25px；四档最小字号 × 九种内容用例 36 组渲染 0 例裁切。
   已知上限：门店名 39 字完整、40 字起触边（此时二维码已缩到 130px 地板）。真实店名 8 字，5 倍富余。
   版式高度账：padding 20 + 标题 25×1.25≈31 + 二维码 185 + 底部两行 21×1.25×2≈53 = 289 < 300。 */
.trace-label {
  box-sizing: border-box;
  width: 300px;
  height: 300px;
  padding: 10px;
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
  font-size: 25px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  letter-spacing: 1px;
}
/* 二维码是版式里唯一可让步的元素：门店名超长折成两行时由它等比缩（aspect-ratio 保正方，
   不会像定死 width 那样被压扁），缩到 130px（=1.3cm）为止仍远在扫码识别下限之上。 */
.trace-label__qr {
  flex: 0 1 auto;
  width: auto;
  height: 185px;
  min-height: 130px;
  aspect-ratio: 1 / 1;
  display: block;
}
.trace-label__qr--empty {
  width: 185px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #ccc;
}
/* 生产编码 / 门店名各占一行，不许被二维码挤掉 */
.trace-label__foot {
  width: 100%;
  flex: 0 0 auto;
  font-size: 21px;
  line-height: 1.25;
  text-align: center;
}
.trace-label__foot-line {
  width: 100%;
  word-break: break-all;
}
</style>
