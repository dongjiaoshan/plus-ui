<template>
  <div class="p-2">
    <!-- 产品打包：去掉普通产品/礼盒 tab 切换（row113），直接产品打包台；
         发送位置仅「发货月台」（去掉邮寄，row111）；去掉来源产品 chip + 猪只耳号 chip（row111）；
         只有「确认」无追溯码打印；卡片无原材料库存行 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      :belong-types="['egg', 'dry_good', 'other']"
      :title="t('djs.warehouse.packEntry.otherTitle')"
      :send-dest-kinds="['platform']"
      :show-print-trace="false"
      :show-stock="false"
      :show-source="false"
      :show-ear="false"
    />
  </div>
</template>

<script setup name="PackEntryOther" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
