<template>
  <div class="p-2">
    <!-- 顶部：门店筛选 + 业态切换 tab -->
    <el-card shadow="never" class="mb-2">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm">{{ t('storeDemand.filter.store') }}</span>
        <el-select
          v-model="currentStoreId"
          filterable
          clearable
          :placeholder="t('storeDemand.filter.storePlaceholder')"
          style="width: 240px"
          @change="onStoreChange"
        >
          <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
        </el-select>
        <el-radio-group v-model="currentType" @change="onTypeChange">
          <el-radio-button v-for="pt in productTypes" :key="pt" :value="pt">{{ t(`storeDemand.productType.${pt}`) }}</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_demand_status']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      :show-row-edit="false"
      :show-row-del="false"
      perm-prefix="djs:store:demand"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @page-change="handlePageChange"
    >
      <template #cell-actions="{ row }">
        <el-button v-if="canEdit(row)" link type="primary" size="small" @click="handleEdit(row)">
          {{ t('storeDemand.action.edit') }}
        </el-button>
        <el-button v-if="canAssignPig(row)" link type="primary" size="small" @click="onAssignPig(row)">
          {{ t('storeDemand.action.assignPig') }}
        </el-button>
        <el-button v-if="canCancel(row)" link type="danger" size="small" @click="onCancel(row)">
          {{ t('storeDemand.action.cancel') }}
        </el-button>
        <el-button link type="info" size="small" @click="onDetail(row)">
          {{ t('storeDemand.action.detail') }}
        </el-button>
      </template>
    </BizTable>

    <StoreDemandForm ref="formRef" :product-type="currentType" :default-store-id="currentStoreId" @success="fetchList" />
    <PigAssignDialog ref="pigDialogRef" @success="fetchList" />
  </div>
</template>

<script setup name="StoreDemand" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import StoreDemandForm from './components/StoreDemandForm.vue';
import PigAssignDialog from './components/PigAssignDialog.vue';
import { listStoreDemand, removeStoreDemand, cancelStoreDemand } from '@/api/djs-store/demand';
import type { StoreDemandProductType, StoreDemandStatusCode, StoreDemandVO } from '@/api/djs-store/demand/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const productTypes: StoreDemandProductType[] = ['white_bar', 'vegetable', 'gift_box', 'other'];

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: string) => void; openDetail: (id: string) => void }>();
const pigDialogRef = ref<{ open: (demandId: string, demandNo: string, requiredCount: number) => void }>();

const list = ref<StoreDemandVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const currentType = ref<StoreDemandProductType>('white_bar');
const currentStoreId = ref<string>('');
const storeOptions = ref<StoreVO[]>([]);

const searchModel = reactive<Record<string, unknown>>({});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'demandNo', label: t('storeDemand.field.demandNo'), type: 'input' },
  { field: 'demandStatus', label: t('storeDemand.field.demandStatus'), type: 'select', dictType: 'djs_demand_status' },
  { field: 'beginDate', label: t('storeDemand.field.beginDate'), type: 'date' },
  { field: 'endDate', label: t('storeDemand.field.endDate'), type: 'date' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'demandNo', label: t('storeDemand.column.demandNo'), width: 180 },
  { prop: 'demandDate', label: t('storeDemand.column.demandDate'), width: 110, align: 'center' },
  { prop: 'productName', label: t('storeDemand.column.productName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'demandQuantity', label: t('storeDemand.column.demandQuantity'), width: 100, align: 'right' },
  { prop: 'productUnit', label: t('storeDemand.column.productUnit'), width: 70, align: 'center' },
  { prop: 'demandStatus', label: t('storeDemand.column.demandStatus'), width: 100, align: 'center', dictType: 'djs_demand_status' },
  { prop: 'expectedArriveDate', label: t('storeDemand.column.expectedArriveDate'), width: 110, align: 'center' },
  { prop: 'createTime', label: t('storeDemand.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'actions', label: t('storeDemand.column.actions'), width: 280, fixed: 'right', align: 'center' }
]);

// 仅 SUBMITTED 态可编辑/取消（门店发起后即 SUBMITTED；CONFIRMED 后由仓库主导）
const canEdit = (r: StoreDemandVO) => r.demandStatus === 'SUBMITTED';
const canCancel = (r: StoreDemandVO) => ['DRAFT', 'SUBMITTED', 'CONFIRMED'].includes(r.demandStatus);
// 白条业态 + 未排产前可指定猪只
const canAssignPig = (r: StoreDemandVO) => r.productType === 'white_bar' && ['SUBMITTED', 'CONFIRMED'].includes(r.demandStatus);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[]; data?: StoreVO[] }).rows ?? []) as StoreVO[];
    // 默认选中第一家门店（门店视角必须带 storeId 过滤）
    if (!currentStoreId.value && storeOptions.value.length > 0) {
      currentStoreId.value = String(storeOptions.value[0].id);
    }
  } catch (e) {
    console.warn('[StoreDemand] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const params = {
      ...searchModel,
      productType: currentType.value,
      storeId: currentStoreId.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listStoreDemand(params as Parameters<typeof listStoreDemand>[0]);
    const payload = res as unknown as { rows?: StoreDemandVO[]; total?: number };
    list.value = payload.rows ?? [];
    total.value = Number(payload.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, unknown>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function onStoreChange() {
  pageNum.value = 1;
  fetchList();
}
function onTypeChange() {
  pageNum.value = 1;
  fetchList();
}
function handleAdd() {
  if (!currentStoreId.value) {
    proxy?.$modal.msgWarning(t('storeDemand.tip.selectStoreFirst'));
    return;
  }
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(String(row.id));
}
function onDetail(row: BizRow) {
  formRef.value?.openDetail(String(row.id));
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
  await proxy?.$modal.confirm(t('storeDemand.confirm.del', { count: rows.length }));
  await removeStoreDemand(rows.map((r) => String(r.id)));
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
async function onCancel(row: StoreDemandVO) {
  const { value: remark } = (await proxy?.$modal.prompt(t('storeDemand.prompt.cancelRemark'), t('storeDemand.action.cancel'), {
    inputPlaceholder: t('storeDemand.prompt.cancelRemarkPh')
  })) as { value: string };
  await cancelStoreDemand(row.id, remark);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function onAssignPig(row: StoreDemandVO) {
  const required = Number(row.demandQuantity ?? 0);
  pigDialogRef.value?.open(row.id, row.demandNo, required);
}

onMounted(async () => {
  await loadStoreOptions();
  fetchList();
});
</script>
