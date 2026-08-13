<template>
  <div>
    <!-- ⚠️ 注释一律写在根 div 之内：写在根节点外面会让 SFC 编译成 Fragment（多根），
         AppMain 的 transition mode="out-in" 解析不出唯一过渡子节点 → leave 永不完成，
         从本页切走后 .app-main 只剩一个注释占位节点、后续所有页面全白（仅 vite dev 复现，
         build:prod 会剥注释）。另：不加外层 padding —— 留白全由 .pack-station--dense 自己控。 -->
    <!-- 礼盒打包：按 belong_type='gift_box' 列出全部礼盒产品（djs_product_type 已废弃 3，礼盒 = 自产 + belong_type=gift_box），
         右台输盒数（packBoxCount）。门店选择走「需求驱动」（底部门店需求 tags）；无来源选择（kind='gift' 模板隐藏来源区）、无追溯码打印。
         发送位置=发货月台（礼盒是终端成品、打包后须发往门店，deliver_dest='platform' 进发货月台）。
         dense=一体秤小屏紧凑布局（贴顶 + 页标题挪左列 + 刷新缩小绝对定位 + numpad 4×3 + dvh 页高），整页零滚动。
         不接秤（scale-fill）：礼盒录的是盒数不是重量，showScaleBar 对 kind='gift' 恒 false，传了也是死代码。 -->
    <SkuPackForm
      kind="gift"
      belong-type="gift_box"
      :send-dest-kinds="['platform']"
      :show-print-trace="false"
      :title="t('djs.warehouse.packEntry.giftTitle')"
      wide
      :hide-pack-no="true"
      dense
    />
  </div>
</template>

<script setup name="PackEntryGift" lang="ts">
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();
</script>
