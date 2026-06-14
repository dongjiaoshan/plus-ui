<template>
  <TraceLayout :title="title" :trace-code="product?.produceCode || code" :cover="product?.imageUrl">
    <!-- 产品信息 -->
    <div class="t-card">
      <div class="t-section-title">{{ t('tracePublic.product.title') }}</div>
      <div class="t-product-body">
        <div class="t-product-img">
          <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
          <div v-else class="t-img-ph">{{ t('tracePublic.product.noImage') }}</div>
        </div>
        <div class="t-product-info">
          <div class="t-product-name">{{ crop?.name || product?.name }}</div>
          <span v-if="plotTag" class="t-tag">{{ t('tracePublic.product.plotNo') }}：{{ plotTag }}</span>
          <div v-if="crop?.variety" class="t-product-meta">{{ t('tracePublic.product.variety') }}：{{ crop.variety }}</div>
          <div v-if="product?.spec" class="t-product-meta">{{ t('tracePublic.product.spec') }}：{{ product.spec }}</div>
          <div v-if="product?.weight" class="t-product-meta">{{ t('tracePublic.product.weight') }}：{{ product.weight }}</div>
          <div v-if="product?.growthDays != null" class="t-product-meta">
            {{ t('tracePublic.product.growthDays') }}：{{ product.growthDays }} {{ t('tracePublic.product.daysUnit') }}
          </div>
          <div v-if="product?.harvestDate" class="t-product-meta">{{ t('tracePublic.product.harvestDate') }}：{{ product.harvestDate }}</div>
          <div class="t-product-meta">{{ t('tracePublic.product.code') }}：{{ product?.produceCode || code }}</div>
          <div v-if="product?.description" class="t-product-meta">{{ t('tracePublic.product.description') }}：{{ product.description }}</div>
        </div>
      </div>
      <!-- 地块简表 -->
      <template v-if="plot">
        <div class="veg-divider"></div>
        <div v-if="plot.plotName" class="t-kv">
          <span class="t-kv__label">{{ t('tracePublic.plot.plotName') }}</span>
          <span class="t-kv__val">{{ plot.plotName }}</span>
        </div>
        <div v-if="plot.zoneName" class="t-kv">
          <span class="t-kv__label">{{ t('tracePublic.plot.zoneName') }}</span>
          <span class="t-kv__val">{{ plot.zoneName }}</span>
        </div>
        <div v-if="plot.area" class="t-kv">
          <span class="t-kv__label">{{ t('tracePublic.plot.area') }}</span>
          <span class="t-kv__val">{{ plot.area }} {{ t('tracePublic.plot.areaUnit') }}</span>
        </div>
      </template>
    </div>

    <!-- 流程时间轴 -->
    <div class="t-card">
      <div class="t-section-title">{{ t('tracePublic.timeline.title') }}</div>
      <div v-if="timeline.length === 0" class="t-empty">{{ t('tracePublic.timeline.empty') }}</div>
      <div v-for="(node, idx) in timeline" :key="idx" class="t-timeline-row">
        <div class="t-timeline-dot"></div>
        <div class="t-timeline-content">
          <span class="t-timeline-name">{{ traceContentLabel(node.traceContent) }}</span>
          <span v-if="node.traceTime" class="t-timeline-time">{{ node.traceTime }}</span>
          <span v-if="node.operatorName" class="t-timeline-op">{{ node.operatorName }}</span>
        </div>
      </div>
    </div>

    <!-- 下钻入口区 -->
    <div class="t-card">
      <div class="t-entry" @click="emit('go', 'plot-records')">
        <div class="t-entry__main">
          <span>{{ t('tracePublic.entry.farmRecords') }}</span>
          <span class="t-entry__sub">{{ workSummary }}</span>
        </div>
        <div class="t-entry__arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div v-if="cropCert" class="t-entry" @click="emit('go', 'cert', { certType: 'crop' })">
        <div class="t-entry__main">
          <span>{{ t('tracePublic.entry.cropCert') }}</span>
          <span v-if="cropCert.issuer || cropCert.certNo" class="t-entry__sub">{{ cropCert.issuer || cropCert.certNo }}</span>
        </div>
        <div class="t-entry__arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div v-if="plotCert" class="t-entry" @click="emit('go', 'cert', { certType: 'plot' })">
        <div class="t-entry__main">
          <span>{{ t('tracePublic.entry.plotCert') }}</span>
          <span v-if="plotCert.issuer || plotCert.certNo" class="t-entry__sub">{{ plotCert.issuer || plotCert.certNo }}</span>
        </div>
        <div class="t-entry__arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 销售门店 -->
    <div v-if="showStore" class="t-card">
      <div class="t-section-title">{{ t('tracePublic.store.title') }}</div>
      <div v-if="store?.name" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.store.name') }}</span>
        <span class="t-kv__val">{{ store.name }}</span>
      </div>
      <div v-if="store?.address" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.store.address') }}</span>
        <span class="t-kv__val">{{ store.address }}</span>
      </div>
    </div>
  </TraceLayout>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import type { PublicTraceVo } from '@/api/trace/types';
import { traceContentLabel, farmWorkTypeLabel } from '@/api/trace/labels';
import TraceLayout from './TraceLayout.vue';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();
const { t } = useI18n();

const product = computed(() => props.trace.product ?? null);
const crop = computed(() => props.trace.crop ?? null);
const plot = computed(() => props.trace.plot ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const plotRecords = computed(() => props.trace.plotRecords ?? []);
const organicCerts = computed(() => props.trace.organicCerts ?? []);
const store = computed(() => props.trace.store ?? null);

const title = computed(() => crop.value?.name || product.value?.name || t('tracePublic.title.veg'));
const plotTag = computed(() => plot.value?.plotName || product.value?.plotName || '');

const workSummary = computed(() => {
  const recs = plotRecords.value;
  if (recs.length === 0) return t('tracePublic.growEntry.view');
  const counts: Record<string, number> = {};
  recs.forEach((r) => {
    if (r.workType) counts[r.workType] = (counts[r.workType] ?? 0) + 1;
  });
  const parts = Object.entries(counts).map(([k, n]) => `${farmWorkTypeLabel(k)} ${n}`);
  return parts.join(' / ');
});

const cropCert = computed(() => organicCerts.value.find((c) => c.certType === 'crop') ?? null);
const plotCert = computed(() => organicCerts.value.find((c) => c.certType === 'plot') ?? null);
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use './trace-h5.scss';

.veg-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0;
}
</style>
