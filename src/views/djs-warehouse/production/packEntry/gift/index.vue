<template>
  <div class="p-2">
    <!-- 礼盒打包：按 belong_type='gift_box' 列出全部礼盒产品（djs_product_type 已废弃 3，礼盒 = 自产 + belong_type=gift_box），
         右台输盒数（packBoxCount）。门店选择走「需求驱动」（底部门店需求 tags）；无来源选择（kind='gift' 模板隐藏来源区）、无追溯码打印。
         发送位置=发货月台（礼盒是终端成品、打包后须发往门店，deliver_dest='platform' 进发货月台）。 -->
    <SkuPackForm
      kind="gift"
      belong-type="gift_box"
      :send-dest-kinds="['platform']"
      :show-print-trace="false"
      :title="t('djs.warehouse.packEntry.giftTitle')"
      wide
      :hide-pack-no="true"
    />
  </div>
</template>

<script setup name="PackEntryGift" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
