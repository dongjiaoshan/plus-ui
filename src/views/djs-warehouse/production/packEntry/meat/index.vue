<template>
  <div class="p-2">
    <!-- 肉品打包：仅猪肉产品（belong_type=pork），发送位置仅「发货月台」（去掉邮寄/礼盒）；
         顶部按已领用出库猪肉来源耳号去重列出耳号选择条（row107），选耳号再选该耳号来源 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      belong-type="pork"
      :product-workshop="3"
      :send-dest-kinds="['platform']"
      ear-group
      :title="t('djs.warehouse.packEntry.meatTitle')"
    />
  </div>
</template>

<script setup name="PackEntryMeat" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
