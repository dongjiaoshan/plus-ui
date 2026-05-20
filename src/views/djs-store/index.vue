<template>
  <div class="djs-placeholder">
    <h2>{{ t('djs.placeholder.title', { domain: '门店销售' }) }}</h2>
    <p>{{ t('djs.placeholder.subtitle') }}</p>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
