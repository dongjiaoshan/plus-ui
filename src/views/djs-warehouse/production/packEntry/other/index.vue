<template>
  <div class="p-2">
    <!-- 其他产品打包管理：纯领用驱动（领用其他业态原料 → 反查命中成品），对齐肉品/果蔬口径。
         发送位置仅「发货月台」（去掉邮寄，row111）；隐藏猪只耳号 chip（其他产品无耳号，row111）；
         只有「确认」无追溯码打印。
         统一目标模型（2026-06-20）：其他产品（egg/dry_good/other 原料 attr=2）领用后产 inhouse，
         打包同 dry 口走「今天领用的其他业态原料 inhouse」做来源。其他产品无追溯码、来源对工人无意义，
         故用 auto-source 隐藏来源选择 panel、选目标成品后按其有效原材料自动解析来源 inhouse
         （sourceInhouseId 自动有值，提交不触发后端 @NotNull 400），不再让工人手选来源 chip。
         目标产品仅「生产产品」(product-attr=1)：原料(attr=2)只能当来源、不能当打包目标，
         否则原料本身（如土鸡蛋）会和它对应的成品一起出现在卡片里（重复「土鸡蛋」），对齐肉品打包 attr=1 口径。
         卡片库存（show-stock）= 成品有效原料的「今天领用待打包 inhouse」余量（= 后端 consumeInhouse 扣减口径），
         按原料单位展示；不取仓库 location_stock 全量（那是仓库总余额、会误导）。
         门店需求只在底部「门店(N份)」标签做参考展示，不参与决定列表里出现哪些成品（领用驱动，不混排礼盒）。 -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      :product-attr="1"
      :belong-types="['egg', 'dry_good', 'other']"
      :title="t('djs.warehouse.packEntry.otherTitle')"
      :send-dest-kinds="['platform', 'gift']"
      :show-print-trace="false"
      :show-stock="true"
      :show-source="false"
      :auto-source="true"
      :show-ear="false"
      wide
    />
  </div>
</template>

<script setup name="PackEntryOther" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
