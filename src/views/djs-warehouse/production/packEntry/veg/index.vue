<template>
  <div class="p-2">
    <SkuPackForm kind="veg" :product-type="1" :title="t('djs.warehouse.packEntry.vegTitle')" plot-group />
  </div>
</template>

<script setup name="PackEntryVeg" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
