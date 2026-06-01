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
      :dict-types="['djs_bar_status', 'djs_pig_cut_part']"
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

const cutStatusOptions = [
  { label: '待领用', value: 'pending_pickup' },
  { label: '已领用', value: 'picked' },
  { label: '分割中', value: 'cutting' },
  { label: '已完成', value: 'done' }
];

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { key: 'cutId', label: t('djs.warehouse.pigCut.cutId'), type: 'input' },
  { key: 'barId', label: t('djs.warehouse.pigCut.barId'), type: 'input' },
  { key: 'earNo', label: t('djs.warehouse.pigCut.earNo'), type: 'input' },
  { key: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), type: 'select', options: cutStatusOptions }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cutId', label: t('djs.warehouse.pigCut.cutId'), minWidth: 140 },
  { prop: 'barId', label: t('djs.warehouse.pigCut.barId'), minWidth: 140 },
  { prop: 'earNo', label: t('djs.warehouse.pigCut.earNo'), minWidth: 120 },
  { prop: 'pickupTime', label: t('djs.warehouse.pigCut.pickupTime'), minWidth: 160 },
  { prop: 'cutStartTime', label: t('djs.warehouse.pigCut.cutStartTime'), minWidth: 160 },
  { prop: 'cutDoneTime', label: t('djs.warehouse.pigCut.cutDoneTime'), minWidth: 160 },
  { prop: 'pickupWeight', label: t('djs.warehouse.pigCut.pickupWeight'), minWidth: 100 },
  { prop: 'dripLoss', label: t('djs.warehouse.pigCut.dripLoss'), minWidth: 100 },
  { prop: 'acidRemoveMinutes', label: t('djs.warehouse.pigCut.acidRemoveMinutes'), minWidth: 100 },
  { prop: 'cutStatus', label: t('djs.warehouse.pigCut.cutStatus'), minWidth: 100 },
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
