<template>
  <!--
    V6-R35：种植计划详情弹框。
    - destroy-on-close：关闭即销毁内部面板，下次打开是全新实例 → 必然重新拉数据
      （甲方原话「目前框架上在 TAP 里点开的详情没有办法进行刷新」，根因就是 tagsView keep-alive）。
    - 不设 close-on-click-modal（Element Plus 默认 true = 点蒙层可关），符合 CLAUDE.md §6 强约束 13。
  -->
  <el-dialog v-model="visible" :title="t('plantPlan.detail.title')" width="90%" top="5vh" append-to-body destroy-on-close>
    <!-- 内容高（基本信息 + 明细宽表 + 甘特图）：弹框内部纵向滚动，不让整页被撑开 -->
    <div class="plan-detail-dialog__body">
      <PlanDetailPanel v-if="visible && planId" :plan-id="planId" @changed="emit('changed')" />
    </div>
  </el-dialog>
</template>

<script setup name="PlanDetailDialog" lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PlanDetailPanel from './PlanDetailPanel.vue';

const props = defineProps<{
  modelValue: boolean;
  planId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  /** 面板内发生了写操作（编辑保存 / 删明细 / 后台调整），列表页据此刷新。 */
  (e: 'changed'): void;
}>();

const { t } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});
</script>

<style scoped>
.plan-detail-dialog__body {
  max-height: 76vh;
  overflow-y: auto;
  /* 明细表 15+ 列由 el-table 自身横向滚动，这里只管纵向 */
  overflow-x: hidden;
}
</style>
