<template>
  <div class="p-2">
    <!-- 肉品打包：仅猪肉产品（belong_type=pork），发送位置仅「发货月台」（去掉邮寄/礼盒）；去掉来源产品 chip 展示（row105） -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      belong-type="pork"
      :send-dest-kinds="['platform']"
      :show-source="false"
      :title="t('djs.warehouse.packEntry.meatTitle')"
    />
  </div>
</template>

<script setup name="PackEntryMeat" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
