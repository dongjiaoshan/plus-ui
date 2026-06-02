<template>
  <div>
    <el-empty v-if="!events || events.length === 0" :description="t('warehouseTrace.timeline.empty')" :image-size="80" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="(ev, idx) in events"
        :key="ev.id || idx"
        :timestamp="ev.traceTime || ''"
        placement="top"
        :type="idx === events.length - 1 ? 'primary' : 'success'"
        :hollow="idx !== events.length - 1"
      >
        <div class="timeline-node">
          <div class="timeline-node__head">
            <dict-tag :options="djs_trace_content" :value="ev.traceContent" />
            <span v-if="ev.operatorName" class="timeline-node__operator">{{ t('warehouseTrace.timeline.operator') }}：{{ ev.operatorName }}</span>
          </div>
          <div v-if="parsedExtra(ev.eventData)" class="timeline-node__extra">{{ parsedExtra(ev.eventData) }}</div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup name="TraceEventTimeline" lang="ts">
import type { TraceEventVO } from '@/api/warehouse/trace/types';
import { useI18n } from 'vue-i18n';

withDefaults(
  defineProps<{
    events?: TraceEventVO[];
  }>(),
  { events: () => [] }
);

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_trace_content } = toRefs<any>(proxy?.useDict('djs_trace_content'));

/** eventData 是事件上下文 JSON（V1 多 NULL）；尝试解析出可读说明，解析失败原样兜底。 */
function parsedExtra(raw?: string): string {
  if (!raw || raw.trim() === '') {
    return '';
  }
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') {
      const desc = (obj as Record<string, unknown>).desc ?? (obj as Record<string, unknown>).note ?? (obj as Record<string, unknown>).remark;
      if (typeof desc === 'string') {
        return desc;
      }
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join('，');
    }
  } catch {
    return raw;
  }
  return raw;
}
</script>

<style lang="scss" scoped>
.timeline-node {
  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__operator {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__extra {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    word-break: break-all;
  }
}
</style>
