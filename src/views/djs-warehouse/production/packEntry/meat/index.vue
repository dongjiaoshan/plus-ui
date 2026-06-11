<template>
  <div class="p-2">
    <SkuPackForm kind="dry" :product-type="1" :title="t('djs.warehouse.packEntry.meatTitle')" />
  </div>
</template>

<script setup name="PackEntryMeat" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
