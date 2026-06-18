<template>
  <div class="p-2">
    <!-- 肉品打包：仅猪肉成品（belong_type=pork + product_attr=1 生产产品，取数逻辑 doc#13）；
         发送位置仅「发货月台」（去掉邮寄/礼盒）；卡片库存=成品 product_material 指向的原材料实时库存（与扣减口径一致）；
         顶部按已领用出库猪肉来源耳号去重列出耳号选择条（row107），选耳号再选该耳号来源 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      belong-type="pork"
      :product-attr="1"
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
