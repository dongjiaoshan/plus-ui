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
      :dict-types="['djs_burn_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:pigBurn"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 覆盖默认行级操作 slot 为空：燎毛记录只读，无 edit / del 入口（写入走 mp） -->
      <template #action><span /></template>
    </BizTable>
  </div>
</template>

<script setup name="PigBurn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listPigBurn, exportPigBurn } from '@/api/djs-warehouse/pigBurn';
import type { PigBurnRecordQuery, PigBurnRecordVO } from '@/api/djs-warehouse/pigBurn/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<PigBurnRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  earNo: undefined,
  burnId: undefined,
  burnStatus: undefined,
  burnTimeFrom: undefined,
  burnTimeTo: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { key: 'earNo', label: t('djs.warehouse.pigBurn.earNo'), type: 'input' },
  { key: 'burnId', label: t('djs.warehouse.pigBurn.burnId'), type: 'input' },
  { key: 'burnStatus', label: t('djs.warehouse.pigBurn.burnStatus'), type: 'dict', dictType: 'djs_burn_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'burnId', label: t('djs.warehouse.pigBurn.burnId'), minWidth: 140 },
  { prop: 'earNo', label: t('djs.warehouse.pigBurn.earNo'), minWidth: 140, formatter: (row) => row.earNo ?? '—' },
  { prop: 'burnTime', label: t('djs.warehouse.pigBurn.burnTime'), minWidth: 160 },
  { prop: 'arriveWeight', label: t('djs.warehouse.pigBurn.arriveWeight'), minWidth: 120 },
  { prop: 'burnWeight', label: t('djs.warehouse.pigBurn.burnWeight'), minWidth: 120 },
  { prop: 'lossWeight', label: t('djs.warehouse.pigBurn.lossWeight'), minWidth: 100 },
  { prop: 'burnStatus', label: t('djs.warehouse.pigBurn.burnStatus'), dictType: 'djs_burn_status', minWidth: 100 },
  { prop: 'operatorName', label: t('djs.warehouse.pigBurn.operator'), minWidth: 100 },
  { prop: 'locationName', label: t('djs.warehouse.pigBurn.location'), minWidth: 120 },
  { prop: 'remark', label: t('djs.warehouse.pigBurn.remark'), minWidth: 160 }
]);

async function loadList() {
  loading.value = true;
  try {
    const params: PigBurnRecordQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPigBurn(params);
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

// BizTable 的 page-change 是位置参数 emit('page-change', page, limit)，不是对象。
// 按对象取属性会拿到两个 undefined，axios 丢掉 undefined 参数后后端收不到分页 →
// PageQuery 的 DEFAULT_PAGE_SIZE 是 Integer.MAX_VALUE（默认查全部），于是整表返回（row59 同款）。
function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/pigBurn/export', { ...searchModel }, `燎毛记录_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
