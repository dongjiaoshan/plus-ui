<template>
  <el-dialog v-model="visible" :title="t('store.traceQr.title')" width="440px" append-to-body destroy-on-close>
    <div class="store-trace-qr">
      <el-descriptions :column="1" border size="small" class="store-trace-qr__info">
        <el-descriptions-item :label="t('store.traceQr.storeName')">{{ store.storeName || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('store.traceQr.storeCode')">{{ store.storeCode || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="store-trace-qr__qr">
        <img v-if="qrDataUrl" :src="qrDataUrl" :alt="t('store.traceQr.title')" class="store-trace-qr__img" />
        <div v-else class="store-trace-qr__placeholder">{{ generating ? '…' : t('store.traceQr.genFailed') }}</div>
      </div>

      <div class="store-trace-qr__link-label">{{ t('store.traceQr.link') }}</div>
      <el-input :model-value="traceUrl" readonly class="store-trace-qr__link" />
      <div class="store-trace-qr__tip">{{ t('store.traceQr.tip') }}</div>
    </div>

    <template #footer>
      <el-button icon="CopyDocument" :disabled="!traceUrl" @click="handleCopy">{{ t('store.traceQr.copy') }}</el-button>
      <el-button type="primary" icon="Download" :disabled="!qrDataUrl" @click="handleDownload">{{ t('store.traceQr.download') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import FileSaver from 'file-saver';
import { buildTraceUrl, genQrDataUrl } from '@/views/trace/useTrace';

/** 打开弹框所需的门店字段（门店列表行即可传入）。 */
export interface StoreTraceQrTarget {
  storeName?: string;
  storeCode?: string;
}

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const generating = ref(false);
const store = ref<StoreTraceQrTarget>({});
const traceUrl = ref('');
const qrDataUrl = ref('');

/** 二维码像素：下载后打印张贴也足够清晰（与追溯贴纸同级别，低于此打印易糊边）。 */
const QR_SIZE = 480;

/**
 * 打开门店猪只追溯码（V7 row40）：门店级固定 URL `<trace 域名>/trace/store/<门店编码>`，
 * trace 域名按当前 admin 域名派生（与追溯贴纸同一个 buildTraceUrl），不随猪变化，可长期张贴。
 */
async function open(target: StoreTraceQrTarget) {
  store.value = { ...target };
  const code = (target.storeCode ?? '').trim();
  traceUrl.value = code ? buildTraceUrl('store', encodeURIComponent(code)) : '';
  qrDataUrl.value = '';
  visible.value = true;
  if (!traceUrl.value) return;
  generating.value = true;
  try {
    qrDataUrl.value = await genQrDataUrl(traceUrl.value, QR_SIZE);
  } finally {
    generating.value = false;
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(traceUrl.value);
    proxy?.$modal.msgSuccess(t('store.traceQr.copied'));
  } catch {
    proxy?.$modal.msgError(t('store.traceQr.copyFailed'));
  }
}

function handleDownload() {
  if (!qrDataUrl.value) return;
  const name = [store.value.storeName, store.value.storeCode].filter(Boolean).join('-');
  FileSaver.saveAs(qrDataUrl.value, `${name || 'store'}-${t('store.title.traceQr')}.png`);
}

defineExpose({ open, traceUrl, qrDataUrl });
</script>

<style scoped lang="scss">
.store-trace-qr__qr {
  display: flex;
  justify-content: center;
  margin: 16px 0 12px;
}
.store-trace-qr__img,
.store-trace-qr__placeholder {
  width: 220px;
  height: 220px;
}
.store-trace-qr__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  border: 1px dashed var(--el-border-color);
}
.store-trace-qr__link-label {
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.store-trace-qr__tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
