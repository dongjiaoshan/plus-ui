<template>
  <!-- 不加外层 padding：dense 要求右操作台贴住可视区上沿，留白全由 pack-station--dense 自己控 -->
  <div>
    <!-- 肉品打包：仅猪肉成品（belong_type=pork + product_attr=1 生产产品，取数逻辑 doc#13）；
         发送位置仅「发货月台」（去掉邮寄/礼盒）；卡片库存=成品 product_material 指向的原材料实时库存（与扣减口径一致）；
         顶部按已领用出库猪肉来源耳号去重列出耳号选择条（row107）；来源产品区隐藏，只按猪只耳号溯源（门店做溯源码），
         选耳号后自动绑定该耳号来源；
         dense=一体秤小屏紧凑布局（贴顶 + 页标题挪左列 + 刷新缩小绝对定位 + numpad 4×3 + dvh 页高），整页零滚动；
         scaleFill=重量录入接本机电子秤（状态条 + 自动填入，开时录入值镜像秤读数、取下回 0） -->
    <SkuPackForm
      kind="dry"
      :product-type="1"
      belong-type="pork"
      :product-attr="1"
      :send-dest-kinds="['platform', 'gift']"
      ear-group
      :show-source="false"
      :show-ear="false"
      wide
      weight-in-gram
      :hide-pack-no="true"
      auto-select-first
      dense
      scale-fill
      :title="t('djs.warehouse.packEntry.meatTitle')"
    />
  </div>
</template>

<script setup name="PackEntryMeat" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
