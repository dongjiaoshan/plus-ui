<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-medium">
            {{ t('pickPlan.adjust.title') }}
            <span class="text-sm text-gray-500 ml-2">{{ planNo }} · {{ cropName }}</span>
          </span>
          <el-button link @click="goBack">{{ t('pickPlan.adjust.backToList') }}</el-button>
        </div>
      </template>

      <el-alert :title="t('pickPlan.adjust.tip')" type="info" :closable="false" class="mb-3" />

      <el-table v-loading="loading" :data="rows" border stripe row-key="id" :empty-text="t('common.empty')">
        <el-table-column :label="t('pickPlan.adjust.col.plotCode')" prop="plotCode" width="120" />
        <el-table-column :label="t('pickPlan.adjust.col.plotName')" prop="plotName" width="160" show-overflow-tooltip />
        <el-table-column :label="t('pickPlan.adjust.col.plotArea')" prop="plotArea" width="100" align="right">
          <template #default="{ row }">{{ row.plotArea }} 亩</template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.adjust.col.planEarliest')" prop="earliestHarvestdate" width="120" align="center" />
        <el-table-column :label="t('pickPlan.adjust.col.planLatest')" prop="lastHarvestdate" width="120" align="center" />
        <el-table-column :label="t('pickPlan.adjust.col.beginHarvestdate')" width="160">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.beginHarvestdate"
              type="date"
              size="small"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 140px"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.adjust.col.endHarvestdate')" width="160">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.endHarvestdate"
              type="date"
              size="small"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 140px"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.adjust.col.isPick')" width="140" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row._isPickBool"
              :active-text="t('pickPlan.adjust.activityYes')"
              :inactive-text="t('pickPlan.adjust.activityNo')"
              inline-prompt
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.adjust.col.harvestBy')" width="160">
          <template #default="{ row }">
            <el-select v-model="row.harvestBy" :placeholder="t('pickPlan.placeholder.team')" clearable size="small" style="width: 140px">
              <el-option v-for="opt in teamOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="t('pickPlan.adjust.col.harvestStatus')" width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="goBack">{{ t('common.cancel') }}</el-button>
        <el-button v-hasPermi="['djs:plant:pick:adjust']" type="primary" :loading="submitting" @click="submit">
          {{ t('common.save') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="PickPlanAdjust" lang="ts">
import { listPickPlanDetails, adjustPickPlan } from '@/api/djs-plant/pick';
import type { PickAdjustBatchForm } from '@/api/djs-plant/pick/types';
import type { PlantDetailsVO } from '@/api/djs-plant/plan/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { djs_pick_status } = useDict('djs_pick_status');

interface AdjustRow extends PlantDetailsVO {
  _isPickBool: boolean;
}

const planId = ref<string>(String(route.query.planId || ''));
const cropId = ref<string>(String(route.query.cropId || ''));
const planNo = ref<string>(String(route.query.planNo || ''));
const cropName = ref<string>(String(route.query.cropName || ''));

const rows = ref<AdjustRow[]>([]);
const loading = ref(false);
const submitting = ref(false);

interface TeamOption {
  label: string;
  value: string;
}
const teamOptions = ref<TeamOption[]>([]);

async function loadRows() {
  if (!planId.value || !cropId.value) {
    ElMessage.error(t('pickPlan.adjust.paramsMissing'));
    return;
  }
  loading.value = true;
  try {
    const res = await listPickPlanDetails(planId.value, cropId.value);
    const data = (res.data || []) as PlantDetailsVO[];
    rows.value = data.map((d) => ({ ...d, _isPickBool: d.isPick === 1 }));
    // 收集已出现的班组到选项（V1 简化：从当前数据带出）
    const seen = new Map<string, string>();
    data.forEach((d) => {
      if (d.harvestBy && d.harvestTeamName) {
        seen.set(String(d.harvestBy), d.harvestTeamName);
      }
      if (d.plantBy && d.plantTeamName) {
        seen.set(String(d.plantBy), d.plantTeamName);
      }
    });
    teamOptions.value = Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/djs-plant/pick/plan');
}

async function submit() {
  if (!rows.value.length) {
    return;
  }
  const form: PickAdjustBatchForm = {
    plantId: planId.value,
    cropId: cropId.value,
    rows: rows.value.map((r) => ({
      id: String(r.id),
      beginHarvestdate: r.beginHarvestdate,
      endHarvestdate: r.endHarvestdate,
      isPick: r._isPickBool ? 1 : 2,
      harvestBy: r.harvestBy ? String(r.harvestBy) : undefined
    }))
  };
  submitting.value = true;
  try {
    const res = await adjustPickPlan(form);
    ElMessage.success(t('pickPlan.adjust.saveSuccess', { count: (res.data ?? 0) as number }));
    await loadRows();
  } finally {
    submitting.value = false;
  }
}

onMounted(loadRows);
</script>
