<template>
  <div class="p-2">
    <!-- 当日损耗条（V4，果疏产品全流程处理.docx）：compute-on-read 聚合果蔬流水，纯展示 -->
    <div v-loading="lossLoading" class="veg-loss-bar">
      <span class="loss-title">{{ t('djs.warehouse.packEntry.vegDailyLoss') }}</span>
      <span class="loss-item">{{ t('djs.warehouse.packEntry.vegLossPicked') }} {{ fmt(loss?.pickedWeight) }}{{ t('djs.warehouse.packEntry.vegLossUnit') }}</span>
      <span class="loss-sep">−</span>
      <span class="loss-item">{{ t('djs.warehouse.packEntry.vegLossPacked') }} {{ fmt(loss?.packedWeight) }}{{ t('djs.warehouse.packEntry.vegLossUnit') }}</span>
      <span class="loss-sep">−</span>
      <span class="loss-item">{{ t('djs.warehouse.packEntry.vegLossReturned') }} {{ fmt(loss?.returnedWeight) }}{{ t('djs.warehouse.packEntry.vegLossUnit') }}</span>
      <span class="loss-sep">−</span>
      <span class="loss-item">{{ t('djs.warehouse.packEntry.vegLossFeed') }} {{ fmt(loss?.feedWeight) }}{{ t('djs.warehouse.packEntry.vegLossUnit') }}</span>
      <span class="loss-value">{{ t('djs.warehouse.packEntry.vegLossValue') }} {{ fmt(loss?.lossWeight) }}{{ t('djs.warehouse.packEntry.vegLossUnit') }}</span>
      <el-tooltip :content="t('djs.warehouse.packEntry.vegLossHint')" placement="top">
        <el-icon class="loss-help"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <!-- 果蔬打包：发送位置仅「发货月台」（去掉邮寄/礼盒，row110）；plot-group 顶部地块来源选择 -->
    <SkuPackForm
      kind="veg"
      :product-type="1"
      belong-type="vegetable"
      :send-dest-kinds="['platform']"
      :title="t('djs.warehouse.packEntry.vegTitle')"
      plot-group
      :show-source="false"
      wide
      @submitted="loadLoss"
    />
  </div>
</template>

<script setup name="PackEntryVeg" lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { QuestionFilled } from '@element-plus/icons-vue';
import SkuPackForm from '../SkuPackForm.vue';
import { getVegDailyLoss } from '@/api/djs-warehouse/packEntry';
import type { VegDailyLossVO } from '@/api/djs-warehouse/packEntry';

const { t } = useI18n();

const loss = ref<VegDailyLossVO>();
const lossLoading = ref(false);

/** 数字保留 3 位（与后端 kg 精度一致），空兜 0。 */
function fmt(v: number | undefined): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : '0.000';
}

/** 拉当日损耗（提交成功后由 SkuPackForm @submitted 触发刷新）。 */
async function loadLoss() {
  lossLoading.value = true;
  try {
    const res = await getVegDailyLoss();
    loss.value = res.data;
  } finally {
    lossLoading.value = false;
  }
}

onMounted(loadLoss);
</script>

<style scoped>
.veg-loss-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 14px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}
.loss-title {
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.loss-item {
  color: var(--el-text-color-regular);
}
.loss-sep {
  color: var(--el-text-color-placeholder);
}
.loss-value {
  font-weight: 700;
  color: var(--el-color-warning-dark-2);
  margin-left: 4px;
}
.loss-help {
  color: var(--el-text-color-placeholder);
  cursor: help;
}
</style>
