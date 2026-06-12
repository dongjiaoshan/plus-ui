<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="px-2">
      <el-tab-pane :label="t('djs.warehouse.packEntry.otherProductTab')" name="product">
        <!-- 其他产品打包：发送方式二选(发货月台/邮寄)，无礼盒；只有「确认」无追溯码打印 -->
        <SkuPackForm
          kind="dry"
          :product-type="1"
          :title="t('djs.warehouse.packEntry.otherTitle')"
          :send-dest-kinds="['platform', 'mail']"
          :show-print-trace="false"
        />
      </el-tab-pane>
      <el-tab-pane :label="t('djs.warehouse.packEntry.otherGiftTab')" name="gift">
        <!-- 礼盒打包：原型无发送位置 + 无追溯码打印 -->
        <SkuPackForm kind="gift" :product-type="3" :title="t('djs.warehouse.packEntry.giftTitle')" :send-dest-kinds="[]" :show-print-trace="false" />
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
