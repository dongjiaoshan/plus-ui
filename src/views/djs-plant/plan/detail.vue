<template>
  <div class="p-4">
    <PlanDetailPanel ref="panelRef" :plan-id="planId" @loaded="onPanelLoaded">
      <template #header-extra>
        <el-button link @click="goList">{{ t('plantPlan.wizard.backToList') }}</el-button>
      </template>
    </PlanDetailPanel>
  </div>
</template>

<script setup name="PlantPlanDetail" lang="ts">
/**
 * 种植计划详情 · 路由页（隐藏菜单 8078 `plan/detail`）。
 *
 * V6-R35 起列表的「详情」走弹框（`components/PlanDetailDialog.vue`），本路由页保留：
 *   - 向导创建成功后 `tab.closeOpenPage({ path: PLAN_BASE + '/detail', query:{ id } })` 仍跳这里；
 *   - 菜单 8078 是已有 sys_menu 行 + role_menu 授权，删它要改 DDL 且牵连角色授权，没有收益，故不删。
 * 正文与弹框共用同一个 PlanDetailPanel，不会出现两套实现漂移。
 *
 * 本页只负责：取 query.id、给「返回列表」、支持 ?edit=1 直接进编辑态。
 */
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import PlanDetailPanel from './components/PlanDetailPanel.vue';
import { PLAN_BASE } from './route';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const panelRef = ref<InstanceType<typeof PlanDetailPanel>>();
const planId = ref<string>('');
/** ?edit=1 只在首次数据到位后进一次编辑态，之后保存/取消不再重复触发 */
const pendingEnterEdit = ref(false);

onMounted(() => {
  const id = route.query.id as string;
  if (!id) {
    ElMessage.error(t('plantPlan.detail.missingId'));
    router.replace(PLAN_BASE);
    return;
  }
  pendingEnterEdit.value = route.query.edit === '1';
  planId.value = id;
});

function onPanelLoaded() {
  if (!pendingEnterEdit.value) return;
  pendingEnterEdit.value = false;
  panelRef.value?.enterEdit();
  // 去掉 ?edit=1，避免 tagsView 复用该 tag 时又自动进编辑
  router.replace({ path: route.path, query: { id: planId.value } });
}

function goList() {
  router.push(PLAN_BASE);
}
</script>
