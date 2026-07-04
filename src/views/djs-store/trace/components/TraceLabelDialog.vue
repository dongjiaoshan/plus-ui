<template>
  <el-dialog v-model="visible" :title="t('storeTrace.label.dialogTitle')" width="420px" append-to-body @closed="onClosed">
    <!-- 结构化标签卡：顶部 生产编码 + 生产日期，下方 左大二维码 + 右字段。产品重量只读展示（本次打包实重，不可修改） -->
    <div ref="labelRef" class="trace-label">
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

    <template #footer>
      <el-button @click="visible = false">{{ t('storeTrace.label.cancel') }}</el-button>
      <el-button type="primary" :loading="printing" @click="handlePrint">{{ t('storeTrace.label.confirmPrint') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

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
const labelRef = ref<HTMLElement>();

const weightText = computed(() => {
  if (weight.value == null) return '-';
  // 果蔬类产品重量按克展示（row146）：kg 值 × 1000，去浮点噪声；其余业态保持 kg
  if (data.value.traceType === 'veg') {
    return `${Math.round(weight.value * 1000 * 100) / 100} ${t('storeTrace.label.weightUnitGram')}`;
  }
  return `${weight.value} ${t('storeTrace.label.weightUnit')}`;
});

/** 二维码 encode URL：VITE_APP_TRACE_BASE 优先（内网/预览扫码可达），缺省 location.origin。 */
function buildTraceUrl(type: string, code: string): string {
  const base = (import.meta.env.VITE_APP_TRACE_BASE as string) || window.location.origin;
  return `${base.replace(/\/$/, '')}/trace/${type}/${code}`;
}

/** 打开弹框：传入标签数据 + 默认重量（row.actualWeight）。 */
async function open(payload: TraceLabelData, defaultWeight?: number) {
  data.value = { ...payload };
  weight.value = defaultWeight != null ? defaultWeight : undefined;
  qrDataUrl.value = '';
  visible.value = true;
  await genQr();
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

async function handlePrint() {
  if (!labelRef.value) return;
  printing.value = true;
  try {
    // 渲染标签卡为图片后用浏览器打印窗口输出（结构化 + 二维码完整保留）
    const canvas = await html2canvas(labelRef.value, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const w = window.open('', '_blank', 'width=480,height=640');
    if (!w) return;
    w.document.write(
      `<html><head><title>${data.value.productCode ?? ''}</title></head>` +
        `<body style="margin:0;text-align:center"><img src="${imgData}" style="max-width:100%"/></body></html>`
    );
    w.document.close();
    w.focus();
    // 等图片加载后打印
    const img = w.document.querySelector('img');
    if (img) {
      img.onload = () => w.print();
    } else {
      w.print();
    }
  } catch {
    proxy?.$modal.msgError(t('storeTrace.label.printFailed'));
  } finally {
    printing.value = false;
  }
}

function onClosed() {
  qrDataUrl.value = '';
}

defineExpose({ open });
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
