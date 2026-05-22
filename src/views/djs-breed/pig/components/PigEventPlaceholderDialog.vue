<template>
  <el-dialog v-model="visible" :title="title" width="560" append-to-body :close-on-click-modal="false" @closed="onClosed">
    <el-alert :title="t('pig.event.placeholderHint')" type="warning" :closable="false" show-icon class="mb-3" />

    <el-descriptions :column="1" border size="small">
      <el-descriptions-item :label="t('pig.column.earNo')">{{ pig?.earNo }}</el-descriptions-item>
      <el-descriptions-item :label="t('pig.column.currentStatus')">
        <dict-tag v-if="pig" :options="lifecycleDict" :value="pig.currentStatus" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('pig.event.target')">
        <span>{{ eventLabel }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <div v-if="payloadFields.length" class="mt-3">
      <div class="payload-title">{{ t('pig.event.payloadFields') }}</div>
      <ul class="payload-list">
        <li v-for="(item, idx) in payloadFields" :key="idx">
          <code>{{ item.key }}</code>
          <span class="payload-desc">— {{ item.desc }}</span>
        </li>
      </ul>
    </div>

    <template #footer>
      <el-button @click="onCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="onConfirm">
        {{ t('pig.event.fireAnyway') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="PigEventPlaceholderDialog">
/**
 * BRD-CORE-001 — 事件触发占位 modal。
 *
 * 用途：D5 / D6 阶段 BRD-EVENT-001~005 还没全实现，本对话框：
 *  - 显示该事件需要的 payload 字段名（前端只展示，不收集真实输入）；
 *  - 点 "强制触发" 直接调 `POST /djs/breed/pig/event`（仅 boss 可见，用于调试）；
 *  - 下游 BRD-EVENT-* 接管后，本 modal 不再用，父页跳真实业务表单页。
 *
 * 真实业务表单不收 payload 字段是因为 OESTRUS / NULL_RETURN / TRANSFER 字段语义复杂，
 * 不应让运维盲点。事件按钮在 boss 角色下兜底用，普通用户走小程序触发。
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useDict } from '@/utils/dict';
import type { PigEventForm, PigStatusEventCode, PigVO } from '@/api/djs-breed/pig/types';
import { firePigEvent } from '@/api/djs-breed/pig';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const { t } = useI18n();
const dict = useDict('djs_pig_lifecycle', 'djs_pig_status_event');
const lifecycleDict = computed(() => dict['djs_pig_lifecycle'] ?? []);
const eventDict = computed(() => dict['djs_pig_status_event'] ?? []);

const visible = ref(false);
const submitting = ref(false);
const pig = ref<PigVO | null>(null);
const eventType = ref<PigStatusEventCode | null>(null);

const title = computed(() => t('pig.event.dialogTitle'));

const eventLabel = computed(() => {
  if (!eventType.value) return '';
  const hit = eventDict.value.find((d) => d.value === eventType.value);
  return hit?.label ?? eventType.value;
});

interface PayloadFieldHint {
  key: string;
  desc: string;
}

const payloadFields = computed<PayloadFieldHint[]>(() => {
  switch (eventType.value) {
    case 'OESTRUS':
      return [{ key: 'isPregnantConfirmed', desc: t('pig.event.payloadDesc.oestrus') }];
    case 'NULL_RETURN':
      return [{ key: 'abnormalType', desc: t('pig.event.payloadDesc.nullReturn') }];
    case 'TRANSFER':
      return [
        { key: 'newBarnId', desc: t('pig.event.payloadDesc.transferBarn') },
        { key: 'newPenId', desc: t('pig.event.payloadDesc.transferPen') }
      ];
    default:
      return [];
  }
});

function open(target: PigVO, ev: PigStatusEventCode) {
  pig.value = target;
  eventType.value = ev;
  visible.value = true;
}

function onCancel() {
  visible.value = false;
}

function onClosed() {
  pig.value = null;
  eventType.value = null;
}

async function onConfirm() {
  if (!pig.value || !eventType.value) return;
  submitting.value = true;
  try {
    const form: PigEventForm = {
      pigId: pig.value.id,
      eventType: eventType.value
    };
    await firePigEvent(form);
    ElMessage.success(t('pig.event.fireSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.payload-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.payload-list {
  margin: 0;
  padding-left: 20px;
}

.payload-list li {
  font-size: 13px;
  line-height: 1.8;
}

.payload-desc {
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mt-3 {
  margin-top: 12px;
}
</style>
