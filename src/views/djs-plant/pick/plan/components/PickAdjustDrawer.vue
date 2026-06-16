<template>
  <el-drawer v-model="visible" size="80%" destroy-on-close>
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
      <el-table-column :label="t('pickPlan.adjust.col.cropName')" prop="cropName" width="120" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.plotCode')" prop="plotCode" width="120" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.plotName')" prop="plotName" width="140" show-overflow-tooltip />
      <el-table-column :label="t('pickPlan.adjust.col.isPick')" min-width="130" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isPick === 1 ? 'warning' : 'info'" size="small">
            {{ row.isPick === 1 ? t('pickPlan.adjust.activityOptYes') : t('pickPlan.adjust.activityOptNo') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.harvestStatus')" width="100" align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
        </template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plantDate')" prop="plantDate" width="120" align="center">
        <template #default="{ row }">{{ row.plantDate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plantTeam')" prop="harvestTeamName" width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.harvestTeamName || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.beginHarvestdate')" prop="beginHarvestdate" width="140" align="center">
        <template #default="{ row }">{{ row.beginHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.endHarvestdate')" prop="endHarvestdate" width="140" align="center">
        <template #default="{ row }">{{ row.endHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.planEarliest')" prop="earliestHarvestdate" width="140" align="center">
        <template #default="{ row }">{{ row.earliestHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.planLatest')" prop="lastHarvestdate" width="140" align="center">
        <template #default="{ row }">{{ row.lastHarvestdate || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.plotArea')" prop="plotArea" width="100" align="right">
        <template #default="{ row }">{{ row.plotArea != null ? `${row.plotArea} 亩` : '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.standardYield')" prop="expectedYield" width="110" align="right">
        <template #default="{ row }">{{ row.expectedYield != null ? `${row.expectedYield} kg` : '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.actualYield')" prop="actualYield" width="110" align="right">
        <template #default="{ row }">{{ `${row.actualYield ?? 0} kg` }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.adjust.col.lossYield')" prop="lossYield" width="110" align="right">
        <template #default="{ row }">{{ `${row.lossYield ?? 0} kg` }}</template>
      </el-table-column>
      <el-table-column :label="t('pickPlan.column.action')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-hasPermi="['djs:plant:pick:adjust']" link type="primary" size="small" @click="openScheduleDialog(row as AdjustRow)">
            {{ t('pickPlan.adjust.action.setSchedule') }}
          </el-button>
          <el-button
            v-hasPermi="['djs:plant:pick:adjust']"
            link
            :type="row.isPick === 1 ? 'warning' : 'primary'"
            size="small"
            :loading="togglingId === String(row.id)"
            @click="toggleActivity(row as AdjustRow)"
          >
            {{ row.isPick === 1 ? t('pickPlan.adjust.action.unsetActivity') : t('pickPlan.adjust.action.setActivity') }}
          </el-button>
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
import type { PlantDetailsVO } from '@/api/djs-plant/plan/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pick_status } = useDict('djs_pick_status');

/** 详情行：后端 PlantDetailsVo 含 plantDate（plan/types.ts 暂未补，本视图本地扩展）。 */
interface AdjustRow extends PlantDetailsVO {
  plantDate?: string;
}

const visible = ref(false);
const cropId = ref<string>('');
const cropName = ref<string>('');

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

function openScheduleDialog(row: AdjustRow) {
  currentRow.value = row;
  scheduleForm.earliestHarvestdate = row.earliestHarvestdate || undefined;
  scheduleForm.lastHarvestdate = row.lastHarvestdate || undefined;
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
