<template>
  <div class="p-4">
    <el-card v-loading="loading" shadow="never" class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-medium">{{ t('plantPlan.detail.title') }} · {{ plan?.plan?.planNo }}</span>
          <div class="flex items-center gap-2">
            <template v-if="editMode">
              <el-button type="primary" :loading="saving" size="small" @click="onSave">
                {{ t('plantPlan.edit.btn.save') }}
              </el-button>
              <el-button :disabled="saving" size="small" @click="onCancel">
                {{ t('plantPlan.edit.btn.cancel') }}
              </el-button>
            </template>
            <template v-else>
              <el-button v-if="canEdit" type="primary" size="small" @click="onEnterEdit">
                {{ t('plantPlan.edit.btn.edit') }}
              </el-button>
              <el-tooltip v-else placement="top" :content="lockTip">
                <el-button size="small" disabled>
                  {{ t('plantPlan.edit.btn.edit') }}
                </el-button>
              </el-tooltip>
            </template>
            <el-button link @click="goList">{{ t('plantPlan.wizard.backToList') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 编辑态时基本信息中 planSeason 可改；其余只读 -->
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item :label="t('plantPlan.field.planNo')">{{ plan?.plan?.planNo }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.planYear')">{{ plan?.plan?.planYear }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.planSeason')">
          <template v-if="editMode">
            <el-select v-model="editForm.planSeason" size="small" :placeholder="t('plantPlan.placeholder.planSeason')" style="width: 160px">
              <el-option v-for="d in djs_planting_season" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </template>
          <template v-else>
            <dict-tag :options="djs_planting_season" :value="plan?.plan?.planSeason" />
          </template>
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.crop')">
          <span>{{ plan?.plan?.cropName }}</span>
          <el-tag v-if="editMode" size="small" type="info" class="ml-2">
            {{ t('plantPlan.edit.locked') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.totalArea')">
          {{ plan?.plan?.totalArea != null ? `${plan?.plan?.totalArea} 亩` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.totalPlot')">{{ plan?.plan?.totalPlot ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.earliestHarvestdate')">{{ plan?.plan?.earliestHarvestdate ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.lastHarvestdate')">{{ plan?.plan?.lastHarvestdate ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('plantPlan.field.plantStatus')">
          <dict-tag :options="djs_plant_plan_status" :value="plan?.plan?.plantStatus" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="flex items-center">
          <span class="text-base font-medium">{{ t('plantPlan.detail.detailsTitle') }}</span>
          <el-tag v-if="editMode" size="small" type="warning" class="ml-2">
            {{ t('plantPlan.edit.detailsTip') }}
          </el-tag>
        </div>
      </template>

      <!-- 只读模式 -->
      <el-table v-if="!editMode" :data="plan?.details || []" stripe size="small" border>
        <el-table-column :label="t('plantPlan.field.plotCode')" prop="plotCode" width="100" align="center" />
        <el-table-column :label="t('plantPlan.field.plotName')" prop="plotName" min-width="90" align="center" show-overflow-tooltip />
        <el-table-column :label="t('plantPlan.field.plantTime')" width="120" align="center">
          <template #default="{ row }">{{ formatPlantTime(row) }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantActualDate')" prop="beginActualdate" width="120" align="center">
          <template #default="{ row }">{{ row.beginActualdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.earliestHarvestdate')" prop="earliestHarvestdate" width="120" align="center" />
        <el-table-column :label="t('plantPlan.field.lastHarvestdate')" prop="lastHarvestdate" width="120" align="center" />
        <el-table-column :label="t('plantPlan.field.beginHarvestdate')" prop="beginHarvestdate" width="120" align="center">
          <template #default="{ row }">{{ row.beginHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.endHarvestdate')" prop="endHarvestdate" width="120" align="center">
          <template #default="{ row }">{{ row.endHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plotArea')" prop="plotArea" width="90" align="center">
          <template #default="{ row }">{{ row.plotArea }} 亩</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.expectedYield')" prop="expectedYield" width="120" align="center">
          <template #default="{ row }">{{ row.expectedYield != null ? `${Number(row.expectedYield).toFixed(2)} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.column.actualYield')" prop="actualYield" width="120" align="center">
          <template #default="{ row }">{{ row.actualYield != null ? `${Number(row.actualYield).toFixed(2)} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantStatus')" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_plan_status" :value="row.plantStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.harvestStatus')" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantBy')" prop="plantTeamName" width="120" align="center" />
        <el-table-column :label="t('plantPlan.field.harvestBy')" prop="harvestTeamName" width="120" align="center" />
      </el-table>

      <!--
        编辑模式：只允许修改 plantBy / harvestBy（班组）；plot / crop / period / month / 时间范围 全锁。
        说明：service.updateByBo 已校验 beginActualdate IS NOT NULL 时仅允许改班组；本 V1 UI 出于实施
        节奏简化为"全部明细只允许改班组"，DB 已开始的明细行回写时 service 仍会强校验。
      -->
      <el-table v-else :data="editDetails" stripe size="small" border>
        <el-table-column :label="t('plantPlan.field.plotCode')" prop="plotCode" width="100" align="center" />
        <el-table-column :label="t('plantPlan.field.plotName')" prop="plotName" min-width="90" align="center" show-overflow-tooltip />
        <el-table-column :label="t('plantPlan.field.plantMonth')" width="100" align="center">
          <template #default="{ row }">{{ row.plantMonth }} 月</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantPeriod')" width="80" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_period" :value="row.plantPeriod" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantBy')" width="160" align="center">
          <template #default="{ row }">
            <el-select v-model="row.plantBy" size="small" clearable filterable :placeholder="t('plantPlan.placeholder.team')">
              <el-option v-for="t in teamOptions" :key="t.id" :label="t.teamName" :value="t.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.harvestBy')" width="160" align="center">
          <template #default="{ row }">
            <el-select v-model="row.harvestBy" size="small" clearable filterable :placeholder="t('plantPlan.placeholder.team')">
              <el-option v-for="t in teamOptions" :key="t.id" :label="t.teamName" :value="t.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantStatus')" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_plan_status" :value="row.plantStatus" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="!editMode" shadow="never">
      <template #header>
        <span class="text-base font-medium">{{ t('plantPlan.gantt.title') }}</span>
        <el-tag size="small" type="info" class="ml-2">{{ t('plantPlan.gantt.v1Note') }}</el-tag>
      </template>

      <div v-if="!ganttRows.length" class="py-6 text-center text-gray-400">
        {{ t('plantPlan.gantt.empty') }}
      </div>

      <div v-else ref="ganttWrapRef" class="gantt-wrap">
        <div class="gantt-legend mb-2 flex gap-4 text-xs">
          <span><i class="legend-block plan-bar" /> {{ t('plantPlan.gantt.legend.plan') }}</span>
          <span><i class="legend-block actual-bar" /> {{ t('plantPlan.gantt.legend.actual') }}</span>
        </div>

        <div class="gantt-axis flex">
          <div class="gantt-row-label" />
          <div v-for="m in 12" :key="m" class="gantt-axis-cell" :style="{ width: cellWidth + 'px' }">{{ m }}月</div>
        </div>

        <div v-for="row in ganttRows" :key="row.detailId" class="gantt-row flex items-center">
          <div class="gantt-row-label truncate" :title="row.plotName">{{ row.plotName || row.plotCode || '-' }}</div>
          <div class="gantt-track relative" :style="{ width: cellWidth * 12 + 'px', '--gantt-cell-w': cellWidth + 'px' }">
            <div
              v-if="row.earliestHarvestdate && row.lastHarvestdate"
              class="gantt-bar plan-bar"
              :style="planBarStyle(row)"
              :title="`${t('plantPlan.gantt.legend.plan')}: ${row.earliestHarvestdate} ~ ${row.lastHarvestdate}`"
            />
            <div
              v-if="row.beginActualdate"
              class="gantt-bar actual-bar"
              :style="actualBarStyle(row)"
              :title="`${t('plantPlan.gantt.legend.actual')}: ${row.beginActualdate} ~ ${row.endActualdate || '...'}`"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="PlantPlanDetail" lang="ts">
import { ref, onMounted, getCurrentInstance, computed, reactive } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { getPlan, getPlanGantt, updatePlan } from '@/api/djs-plant/plan';
import { listAllTeam } from '@/api/djs-plant/team';
import type {
  PlantPlanDetailVO,
  PlantPlanGanttRow,
  PlantPlanGanttVO,
  PlantDetailsVO,
  PlantPlanUpdateForm,
  PlantDetailInput
} from '@/api/djs-plant/plan/types';
import { PLAN_BASE } from './route';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_planting_season, djs_plant_plan_status, djs_pick_status, djs_plant_period } = toRefs<any>(
  proxy?.useDict('djs_planting_season', 'djs_plant_plan_status', 'djs_pick_status', 'djs_plant_period')
);

const plan = ref<PlantPlanDetailVO | null>(null);
const gantt = ref<PlantPlanGanttVO | null>(null);
const loading = ref(false);
const saving = ref(false);
const editMode = ref(false);

interface EditDetailRow extends PlantDetailsVO {
  /** 行级 plantBy / harvestBy 显式声明：v-model 编辑用 */
}

const editForm = reactive<{ planSeason?: string; cropId?: string; plantDate?: string }>({});
const editDetails = ref<EditDetailRow[]>([]);

// 班组下拉数据
const teamOptions = ref<Array<{ id: string; teamName: string }>>([]);

// 甘特图月份格宽：按容器宽度动态平铺 12 个月，撑满页面（行标签占 140px）。
// 容器太窄时退回最小格宽 48px，由 .gantt-wrap 横向滚动兜底。
const GANTT_ROW_LABEL_WIDTH = 140;
const GANTT_MIN_CELL_WIDTH = 48;
const ganttWrapRef = ref<HTMLElement | null>(null);
const { width: ganttWrapWidth } = useElementSize(ganttWrapRef);
const cellWidth = computed<number>(() => {
  const avail = ganttWrapWidth.value - GANTT_ROW_LABEL_WIDTH;
  if (avail <= 0) return GANTT_MIN_CELL_WIDTH;
  return Math.max(GANTT_MIN_CELL_WIDTH, avail / 12);
});
const ganttRows = computed<PlantPlanGanttRow[]>(() => gantt.value?.rows || []);

/** 是否允许进入编辑态 */
const canEdit = computed(() => {
  const s = plan.value?.plan?.plantStatus;
  // V1：draft / planned / ongoing 允许进入编辑（受 service 端规则约束实际可改字段）
  // done / cancelled 禁止
  return s === 'draft' || s === 'planned' || s === 'ongoing';
});

const lockTip = computed(() => {
  const s = plan.value?.plan?.plantStatus;
  if (s === 'done') return t('plantPlan.edit.lockTip.done');
  if (s === 'cancelled') return t('plantPlan.edit.lockTip.cancelled');
  return t('plantPlan.edit.lockTip.other');
});

onMounted(async () => {
  const id = route.query.id as string;
  if (!id) {
    ElMessage.error(t('plantPlan.detail.missingId'));
    router.replace(PLAN_BASE);
    return;
  }
  await loadAll(id);

  // ?edit=1 时自动进入编辑模式（来自列表 edit 按钮）
  if (route.query.edit === '1' && canEdit.value) {
    onEnterEdit();
  }
});

async function loadAll(id: string) {
  loading.value = true;
  try {
    const [planRes, ganttRes] = await Promise.all([getPlan(id), getPlanGantt(id)]);
    plan.value = (planRes.data || planRes) as PlantPlanDetailVO;
    gantt.value = (ganttRes.data || ganttRes) as PlantPlanGanttVO;
  } finally {
    loading.value = false;
  }
}

async function loadTeams() {
  if (teamOptions.value.length) return;
  try {
    const res: any = await listAllTeam({ teamStatus: 1 });
    const rows = (res?.data ?? res?.rows ?? []) as Array<{ id: string; teamName: string }>;
    teamOptions.value = rows.map((r) => ({ id: String(r.id), teamName: r.teamName }));
  } catch {
    teamOptions.value = [];
  }
}

function onEnterEdit() {
  if (!plan.value?.plan) return;
  editForm.planSeason = plan.value.plan.planSeason;
  editForm.cropId = plan.value.plan.cropId;
  editForm.plantDate = plan.value.plan.plantDate;
  editDetails.value = (plan.value.details || []).map((d) => ({ ...d }));
  loadTeams();
  editMode.value = true;
}

function onCancel() {
  editMode.value = false;
  // 清空临时态（再次进入编辑会从 plan 重新初始化）
  editDetails.value = [];
  editForm.planSeason = undefined;
  editForm.cropId = undefined;
  editForm.plantDate = undefined;
  // 移除 ?edit=1 query 避免下次进入时再自动进编辑
  if (route.query.edit) {
    router.replace({ path: route.path, query: { id: route.query.id } });
  }
}

async function onSave() {
  if (!plan.value?.plan) return;
  saving.value = true;
  try {
    const details: PlantDetailInput[] = editDetails.value.map((d) => ({
      id: d.id,
      plotId: d.plotId,
      plantMonth: d.plantMonth,
      plantPeriod: d.plantPeriod as '05' | '15' | '25',
      plantBy: d.plantBy || undefined,
      harvestBy: d.harvestBy || undefined
    }));

    const body: PlantPlanUpdateForm = {
      id: plan.value.plan.id,
      planSeason: editForm.planSeason,
      plantDate: editForm.plantDate || undefined,
      details
    };

    await updatePlan(body);
    ElMessage.success(t('plantPlan.edit.saveSuccess'));
    editMode.value = false;
    // 重新拉数据
    await loadAll(plan.value.plan.id);
    if (route.query.edit) {
      router.replace({ path: route.path, query: { id: route.query.id } });
    }
  } catch (e: any) {
    // ruoyi axios 失败拦截已弹错；这里不重复弹
  } finally {
    saving.value = false;
  }
}

/** 合并「种植月份 + 上中下旬」为「计划种植时间」展示，如 6月中旬 */
function formatPlantTime(row: PlantDetailsVO): string {
  if (row.plantMonth == null) return '-';
  const opt = djs_plant_period.value?.find((d: any) => String(d.value) === String(row.plantPeriod));
  const periodLabel = opt?.label || '';
  return `${row.plantMonth}月${periodLabel}`;
}

function planBarStyle(row: PlantPlanGanttRow) {
  return barStyle(row.earliestHarvestdate, row.lastHarvestdate, 6);
}
function actualBarStyle(row: PlantPlanGanttRow) {
  return barStyle(row.beginActualdate, row.endActualdate, 24);
}

function barStyle(start?: string, end?: string, topOffset = 6) {
  if (!start) return { display: 'none' } as Record<string, string>;
  const year = gantt.value?.planYear ?? new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01`).getTime();
  const yearEnd = new Date(`${year}-12-31`).getTime();
  const span = yearEnd - yearStart;
  const startT = Math.max(new Date(start).getTime(), yearStart);
  const endT = end ? Math.min(new Date(end).getTime(), yearEnd) : startT + 86400000;
  const trackWidth = cellWidth.value * 12;
  const left = ((startT - yearStart) / span) * trackWidth;
  const width = Math.max(8, ((endT - startT) / span) * trackWidth);
  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${topOffset}px`
  };
}

function goList() {
  router.push(PLAN_BASE);
}
</script>

<style scoped>
.gantt-wrap {
  overflow-x: auto;
}
.gantt-axis {
  border-bottom: 1px solid #ebeef5;
  padding-left: 0;
  background: #fafafa;
}
.gantt-axis-cell {
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  color: #606266;
  border-right: 1px dashed #ebeef5;
}
.gantt-row {
  border-bottom: 1px solid #f0f2f5;
  min-height: 56px;
}
.gantt-row-label {
  width: 140px;
  padding: 8px 12px;
  font-size: 13px;
  flex-shrink: 0;
}
.gantt-track {
  position: relative;
  height: 48px;
  background-image: repeating-linear-gradient(to right, #f7f8fa 0 1px, transparent 1px var(--gantt-cell-w, 60px));
}
.gantt-bar {
  position: absolute;
  height: 16px;
  border-radius: 3px;
}
.plan-bar {
  background: #67c23a;
  opacity: 0.85;
}
.actual-bar {
  background: #409eff;
  opacity: 0.95;
}
.legend-block {
  display: inline-block;
  width: 14px;
  height: 10px;
  margin-right: 4px;
  border-radius: 2px;
  vertical-align: middle;
}
.legend-block.plan-bar {
  background: #67c23a;
}
.legend-block.actual-bar {
  background: #409eff;
}
</style>
