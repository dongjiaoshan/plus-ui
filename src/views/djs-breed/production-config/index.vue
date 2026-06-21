<template>
  <div class="p-2">
    <el-alert class="mb-3" type="info" show-icon :closable="true" :title="t('productionConfig.tip.noAutoTrigger')" />

    <el-tabs v-model="activeTab" class="biz-tabs">
      <!-- Tab1 母猪生产配置（6 字段表单）-->
      <el-tab-pane :label="t('productionConfig.tab.sow')" name="sow">
        <el-card shadow="never" class="form-card">
          <el-form ref="sowFormRef" :model="sowForm" label-width="180px" class="config-form">
            <el-form-item v-for="item in SOW_FIELDS" :key="item.key" :label="t('productionConfig.sow.' + item.key)">
              <el-input-number v-model="sowForm[item.key]" :min="0" :max="9999" :step="1" :precision="0" controls-position="right" />
              <span class="unit-suffix">{{ t('productionConfig.unit.day') }}</span>
            </el-form-item>
            <el-form-item>
              <el-button v-hasPermi="['djs:breed:production-cycle:edit']" type="primary" :loading="sowSaving" @click="onSaveSow">
                {{ t('common.save') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- Tab2 育肥生产配置（日龄阶段表格 CRUD）-->
      <el-tab-pane :label="t('productionConfig.tab.fatten')" name="fatten">
        <el-card shadow="never" class="form-card">
          <div class="table-toolbar">
            <el-button v-hasPermi="['djs:breed:production-cycle:edit']" type="primary" plain icon="Plus" @click="onAddStage">
              {{ t('productionConfig.fatten.addStage') }}
            </el-button>
            <el-button v-hasPermi="['djs:breed:production-cycle:edit']" type="success" :loading="fattenSaving" @click="onSaveFatten">
              {{ t('common.save') }}
            </el-button>
          </div>
          <el-table v-loading="fattenLoading" :data="fattenList" border row-key="rowKey">
            <el-table-column type="index" :label="t('productionConfig.fatten.index')" width="70" align="center" />
            <el-table-column :label="t('productionConfig.fatten.startAge')" min-width="160" align="center" header-align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.startAge" :min="0" :max="9999" :step="1" :precision="0" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column :label="t('productionConfig.fatten.endAge')" min-width="160" align="center" header-align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.endAge" :min="0" :max="9999" :step="1" :precision="0" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column :label="t('productionConfig.fatten.recordGrowth')" width="160" align="center" header-align="center">
              <template #default="{ row }">
                <el-switch v-model="row.recordGrowth" :active-value="1" :inactive-value="0" />
              </template>
            </el-table-column>
            <el-table-column :label="t('common.operate')" width="100" align="center" header-align="center">
              <template #default="{ $index }">
                <el-button v-hasPermi="['djs:breed:production-cycle:edit']" type="danger" link icon="Delete" @click="onRemoveStage($index)">
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- Tab3 出栏配置（单字段表单）-->
      <el-tab-pane :label="t('productionConfig.tab.slaughter')" name="slaughter">
        <el-card shadow="never" class="form-card">
          <el-form ref="slaughterFormRef" :model="slaughterForm" label-width="180px" class="config-form">
            <el-form-item :label="t('productionConfig.slaughter.slaughterAge')">
              <el-input-number v-model="slaughterForm.slaughter_age_days" :min="0" :max="9999" :step="1" :precision="0" controls-position="right" />
              <span class="unit-suffix">{{ t('productionConfig.unit.day') }}</span>
            </el-form-item>
            <el-form-item>
              <el-button v-hasPermi="['djs:breed:production-cycle:edit']" type="primary" :loading="slaughterSaving" @click="onSaveSlaughter">
                {{ t('common.save') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="ProductionConfig" lang="ts">
import {
  batchSaveFattenStage,
  getSlaughterConfig,
  getSowConfig,
  listFattenStage,
  saveSlaughterConfig,
  saveSowConfig
} from '@/api/djs-breed/production-config';
import type { FattenAgeStageVO } from '@/api/djs-breed/production-config/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeTab = ref<'sow' | 'fatten' | 'slaughter'>('sow');

// ============= Tab1 母猪生产配置（6 字段表单）=============
// key 与后端 ProductionCycleConfigController.SOW_DEFAULTS 严格对齐
const SOW_FIELDS = [
  { key: 'sow_reserve_to_breed_days' },
  { key: 'sow_wean_to_breed_days' },
  { key: 'sow_return_to_breed_days' },
  { key: 'sow_empty_to_breed_days' },
  { key: 'sow_abort_to_breed_days' },
  { key: 'sow_breed_to_farrow_days' },
  { key: 'sow_farrow_to_wean_days' }
] as const;

const sowForm = reactive<Record<string, number>>({
  sow_reserve_to_breed_days: 7,
  sow_wean_to_breed_days: 6,
  sow_return_to_breed_days: 5,
  sow_empty_to_breed_days: 5,
  sow_abort_to_breed_days: 5,
  sow_breed_to_farrow_days: 141,
  sow_farrow_to_wean_days: 25
});
const sowSaving = ref(false);

async function fetchSow() {
  const res = await getSowConfig();
  const data = (res.data ?? {}) as Record<string, number>;
  SOW_FIELDS.forEach((f) => {
    if (data[f.key] != null) {
      sowForm[f.key] = data[f.key];
    }
  });
}

async function onSaveSow() {
  sowSaving.value = true;
  try {
    const payload: Record<string, number> = {};
    SOW_FIELDS.forEach((f) => (payload[f.key] = sowForm[f.key]));
    await saveSowConfig(payload);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    fetchSow();
  } finally {
    sowSaving.value = false;
  }
}

// ============= Tab2 育肥生产配置（日龄阶段表格）=============
interface FattenRow {
  rowKey: string;
  id?: number | string;
  startAge: number | null;
  endAge: number | null;
  recordGrowth: number;
}

const fattenList = ref<FattenRow[]>([]);
const fattenLoading = ref(false);
const fattenSaving = ref(false);
let rowSeq = 0;

function nextRowKey(): string {
  rowSeq += 1;
  return 'r' + rowSeq;
}

async function fetchFatten() {
  fattenLoading.value = true;
  try {
    const res = await listFattenStage();
    const rows = (res.data ?? []) as FattenAgeStageVO[];
    fattenList.value = rows.map((r) => ({
      rowKey: nextRowKey(),
      id: r.id,
      startAge: r.startAge,
      endAge: r.endAge,
      recordGrowth: r.recordGrowth ?? 0
    }));
  } finally {
    fattenLoading.value = false;
  }
}

function onAddStage() {
  // 新增行默认接续上一行的截止日龄 + 1（连续日龄段）
  const last = fattenList.value[fattenList.value.length - 1];
  const start = last && last.endAge != null ? last.endAge + 1 : 0;
  fattenList.value.push({ rowKey: nextRowKey(), startAge: start, endAge: null, recordGrowth: 0 });
}

function onRemoveStage(index: number) {
  fattenList.value.splice(index, 1);
}

async function onSaveFatten() {
  // 前端校验：每行起止非空 + 截止 ≥ 起始
  for (let i = 0; i < fattenList.value.length; i++) {
    const r = fattenList.value[i];
    if (r.startAge == null || r.endAge == null) {
      proxy?.$modal.msgError(t('productionConfig.fatten.ruleRequired', { row: i + 1 }));
      return;
    }
    if (r.endAge < r.startAge) {
      proxy?.$modal.msgError(t('productionConfig.fatten.ruleRange', { row: i + 1 }));
      return;
    }
  }
  fattenSaving.value = true;
  try {
    const payload = fattenList.value.map((r) => ({
      startAge: r.startAge,
      endAge: r.endAge,
      recordGrowth: r.recordGrowth
    }));
    await batchSaveFattenStage(payload);
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    fetchFatten();
  } finally {
    fattenSaving.value = false;
  }
}

// ============= Tab3 出栏配置（单字段表单）=============
const slaughterForm = reactive<Record<string, number>>({ slaughter_age_days: 175 });
const slaughterSaving = ref(false);

async function fetchSlaughter() {
  const res = await getSlaughterConfig();
  const data = (res.data ?? {}) as Record<string, number>;
  if (data.slaughter_age_days != null) {
    slaughterForm.slaughter_age_days = data.slaughter_age_days;
  }
}

async function onSaveSlaughter() {
  slaughterSaving.value = true;
  try {
    await saveSlaughterConfig({ slaughter_age_days: slaughterForm.slaughter_age_days });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    fetchSlaughter();
  } finally {
    slaughterSaving.value = false;
  }
}

onMounted(() => {
  fetchSow();
  fetchFatten();
  fetchSlaughter();
});
</script>

<style scoped>
.biz-tabs :deep(.el-tabs__content) {
  padding-top: 4px;
}
.form-card {
  max-width: 720px;
}
.config-form {
  padding-top: 8px;
}
.unit-suffix {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}
.table-toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}
</style>
