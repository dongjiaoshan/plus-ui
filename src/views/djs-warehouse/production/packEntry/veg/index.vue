<template>
  <div class="p-2">
    <!-- 果蔬打包：发送位置仅「发货月台」（去掉邮寄/礼盒，row110）；plot-group 顶部地块来源选择 -->
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
