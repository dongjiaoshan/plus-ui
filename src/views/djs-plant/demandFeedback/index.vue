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
      perm-prefix="djs:plant:demandFeedback"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="120"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:demandFeedback:reply']" link type="primary" @click="handleReply(row)">
          {{ t('cropDemand.action.reply') }}
        </el-button>
      </template>
    </BizTable>

    <DemandReplyDialog ref="replyRef" @success="loadList" />
  </div>
</template>

<script setup name="DemandFeedbackIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import DemandReplyDialog from './components/DemandReplyDialog.vue';
import {
  buildDemandColumns,
  buildDemandSearchSchema,
  createDemandSearchModel,
  demandDateRangeOf,
  DEMAND_DICT_TYPES,
  type DemandSearchModel
} from './components/demandShared';
import { listCropDemand } from '@/api/djs-plant/cropDemand';
import type { CropDemandQuery, CropDemandVO } from '@/api/djs-plant/cropDemand/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const replyRef = ref<{ open: (id: number | string) => void }>();

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

/** 甲方：无论什么状态都是「回复」，已回复的进来会回填旧内容供修改。 */
function handleReply(row: BizRow) {
  replyRef.value?.open(row.id as number | string);
}

onMounted(() => {
  loadList();
});
</script>
