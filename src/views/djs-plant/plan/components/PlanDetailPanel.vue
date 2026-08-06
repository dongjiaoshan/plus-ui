<template>
  <div>
    <el-card v-loading="loading" shadow="never" class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-medium">{{ t('plantPlan.detail.title') }} · {{ plan?.plan?.planNo }}</span>
          <div class="flex items-center gap-2">
            <!--
              详情不给「编辑」入口（甲方 V6-R42）。编辑态本身保留：路由页 `?edit=1` 调 enterEdit() 进入，
              进入后这里出「保存 / 取消」。
            -->
            <template v-if="editMode">
              <el-button type="primary" :loading="saving" size="small" @click="onSave">
                {{ t('plantPlan.edit.btn.save') }}
              </el-button>
              <el-button :disabled="saving" size="small" @click="onCancel">
                {{ t('plantPlan.edit.btn.cancel') }}
              </el-button>
            </template>
            <!-- 路由页在此塞「返回列表」；弹框形态不渲染 -->
            <slot name="header-extra" />
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
        <el-table-column :label="t('plantPlan.field.plotCode')" prop="plotCode" width="100" align="center" header-align="center" />
        <el-table-column
          :label="t('plantPlan.field.plotName')"
          prop="plotName"
          min-width="90"
          align="center"
          header-align="center"
          show-overflow-tooltip
        />
        <el-table-column :label="t('plantPlan.field.plantTime')" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ formatPlantTime(row) }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantActualDate')" prop="beginActualdate" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.beginActualdate || '-' }}</template>
        </el-table-column>
        <el-table-column
          :label="t('plantPlan.field.earliestHarvestdate')"
          prop="earliestHarvestdate"
          width="120"
          align="center"
          header-align="center"
        >
          <template #default="{ row }">{{ row.earliestHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.lastHarvestdate')" prop="lastHarvestdate" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.lastHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.beginHarvestdate')" prop="beginHarvestdate" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.beginHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.endHarvestdate')" prop="endHarvestdate" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.endHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plotArea')" prop="plotArea" width="90" align="center" header-align="center">
          <template #default="{ row }">{{ row.plotArea }} 亩</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.expectedYield')" prop="expectedYield" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.expectedYield != null ? `${Number(row.expectedYield).toFixed(3)} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.column.actualYield')" prop="actualYield" width="120" align="center" header-align="center">
          <template #default="{ row }">{{ row.actualYield != null ? `${Number(row.actualYield).toFixed(3)} kg` : '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantStatus')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_plan_status" :value="row.plantStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.harvestStatus')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
          </template>
        </el-table-column>
        <!-- V6-R36：变更类型（种植记录最后一次由谁改：小程序操作 / 后台调整 / 后台班组调整） -->
        <el-table-column :label="t('plantPlan.field.changeType')" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_change_type" :value="row.changeType" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantBy')" width="140" align="center" header-align="center">
          <template #default="{ row }">
            <template v-if="teamNamesOf(row, 'plant').length">
              <el-tag v-for="(nm, i) in teamNamesOf(row, 'plant')" :key="i" size="small" class="ma-1">{{ nm }}</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.harvestBy')" width="140" align="center" header-align="center">
          <template #default="{ row }">
            <template v-if="teamNamesOf(row, 'harvest').length">
              <el-tag v-for="(nm, i) in teamNamesOf(row, 'harvest')" :key="i" size="small" type="success" class="ma-1">{{ nm }}</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <!-- 操作列固定在最右：已种植且采摘未开始的地块给「修改」（V6-R36 / R38），种植未开始的给「删除」（row184） -->
        <el-table-column :label="t('common.operate')" width="130" align="center" header-align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canAdjustDetail(row)" v-hasPermi="['djs:plant:plan:edit']" link type="primary" size="small" @click="onAdjustDetail(row)">
              {{ t('plantPlan.adjust.btn') }}
            </el-button>
            <el-button v-else-if="canRemoveDetail(row)" link type="danger" size="small" @click="onRemoveDetail(row)">
              {{ t('common.del') }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!--
        编辑模式：只允许修改 plantBy / harvestBy（班组）；plot / crop / period / month / 时间范围 全锁。
        说明：service.updateByBo 已校验 beginActualdate IS NOT NULL 时仅允许改班组；本 V1 UI 出于实施
        节奏简化为"全部明细只允许改班组"，DB 已开始的明细行回写时 service 仍会强校验。
      -->
      <el-table v-else :data="editDetails" stripe size="small" border>
        <el-table-column :label="t('plantPlan.field.plotCode')" prop="plotCode" width="100" align="center" header-align="center" />
        <el-table-column
          :label="t('plantPlan.field.plotName')"
          prop="plotName"
          min-width="90"
          align="center"
          header-align="center"
          show-overflow-tooltip
        />
        <el-table-column :label="t('plantPlan.field.plantMonth')" width="100" align="center" header-align="center">
          <template #default="{ row }">{{ row.plantMonth }} 月</template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantPeriod')" width="80" align="center" header-align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_period" :value="row.plantPeriod" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantBy')" width="200" align="center" header-align="center">
          <template #default="{ row }">
            <el-select
              v-model="row.plantByIds"
              size="small"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              filterable
              :placeholder="t('plantPlan.placeholder.team')"
            >
              <el-option v-for="tm in teamOptions" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.harvestBy')" width="200" align="center" header-align="center">
          <template #default="{ row }">
            <el-select
              v-model="row.harvestByIds"
              size="small"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              filterable
              :placeholder="t('plantPlan.placeholder.team')"
            >
              <el-option v-for="tm in teamOptions" :key="tm.id" :label="tm.teamName" :value="String(tm.id)" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="t('plantPlan.field.plantStatus')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_plant_plan_status" :value="row.plantStatus" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="!editMode" shadow="never">
      <template #header>
        <span class="text-base font-medium">{{ t('plantPlan.gantt.title') }}</span>
      </template>

      <div v-if="!ganttRows.length" class="py-6 text-center text-gray-400">
        {{ t('plantPlan.gantt.empty') }}
      </div>

      <div v-else ref="ganttWrapRef" class="gantt-wrap">
        <div class="gantt-legend mb-2 flex gap-4 text-xs">
          <span><i class="legend-block plan-bar" /> {{ t('plantPlan.gantt.legend.plan') }}</span>
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
          </div>
        </div>
      </div>
    </el-card>

    <!-- V6-R36：已种植地块后台调整 -->
    <PlantedDetailEditDialog v-model="adjustVisible" :detail="adjustRow" @saved="onAdjustSaved" />
  </div>
</template>

<script setup name="PlanDetailPanel" lang="ts">
/**
 * 种植计划详情内容面板（V6-R35）。
 *
 * 原 `plan/detail.vue` 整页内容抽成本组件，由两处复用：
 *   - `components/PlanDetailDialog.vue`（列表「详情」按钮，甲方要的弹框形态）
 *   - `plan/detail.vue`（保留的路由页，向导创建完成后跳转 / 隐藏菜单 8078 仍指向它）
 *
 * 面板自己负责取数：`load()` 每次调用都重新拉 getPlan + getPlanGantt，
 * 这正是甲方 row35 抱怨的「TAP 里点开的详情没办法刷新」的解法——弹框每次打开重新 load。
 */
import { ref, computed, reactive, watch, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { delPlanDetail, getPlan, getPlanGantt, updatePlan } from '@/api/djs-plant/plan';
import { listAllTeam } from '@/api/djs-plant/team';
import type {
  PlantPlanDetailVO,
  PlantPlanGanttRow,
  PlantPlanGanttVO,
  PlantDetailsVO,
  PlantPlanUpdateForm,
  PlantDetailInput
} from '@/api/djs-plant/plan/types';
import PlantedDetailEditDialog from './PlantedDetailEditDialog.vue';

const props = defineProps<{
  /** 计划 id；变化时自动重新拉数据。 */
  planId?: string;
}>();

const emit = defineEmits<{
  /** 明细被删除 / 被后台调整 / 计划被编辑保存后触发，供列表页刷新。 */
  (e: 'changed'): void;
  /** 一次 load() 完成（成败均触发），路由页 ?edit=1 靠它决定何时进编辑态。 */
  (e: 'loaded'): void;
}>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_planting_season, djs_plant_plan_status, djs_pick_status, djs_plant_period, djs_plant_change_type } = toRefs<any>(
  proxy?.useDict('djs_planting_season', 'djs_plant_plan_status', 'djs_pick_status', 'djs_plant_period', 'djs_plant_change_type')
);

const plan = ref<PlantPlanDetailVO | null>(null);
const gantt = ref<PlantPlanGanttVO | null>(null);
const loading = ref(false);
const saving = ref(false);
const editMode = ref(false);

type EditDetailRow = PlantDetailsVO;

const editForm = reactive<{ planSeason?: string; cropId?: string; plantDate?: string }>({});
const editDetails = ref<EditDetailRow[]>([]);

// 班组下拉数据
const teamOptions = ref<Array<{ id: string; teamName: string }>>([]);

// V6-R36 已种植地块调整弹框
const adjustVisible = ref(false);
const adjustRow = ref<PlantDetailsVO | null>(null);

/** 采摘状态「待开始」的字典码值（djs_pick_status：pending/picking/completed/delayed） */
const HARVEST_STATUS_PENDING = 'pending';

// 只读明细行展示班组名列表（row36 多 tag）：优先 VO 全集名，回落旧单列名
function teamNamesOf(row: PlantDetailsVO, role: 'plant' | 'harvest'): string[] {
  if (role === 'plant') {
    if (row.plantTeamNames && row.plantTeamNames.length) return row.plantTeamNames;
    return row.plantTeamName ? [row.plantTeamName] : [];
  }
  if (row.harvestTeamNames && row.harvestTeamNames.length) return row.harvestTeamNames;
  return row.harvestTeamName ? [row.harvestTeamName] : [];
}

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

/** 是否允许进入编辑态（唯一入口是路由页 `?edit=1` → enterEdit()，界面上不再有编辑按钮） */
const canEdit = computed(() => {
  const s = plan.value?.plan?.plantStatus;
  // V1：draft / planned / ongoing 允许进入编辑（受 service 端规则约束实际可改字段）
  // done / cancelled 禁止
  return s === 'draft' || s === 'planned' || s === 'ongoing';
});

watch(
  () => props.planId,
  (id) => {
    if (id) load();
  },
  { immediate: true }
);

/** 重新拉主表 + 明细 + 甘特（对外暴露，弹框每次打开调它） */
async function load() {
  const id = props.planId;
  if (!id) return;
  editMode.value = false;
  loading.value = true;
  try {
    const [planRes, ganttRes] = await Promise.all([getPlan(id), getPlanGantt(id)]);
    plan.value = (planRes.data || planRes) as unknown as PlantPlanDetailVO;
    gantt.value = (ganttRes.data || ganttRes) as unknown as PlantPlanGanttVO;
  } finally {
    loading.value = false;
    emit('loaded');
  }
}

/** 让外部（route 页 ?edit=1）能直接进编辑态 */
function enterEdit() {
  if (canEdit.value) onEnterEdit();
}

defineExpose({ load, enterEdit });

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
  editDetails.value = (plan.value.details || []).map((d) => ({
    ...d,
    // 班组多选（row36）：优先 VO 全集 id，回落旧单列 → string[]，保证 el-select multiple v-model
    plantByIds: (d.plantByIds && d.plantByIds.length ? d.plantByIds : d.plantBy ? [d.plantBy] : []).map(String),
    harvestByIds: (d.harvestByIds && d.harvestByIds.length ? d.harvestByIds : d.harvestBy ? [d.harvestBy] : []).map(String)
  }));
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
      plantByIds: d.plantByIds || [],
      harvestByIds: d.harvestByIds || []
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
    await load();
    emit('changed');
  } finally {
    // ruoyi axios 失败拦截已弹错，这里不重复弹；无论成败都要解掉 loading
    saving.value = false;
  }
}

/**
 * row184：该地块明细能否从计划里删除。
 *
 * 只有「种植未开始」可删 —— 明细 plantStatus='pending'（字典 djs_plant_plan_status 的「待开始」）
 * 且没有实际开始日期。已完成（completed）/ 进行中（ongoing）/ 已开工的都不显示删除按钮。
 */
function canRemoveDetail(row: PlantDetailsVO): boolean {
  return row.plantStatus === 'pending' && !row.beginActualdate;
}

/**
 * 该地块明细能否后台调整（V6-R36 入口 + V6-R38 采摘态收窄）。
 *
 * 两个条件同时满足才给「修改」：
 *   1. `beginActualdate` 有值 = 已有种植记录。用日期而不是 plantStatus 码值判断，是因为
 *      mp「一步落地」写 completed、历史「开工分步」写 ongoing，两种都是甲方口中的「已种植」，
 *      唯一稳定的共同特征就是实际种植日期已落库。
 *   2. 尚未进入采摘环节。采摘一旦开始/完成，该行下游已挂采摘记录、毛菜处理、产量台账，
 *      后台不再给调整入口（甲方 2026-08-06）。
 *
 * 判据必须与后端 `PlantPlanServiceImpl.isPicked` **逐条一致**（三判据并集），不能只看采摘状态：
 * 「采摘活动」录产量那条写路径（`PlantActivityServiceImpl.accumulateActualYield`）只写 `actual_yield`，
 * 不推 `harvest_status` 也不写 `begin_harvestdate`。只判状态的话，这类行前端显示「修改」、
 * 点保存却被后端拒，是最难解释的一种坏体验。两边同进同出，改一处必须改另一处。
 *
 * 落不到「修改」的已种植行也不会掉进「删除」分支：canRemoveDetail 要求 `!beginActualdate`。
 */
function canAdjustDetail(row: PlantDetailsVO): boolean {
  if (!row.beginActualdate) return false;
  const picked =
    !!row.beginHarvestdate ||
    (row.harvestStatus != null && row.harvestStatus !== HARVEST_STATUS_PENDING) ||
    (row.actualYield != null && Number(row.actualYield) > 0);
  return !picked;
}

function onAdjustDetail(row: PlantDetailsVO) {
  adjustRow.value = row;
  adjustVisible.value = true;
}

async function onAdjustSaved() {
  await load();
  emit('changed');
}

/** row184：确认后把该地块从计划里去除，成功后重拉详情 + 甘特（主表面积/地块数由后端重算） */
async function onRemoveDetail(row: PlantDetailsVO) {
  if (!props.planId) return;
  try {
    await proxy?.$modal.confirm(t('plantPlan.detail.removeDetailConfirm', { plot: row.plotName || row.plotCode || '' }));
  } catch {
    return; // 用户取消
  }
  await delPlanDetail(row.id);
  ElMessage.success(t('plantPlan.detail.removeDetailSuccess'));
  await load();
  emit('changed');
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
</style>
