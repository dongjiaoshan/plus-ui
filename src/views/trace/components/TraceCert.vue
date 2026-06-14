<template>
  <div class="cert-page">
    <div class="cert-page__title">{{ pageTitle }}</div>
    <div v-if="certs.length === 0" class="t-empty">{{ t('tracePublic.cert.empty') }}</div>
    <div v-for="(c, idx) in certs" :key="idx" class="cert-card">
      <el-image v-if="c.imageUrl" :src="c.imageUrl" :preview-src-list="[c.imageUrl]" :preview-teleported="true" fit="contain" class="cert-img" />
      <div v-if="c.issuer" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.cert.issuer') }}</span>
        <span class="t-kv__val">{{ c.issuer }}</span>
      </div>
      <div v-if="c.certNo" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.cert.certNo') }}</span>
        <span class="t-kv__val">{{ c.certNo }}</span>
      </div>
      <div v-if="c.validFrom || c.validTo" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.cert.validity') }}</span>
        <span class="t-kv__val">{{ validityText(c.validFrom, c.validTo) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PublicTraceVo } from '@/api/trace/types';

const props = defineProps<{ trace: PublicTraceVo; certType: string }>();
const { t } = useI18n();

const certs = computed(() => (props.trace.organicCerts ?? []).filter((c) => c.certType === props.certType));
const pageTitle = computed(() => (props.certType === 'plot' ? t('tracePublic.title.plotCert') : t('tracePublic.title.cropCert')));

function validityText(from?: string, to?: string): string {
  if (from && to) return `${from} ${t('tracePublic.cert.validTo')} ${to}`;
  return to || from || '';
}
</script>

<style lang="scss" scoped>
@use './trace-h5.scss';

.cert-page {
  padding: 12px;
}
.cert-page__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}
.cert-card {
  background: #fff;
  border: 2px solid #2f7c44;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(47, 124, 68, 0.12);
  margin-bottom: 16px;
}
.cert-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f5f7fa;
}
</style>
