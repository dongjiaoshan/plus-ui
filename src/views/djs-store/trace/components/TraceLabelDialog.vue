<template>
  <el-dialog v-model="visible" :title="t('storeTrace.label.dialogTitle')" width="420px" append-to-body @closed="onClosed">
    <!-- 预览：3cm×3cm 追溯码贴纸放大 2 倍展示（贴纸本身仍是 30mm，只有预览放大） -->
    <div class="trace-label-preview">
      <div class="trace-label-preview__zoom">
        <TraceLabelCard :data="data" :weight-text="weightText" :qr-data-url="qrDataUrl" />
      </div>
      <div class="trace-label-preview__hint">{{ t('storeTrace.label.sizeHint') }}</div>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('storeTrace.label.cancel') }}</el-button>
      <el-button type="primary" :loading="printing" @click="handlePrint">{{ t('storeTrace.label.confirmPrint') }}</el-button>
    </template>
  </el-dialog>

  <!-- 离屏打印源：始终挂载、定位到可视区外，供 html2canvas 快照（预览与直接打印共用同一份内容）。
       不能用 display:none / visibility:hidden，否则 html2canvas 拿不到尺寸会渲染空白。 -->
  <div ref="printHostRef" class="trace-label-print-host" aria-hidden="true">
    <TraceLabelCard :data="data" :weight-text="weightText" :qr-data-url="qrDataUrl" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import TraceLabelCard from './TraceLabelCard.vue';

/** 标签 8 字段数据（调用方按业态填充）。 */
export interface TraceLabelData {
  /** 产品编码 */
  productCode?: string;
  /** 生产序号 */
  serialNo?: string | number;
  /** 打包编码 */
  packCode?: string;
  /** 生产日期 */
  produceDate?: string;
  /** 产品名称 */
  productName?: string;
  /** 销售门店 */
  storeName?: string;
  /** 来源标签覆盖（默认按 earNo/plotNo 自动选）：地块编号 / 猪只耳号 */
  sourceLabel?: string;
  /** 来源值（地块编号或耳号） */
  sourceValue?: string;
  /** 猪只耳号（用于自动判定来源标签） */
  earNo?: string;
  /** 追溯码 = produce_code（二维码 encode 用） */
  produceCode?: string;
  /** 业态 type（pork/veg；二维码 URL /trace/{type}/{code}） */
  traceType?: string;
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const printing = ref(false);
const weight = ref<number | undefined>(undefined);
const data = ref<TraceLabelData>({});
const qrDataUrl = ref('');
const printHostRef = ref<HTMLElement>();

const weightText = computed(() => {
  if (weight.value == null) return '-';
  // 果蔬类产品重量按克展示（row146）：kg 值 × 1000，去浮点噪声；其余业态保持 kg
  if (data.value.traceType === 'veg') {
    return `${Math.round(weight.value * 1000 * 100) / 100} ${t('storeTrace.label.weightUnitGram')}`;
  }
  return `${weight.value} ${t('storeTrace.label.weightUnit')}`;
});

/**
 * 二维码 encode URL：admin 域名按环境派生 trace 域名
 * （admin(-staging).dongjiaoshan.com → trace(-staging).dongjiaoshan.com），
 * staging admin 落 trace-staging、prod admin 落 trace；其它 host 回退 VITE_APP_TRACE_BASE 或 origin。
 */
function buildTraceUrl(type: string, code: string): string {
  const host = window.location.hostname;
  const base = host.startsWith('admin')
    ? `${window.location.protocol}//${host.replace(/^admin/, 'trace')}`
    : (import.meta.env.VITE_APP_TRACE_BASE as string) || window.location.origin;
  return `${base.replace(/\/$/, '')}/trace/${type}/${code}`;
}

/** 预览：打开弹框展示标签卡（传入标签数据 + 默认重量 row.actualWeight）。 */
async function open(payload: TraceLabelData, defaultWeight?: number) {
  await applyData(payload, defaultWeight);
  visible.value = true;
}

/** 直接打印：不弹预览框，渲染标签后直接送打印（浏览器开启 kiosk-printing 时无原生弹框，静默打印默认打印机）。 */
async function printDirect(payload: TraceLabelData, defaultWeight?: number) {
  await applyData(payload, defaultWeight);
  await runPrint();
}

/** 填充数据 + 生成二维码，并等离屏卡片按最新数据渲染完成。 */
async function applyData(payload: TraceLabelData, defaultWeight?: number) {
  data.value = { ...payload };
  weight.value = defaultWeight != null ? defaultWeight : undefined;
  qrDataUrl.value = '';
  await genQr();
  await nextTick();
}

async function genQr() {
  const code = data.value.produceCode;
  if (!code) {
    qrDataUrl.value = '';
    return;
  }
  const url = buildTraceUrl(data.value.traceType || 'pork', code);
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
  } catch {
    qrDataUrl.value = '';
  }
}

/** 弹框内「确认并打印」。 */
async function handlePrint() {
  await runPrint();
}

async function runPrint() {
  if (!printHostRef.value) return;
  printing.value = true;
  try {
    // 渲染离屏标签卡为图片（结构化 + 二维码完整保留）后经隐藏 iframe 打印
    const canvas = await html2canvas(printHostRef.value, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    await printImageViaIframe(imgData, data.value.productCode ?? '');
  } catch {
    proxy?.$modal.msgError(t('storeTrace.label.printFailed'));
  } finally {
    printing.value = false;
  }
}

/**
 * 用隐藏 iframe 打印标签图（替代 window.open 弹窗）。
 * 浏览器以 --kiosk-printing 启动时，print() 不弹原生对话框，直接送默认打印机；
 * 普通浏览器仍会弹一次系统打印框（受浏览器安全限制，JS 无法绕过）。
 * 方形贴纸图最大 28mm 居中，四周留 1mm 安全边（热敏标签机有 1~2mm 不可打印边
 * + 间隙传感器 ±1mm 定位误差，满幅会被裁掉边缘）。
 *
 * ⚠️ 三条都别改回去，各自对应一次实物返工：
 *
 * 1. `@page{size:auto}` —— **不要写死 `size:40mm 30mm`**。写死的那版：只要驱动里那张纸不是
 *    40×30（实测甲方那台就不是），Chromium 会按声明的尺寸排完版再把**整页缩放**塞进真实纸张，
 *    结果是二维码从 28mm 缩到 21mm、还被拉成 20.97×37.04 的非正方形，旁边空出一大条白边。
 *    交给 auto 之后，纸 40×30 / 30×40 / 30×30 三种实测都是 27.8~28mm 见方、两轴居中。
 * 2. `position:fixed` 铺满页盒 —— 打印分页布局里 `html,body{height:100%}` 不保证解析成页高，
 *    解析不了就退化成内容高度，flex 没有多余空间可分，图会顶在最上面。
 * 3. 图用 `max-width/max-height:100% + object-fit:contain` —— 可打印区比 28mm 小时整体等比缩，
 *    而不是溢出被裁。写死 `width:28mm;height:28mm;margin:1mm auto` 出过「标题只剩半截」的实物。
 */
function printImageViaIframe(imgData: string, title: string): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);
    const cw = iframe.contentWindow;
    if (!cw) {
      iframe.remove();
      resolve();
      return;
    }
    const finish = () => {
      // 延迟移除，确保打印任务已提交给系统
      setTimeout(() => iframe.remove(), 1000);
      resolve();
    };
    const doPrint = () => {
      try {
        cw.focus();
        cw.print();
      } finally {
        finish();
      }
    };
    const doc = cw.document;
    doc.open();
    doc.write(
      `<html><head><title>${title}</title>` +
        `<style>@page{size:auto;margin:0}` +
        `html,body{margin:0;padding:0}` +
        `.p{position:fixed;top:0;left:0;right:0;bottom:0;box-sizing:border-box;padding:1mm;` +
        `display:flex;align-items:center;justify-content:center}` +
        `img{width:28mm;height:28mm;max-width:100%;max-height:100%;object-fit:contain;display:block}</style>` +
        `</head><body><div class="p"><img src="${imgData}" alt="label"/></div></body></html>`
    );
    doc.close();
    const img = doc.querySelector('img');
    if (img && !img.complete) {
      img.onload = doPrint;
      img.onerror = doPrint;
    } else {
      doPrint();
    }
  });
}

function onClosed() {
  qrDataUrl.value = '';
}

defineExpose({ open, printDirect });
</script>

<style lang="scss" scoped>
/* 预览：3cm 贴纸居中，外加浅框标示贴纸边界（仅预览，不进打印快照） */
.trace-label-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}
/* r130：30mm 贴纸按真实尺寸落到屏幕只有 113px，顶部标题被压到 9.4px——
   中文在这个字号下底部笔画会被光栅化吞掉，看起来就是「字底部没显示全」。
   打印产物（html2canvas scale:2 → 228px）本身是完整的，问题只在屏幕预览太小。
   故预览整体放大 2 倍便于核对内容；贴纸与打印快照仍是 30mm，尺寸没变。 */
.trace-label-preview__zoom {
  zoom: 2;
}
.trace-label-preview :deep(.trace-label) {
  border: 1px dashed #dcdfe6;
}
.trace-label-preview__hint {
  font-size: 12px;
  color: #909399;
}
.trace-label-print-host {
  position: fixed;
  left: -100000px;
  top: 0;
  width: 30mm;
  pointer-events: none;
  z-index: -1;
}
</style>
