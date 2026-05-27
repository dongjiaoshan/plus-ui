<template>
  <el-dialog v-model="visible" :title="t('demand.history.title')" destroy-on-close append-to-body width="640px">
    <el-timeline v-if="entries.length > 0">
      <el-timeline-item v-for="(it, idx) in entries" :key="idx" :timestamp="formatTs(it.ts)" placement="top">
        <div class="flex items-center gap-2 mb-1">
          <dict-tag :options="djs_demand_status" :value="it.from" />
          <span>→</span>
          <dict-tag :options="djs_demand_status" :value="it.to" />
          <el-tag size="small" type="info">{{ it.event }}</el-tag>
        </div>
        <div class="text-gray-500 text-sm">{{ t('demand.history.operator') }}: {{ it.operatorName || it.operator || '—' }}</div>
        <div v-if="it.remark" class="text-sm mt-1">{{ t('demand.history.remark') }}: {{ it.remark }}</div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else :description="t('demand.history.empty')" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { getDemandHistory } from '@/api/djs-warehouse/demand';
import type { AuditHistoryEntryVO } from '@/api/djs-warehouse/demand/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_demand_status } = toRefs<any>(proxy?.useDict('djs_demand_status'));

const visible = ref(false);
const entries = ref<AuditHistoryEntryVO[]>([]);

async function open(demandId: string) {
  entries.value = [];
  visible.value = true;
  const res = await getDemandHistory(demandId);
  entries.value = ((res as any).data ?? []) as AuditHistoryEntryVO[];
}

function formatTs(ts?: string): string {
  if (!ts) return '';
  // backend writes LocalDateTime.toString() => "2026-06-01T10:30:00"
  return ts.replace('T', ' ').slice(0, 19);
}

defineExpose({ open });
</script>
