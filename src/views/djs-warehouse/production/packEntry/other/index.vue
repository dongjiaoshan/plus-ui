<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="px-2">
      <el-tab-pane :label="t('djs.warehouse.packEntry.otherProductTab')" name="product">
        <SkuPackForm kind="dry" :product-type="1" :title="t('djs.warehouse.packEntry.otherTitle')" />
      </el-tab-pane>
      <el-tab-pane :label="t('djs.warehouse.packEntry.otherGiftTab')" name="gift">
        <SkuPackForm kind="gift" :product-type="3" :title="t('djs.warehouse.packEntry.giftTitle')" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="PackEntryOther" lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
const activeTab = ref('product');
</script>
