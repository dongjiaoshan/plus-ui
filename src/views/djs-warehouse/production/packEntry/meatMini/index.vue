<template>
  <div>
    <!-- 肉品打包「小屏测试」：与肉品打包同数据/同逻辑，仅开 mini 小屏模式
         （右台上移 / 卡片缩小一排多个 / 去 numpad / 秤重量做成可编辑输入框自动填入 / 去填入·归零·去皮）。
         验好后把 mini 相关改动回灌到正式页。 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      belong-type="pork"
      :product-attr="1"
      :send-dest-kinds="['platform', 'gift']"
      ear-group
      :show-source="false"
      :show-ear="false"
      weight-in-gram
      :hide-pack-no="true"
      auto-select-first
      mini
      :title="t('djs.warehouse.packEntry.meatTitle')"
    />
  </div>
</template>

<script setup name="PackEntryMeatMini" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
