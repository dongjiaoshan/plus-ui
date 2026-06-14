<template>
  <TraceLayout :title="product?.name || t('tracePublic.title.pork')" :trace-code="product?.produceCode || code" :cover="product?.imageUrl">
    <!-- 产品信息 -->
    <div class="t-card">
      <div class="t-section-title">{{ t('tracePublic.product.title') }}</div>
      <div class="t-product-body">
        <div class="t-product-img">
          <img v-if="product?.imageUrl" :src="product.imageUrl" alt="" />
          <div v-else class="t-img-ph">{{ t('tracePublic.product.noImage') }}</div>
        </div>
        <div class="t-product-info">
          <div class="t-product-name">{{ product?.name }}</div>
          <div v-if="product?.weight" class="t-product-meta">{{ t('tracePublic.product.weight') }}：{{ product.weight }}</div>
          <div v-if="product?.spec" class="t-product-meta">{{ t('tracePublic.product.spec') }}：{{ product.spec }}</div>
          <div class="t-product-meta">{{ t('tracePublic.product.code') }}：{{ product?.produceCode || code }}</div>
          <div v-if="product?.description" class="t-product-meta">{{ t('tracePublic.product.description') }}：{{ product.description }}</div>
        </div>
      </div>
    </div>

    <!-- 猪只追溯 -->
    <div v-if="pig" class="t-card">
      <div class="t-section-title">{{ t('tracePublic.pig.title') }}</div>
      <div v-if="pig.photoUrl" class="pig-photo">
        <img :src="pig.photoUrl" alt="" />
      </div>
      <div v-if="pig.earNo" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.earNo') }}</span>
        <span class="t-chip">{{ pig.earNo }}</span>
      </div>
      <div v-if="pig.sex" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.sex') }}</span>
        <span class="t-kv__val">{{ pigSexLabel(pig.sex) }}</span>
      </div>
      <div v-if="pig.weight" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.weight') }}</span>
        <span class="t-kv__val">{{ pig.weight }} {{ t('tracePublic.grow.weightUnit') }}</span>
      </div>
      <div v-if="pig.breed" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.breed') }}</span>
        <span class="t-kv__val">{{ pigBreedLabel(pig.breed) }}</span>
      </div>
      <div v-if="pig.farmName" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.farm') }}</span>
        <span class="t-kv__val">{{ pig.farmName }}</span>
      </div>
      <div v-if="pig.barnName" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.barn') }}</span>
        <span class="t-kv__val">{{ pig.barnName }}</span>
      </div>
      <div v-if="pig.birthDate" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.birth') }}</span>
        <span class="t-kv__val">{{ pig.birthDate }}</span>
      </div>
      <div v-if="pig.ageDays != null" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.ageDays') }}</span>
        <span class="t-kv__val">{{ pig.ageDays }} {{ t('tracePublic.pig.daysUnit') }}</span>
      </div>
      <div v-if="pig.marketDate" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.pig.market') }}</span>
        <span class="t-kv__val">{{ pig.marketDate }}</span>
      </div>
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

    <!-- 生长记录入口 -->
    <div v-if="hasGrowOrMed" class="t-card">
      <div class="t-entry" @click="emit('go', 'grow')">
        <div class="t-entry__main">
          <span>{{ t('tracePublic.growEntry.growth', { n: growthCount }) }}</span>
          <span class="t-entry__sub">{{ t('tracePublic.growEntry.medication', { n: medicationCount }) }}</span>
        </div>
        <div class="t-entry__arrow">
          <span>{{ t('tracePublic.growEntry.view') }}</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 父系 / 母系 -->
    <div v-if="showPedigree" class="t-card">
      <div class="t-section-title">{{ t('tracePublic.pedigree.title') }}</div>
      <div class="t-pedigree-cards">
        <div v-if="pedigree?.sireEarNo" class="t-pedigree-card">
          <div class="t-pedigree-head t-pedigree-head--sire">{{ t('tracePublic.pedigree.sire') }}</div>
          <div class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.earNo') }}</span>
            <span class="t-chip">{{ pedigree.sireEarNo }}</span>
          </div>
          <div v-if="pedigree.sireBreed" class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.breed') }}</span>
            <span class="t-kv__val">{{ pedigree.sireBreed }}</span>
          </div>
          <div v-if="pedigree.sireAgeDays != null" class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.ageDays') }}</span>
            <span class="t-kv__val">{{ pedigree.sireAgeDays }} {{ t('tracePublic.pedigree.daysUnit') }}</span>
          </div>
        </div>
        <div v-if="pedigree?.damEarNo" class="t-pedigree-card">
          <div class="t-pedigree-head t-pedigree-head--dam">{{ t('tracePublic.pedigree.dam') }}</div>
          <div class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.earNo') }}</span>
            <span class="t-chip">{{ pedigree.damEarNo }}</span>
          </div>
          <div v-if="pedigree.damBreed" class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.breed') }}</span>
            <span class="t-kv__val">{{ pedigree.damBreed }}</span>
          </div>
          <div v-if="pedigree.damAgeDays != null" class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.ageDays') }}</span>
            <span class="t-kv__val">{{ pedigree.damAgeDays }} {{ t('tracePublic.pedigree.daysUnit') }}</span>
          </div>
          <div v-if="pedigree.damParity != null" class="t-kv">
            <span class="t-kv__label">{{ t('tracePublic.pedigree.parity') }}</span>
            <span class="t-kv__val">{{ t('tracePublic.pedigree.parityValue', { n: pedigree.damParity }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 检验检疫（V1 数据源缺口恒空 → 隐藏） -->
    <div v-if="showQuarantine" class="t-card">
      <div class="t-section-title">{{ t('tracePublic.quarantine.title') }}</div>
      <div v-if="quarantine?.certNo" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.quarantine.certNo') }}</span>
        <span class="t-kv__val">{{ quarantine.certNo }}</span>
      </div>
      <div v-if="quarantine?.agency" class="t-kv">
        <span class="t-kv__label">{{ t('tracePublic.quarantine.agency') }}</span>
        <span class="t-kv__val">{{ quarantine.agency }}</span>
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
import { traceContentLabel, pigSexLabel, pigBreedLabel } from '@/api/trace/labels';
import TraceLayout from './TraceLayout.vue';

const props = defineProps<{ trace: PublicTraceVo; code: string }>();
const emit = defineEmits<{ (e: 'go', target: string, query?: Record<string, string>): void }>();
const { t } = useI18n();

const product = computed(() => props.trace.product ?? null);
const pig = computed(() => props.trace.pig ?? null);
const pedigree = computed(() => props.trace.pedigree ?? null);
const timeline = computed(() => props.trace.timeline ?? []);
const quarantine = computed(() => props.trace.quarantine ?? null);
const store = computed(() => props.trace.store ?? null);

const growthCount = computed(() => props.trace.growthRecords?.length ?? 0);
const medicationCount = computed(() => props.trace.medications?.length ?? 0);
const hasGrowOrMed = computed(() => growthCount.value > 0 || medicationCount.value > 0);
const showPedigree = computed(() => !!pedigree.value && (!!pedigree.value.sireEarNo || !!pedigree.value.damEarNo));
const showQuarantine = computed(() => !!quarantine.value && (!!quarantine.value.certNo || !!quarantine.value.agency));
const showStore = computed(() => !!store.value && (!!store.value.name || !!store.value.address));
</script>

<style lang="scss" scoped>
@use './trace-h5.scss';

.pig-photo {
  width: 100%;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}
.pig-photo img {
  width: 100%;
  display: block;
  border-radius: 8px;
}
</style>
