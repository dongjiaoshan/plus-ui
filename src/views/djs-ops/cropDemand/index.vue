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
      :dict-types="DEMAND_DICT_TYPES"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:ops:cropDemand"
      show-add
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="160"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button link type="primary" @click="handleDetail(row)">
          {{ t('cropDemand.action.detail') }}
        </el-button>
        <el-button v-if="canDelete(row)" v-hasPermi="['djs:ops:cropDemand:remove']" link type="danger" @click="handleDel(row)">
          {{ t('cropDemand.action.del') }}
        </el-button>
      </template>
    </BizTable>

    <CropDemandForm ref="formRef" @success="loadList" />
    <DemandDetailDialog ref="detailRef" />
  </div>
</template>

<script setup name="CropDemandIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import CropDemandForm from './components/CropDemandForm.vue';
import DemandDetailDialog from '@/views/djs-plant/demandFeedback/components/DemandDetailDialog.vue';
import {
  buildDemandColumns,
  buildDemandSearchSchema,
  createDemandSearchModel,
  demandDateRangeOf,
  DEMAND_DICT_TYPES,
  type DemandSearchModel
} from '@/views/djs-plant/demandFeedback/components/demandShared';
import { delCropDemand, listCropDemand } from '@/api/djs-plant/cropDemand';
import type { CropDemandQuery, CropDemandVO } from '@/api/djs-plant/cropDemand/types';
import { useUserStore } from '@/store/modules/user';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userStore = useUserStore();

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void }>();
const detailRef = ref<{ open: (id: number | string) => void }>();

const list = ref<CropDemandVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<DemandSearchModel>(createDemandSearchModel());

const searchSchema = computed<SearchFieldSchema[]>(() => buildDemandSearchSchema(t));
const columns = computed<BizTableColumn[]>(() => buildDemandColumns(t));

function buildQuery(): CropDemandQuery {
  const { beginDate, endDate } = demandDateRangeOf(searchModel.demandDateRange);
  return {
    demandContent: searchModel.demandContent || undefined,
    demandCategory: searchModel.demandCategory || undefined,
    demandStatus: searchModel.demandStatus || undefined,
    beginDate,
    endDate,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listCropDemand(buildQuery());
    const r = res as unknown as { rows?: CropDemandVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 只有创建人本人能删自己录入的需求（甲方 row152 第 3 点）。
 * 这里只是隐藏按钮，真正的拦截在后端 CropDemandServiceImpl.deleteWithValidByIds。
 * 雪花 ID 走 string，统一 String() 比较，不用 Number()。
 */
function canDelete(row: BizRow): boolean {
  const createBy = row.createBy;
  if (createBy == null) return false;
  return String(createBy) === String(userStore.userId);
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

function handleReset() {
  Object.assign(searchModel, createDemandSearchModel());
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleAdd() {
  formRef.value?.openCreate();
}

function handleDetail(row: BizRow) {
  detailRef.value?.open(row.id as number | string);
}

async function handleDel(row: BizRow) {
  await proxy?.$modal.confirm(t('cropDemand.confirm.del'));
  await delCropDemand(row.id as number | string);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  loadList();
}

onMounted(() => {
  loadList();
});
</script>
