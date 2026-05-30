<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2" :title="t('breedEvent.eartag.readonlyTip')" />
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
      perm-prefix="djs:breed:event:eartag"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #cell-pigletSex="{ row }">
        <el-tag :type="row.pigletSex === 'F' ? 'success' : 'primary'" size="small">
          {{ row.pigletSex === 'F' ? t('breedEvent.sex.female') : t('breedEvent.sex.male') }}
        </el-tag>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventEartag" lang="ts">
import { useI18n } from 'vue-i18n';
import { listPigletEarTag } from '@/api/djs-breed/event/eartag';
import type { PigletnoVO, PigletEarTagQuery } from '@/api/djs-breed/event/eartag';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const list = ref<PigletnoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigletEarTagQuery>({
  pigletEarNo: undefined,
  motherEarNo: undefined,
  pigletSex: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'pigletEarNo',
    label: t('breedEvent.eartag.field.pigletEarNo'),
    type: 'input',
    placeholder: t('breedEvent.eartag.placeholder.pigletEarNo'),
    clearable: true
  },
  {
    field: 'motherEarNo',
    label: t('breedEvent.eartag.field.motherEarNo'),
    type: 'input',
    placeholder: t('breedEvent.eartag.placeholder.motherEarNo'),
    clearable: true
  },
  {
    field: 'pigletSex',
    label: t('breedEvent.eartag.field.pigletSex'),
    type: 'select',
    options: [
      { label: t('breedEvent.sex.femaleOption'), value: 'F' },
      { label: t('breedEvent.sex.maleOption'), value: 'M' }
    ],
    clearable: true
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'pigletEarNo', label: t('breedEvent.eartag.column.pigletEarNo'), minWidth: 140, fixed: 'left' },
  { prop: 'pigletSex', label: t('breedEvent.eartag.column.pigletSex'), width: 80, align: 'center' },
  { prop: 'motherEarNo', label: t('breedEvent.eartag.column.motherEarNo'), width: 140, align: 'center' },
  { prop: 'fatherEarNo', label: t('breedEvent.eartag.column.fatherEarNo'), width: 140, align: 'center' },
  { prop: 'farrowDate', label: t('breedEvent.eartag.column.farrowDate'), width: 140, align: 'center', formatter: 'datetime' },
  { prop: 'birthWeight', label: t('breedEvent.eartag.column.birthWeight'), width: 110, align: 'center' },
  { prop: 'tagDate', label: t('breedEvent.eartag.column.tagDate'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'remark', label: t('breedEvent.eartag.column.remark'), minWidth: 140 },
  { prop: 'farrowId', label: t('breedEvent.eartag.column.farrowId'), width: 180, align: 'center', visible: false }
]);

async function load() {
  loading.value = true;
  try {
    const params: PigletEarTagQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPigletEarTag(params);
    list.value = (res.rows ?? []) as PigletnoVO[];
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
    pigletEarNo: undefined,
    motherEarNo: undefined,
    pigletSex: undefined
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
