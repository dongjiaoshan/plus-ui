<template>
  <div class="p-2">
    <!-- 产品打包：去掉普通产品/礼盒 tab 切换（row113），直接产品打包台；
         发送位置仅「发货月台」（去掉邮寄，row111）；隐藏猪只耳号 chip（其他产品无耳号，row111）；
         只有「确认」无追溯码打印。
         统一目标模型（2026-06-20）：其他产品（egg/dry_good/other 原料 attr=2）领用后产 inhouse，
         打包同 dry 口走「今天领用的其他业态原料 inhouse」做来源。故开 show-source 让工人选来源 chip，
         使 sourceInhouseId 有值、提交不再触发后端 @NotNull 400；卡片库存（show-stock）走成品
         product_material → 原料 location_stock，对其他产品成立。 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      :belong-types="['egg', 'dry_good', 'other']"
      :title="t('djs.warehouse.packEntry.otherTitle')"
      :send-dest-kinds="['platform']"
      :show-print-trace="false"
      :show-stock="true"
      :show-source="true"
      :show-ear="false"
    />
  </div>
</template>

<script setup name="PackEntryOther" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
