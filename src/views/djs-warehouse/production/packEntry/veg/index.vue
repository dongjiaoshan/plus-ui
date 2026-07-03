<template>
  <div class="p-2">
    <!-- 顶部工具条：右侧「刷新」按钮，点击重新拉页面数据（row130#2）。原「当日损耗」条已去掉（row130#1）。 -->
    <div class="veg-toolbar">
      <el-button :icon="Refresh" @click="handleRefresh">{{ t('common.refresh') }}</el-button>
    </div>

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
import { Refresh } from '@element-plus/icons-vue';
import SkuPackForm from '../SkuPackForm.vue';

const { t } = useI18n();

const packFormRef = ref<InstanceType<typeof SkuPackForm>>();

/** 「刷新」按钮：重新拉打包台全部数据（来源 / 成品 / 门店需求 / 库存）。（row130#2） */
function handleRefresh() {
  void packFormRef.value?.reload();
}

/**
 * 每次「确定生产产品」成功后页面自动刷新一次（row130#3）。
 * TODO(后端轨 WS2)：需求量「不减少」由后端处理；前端 reload 只负责把后端修正后的最新需求量重新拉回展示。
 */
function handleSubmitted() {
  void packFormRef.value?.reload();
}
</script>

<style scoped>
.veg-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
