<template>
  <el-dropdown trigger="click" :disabled="terminal" @command="onCommand">
    <el-button :type="terminal ? 'info' : 'primary'" :disabled="terminal" size="small" link>
      {{ t('pig.action.fireEvent') }}
      <el-icon class="el-icon--right">
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="!allowedEvents.length" disabled>
          {{ t('pig.event.empty') }}
        </el-dropdown-item>
        <el-dropdown-item v-for="ev in allowedEvents" :key="ev" :command="ev">
          {{ t('pig.event.' + ev.toLowerCase()) }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts" name="PigEventDropdown">
/**
 * 猪只状态机事件触发 dropdown（BRD-CORE-001）。
 *
 * - 根据当前 pig 的 `currentStatus` + `pigSex` + `pigType` 过滤 11 events
 *   仅展示状态机允许的事件（终态 END 整体 disable，BREED 仅母猪等）。
 * - 点击事件 emit `select` 给父组件 — 父组件决定走"占位 modal 显示 payload 字段"
 *   还是跳真实业务表单页（BRD-EVENT-001/003 D5 接管；BRD-EVENT-002/004/005 D6+）。
 *
 * 真实 transition 校验由后端 PigStateMachine 兜底；前端漏判会被 503/500 拒绝。
 */
import { computed } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import type { PigStatusEventCode, PigVO } from '@/api/djs-breed/pig/types';
import { getAllowedEvents } from '../transition';

const props = defineProps<{
  pig: PigVO;
}>();

const emit = defineEmits<{
  (e: 'select', event: PigStatusEventCode, pig: PigVO): void;
}>();

const { t } = useI18n();

const terminal = computed(() => props.pig.currentStatus === 'END');

const allowedEvents = computed(() => getAllowedEvents(props.pig.currentStatus, props.pig.pigSex, props.pig.pigType));

function onCommand(ev: PigStatusEventCode) {
  emit('select', ev, props.pig);
}
</script>
