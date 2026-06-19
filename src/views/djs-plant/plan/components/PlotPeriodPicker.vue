<template>
  <div v-loading="loading">
    <el-alert :title="t('plantPlan.wizard.plotPickerHint')" type="info" :closable="false" class="mb-3" />

    <!-- 大区 → 片区 → 地块 三级树：el-tree 默认 render-after-expand，折叠分支不入 DOM，
         展开某大区才渲染其片区、展开片区才渲染其地块，规避一次性挂载全部地块行 + 近千个 el-select -->
    <el-tree
      v-if="treeData.length"
      :data="treeData"
      node-key="id"
      :props="treeProps"
      :expand-on-click-node="true"
      :default-expanded-keys="[]"
      class="plot-tree"
    >
      <template #default="{ data }">
        <!-- 大区节点 -->
        <span v-if="data.type === 'region'" class="flex items-center">
          <span class="font-medium">{{ data.label }}</span>
          <el-tag size="small" type="info" class="ml-2">{{ countSelectedInRegion(data) }}/{{ totalInRegion(data) }}</el-tag>
        </span>

        <!-- 片区节点 -->
        <span v-else-if="data.type === 'zone'" class="flex items-center">
          <span>{{ data.label }}</span>
          <el-tag size="small" class="ml-2">{{ countSelectedInZone(data.zone) }}/{{ data.zone.plots.length }}</el-tag>
        </span>

        <!-- 地块叶子：点整行即可勾选/取消；选中后内联设置 月份 / 上中下旬 / 种植班组 / 采收班组 -->
        <span
          v-else
          class="plot-leaf flex items-center gap-x-3 py-1"
          @click.stop="togglePlot(data.plot, !isSelected(data.plot.plotId))"
        >
          <el-checkbox :model-value="isSelected(data.plot.plotId)" class="pointer-events-none" />
          <span class="w-24 shrink-0 text-xs text-gray-500">{{ data.plot.plotCode }}</span>
          <span class="w-28 shrink-0 truncate" :title="data.plot.plotName">{{ data.plot.plotName }}</span>
          <span class="w-16 shrink-0 text-xs text-gray-400">{{ data.plot.plotArea }} 亩</span>

          <!-- 选中后的配置区 @click.stop：操作下拉不触发整行勾选 -->
          <span v-if="isSelected(data.plot.plotId)" class="flex shrink-0 items-center gap-2" @click.stop>
            <el-select
              :model-value="rowOf(data.plot.plotId)?.plantMonth"
              size="small"
              style="width: 92px"
              :placeholder="t('plantPlan.wizard.placeholder.month')"
              @update:model-value="(v) => updateRow(data.plot, 'plantMonth', v)"
            >
              <el-option v-for="m in monthOpts" :key="m" :label="`${m} 月`" :value="m" :disabled="isMonthDisabled(m)" />
            </el-select>
            <el-select
              :model-value="rowOf(data.plot.plotId)?.plantPeriod"
              size="small"
              style="width: 92px"
              :placeholder="t('plantPlan.wizard.placeholder.period')"
              @update:model-value="(v) => updateRow(data.plot, 'plantPeriod', v)"
            >
              <el-option
                v-for="p in periodOpts"
                :key="p.value"
                :label="p.label"
                :value="p.value"
                :disabled="isPeriodDisabled(rowOf(data.plot.plotId)?.plantMonth, p.value)"
              />
            </el-select>
            <el-select
              :model-value="rowOf(data.plot.plotId)?.plantBy"
              size="small"
              clearable
              style="width: 128px"
              :placeholder="t('plantPlan.wizard.placeholder.team')"
              @update:model-value="(v) => updateRow(data.plot, 'plantBy', v)"
            >
              <el-option v-for="tm in teams" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
            </el-select>
            <el-select
              :model-value="rowOf(data.plot.plotId)?.harvestBy"
              size="small"
              clearable
              style="width: 128px"
              :placeholder="t('plantPlan.wizard.placeholder.team')"
              @update:model-value="(v) => updateRow(data.plot, 'harvestBy', v)"
            >
              <el-option v-for="tm in teams" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
            </el-select>
          </span>
        </span>
      </template>
    </el-tree>

    <div v-if="!loading && !treeData.length" class="py-10 text-center text-gray-400">
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
import { listAllZone } from '@/api/djs-plant/zone';
import { listAllTeam } from '@/api/djs-plant/team';
import type { PlotByZoneVO, PlotByZoneRow, PlantDetailInput } from '@/api/djs-plant/plan/types';
import type { PlantWorkTeamVO } from '@/api/djs-plant/team/types';

interface RegionNode {
  id: string;
  type: 'region';
  label: string;
  zones: PlotByZoneVO[];
  children: ZoneNode[];
}
interface ZoneNode {
  id: string;
  type: 'zone';
  label: string;
  zone: PlotByZoneVO;
  children: PlotNode[];
}
interface PlotNode {
  id: string;
  type: 'plot';
  label: string;
  plot: PlotByZoneRow;
}

const props = defineProps<{ modelValue: PlantDetailInput[]; planYear?: number }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: PlantDetailInput[]): void }>();

const { t } = useI18n();
const zones = ref<PlotByZoneVO[]>([]);
const teams = ref<PlantWorkTeamVO[]>([]);
const zoneBelongMap = ref<Map<string, string>>(new Map());
const loading = ref(false);
const treeProps = { children: 'children', label: 'label' };
const ORPHAN_BELONG = '未分组';

const monthOpts = computed(() => Array.from({ length: 12 }, (_, i) => i + 1));
const periodOpts = [
  { label: t('plantPlan.dict.period.early'), value: '05' },
  { label: t('plantPlan.dict.period.mid'), value: '15' },
  { label: t('plantPlan.dict.period.late'), value: '25' }
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();

// 树：按片区的 zoneBelong（所属大区）分组成顶层大区，大区下挂片区，片区下挂地块
const treeData = computed<RegionNode[]>(() => {
  const order: string[] = [];
  const byBelong = new Map<string, PlotByZoneVO[]>();
  for (const z of zones.value) {
    const belong = (z.zoneId != null ? zoneBelongMap.value.get(String(z.zoneId)) : '') || ORPHAN_BELONG;
    if (!byBelong.has(belong)) {
      byBelong.set(belong, []);
      order.push(belong);
    }
    byBelong.get(belong)!.push(z);
  }
  return order.map((belong) => {
    const zs = byBelong.get(belong)!;
    return {
      id: `r:${belong}`,
      type: 'region',
      label: belong,
      zones: zs,
      children: zs.map<ZoneNode>((z) => ({
        id: `z:${z.zoneId ?? 'orphan'}`,
        type: 'zone',
        label: z.zoneName,
        zone: z,
        children: z.plots.map<PlotNode>((p) => ({
          id: `p:${p.plotId}`,
          type: 'plot',
          label: p.plotName,
          plot: p
        }))
      }))
    };
  });
});

// 月份是否为历史月（仅当所选计划年份 = 今年时，早于当前月的月份视为历史月不可选）
function isMonthDisabled(month: number): boolean {
  const year = props.planYear;
  if (year == null) return false;
  if (year > currentYear) return false;
  if (year < currentYear) return true;
  return month < currentMonth;
}

// 旬（上旬05/中旬15/下旬25）是否为历史旬：以所选月份 + 该旬代表日界判断
function isPeriodDisabled(month: number | undefined, periodValue: string): boolean {
  const year = props.planYear;
  if (year == null || month == null) return false;
  if (year > currentYear) return false;
  if (year < currentYear) return true;
  if (month < currentMonth) return true;
  if (month > currentMonth) return false;
  // 同年同月：按今天的日界禁早于今天的旬（上旬1-10 / 中旬11-20 / 下旬21-31）
  if (currentDay <= 10) return false;
  if (currentDay <= 20) return periodValue === '05';
  return periodValue === '05' || periodValue === '15';
}

function rowOf(plotId: string | number): PlantDetailInput | undefined {
  return props.modelValue.find((d) => String(d.plotId) === String(plotId));
}

function isSelected(plotId: string | number) {
  return !!rowOf(plotId);
}

function updateRow(row: PlotByZoneRow, field: keyof PlantDetailInput, value: unknown) {
  const next = [...props.modelValue];
  const idx = next.findIndex((d) => String(d.plotId) === String(row.plotId));
  if (idx < 0) return;
  (next[idx] as Record<string, unknown>)[field] = value;
  emit('update:modelValue', next);
}

// 勾选地块时给出的默认月/旬：避开历史月旬，默认落到最近一个可选的月份与旬
function defaultMonthPeriod(): { plantMonth: number; plantPeriod: '05' | '15' | '25' } {
  const year = props.planYear;
  if (year == null || year > currentYear) {
    return { plantMonth: currentMonth, plantPeriod: '05' };
  }
  if (year === currentYear) {
    if (currentDay <= 10) return { plantMonth: currentMonth, plantPeriod: '05' };
    if (currentDay <= 20) return { plantMonth: currentMonth, plantPeriod: '15' };
    if (currentDay <= 31 && currentMonth < 12) return { plantMonth: currentMonth, plantPeriod: '25' };
    return { plantMonth: Math.min(currentMonth + 1, 12), plantPeriod: '05' };
  }
  return { plantMonth: currentMonth, plantPeriod: '05' };
}

function togglePlot(row: PlotByZoneRow, checked: unknown) {
  const next = [...props.modelValue];
  const idx = next.findIndex((d) => String(d.plotId) === String(row.plotId));
  if (checked) {
    if (idx < 0) {
      next.push({ plotId: String(row.plotId), ...defaultMonthPeriod() });
    }
  } else if (idx >= 0) {
    next.splice(idx, 1);
  }
  emit('update:modelValue', next);
}

function countSelectedInZone(zone: PlotByZoneVO) {
  return zone.plots.filter((p) => isSelected(p.plotId)).length;
}

function countSelectedInRegion(node: RegionNode) {
  return node.zones.reduce((s, z) => s + countSelectedInZone(z), 0);
}

function totalInRegion(node: RegionNode) {
  return node.zones.reduce((s, z) => s + z.plots.length, 0);
}

onMounted(async () => {
  loading.value = true;
  try {
    const [zoneRes, allZoneRes, teamRes] = await Promise.all([
      listAvailablePlots(),
      listAllZone(),
      listAllTeam({ teamStatus: 1 })
    ]);
    zones.value = (zoneRes.data || []) as PlotByZoneVO[];
    const map = new Map<string, string>();
    for (const z of allZoneRes.data || []) {
      if (z.id != null) map.set(String(z.id), (z.zoneBelong || '').trim());
    }
    zoneBelongMap.value = map;
    teams.value = (teamRes.data || []) as PlantWorkTeamVO[];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* el-tree 默认节点行高 26px；地块叶子内联了表单控件需要更高，各级节点统一垂直居中（修复展开三角与文字错位） */
.plot-tree :deep(.el-tree-node__content) {
  height: auto;
  min-height: 36px;
  align-items: center;
}
.plot-leaf {
  width: 100%;
}
</style>
