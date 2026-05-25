<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2">
      <template #title>
        <strong>事件台账</strong> · 状态机统一流水（t_farm_status_record，所有事件自动写入）。各事件录入请到小程序端对应表单。
      </template>
    </el-alert>
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:breed:pig"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #cell-eventType="{ row }">
        <el-tag :type="eventTagType(row.eventType)" size="small">
          {{ eventLabel(row.eventType) }}
        </el-tag>
      </template>
      <template #cell-transition="{ row }">
        <span class="text-xs">
          <el-tag size="small" type="info" effect="plain" v-if="row.oldStatus">{{ statusLabel(row.oldStatus) }}</el-tag>
          <span v-else class="text-gray-400">—</span>
          <span class="mx-1 text-gray-400">→</span>
          <el-tag size="small" :type="statusTagType(row.newStatus)" effect="plain">{{ statusLabel(row.newStatus) }}</el-tag>
        </span>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventStatusRecord" lang="ts">
import { listStatusRecord } from '@/api/djs-breed/event/status-record';
import type { PigStatusRecordVO, PigStatusRecordQuery } from '@/api/djs-breed/event/status-record';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const tableRef = ref<BizTableExpose>();
const list = ref<PigStatusRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const EVENT_LABEL: Record<string, string> = {
  INTRO: '引种',
  BREED: '配种',
  FARROW: '分娩',
  WEAN: '断奶',
  OESTRUS: '查情',
  NULL_RETURN: '返空',
  DIE: '死亡',
  ELIMINATE: '淘汰',
  CASTRATE: '阉割',
  TRANSFER: '转移',
  SLAUGHTER: '出栏'
};

const STATUS_LABEL: Record<string, string> = {
  HB: '后备',
  PZ: '配种',
  PH: '配怀',
  FM: '分娩',
  DN: '断奶',
  LC: '流产',
  KH: '空怀',
  FQ: '返情',
  END: '终止',
  BOAR_ACTIVE: '公猪在产'
};

function eventLabel(t: string) {
  return EVENT_LABEL[t] || t;
}
function statusLabel(s: string) {
  return STATUS_LABEL[s] || s;
}
function eventTagType(t: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  if (['INTRO', 'BREED', 'FARROW'].includes(t)) return 'success';
  if (['WEAN', 'TRANSFER'].includes(t)) return '';
  if (['OESTRUS', 'NULL_RETURN'].includes(t)) return 'warning';
  if (['DIE', 'ELIMINATE', 'CASTRATE', 'SLAUGHTER'].includes(t)) return 'danger';
  return 'info';
}
function statusTagType(s: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  if (s === 'END') return 'info';
  if (['LC', 'KH', 'FQ'].includes(s)) return 'warning';
  return 'success';
}

const searchModel = reactive<PigStatusRecordQuery>({
  pigId: undefined,
  earNo: undefined,
  eventType: undefined,
  newStatus: undefined,
  changeTimeStart: undefined,
  changeTimeEnd: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'earNo', label: '耳号', type: 'input', placeholder: '精确匹配', clearable: true },
  { field: 'pigId', label: '猪只 ID', type: 'input', placeholder: '可选', clearable: true },
  {
    field: 'eventType',
    label: '事件类型',
    type: 'select',
    options: Object.entries(EVENT_LABEL).map(([value, label]) => ({ label: `${label} (${value})`, value })),
    clearable: true,
    filterable: true
  },
  {
    field: 'newStatus',
    label: '变更后状态',
    type: 'select',
    options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ label: `${label} (${value})`, value })),
    clearable: true,
    filterable: true
  }
];

const columns: BizTableColumn[] = [
  { prop: 'changeTime', label: '变更时间', width: 165, align: 'center', formatter: 'datetime', fixed: 'left' },
  { prop: 'earNo', label: '耳号', width: 140, align: 'center' },
  { prop: 'eventType', label: '事件', width: 110, align: 'center' },
  { prop: 'transition', label: '状态变化', width: 180, align: 'center' },
  { prop: 'pigId', label: '猪只 ID', width: 180, align: 'center' },
  { prop: 'relatedEventId', label: '关联业务 ID', width: 150, align: 'center' },
  { prop: 'durationDays', label: '停留天数', width: 90, align: 'center' },
  { prop: 'id', label: '流水 ID', width: 180, align: 'center' }
];

async function load() {
  loading.value = true;
  try {
    const params: PigStatusRecordQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res: any = await listStatusRecord(params);
    list.value = (res.rows ?? []) as PigStatusRecordVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: PigStatusRecordQuery) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.keys(searchModel).forEach((k) => ((searchModel as any)[k] = undefined));
  pageNum.value = 1;
  load();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  load();
}

onMounted(() => {
  load();
});
</script>
