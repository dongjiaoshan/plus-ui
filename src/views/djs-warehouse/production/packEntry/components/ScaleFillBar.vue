<template>
  <!-- 秤状态条（挂在重量录入框正上方）：连接状态 + 稳定/晃动 + 自动填入开关。
       自动填入打开时录入值完全镜像秤推送重量（含取下回 0），口径见 useScaleAutoFill。
       异常原因挂状态胶囊的 tooltip，不额外占行高（一体秤小屏寸土必争）。 -->
  <div class="scale-bar">
    <el-tooltip v-if="tip" :content="tip" placement="top" :show-after="0">
      <span class="sb-status" :class="statusClass"><span class="dot" />{{ statusText }}</span>
    </el-tooltip>
    <span v-else class="sb-status" :class="statusClass"><span class="dot" />{{ statusText }}</span>

    <span v-if="connected && code !== 0" class="sb-badge" :class="isSteady ? 'ok' : 'warn'">
      {{ isSteady ? t('djs.warehouse.scale.steady') : t('djs.warehouse.scale.unstable') }}
    </span>

    <span class="sb-auto">
      {{ t('djs.warehouse.scale.autoFill') }}
      <el-switch v-model="cfg.autoFill" size="small" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScaleAutoFill } from '@/composables/useScaleAutoFill';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';

/**
 * 电子秤接入条（打包页 numpad 录入模式用；mini 的输入框形态见 ScaleWeightInput）。
 * 本组件持有秤连接（useScaleAutoFill）——**一页只放一个**，多放会各开一条 WS + 轮询。
 * v-model 绑父级录入值：自动填入开时按秤推送值实时改写（取下回 0），关掉则完全不碰，交给 numpad 手输。
 */
const props = defineProps<{
  modelValue: number | undefined;
  /** 录入单位是否为克（肉品/果蔬打包=true，秤给 kg → ×1000 取整）；否则 kg 三位小数 */
  inGram: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [v: number | undefined] }>();

const { t } = useI18n();
const cfg = useScaleConfigStore();

const { connected, isSteady, code, lastError } = useScaleAutoFill({
  inGram: () => props.inGram,
  current: () => props.modelValue,
  onFill: (v) => emit('update:modelValue', v)
});

/** 三态：未连接（灰）/ 秤异常 Code=0（黄，此时不跟随也不显示稳定性）/ 已连接（绿） */
const statusClass = computed<string>(() => (!connected.value ? 'off' : code.value === 0 ? 'err' : 'on'));
const statusText = computed<string>(() => {
  if (!connected.value) return t('djs.warehouse.scale.disconnected');
  if (code.value === 0) return t('djs.warehouse.scale.scaleError');
  return t('djs.warehouse.scale.connected');
});
/** 异常原因：未连接给排查提示，Code=0 优先给设备返回的原文 */
const tip = computed<string>(() => {
  if (!connected.value) return t('djs.warehouse.scale.offlineTip');
  if (code.value === 0) return lastError.value || t('djs.warehouse.scale.scaleError');
  return '';
});
</script>

<style scoped>
.scale-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}
.sb-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: default;
}
.sb-status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-info);
}
.sb-status.on {
  color: var(--el-color-success);
}
.sb-status.on .dot {
  background: var(--el-color-success);
}
.sb-status.off {
  color: var(--el-text-color-placeholder);
}
.sb-status.err {
  color: var(--el-color-warning);
}
.sb-status.err .dot {
  background: var(--el-color-warning);
}
.sb-badge {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}
.sb-badge.ok {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.sb-badge.warn {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.sb-auto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
