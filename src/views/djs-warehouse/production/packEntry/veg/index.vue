<template>
  <div>
    <!-- ⚠️ 注释一律写在根 div 之内：写在根节点外面会让 SFC 编译成 Fragment（多根），
         AppMain 的 transition mode="out-in" 解析不出唯一过渡子节点 → leave 永不完成，
         从本页切走后 .app-main 只剩一个注释占位节点、后续所有页面全白（仅 vite dev 复现，
         build:prod 会剥注释）。另：不加外层 padding —— 留白全由 .pack-station--dense 自己控。 -->
    <!-- 果蔬打包：发送位置仅「发货月台」（去掉邮寄/礼盒，row110）；plot-group 顶部地块来源选择；
         dense=一体秤小屏紧凑布局（贴顶 + 页标题挪左列 + 刷新缩小绝对定位 + numpad 4×3 + dvh 页高），整页零滚动；
         scaleFill=重量录入接本机电子秤（果蔬按克录入，状态条 + 自动填入，开时录入值镜像秤读数、取下回 0） -->
    <SkuPackForm
      ref="packFormRef"
      kind="veg"
      :product-type="1"
      belong-type="vegetable"
      :send-dest-kinds="['platform', 'gift']"
      :title="t('djs.warehouse.packEntry.vegTitle')"
      plot-group
      :show-source="false"
      wide
      :hide-pack-no="true"
      dense
      scale-fill
      @submitted="handleSubmitted"
    />
  </div>
</template>

<script setup name="PackEntryVeg" lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();

const packFormRef = ref<InstanceType<typeof SkuPackForm>>();

/**
 * 每次「确定生产产品」成功后页面自动刷新一次（row130#3）。
 * row130#5「需求量不减」根因是前端不刷新：后端各打包路径已扣 shipped_count，reload 重拉即呈现减后需求量。
 */
function handleSubmitted() {
  void packFormRef.value?.reload();
}
</script>
