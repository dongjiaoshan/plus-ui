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
      :dict-types="['djs_veg_handle_status', 'djs_record_type', 'djs_handle_target']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:vegHandle"
      show-export
      :show-add="false"
      :show-batch-del="false"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
      @row-click="handleRowClick"
    >
      <!-- 只读，无 edit / del；提供「详情」按钮显式入口（行点击为辅助入口） -->
      <template #action="{ row }">
        <el-button
          v-hasPermi="['djs:warehouse:vegHandle:query']"
          link
          type="primary"
          @click="handleRowClick(row as VegetableHandleVO)"
        >
          {{ t('djs.warehouse.vegHandle.detail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- 详情下钻：handle_record 流水 -->
    <el-dialog v-model="recordsDialogVisible" :title="t('djs.warehouse.vegHandle.recordsDialogTitle')" width="900px">
      <el-table :data="records" stripe size="default">
        <el-table-column prop="recordType" :label="t('djs.warehouse.vegHandle.recordType')" min-width="100">
          <template #default="{ row }">
            {{ row.recordType === 1 ? t('djs.warehouse.vegHandle.recordTypePick') : t('djs.warehouse.vegHandle.recordTypeHandle') }}
          </template>
        </el-table-column>
        <el-table-column prop="recordWeight" :label="t('djs.warehouse.vegHandle.recordWeight')" min-width="120" />
        <el-table-column prop="handleTarget" :label="t('djs.warehouse.vegHandle.handleTarget')" min-width="120">
          <template #default="{ row }">
            {{ handleTargetLabel(row.handleTarget) }}
          </template>
        </el-table-column>
        <el-table-column prop="locationName" :label="t('djs.warehouse.vegHandle.location')" min-width="140" />
        <el-table-column prop="handleUserName" :label="t('djs.warehouse.vegHandle.operator')" min-width="120" />
        <el-table-column prop="handleTime" :label="t('djs.warehouse.vegHandle.handleTime')" min-width="160" />
        <el-table-column prop="remark" :label="t('djs.warehouse.vegHandle.remark')" min-width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="VegHandle" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listVegHandle, listVegHandleRecords } from '@/api/djs-warehouse/vegHandle';
import type { VegetableHandleVO, HandleRecordVO, VegHandleQuery } from '@/api/djs-warehouse/vegHandle/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<VegetableHandleVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const records = ref<HandleRecordVO[]>([]);
const recordsDialogVisible = ref(false);

const searchModel = reactive<Record<string, any>>({
  plotId: undefined,
  cropId: undefined,
  handleStatus: undefined,
  pickStartTimeFrom: undefined,
  pickStartTimeTo: undefined
});

const statusOptions = [
  { label: t('djs.warehouse.vegHandle.statusPending'), value: 'pending' },
  { label: t('djs.warehouse.vegHandle.statusProcessing'), value: 'processing' },
  { label: t('djs.warehouse.vegHandle.statusDone'), value: 'done' }
];

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { key: 'plotId', label: t('djs.warehouse.vegHandle.plot'), type: 'input' },
  { key: 'cropId', label: t('djs.warehouse.vegHandle.crop'), type: 'input' },
  { key: 'handleStatus', label: t('djs.warehouse.vegHandle.handleStatus'), type: 'select', options: statusOptions }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'plotName', label: t('djs.warehouse.vegHandle.plot'), minWidth: 120 },
  { prop: 'cropName', label: t('djs.warehouse.vegHandle.crop'), minWidth: 120 },
  { prop: 'pickStartTime', label: t('djs.warehouse.vegHandle.pickStartTime'), minWidth: 160 },
  { prop: 'pickEndTime', label: t('djs.warehouse.vegHandle.pickEndTime'), minWidth: 160 },
  { prop: 'pickedWeight', label: t('djs.warehouse.vegHandle.pickedWeight'), minWidth: 110 },
  { prop: 'handledWeight', label: t('djs.warehouse.vegHandle.handledWeight'), minWidth: 110 },
  { prop: 'feedWeight', label: t('djs.warehouse.vegHandle.feedWeight'), minWidth: 110 },
  { prop: 'sendPlatformWeight', label: t('djs.warehouse.vegHandle.sendPlatformWeight'), minWidth: 110 },
  { prop: 'stockInWeight', label: t('djs.warehouse.vegHandle.stockInWeight'), minWidth: 110 },
  { prop: 'lossWeight', label: t('djs.warehouse.vegHandle.lossWeight'), minWidth: 110 },
  { prop: 'handleStatus', label: t('djs.warehouse.vegHandle.handleStatus'), minWidth: 100 },
  { prop: 'remark', label: t('djs.warehouse.vegHandle.remark'), minWidth: 160 }
]);

function handleTargetLabel(t: number | undefined) {
  if (t === 1) return '入库';
  if (t === 2) return '月台';
  if (t === 3) return '饲料';
  return '';
}

async function loadList() {
  loading.value = true;
  try {
    const params: VegHandleQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listVegHandle(params);
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

function handlePageChange(p: { pageNum: number; pageSize: number }) {
  pageNum.value = p.pageNum;
  pageSize.value = p.pageSize;
  loadList();
}

function handleExport() {
  proxy?.download('/djs/warehouse/vegHandle/export', { ...searchModel }, `毛菜处理_${new Date().getTime()}.xlsx`);
}

async function handleRowClick(row: VegetableHandleVO) {
  records.value = [];
  recordsDialogVisible.value = true;
  const res = await listVegHandleRecords(row.id);
  records.value = (res as any).data ?? [];
}

onMounted(() => {
  loadList();
});
</script>
