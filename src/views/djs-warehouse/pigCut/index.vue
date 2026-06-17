<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_bar_status', 'djs_pig_cut_part', 'djs_pig_cut_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:pigCut"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- P5 外购标注：外购行显「普通白条」+ 供应商名，自养行显耳号 -->
      <template #cell-earNo="{ row }">
        <template v-if="row.isOutsource">
          <el-tag type="warning" size="small" disable-transitions>{{ t('djs.warehouse.pigCut.outsourceBar') }}</el-tag>
          <span v-if="row.supplierName" class="supplier-name">{{ row.supplierName }}</span>
        </template>
        <span v-else>{{ row.earNo ?? '—' }}</span>
      </template>
      <!-- 分割记录只读，无 edit / del 入口（写入走 mp） -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="PigCut" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPigCut } from '@/api/djs-warehouse/pigCut';
import type { PigCutRecordQuery, PigCutRecordVO } from '@/api/djs-warehouse/pigCut/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PigCutRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  cutId: undefined,
  barId: undefined,
  earNo: undefined,
  cutStatus: undefined,
  pickupTimeFrom: undefined,
  pickupTimeTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cutId', label: t('djs.warehouse.pigCut.cutId'), type: 'input' },
  { field: 'barId', label: t('djs.warehouse.pigCut.barId'), type: 'input' },
  { field: 'earNo', label: t('djs.warehouse.pigCut.earNo'), type: 'input' },
  { field: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), type: 'select', dictType: 'djs_pig_cut_status' }
]);

/** 比率 → 百分比文本；分母缺失（后端返 null/undefined）显「—」 */
function fmtRate(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

/** 重量 → kg 文本（2 位小数）；缺失显「—」 */
function fmtKg(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return n.toFixed(2);
}

/** 分钟 → 文本；缺失显「—」 */
function fmtMinutes(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return String(n);
}

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cutId', label: t('djs.warehouse.pigCut.cutId'), minWidth: 140 },
  { prop: 'barId', label: t('djs.warehouse.pigCut.barId'), minWidth: 140 },
  { prop: 'earNo', label: t('djs.warehouse.pigCut.earNo'), minWidth: 140 },
  { prop: 'supplierName', label: t('djs.warehouse.pigCut.supplierName'), minWidth: 120, formatter: (row) => row.supplierName ?? '—' },
  { prop: 'pickupTime', label: t('djs.warehouse.pigCut.pickupTime'), minWidth: 160 },
  { prop: 'cutStartTime', label: t('djs.warehouse.pigCut.cutStartTime'), minWidth: 160 },
  { prop: 'cutDoneTime', label: t('djs.warehouse.pigCut.cutDoneTime'), minWidth: 160 },
  { prop: 'pickupWeight', label: t('djs.warehouse.pigCut.pickupWeight'), minWidth: 100 },
  { prop: 'headSkinYieldRate', label: t('djs.warehouse.pigCut.headSkinYieldRate'), minWidth: 110, formatter: (row) => fmtRate(row.headSkinYieldRate) },
  { prop: 'whiteBarYieldRate', label: t('djs.warehouse.pigCut.whiteBarYieldRate'), minWidth: 110, formatter: (row) => fmtRate(row.whiteBarYieldRate) },
  { prop: 'precoolLossWeight', label: t('djs.warehouse.pigCut.precoolLossWeight'), minWidth: 110, formatter: (row) => fmtKg(row.precoolLossWeight) },
  { prop: 'precoolLossRate', label: t('djs.warehouse.pigCut.precoolLossRate'), minWidth: 110, formatter: (row) => fmtRate(row.precoolLossRate) },
  { prop: 'coldStorageMinutes', label: t('djs.warehouse.pigCut.coldStorageMinutes'), minWidth: 110, formatter: (row) => fmtMinutes(row.coldStorageMinutes) },
  { prop: 'cutProductTotalWeight', label: t('djs.warehouse.pigCut.cutProductTotalWeight'), minWidth: 110, formatter: (row) => fmtKg(row.cutProductTotalWeight) },
  { prop: 'cutLossWeight', label: t('djs.warehouse.pigCut.cutLossWeight'), minWidth: 100, formatter: (row) => fmtKg(row.cutLossWeight) },
  { prop: 'dripLoss', label: t('djs.warehouse.pigCut.dripLoss'), minWidth: 100 },
  { prop: 'acidRemoveMinutes', label: t('djs.warehouse.pigCut.acidRemoveMinutes'), minWidth: 100 },
  { prop: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), minWidth: 100, dictType: 'djs_pig_cut_status' },
  { prop: 'operatorName', label: t('djs.warehouse.pigCut.operator'), minWidth: 100 },
  { prop: 'locationName', label: t('djs.warehouse.pigCut.location'), minWidth: 120 },
  { prop: 'remark', label: t('djs.warehouse.pigCut.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PigCutRecordQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPigCut(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(p: { pageNum: number; pageSize: number }) {
  pageNum.value = p.pageNum;
  pageSize.value = p.pageSize;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/pigCut/export', { ...searchModel }, `分割记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.supplier-name {
  margin-left: 6px;
  color: var(--el-text-color-regular);
}
</style>
