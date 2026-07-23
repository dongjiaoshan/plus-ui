<template>
  <el-drawer v-model="visible" size="90%" destroy-on-close>
    <template #header>
      <div class="flex items-center justify-between w-full pr-4">
        <span class="text-base font-medium">
          {{ t('pickPlan.adjust.title') }}
          <span class="text-sm text-gray-500 ml-2">{{ cropName }}</span>
        </span>
        <el-tooltip :content="t('biz.table.action.export')" placement="top">
          <el-button v-hasPermi="['djs:plant:pick:export']" link type="primary" icon="Download" @click="handleExport" />
        </el-tooltip>
      </div>
    </template>

    <!-- 表格上方筛选：是否采摘活动 + 采摘状态 -->
    <el-form :inline="true" class="mb-3 pick-adjust-filter">
      <el-form-item :label="t('pickPlan.adjust.filter.isPick')">
        <el-select v-model="filterIsPick" :placeholder="t('pickPlan.adjust.placeholder.isPick')" clearable style="width: 200px">
          <el-option :label="t('pickPlan.adjust.activityOptYes')" :value="1" />
          <el-option :label="t('pickPlan.adjust.activityOptNo')" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('pickPlan.adjust.filter.harvestStatus')">
        <el-select v-model="filterStatus" :placeholder="t('pickPlan.adjust.placeholder.harvestStatus')" clearable style="width: 200px">
          <el-option v-for="d in djs_pick_status" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="filteredRows" border stripe row-key="id" :empty-text="t('common.empty')">
      <el-table-column :label="t('pickPlan.adjust.col.cropName')" prop="cropName" width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.plotCode')" prop="plotCode" width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.plotName')" prop="plotName" width="140" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.isPick')" min-width="130" align="center" header-align="center">
        <template #default="{ row }">
          <el-tag :type="row.isPick === 1 ? 'warning' : 'info'" size="small">
            {{ row.isPick === 1 ? t('pickPlan.adjust.activityOptYes') : t('pickPlan.adjust.activityOptNo') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.harvestStatus')" width="100" align="center" header-align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
        </template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plantDate')" prop="plantDate" width="120" align="center" header-align="center">
        <template #default="{ row }">{{ row.plantDate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plantTeam')" prop="plantTeamName" width="120" align="center" header-align="center" show-overflow-tooltip>
        <template #default="{ row }">{{ (row.plantTeamNames && row.plantTeamNames.length ? row.plantTeamNames.join('、') : row.plantTeamName) || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.beginHarvestdate')" prop="beginHarvestdate" width="140" align="center" header-align="center">
        <template #default="{ row }">{{ row.beginHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.endHarvestdate')" prop="endHarvestdate" width="140" align="center" header-align="center">
        <template #default="{ row }">{{ row.endHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.planEarliest')" prop="earliestHarvestdate" width="140" align="center" header-align="center">
        <template #default="{ row }">{{ row.earliestHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.planLatest')" prop="lastHarvestdate" width="140" align="center" header-align="center">
        <template #default="{ row }">{{ row.lastHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plotArea')" prop="plotArea" width="100" align="center" header-align="center">
        <template #default="{ row }">{{ row.plotArea != null ? `${row.plotArea} 亩` : '-' }}</template>
      </el-table-column>
      <!-- row185：标准产量列展示已扣灾害损失的净值（后端 netExpectedYield = max(0, 标准产量 − 灾害损失)）；
           后端无 netExpectedYield 时回退原 expectedYield，避免老数据空白 -->
      <el-table-column :label="t('pickPlan.adjust.col.standardYield')" prop="expectedYield" width="120" align="center" header-align="center">
        <template #default="{ row }">{{
          (row.netExpectedYield ?? row.expectedYield) != null ? `${row.netExpectedYield ?? row.expectedYield} kg` : '-'
        }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.actualYield')" prop="actualYield" width="110" align="center" header-align="center">
        <template #default="{ row }">{{ `${row.actualYield ?? 0} kg` }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.lossYield')" prop="lossYield" width="110" align="center" header-align="center">
        <template #default="{ row }">{{ `${row.lossYield ?? 0} kg` }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.column.action')" width="200" fixed="right" align="center" header-align="center">
        <template #default="{ row }">
          <template v-if="rowEditable(row as AdjustRow)">
            <el-button v-hasPermi="['djs:plant:pick:adjust']" link type="primary" size="small" @click="openScheduleDialog(row as AdjustRow)">
              {{ t('pickPlan.adjust.action.setSchedule') }}
            </el-button>
            <el-button
              v-hasPermi="['djs:plant:pick:adjust']"
              link
              :type="(row as AdjustRow).isPick === 1 ? 'warning' : 'primary'"
              size="small"
              :loading="togglingId === String(row.id)"
              @click="toggleActivity(row as AdjustRow)"
            >
              {{ (row as AdjustRow).isPick === 1 ? t('pickPlan.adjust.action.unsetActivity') : t('pickPlan.adjust.action.setActivity') }}
            </el-button>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 设置计划 modal：仅 开始 / 结束采摘日期 + 居中确定（抽屉内层 dialog） -->
    <el-dialog v-model="dialogVisible" :title="t('pickPlan.adjust.dialog.title')" width="420px" append-to-body align-center>
      <el-form :model="scheduleForm" label-width="120px">
        <el-form-item :label="t('pickPlan.adjust.dialog.beginDate')" required>
          <el-date-picker
            v-model="scheduleForm.earliestHarvestdate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('pickPlan.adjust.dialog.endDate')">
          <el-date-picker
            v-model="scheduleForm.lastHarvestdate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-center">
          <el-button type="primary" :loading="dialogSubmitting" @click="submitSchedule">{{ t('common.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup name="PickAdjustDrawer" lang="ts">
import { listPickPlanDetailsByCrop, setPickSchedule, togglePickActivity } from '@/api/djs-plant/pick';
import { getCrop } from '@/api/djs-plant/crop';
import type { PlantDetailsVO } from '@/api/djs-plant/plan/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// useDict 异步回填，必须 toRefs 保持响应式；直接解构会拿到初始空数组快照，
// 导致「采摘状态」列 dict-tag 与筛选下拉为空（对齐 overview/CropDetailDrawer 写法）。
const { djs_pick_status } = toRefs(useDict('djs_pick_status'));

/** 详情行：后端 PlantDetailsVo 含 plantDate（plan/types.ts 暂未补，本视图本地扩展）。 */
interface AdjustRow extends PlantDetailsVO {
  plantDate?: string;
}

/** 采摘状态门控：仅 待开始(pending)/延期(delayed) 可操作；采摘中(picking)/已完成(completed) 锁定。 */
function rowEditable(row: AdjustRow): boolean {
  return row.harvestStatus !== 'picking' && row.harvestStatus !== 'completed';
}

const visible = ref(false);
const cropId = ref<string>('');
const cropName = ref<string>('');
/** 作物生长最大周期（天）；open 时按 cropId 取 maxCycle，用于改最早采摘日时自动重算最晚采摘日。 */
const cropCycleDays = ref(0);

const rows = ref<AdjustRow[]>([]);
const loading = ref(false);

// 表格上方筛选（客户端过滤已加载行）
const filterIsPick = ref<number | undefined>(undefined);
const filterStatus = ref<string | undefined>(undefined);

const filteredRows = computed(() =>
  rows.value.filter(
    (r) =>
      (filterIsPick.value == null || r.isPick === filterIsPick.value) &&
      (!filterStatus.value || r.harvestStatus === filterStatus.value)
  )
);

// 设置计划 modal
const dialogVisible = ref(false);
const dialogSubmitting = ref(false);
const currentRow = ref<AdjustRow | null>(null);
const scheduleForm = reactive<{ earliestHarvestdate?: string; lastHarvestdate?: string }>({
  earliestHarvestdate: undefined,
  lastHarvestdate: undefined
});

const togglingId = ref<string>('');

// 打开「设置计划」时抑制 earliestHarvestdate watch 的初始重算，避免 clobber 该行原始 lastHarvestdate（最晚采摘日期）
const suppressRecalc = ref(false);

/** 在 YYYY-MM-DD 日期上加 days 天，返回 YYYY-MM-DD（基于本地零点构造，避免时区漂移）。 */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// 改「最早采摘」时按作物生长最大周期自动重算「最晚采摘」；无周期数据（cropCycleDays=0）则不覆盖，沿用后端原窗口派生兜底。
watch(
  () => scheduleForm.earliestHarvestdate,
  (v) => {
    if (suppressRecalc.value) return;
    if (v && cropCycleDays.value > 0) {
      scheduleForm.lastHarvestdate = addDays(v, cropCycleDays.value);
    }
  }
);

async function loadRows() {
  if (!cropId.value) {
    ElMessage.error(t('pickPlan.adjust.paramsMissing'));
    return;
  }
  loading.value = true;
  try {
    const res = await listPickPlanDetailsByCrop(cropId.value);
    rows.value = (res.data || []) as AdjustRow[];
  } finally {
    loading.value = false;
  }
}

async function openScheduleDialog(row: AdjustRow) {
  currentRow.value = row;
  // 先抑制 watch 重算，确保结束采摘日期默认 = 该行最晚采摘日期（而非 最早+作物生长周期）
  suppressRecalc.value = true;
  scheduleForm.earliestHarvestdate = row.earliestHarvestdate || undefined;
  scheduleForm.lastHarvestdate = row.lastHarvestdate || undefined;
  await nextTick();
  suppressRecalc.value = false;
  dialogVisible.value = true;
}

async function submitSchedule() {
  if (!currentRow.value) {
    return;
  }
  if (!scheduleForm.earliestHarvestdate) {
    ElMessage.warning(t('pickPlan.adjust.dialog.beginRequired'));
    return;
  }
  if (scheduleForm.lastHarvestdate && scheduleForm.lastHarvestdate < scheduleForm.earliestHarvestdate) {
    ElMessage.warning(t('pickPlan.adjust.dialog.dateOrder'));
    return;
  }
  dialogSubmitting.value = true;
  try {
    await setPickSchedule({
      id: String(currentRow.value.id),
      earliestHarvestdate: scheduleForm.earliestHarvestdate,
      lastHarvestdate: scheduleForm.lastHarvestdate
    });
    proxy?.$modal.msgSuccess(t('pickPlan.adjust.toggleSuccess'));
    dialogVisible.value = false;
    await loadRows();
  } finally {
    dialogSubmitting.value = false;
  }
}

async function toggleActivity(row: AdjustRow) {
  const next = row.isPick === 1 ? 2 : 1;
  togglingId.value = String(row.id);
  try {
    await togglePickActivity({ id: String(row.id), isPick: next });
    proxy?.$modal.msgSuccess(t('pickPlan.adjust.toggleSuccess'));
    await loadRows();
  } finally {
    togglingId.value = '';
  }
}

function handleExport() {
  proxy?.download('djs/plant/pick/plan/details/export', { cropId: cropId.value || undefined }, `pick_plan_detail_${new Date().getTime()}.xlsx`);
}

/** 由列表 handleAdjust 触发，传 cropId/cropName 打开抽屉并拉明细。 */
async function open(payload: { cropId: number | string; cropName?: string }) {
  visible.value = true;
  cropId.value = String(payload.cropId || '');
  cropName.value = payload.cropName || '';
  // 取作物生长最大周期（天），供改最早采摘日时重算最晚采摘日
  cropCycleDays.value = 0;
  if (payload.cropId) {
    try {
      const c = await getCrop(payload.cropId);
      cropCycleDays.value = c.data?.maxCycle ?? 0;
    } catch {
      cropCycleDays.value = 0;
    }
  }
  // 重置筛选，避免上次残留
  filterIsPick.value = undefined;
  filterStatus.value = undefined;
  rows.value = [];
  await loadRows();
}

defineExpose({ open });
</script>

<style scoped>
/* 筛选区 inline label 不换行（避免「是否采摘活动」6 字被折成两行） */
.pick-adjust-filter :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
