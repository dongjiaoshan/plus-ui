<template>
  <div v-loading="loading">
    <el-alert :title="t('plantPlan.wizard.plotPickerHint')" type="info" :closable="false" class="mb-3" />

    <el-collapse v-model="activeZones">
      <el-collapse-item v-for="zone in zones" :key="String(zone.zoneId ?? 'orphan')" :name="String(zone.zoneId ?? 'orphan')">
        <template #title>
          <span class="font-medium">{{ zone.zoneName }}</span>
          <el-tag size="small" class="ml-2">{{ countSelectedInZone(zone) }}/{{ zone.plots.length }}</el-tag>
        </template>

        <el-table :data="zone.plots" stripe size="small">
          <el-table-column type="selection" width="50" :selectable="(row) => true" />
          <el-table-column :label="t('plantPlan.wizard.col.plotCode')" prop="plotCode" width="100" />
          <el-table-column :label="t('plantPlan.wizard.col.plotName')" prop="plotName" min-width="120" show-overflow-tooltip />
          <el-table-column :label="t('plantPlan.wizard.col.plotArea')" prop="plotArea" width="90" align="right">
            <template #default="{ row }">{{ row.plotArea }} 亩</template>
          </el-table-column>
          <el-table-column :label="t('plantPlan.wizard.col.month')" width="120" align="center">
            <template #default="{ row }">
              <el-select
                :model-value="rowOf(row.plotId)?.plantMonth"
                size="small"
                :placeholder="t('plantPlan.wizard.placeholder.month')"
                :disabled="!isSelected(row.plotId)"
                @update:model-value="(v) => updateRow(row, 'plantMonth', v)"
              >
                <el-option v-for="m in monthOpts" :key="m" :label="`${m} 月`" :value="m" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('plantPlan.wizard.col.period')" width="120" align="center">
            <template #default="{ row }">
              <el-select
                :model-value="rowOf(row.plotId)?.plantPeriod"
                size="small"
                :placeholder="t('plantPlan.wizard.placeholder.period')"
                :disabled="!isSelected(row.plotId)"
                @update:model-value="(v) => updateRow(row, 'plantPeriod', v)"
              >
                <el-option v-for="p in periodOpts" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('plantPlan.wizard.col.plantBy')" width="160" align="center">
            <template #default="{ row }">
              <el-select
                :model-value="rowOf(row.plotId)?.plantBy"
                size="small"
                clearable
                :placeholder="t('plantPlan.wizard.placeholder.team')"
                :disabled="!isSelected(row.plotId)"
                @update:model-value="(v) => updateRow(row, 'plantBy', v)"
              >
                <el-option v-for="tm in teams" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="t('plantPlan.wizard.col.harvestBy')" width="160" align="center">
            <template #default="{ row }">
              <el-select
                :model-value="rowOf(row.plotId)?.harvestBy"
                size="small"
                clearable
                :placeholder="t('plantPlan.wizard.placeholder.team')"
                :disabled="!isSelected(row.plotId)"
                @update:model-value="(v) => updateRow(row, 'harvestBy', v)"
              >
                <el-option v-for="tm in teams" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="80" align="center">
            <template #header>
              <el-tooltip :content="t('plantPlan.wizard.col.selectHint')">
                <span>{{ t('plantPlan.wizard.col.selected') }}</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-checkbox :model-value="isSelected(row.plotId)" @update:model-value="(v) => togglePlot(row, v)" />
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <div v-if="!loading && !zones.length" class="py-10 text-center text-gray-400">
      {{ t('plantPlan.wizard.zoneEmpty') }}
    </div>

    <div class="mt-4 text-sm text-gray-500">
      {{ t('plantPlan.wizard.selectedSummary', { count: modelValue?.length || 0 }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { listAvailablePlots } from '@/api/djs-plant/plan';
import { listAllTeam } from '@/api/djs-plant/team';
import type { PlotByZoneVO, PlantDetailInput } from '@/api/djs-plant/plan/types';
import type { PlantWorkTeamVO } from '@/api/djs-plant/team/types';

const props = defineProps<{ modelValue: PlantDetailInput[] }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: PlantDetailInput[]): void }>();

const { t } = useI18n();
const zones = ref<PlotByZoneVO[]>([]);
const teams = ref<PlantWorkTeamVO[]>([]);
const loading = ref(false);
const activeZones = ref<string[]>([]);
const monthOpts = computed(() => Array.from({ length: 12 }, (_, i) => i + 1));
const periodOpts = [
  { label: t('plantPlan.dict.period.early'), value: '05' },
  { label: t('plantPlan.dict.period.mid'), value: '15' },
  { label: t('plantPlan.dict.period.late'), value: '25' }
];

function rowOf(plotId: string | number): PlantDetailInput | undefined {
  return props.modelValue.find((d) => String(d.plotId) === String(plotId));
}

function isSelected(plotId: string | number) {
  return !!rowOf(plotId);
}

function updateRow(row: { plotId: string | number }, field: keyof PlantDetailInput, value: unknown) {
  const next = [...props.modelValue];
  const idx = next.findIndex((d) => String(d.plotId) === String(row.plotId));
  if (idx < 0) return;
  (next[idx] as any)[field] = value;
  emit('update:modelValue', next);
}

function togglePlot(row: { plotId: string | number }, checked: unknown) {
  const next = [...props.modelValue];
  const idx = next.findIndex((d) => String(d.plotId) === String(row.plotId));
  if (checked) {
    if (idx < 0) {
      next.push({ plotId: String(row.plotId), plantMonth: new Date().getMonth() + 1, plantPeriod: '05' });
    }
  } else if (idx >= 0) {
    next.splice(idx, 1);
  }
  emit('update:modelValue', next);
}

function countSelectedInZone(zone: PlotByZoneVO) {
  return zone.plots.filter((p) => isSelected(p.plotId)).length;
}

onMounted(async () => {
  loading.value = true;
  try {
    const [zoneRes, teamRes] = await Promise.all([listAvailablePlots(), listAllTeam({ teamStatus: 1 })]);
    zones.value = (zoneRes.data || []) as PlotByZoneVO[];
    teams.value = (teamRes.data || []) as PlantWorkTeamVO[];
    activeZones.value = zones.value.map((z) => String(z.zoneId ?? 'orphan'));
  } finally {
    loading.value = false;
  }
});
</script>
