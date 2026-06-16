<template>
  <div class="p-2">
    <!-- 果蔬打包：发送位置仅「发货月台」（去掉邮寄/礼盒，row110）；plot-group 顶部地块来源选择 -->
    <SkuPackForm kind="veg" :product-type="1" belong-type="vegetable" :send-dest-kinds="['platform']" :title="t('djs.warehouse.packEntry.vegTitle')" plot-group />
  </div>
</template>

<script setup name="PackEntryVeg" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
