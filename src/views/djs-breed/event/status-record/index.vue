<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2" :title="t('breedEvent.ledger.readonlyTip')" />
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_pig_status_event', 'djs_pig_lifecycle']"
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
      <template #cell-transition="{ row }">
        <span class="text-xs">
          <el-tag v-if="row.oldStatus" size="small" type="info" effect="plain">
            <dict-tag :options="djs_pig_lifecycle" :value="row.oldStatus" />
          </el-tag>
          <span v-else class="text-gray-400">{{ t('breedEvent.ledger.transitionInit') }}</span>
          <span class="mx-1 text-gray-400">→</span>
          <el-tag size="small" :type="statusTagType(row.newStatus)" effect="plain">
            <dict-tag :options="djs_pig_lifecycle" :value="row.newStatus" />
          </el-tag>
        </span>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventStatusRecord" lang="ts">
import { useI18n } from 'vue-i18n';
import { listStatusRecord } from '@/api/djs-breed/event/status-record';
import type { PigStatusRecordVO, PigStatusRecordQuery } from '@/api/djs-breed/event/status-record';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// ADR-0004 §2.4 Vue3 字典消费范式
const { djs_pig_lifecycle } = toRefs<any>(proxy?.useDict('djs_pig_lifecycle'));

function statusTagType(s: string): 'success' | 'warning' | 'info' | 'danger' {
  if (s === 'END') return 'info';
  if (['LC', 'KH', 'FQ'].includes(s)) return 'warning';
  return 'success';
}

const tableRef = ref<BizTableExpose>();
const list = ref<PigStatusRecordVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigStatusRecordQuery>({
  earNo: undefined,
  eventType: undefined,
  newStatus: undefined,
  createByName: undefined,
  changeTimeStart: undefined,
  changeTimeEnd: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'earNo',
    label: t('breedEvent.ledger.field.earNo'),
    type: 'input',
    placeholder: t('breedEvent.ledger.placeholder.earNo'),
    clearable: true
  },
  { field: 'eventType', label: t('breedEvent.ledger.field.eventType'), type: 'select', dictType: 'djs_pig_status_event', clearable: true },
  { field: 'newStatus', label: t('breedEvent.ledger.field.newStatus'), type: 'select', dictType: 'djs_pig_lifecycle', clearable: true },
  {
    field: 'createByName',
    label: t('breedEvent.ledger.field.changeBy'),
    type: 'input',
    placeholder: t('breedEvent.ledger.placeholder.changeBy'),
    clearable: true
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'changeTime', label: t('breedEvent.ledger.column.changeTime'), width: 165, align: 'center', formatter: 'datetime', fixed: 'left' },
  { prop: 'earNo', label: t('breedEvent.ledger.column.earNo'), width: 140, align: 'center' },
  { prop: 'eventType', label: t('breedEvent.ledger.column.eventType'), width: 110, align: 'center', dictType: 'djs_pig_status_event' },
  { prop: 'transition', label: t('breedEvent.ledger.column.transition'), width: 180, align: 'center' },
  { prop: 'durationDays', label: t('breedEvent.ledger.column.durationDays'), width: 90, align: 'center' },
  { prop: 'createByName', label: t('breedEvent.ledger.column.changeBy'), width: 100, align: 'center' },
  { prop: 'relatedEventId', label: t('breedEvent.ledger.column.relatedEventId'), width: 180, align: 'center', visible: false },
  { prop: 'pigId', label: t('breedEvent.ledger.column.pigId'), width: 180, align: 'center', visible: false },
  { prop: 'id', label: t('breedEvent.ledger.column.id'), width: 180, align: 'center', visible: false }
]);

async function load() {
  loading.value = true;
  try {
    const params: PigStatusRecordQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listStatusRecord(params);
    list.value = (res.rows ?? []) as PigStatusRecordVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, string | undefined>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.assign(searchModel, {
    earNo: undefined,
    eventType: undefined,
    newStatus: undefined,
    createByName: undefined,
    changeTimeStart: undefined,
    changeTimeEnd: undefined
  });
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
