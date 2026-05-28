<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="900px" @closed="reset">
    <div class="flex justify-between items-center mb-2">
      <el-text size="default">
        {{ t('demand.assignPig.selectedTip', { selected: selectedRows.length, required: requiredCount }) }}
      </el-text>
      <el-button size="small" :icon="Refresh" @click="fetchAvailable">{{ t('common.refresh') }}</el-button>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="available"
      row-key="earNo"
      border
      height="360"
      @selection-change="onSelectionChange"
      @select="onSelectOne"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="earNo" :label="t('demand.assignPig.column.earNo')" min-width="140" />
      <el-table-column prop="pigSex" :label="t('demand.assignPig.column.pigSex')" width="80" align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_pig_sex" :value="row.pigSex" />
        </template>
      </el-table-column>
      <el-table-column prop="pigBreedLabel" :label="t('demand.assignPig.column.pigBreed')" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.pigBreedLabel || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ageDays" :label="t('demand.assignPig.column.ageDays')" width="100" align="right">
        <template #default="{ row }">
          <span>{{ row.ageDays == null ? '—' : row.ageDays }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastBackfat" :label="t('demand.assignPig.column.lastBackfat')" width="120" align="right">
        <template #default="{ row }">
          <span>{{ formatBackfat(row.lastBackfat) }}</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :description="t('demand.assignPig.emptyAvailable')" />
      </template>
    </el-table>

    <pagination v-if="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" @pagination="fetchAvailable" />

    <div v-if="assignedList.length > 0" class="mt-3">
      <el-divider content-position="left">
        {{ t('demand.assignPig.assignedTitle', { count: assignedList.length }) }}
      </el-divider>
      <el-tag
        v-for="p in assignedList"
        :key="p.earNo"
        type="primary"
        closable
        size="default"
        class="mr-2 mb-2"
        @close="onRemove(p.earNo)"
      >
        {{ p.earNo }}
      </el-tag>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" :disabled="selectedRows.length === 0" @click="handleAssign">
        {{ t('demand.assignPig.confirmBtn', { count: selectedRows.length }) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Refresh } from '@element-plus/icons-vue';
import { assignPigs, listAssignedPigs, listAvailablePigs, removeAssignedPig } from '@/api/djs-warehouse/demand';
import type { DemandPigVO, PigAvailableVO } from '@/api/djs-warehouse/demand/types';

const emit = defineEmits<{ (e: 'success'): void }>();
const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_sex } = toRefs<any>(proxy?.useDict('djs_pig_sex'));

const visible = ref(false);
const submitting = ref(false);
const loading = ref(false);
const demandId = ref<string>('');
const demandNo = ref<string>('');
const requiredCount = ref<number>(0);

const available = ref<PigAvailableVO[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const selectedRows = ref<PigAvailableVO[]>([]);
const tableRef = ref<any>();

const assignedList = ref<DemandPigVO[]>([]);

const dialogTitle = computed(() => t('demand.assignPig.title', { no: demandNo.value, required: requiredCount.value }));

function formatBackfat(v: number | string | undefined | null) {
  if (v === undefined || v === null || v === '') return '—';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return '—';
  return n.toFixed(2);
}

async function fetchAvailable() {
  loading.value = true;
  try {
    const res = await listAvailablePigs({ pageNum: pageNum.value, pageSize: pageSize.value });
    const payload = res as any;
    available.value = (payload.rows ?? payload.data ?? []) as PigAvailableVO[];
    total.value = Number(payload.total ?? 0);
    // 翻页后清掉已选（避免跨页歧义）
    tableRef.value?.clearSelection?.();
    selectedRows.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadAssigned() {
  if (!demandId.value) return;
  const res = await listAssignedPigs(demandId.value);
  assignedList.value = ((res as any).data ?? []) as DemandPigVO[];
}

function onSelectionChange(rows: PigAvailableVO[]) {
  // requiredCount 兜底：若超过 required，弹提示并截断
  if (requiredCount.value > 0 && rows.length > requiredCount.value) {
    proxy?.$modal.msgWarning(t('demand.assignPig.overLimit', { required: requiredCount.value }));
    // 回退最后一次选中
    const last = rows[rows.length - 1];
    tableRef.value?.toggleRowSelection(last, false);
    return;
  }
  selectedRows.value = rows;
}

function onSelectOne(_rows: PigAvailableVO[], _row: PigAvailableVO) {
  // selection-change 已处理；保留 hook 给后续 BizTable 扩展
}

async function open(id: string, no: string, required: number) {
  reset();
  demandId.value = id;
  demandNo.value = no;
  requiredCount.value = Number(required ?? 0);
  visible.value = true;
  await Promise.all([fetchAvailable(), loadAssigned()]);
}

function reset() {
  available.value = [];
  total.value = 0;
  pageNum.value = 1;
  pageSize.value = 10;
  selectedRows.value = [];
  assignedList.value = [];
  demandId.value = '';
  demandNo.value = '';
  requiredCount.value = 0;
}

async function handleAssign() {
  if (!demandId.value || selectedRows.value.length === 0) return;
  const earNos = selectedRows.value.map((p) => p.earNo);
  submitting.value = true;
  try {
    await assignPigs(demandId.value, { earNos });
    proxy?.$modal.msgSuccess(t('demand.assignPig.assignSuccess', { count: earNos.length }));
    await Promise.all([fetchAvailable(), loadAssigned()]);
    emit('success');
  } finally {
    submitting.value = false;
  }
}

async function onRemove(earNo: string) {
  await proxy?.$modal.confirm(t('demand.assignPig.confirmRemove', { earNo }));
  await removeAssignedPig(demandId.value, earNo);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  await Promise.all([fetchAvailable(), loadAssigned()]);
  emit('success');
}

defineExpose({ open });
</script>
