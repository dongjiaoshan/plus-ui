<template>
  <el-dialog
    v-model="visible"
    :title="t('pig.detail.title', { earNo: detail?.earNo ?? '' })"
    width="780"
    append-to-body
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <el-tabs v-model="activeTab">
      <!-- 概览 -->
      <el-tab-pane :label="t('pig.detail.tab.overview')" name="overview">
        <div v-if="loading" v-loading="loading" class="loading-box" />
        <template v-else-if="detail">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item :label="t('pig.column.earNo')">{{ detail.earNo }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.earTag')">{{ detail.earTag || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.pigSex')">{{ sexLabel }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.pigType')">
              <dict-tag :options="pigTypeDict" :value="detail.pigType" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.currentStatus')">
              <dict-tag :options="lifecycleDict" :value="detail.currentStatus" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.statusStartedAt')">{{ detail.statusStartedAt || '—' }}</el-descriptions-item>
            <el-descriptions-item v-if="detail.currentStatus === 'END'" :label="t('pig.column.endReason')">
              <dict-tag :options="endReasonDict" :value="detail.endReason" />
            </el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.pigBreedCode')">{{ detail.pigBreedCode || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.pigStrainCode')">{{ detail.pigStrainCode || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.birthDate')">{{ detail.birthDate || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.introduceDate')">{{ detail.introduceDate || '—' }}</el-descriptions-item>
            <el-descriptions-item v-if="detail.pigSex === 'F'" :label="t('pig.column.parity')">{{ detail.parity ?? '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.barn')">{{ detail.barnCode || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.pen')">{{ detail.penCode || '—' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.motherEar')">
              <el-link v-if="detail.motherEar" type="primary" @click="onOpenParent('mother')">{{ detail.motherEar }}</el-link>
              <span v-else>—</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.fatherEar')">
              <el-link v-if="detail.fatherEar" type="primary" @click="onOpenParent('father')">{{ detail.fatherEar }}</el-link>
              <span v-else>—</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('pig.column.remark')" :span="2">{{ detail.remark || '—' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-tab-pane>

      <!-- 状态变更历史 -->
      <el-tab-pane :label="t('pig.detail.tab.history')" name="history" lazy>
        <div v-if="historyLoading" v-loading="historyLoading" class="loading-box" />
        <el-empty v-else-if="!history.length" :description="t('pig.detail.historyEmpty')" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="(rec, idx) in history"
            :key="rec.id"
            :timestamp="rec.changeTime"
            :type="timelineColor(rec.eventType)"
            :hollow="idx !== 0"
            placement="top"
          >
            <div class="history-row">
              <dict-tag :options="eventDict" :value="rec.eventType" />
              <span class="status-transition">
                <span v-if="rec.oldStatus">
                  <dict-tag :options="lifecycleDict" :value="rec.oldStatus" />
                </span>
                <span v-else class="status-init">{{ t('pig.detail.historyInit') }}</span>
                <el-icon class="arrow"><ArrowRight /></el-icon>
                <dict-tag :options="lifecycleDict" :value="rec.newStatus" />
              </span>
              <span v-if="rec.durationDays != null" class="duration">
                {{ t('pig.detail.duration', { days: rec.durationDays }) }}
              </span>
            </div>
            <div v-if="rec.relatedEventId" class="related-id">
              {{ t('pig.detail.relatedEvent', { id: String(rec.relatedEventId) }) }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <!-- 健康记录占位（BRD-MED-003） -->
      <el-tab-pane :label="t('pig.detail.tab.health')" name="health" lazy>
        <el-empty :description="t('pig.detail.healthPlaceholder')" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <PigEventDropdown v-if="detail" :pig="detail" @select="onEventSelect" />
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
    </template>

    <PigEventPlaceholderDialog ref="eventDialogRef" @success="onEventSuccess" />
  </el-dialog>
</template>

<script setup lang="ts" name="PigDetailModal">
/**
 * 猪只详情 modal（BRD-CORE-001）。3 tab：
 *  - overview：基本信息 + 当前状态徽章 + 谱系
 *  - history：状态变更时间线（拉全量 /history，最多 200 条）
 *  - health：BRD-MED-003 placeholder
 *
 * 触发事件：footer 暴露 PigEventDropdown — 选事件后弹 PigEventPlaceholderDialog
 * 显示该事件需要的 payload 字段（运维 / boss 可强制触发，普通业务走 BRD-EVENT-* 端点）。
 */
import { computed, nextTick, ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useDict } from '@/utils/dict';
import { getPig, listPigHistory } from '@/api/djs-breed/pig';
import type { PigDetailVO, PigStatusEventCode, PigStatusRecordVO, PigVO } from '@/api/djs-breed/pig/types';
import PigEventDropdown from './PigEventDropdown.vue';
import PigEventPlaceholderDialog from './PigEventPlaceholderDialog.vue';

const emit = defineEmits<{
  (e: 'event-fired'): void;
  (e: 'open-related-ear', earNo: string): void;
}>();

const { t } = useI18n();
const dict = useDict('djs_pig_lifecycle', 'djs_pig_status_event', 'djs_pig_type', 'djs_pig_end_reason');
const lifecycleDict = computed(() => dict['djs_pig_lifecycle'] ?? []);
const eventDict = computed(() => dict['djs_pig_status_event'] ?? []);
const pigTypeDict = computed(() => dict['djs_pig_type'] ?? []);
const endReasonDict = computed(() => dict['djs_pig_end_reason'] ?? []);

const visible = ref(false);
const activeTab = ref<'overview' | 'history' | 'health'>('overview');
const loading = ref(false);
const historyLoading = ref(false);
const detail = ref<PigDetailVO | null>(null);
const history = ref<PigStatusRecordVO[]>([]);

const eventDialogRef = ref<{ open: (pig: PigVO, ev: PigStatusEventCode) => void }>();

const sexLabel = computed(() => {
  if (!detail.value) return '';
  return detail.value.pigSex === 'F' ? t('pig.sex.female') : t('pig.sex.male');
});

const timelineColorMap: Record<PigStatusEventCode, '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  INTRO: 'primary',
  BREED: 'primary',
  FARROW: 'success',
  WEAN: 'success',
  OESTRUS: 'info',
  NULL_RETURN: 'warning',
  DIE: 'danger',
  ELIMINATE: 'danger',
  CASTRATE: 'info',
  TRANSFER: 'info',
  SLAUGHTER: 'warning'
};

function timelineColor(ev: PigStatusEventCode) {
  return timelineColorMap[ev] ?? '';
}

async function open(id: number | string) {
  visible.value = true;
  activeTab.value = 'overview';
  detail.value = null;
  history.value = [];
  loading.value = true;
  try {
    const res = await getPig(id);
    detail.value = res.data;
  } finally {
    loading.value = false;
  }
  // 异步预拉 history（不阻塞 overview 渲染）
  loadHistory(id);
}

async function loadHistory(id: number | string) {
  historyLoading.value = true;
  try {
    const res = await listPigHistory(id);
    history.value = res.data ?? [];
  } finally {
    historyLoading.value = false;
  }
}

function onClosed() {
  detail.value = null;
  history.value = [];
}

function onEventSelect(ev: PigStatusEventCode, pig: PigVO) {
  nextTick(() => {
    eventDialogRef.value?.open(pig, ev);
  });
}

async function onEventSuccess() {
  emit('event-fired');
  // 重拉 detail + history
  if (detail.value) {
    await open(detail.value.id);
    activeTab.value = 'history';
  }
}

function onOpenParent(kind: 'mother' | 'father') {
  if (!detail.value) return;
  const earNo = kind === 'mother' ? detail.value.motherEar : detail.value.fatherEar;
  if (!earNo) return;
  emit('open-related-ear', earNo);
}

defineExpose({ open });
</script>

<style scoped>
.loading-box {
  min-height: 200px;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-transition {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-init {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  border: 1px dashed var(--el-border-color);
  padding: 0 6px;
  border-radius: 4px;
}

.arrow {
  color: var(--el-text-color-secondary);
}

.duration {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.related-id {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
