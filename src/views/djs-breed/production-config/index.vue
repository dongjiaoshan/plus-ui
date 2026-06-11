<template>
  <div class="p-2">
    <el-alert class="mb-3" type="info" show-icon :closable="true" :title="t('productionConfig.tip.noAutoTrigger')" />

    <el-tabs v-model="activeTab" class="biz-tabs">
      <!-- Tab1 生产周期 -->
      <el-tab-pane :label="t('productionConfig.tab.cycle')" name="cycle">
        <BizTable
          :data="cycleList"
          :total="cycleTotal"
          :loading="cycleLoading"
          :columns="cycleColumns"
          :search-schema="cycleSearchSchema"
          :search-model="cycleSearch"
          :page-num="cyclePageNum"
          :page-size="cyclePageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:production-cycle"
          @search="onCycleSearch"
          @reset="onCycleReset"
          @add="onCycleAdd"
          @edit="onCycleEdit"
          @del="onCycleDel"
          @page-change="onCyclePageChange"
        />
      </el-tab-pane>

      <!-- Tab2 精液公猪 -->
      <el-tab-pane :label="t('productionConfig.tab.boar')" name="boar">
        <BizTable
          :data="boarList"
          :total="boarTotal"
          :loading="boarLoading"
          :columns="boarColumns"
          :search-schema="boarSearchSchema"
          :search-model="boarSearch"
          :page-num="boarPageNum"
          :page-size="boarPageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:production-boar"
          @search="onBoarSearch"
          @reset="onBoarReset"
          @add="onBoarAdd"
          @edit="onBoarEdit"
          @del="onBoarDel"
          @page-change="onBoarPageChange"
        />
      </el-tab-pane>

      <!-- Tab3 药品周期 -->
      <el-tab-pane :label="t('productionConfig.tab.med')" name="med">
        <BizTable
          :data="medList"
          :total="medTotal"
          :loading="medLoading"
          :columns="medColumns"
          :search-schema="medSearchSchema"
          :search-model="medSearch"
          :page-num="medPageNum"
          :page-size="medPageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:production-med"
          @search="onMedSearch"
          @reset="onMedReset"
          @add="onMedAdd"
          @edit="onMedEdit"
          @del="onMedDel"
          @page-change="onMedPageChange"
        />
      </el-tab-pane>
    </el-tabs>

    <CycleForm ref="cycleFormRef" @success="fetchCycle" />
    <BoarForm ref="boarFormRef" @success="fetchBoar" />
    <MedScheduleForm ref="medFormRef" @success="fetchMed" />
  </div>
</template>

<script setup name="ProductionConfig" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import CycleForm from './components/CycleForm.vue';
import BoarForm from './components/BoarForm.vue';
import MedScheduleForm from './components/MedScheduleForm.vue';
import {
  delBoarConfig,
  delMedSchedule,
  delProductionCycle,
  listBoarConfig,
  listMedSchedule,
  listProductionCycle
} from '@/api/djs-breed/production-config';
import type {
  BoarConfigQuery,
  BoarConfigVO,
  MedScheduleConfigQuery,
  MedScheduleConfigVO,
  ProductionCycleConfigQuery,
  ProductionCycleConfigVO
} from '@/api/djs-breed/production-config/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_med_type, djs_med_event_trigger } = toRefs<any>(proxy?.useDict('djs_med_type', 'djs_med_event_trigger'));

const activeTab = ref<'cycle' | 'boar' | 'med'>('cycle');

const cycleFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const boarFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const medFormRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

// ============= Tab1 cycle state =============
const cycleList = ref<ProductionCycleConfigVO[]>([]);
const cycleTotal = ref(0);
const cycleLoading = ref(false);
const cyclePageNum = ref(1);
const cyclePageSize = ref(10);
const cycleSearch = reactive<Record<string, any>>({ configKey: undefined, description: undefined });

const cycleSearchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'configKey', label: t('productionConfig.field.configKey'), type: 'input' },
  { field: 'description', label: t('productionConfig.field.description'), type: 'input' }
]);

const cycleColumns = computed<BizTableColumn[]>(() => [
  { prop: 'configKey', label: t('productionConfig.column.configKey'), width: 200 },
  { prop: 'defaultValue', label: t('productionConfig.column.defaultValue'), width: 100, align: 'right' },
  { prop: 'customValue', label: t('productionConfig.column.customValue'), width: 110, align: 'right' },
  { prop: 'unit', label: t('productionConfig.column.unit'), width: 80, align: 'center' },
  { prop: 'description', label: t('productionConfig.column.description'), minWidth: 240, showOverflowTooltip: true },
  { prop: 'remark', label: t('productionConfig.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('productionConfig.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchCycle() {
  cycleLoading.value = true;
  try {
    const query: ProductionCycleConfigQuery = {
      pageNum: cyclePageNum.value,
      pageSize: cyclePageSize.value,
      configKey: cycleSearch.configKey || undefined,
      description: cycleSearch.description || undefined
    };
    const res = await listProductionCycle(query);
    cycleList.value = (res.rows ?? res.data ?? []) as ProductionCycleConfigVO[];
    cycleTotal.value = res.total ?? 0;
  } finally {
    cycleLoading.value = false;
  }
}

function onCycleSearch() {
  cyclePageNum.value = 1;
  fetchCycle();
}
function onCycleReset() {
  onCycleSearch();
}
function onCyclePageChange(payload: number | [number, number]) {
  if (Array.isArray(payload)) {
    cyclePageNum.value = payload[0];
    cyclePageSize.value = payload[1];
  }
  fetchCycle();
}
function onCycleAdd() {
  cycleFormRef.value?.openCreate();
}
function onCycleEdit(row: BizRow) {
  cycleFormRef.value?.openEdit(row.id);
}
async function onCycleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('productionConfig.confirm.delCycle', { count: ids.length }));
  await delProductionCycle(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchCycle();
}

// ============= Tab2 boar state =============
const boarList = ref<BoarConfigVO[]>([]);
const boarTotal = ref(0);
const boarLoading = ref(false);
const boarPageNum = ref(1);
const boarPageSize = ref(10);
const boarSearch = reactive<Record<string, any>>({ boarId: undefined });

const boarSearchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'boarId', label: t('productionConfig.field.boarId'), type: 'input' }]);

const boarColumns = computed<BizTableColumn[]>(() => [
  { prop: 'boarId', label: t('productionConfig.column.boarId'), width: 140, align: 'right' },
  { prop: 'spermQualityThreshold', label: t('productionConfig.column.spermQualityThreshold'), width: 160, align: 'right' },
  { prop: 'breedingIntervalDays', label: t('productionConfig.column.breedingIntervalDays'), width: 140, align: 'right' },
  { prop: 'remark', label: t('productionConfig.column.remark'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: t('productionConfig.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchBoar() {
  boarLoading.value = true;
  try {
    const query: BoarConfigQuery = {
      pageNum: boarPageNum.value,
      pageSize: boarPageSize.value,
      boarId: boarSearch.boarId || undefined
    };
    const res = await listBoarConfig(query);
    boarList.value = (res.rows ?? res.data ?? []) as BoarConfigVO[];
    boarTotal.value = res.total ?? 0;
  } finally {
    boarLoading.value = false;
  }
}

function onBoarSearch() {
  boarPageNum.value = 1;
  fetchBoar();
}
function onBoarReset() {
  onBoarSearch();
}
function onBoarPageChange(payload: number | [number, number]) {
  if (Array.isArray(payload)) {
    boarPageNum.value = payload[0];
    boarPageSize.value = payload[1];
  }
  fetchBoar();
}
function onBoarAdd() {
  boarFormRef.value?.openCreate();
}
function onBoarEdit(row: BizRow) {
  boarFormRef.value?.openEdit(row.id);
}
async function onBoarDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('productionConfig.confirm.delBoar', { count: ids.length }));
  await delBoarConfig(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchBoar();
}

// ============= Tab3 med state =============
const medList = ref<MedScheduleConfigVO[]>([]);
const medTotal = ref(0);
const medLoading = ref(false);
const medPageNum = ref(1);
const medPageSize = ref(10);
const medSearch = reactive<Record<string, any>>({ medType: undefined, eventTrigger: undefined });

const medSearchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'medType',
    label: t('productionConfig.field.medType'),
    type: 'select',
    options: (djs_med_type.value || []).map((d: any) => ({ value: d.value, label: d.label }))
  },
  {
    field: 'eventTrigger',
    label: t('productionConfig.field.eventTrigger'),
    type: 'select',
    options: (djs_med_event_trigger.value || []).map((d: any) => ({ value: d.value, label: d.label }))
  }
]);

const medColumns = computed<BizTableColumn[]>(() => [
  {
    prop: 'medType',
    label: t('productionConfig.column.medType'),
    width: 120,
    align: 'center',
    formatter: (row: any) => {
      const item = (djs_med_type.value || []).find((d: any) => d.value === row.medType);
      return item ? item.label : row.medType;
    }
  },
  {
    prop: 'eventTrigger',
    label: t('productionConfig.column.eventTrigger'),
    width: 140,
    align: 'center',
    formatter: (row: any) => {
      const item = (djs_med_event_trigger.value || []).find((d: any) => d.value === row.eventTrigger);
      return item ? item.label : row.eventTrigger;
    }
  },
  { prop: 'daysOffset', label: t('productionConfig.column.daysOffset'), width: 110, align: 'right' },
  { prop: 'description', label: t('productionConfig.column.description'), minWidth: 220, showOverflowTooltip: true },
  { prop: 'remark', label: t('productionConfig.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('productionConfig.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

async function fetchMed() {
  medLoading.value = true;
  try {
    const query: MedScheduleConfigQuery = {
      pageNum: medPageNum.value,
      pageSize: medPageSize.value,
      medType: medSearch.medType || undefined,
      eventTrigger: medSearch.eventTrigger || undefined
    };
    const res = await listMedSchedule(query);
    medList.value = (res.rows ?? res.data ?? []) as MedScheduleConfigVO[];
    medTotal.value = res.total ?? 0;
  } finally {
    medLoading.value = false;
  }
}

function onMedSearch() {
  medPageNum.value = 1;
  fetchMed();
}
function onMedReset() {
  onMedSearch();
}
function onMedPageChange(payload: number | [number, number]) {
  if (Array.isArray(payload)) {
    medPageNum.value = payload[0];
    medPageSize.value = payload[1];
  }
  fetchMed();
}
function onMedAdd() {
  medFormRef.value?.openCreate();
}
function onMedEdit(row: BizRow) {
  medFormRef.value?.openEdit(row.id);
}
async function onMedDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('productionConfig.confirm.delMed', { count: ids.length }));
  await delMedSchedule(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchMed();
}

onMounted(() => {
  fetchCycle();
  fetchBoar();
  fetchMed();
});
</script>

<style scoped>
.biz-tabs :deep(.el-tabs__content) {
  padding-top: 4px;
}
</style>
