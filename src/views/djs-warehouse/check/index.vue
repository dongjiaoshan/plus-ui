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
      :dict-types="['djs_check_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:check"
      show-export
      :show-add="true"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @add="openCreateDialog"
      @export="handleExport"
      @page-change="(pn: number, ps: number) => handlePageChange(pn, ps)"
    >
      <template #action="{ row }">
        <el-button type="primary" link @click="openDetailDialog(row as StockCheckHeaderVO)">
          {{ t('djs.warehouse.check.detail') }}
        </el-button>
        <el-button
          v-if="(row as StockCheckHeaderVO).checkStatus === 'in_progress'"
          v-hasPermi="['djs:warehouse:check:complete']"
          type="success"
          link
          @click="handleComplete(row as StockCheckHeaderVO)"
        >
          {{ t('djs.warehouse.check.complete') }}
        </el-button>
        <el-button
          v-if="(row as StockCheckHeaderVO).checkStatus === 'in_progress'"
          v-hasPermi="['djs:warehouse:check:cancel']"
          type="warning"
          link
          @click="handleCancel(row as StockCheckHeaderVO)"
        >
          {{ t('djs.warehouse.check.cancel') }}
        </el-button>
      </template>
    </BizTable>

    <CheckCreateDialog v-model="createVisible" @success="onCreated" />
    <CheckDetailDialog v-model="detailVisible" :header="currentRow" />
  </div>
</template>

<script setup name="StockCheck" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { cancelCheck, completeCheck, listCheck } from '@/api/djs-warehouse/check';
import type { StockCheckHeaderVO, StockCheckQuery } from '@/api/djs-warehouse/check/types';
import CheckCreateDialog from './components/CheckCreateDialog.vue';
import CheckDetailDialog from './components/CheckDetailDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<StockCheckHeaderVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  checkId: undefined,
  checkStatus: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'checkId', label: t('djs.warehouse.check.checkId'), type: 'input' },
  { field: 'checkStatus', label: t('djs.warehouse.check.checkStatus'), type: 'select', dictType: 'djs_check_status' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'checkId', label: t('djs.warehouse.check.checkId'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'locationName', label: t('djs.warehouse.check.locationName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'checkDate', label: t('djs.warehouse.check.checkDate'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'checkStatus', label: t('djs.warehouse.check.checkStatus'), width: 100, align: 'center', dictType: 'djs_check_status' },
  { prop: 'lineCount', label: t('djs.warehouse.check.lineCount'), width: 90, align: 'center' },
  { prop: 'diffSum', label: t('djs.warehouse.check.diffSum'), width: 110, align: 'right' },
  { prop: 'createTime', label: t('djs.warehouse.check.createTime'), minWidth: 160, align: 'center', formatter: 'datetime' }
]);

// 新建盘点单
const createVisible = ref(false);
function openCreateDialog() {
  createVisible.value = true;
}
function onCreated() {
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.createSuccess'));
  loadList();
}

// 详情
const detailVisible = ref(false);
const currentRow = ref<StockCheckHeaderVO | null>(null);
function openDetailDialog(row: StockCheckHeaderVO) {
  currentRow.value = row;
  detailVisible.value = true;
}

// 完成盘点
async function handleComplete(row: StockCheckHeaderVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.check.completeConfirm', { no: row.checkId }));
  await completeCheck(row.id);
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.completeSuccess'));
  await loadList();
}

// 取消盘点
async function handleCancel(row: StockCheckHeaderVO) {
  await proxy?.$modal.confirm(t('djs.warehouse.check.cancelConfirm', { no: row.checkId }));
  await cancelCheck(row.id);
  proxy?.$modal.msgSuccess(t('djs.warehouse.check.cancelSuccess'));
  await loadList();
}

async function loadList() {
  loading.value = true;
  try {
    const params: StockCheckQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listCheck(params);
    list.value = (res as any).rows ?? [];
    total.value = (res as any).total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  handleSearch();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/check/export', { ...searchModel }, `库存盘点_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  loadList();
});
</script>
