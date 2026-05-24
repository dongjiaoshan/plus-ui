<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2">
      <template #title> 仔猪耳标为 <strong>只读历史</strong>。新增请到小程序端的「仔猪批量耳标」录入。 </template>
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
          {{ row.pigletSex === 'F' ? '母' : '公' }}
        </el-tag>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventEartag" lang="ts">
import { listPigletEarTag } from '@/api/djs-breed/event/eartag';
import type { PigletnoVO, PigletEarTagQuery } from '@/api/djs-breed/event/eartag';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const tableRef = ref<BizTableExpose>();
const list = ref<PigletnoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigletEarTagQuery>({
  pigletEarNo: undefined,
  motherEarNo: undefined,
  farrowId: undefined,
  pigletSex: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'pigletEarNo', label: '仔猪耳号', type: 'input', placeholder: '完整耳号', clearable: true },
  { field: 'motherEarNo', label: '母猪耳号', type: 'input', placeholder: '完整耳号', clearable: true },
  { field: 'farrowId', label: '分娩 ID', type: 'number', placeholder: 't_farm_pig_farrow.id' },
  {
    field: 'pigletSex',
    label: '性别',
    type: 'select',
    options: [
      { label: '母 F', value: 'F' },
      { label: '公 M', value: 'M' }
    ],
    clearable: true
  }
];

const columns: BizTableColumn[] = [
  { prop: 'pigletEarNo', label: '仔猪耳号', minWidth: 140, fixed: 'left' },
  { prop: 'pigletSex', label: '性别', width: 80, align: 'center' },
  { prop: 'motherEarNo', label: '母猪耳号', width: 140, align: 'center' },
  { prop: 'fatherEarNo', label: '父猪耳号', width: 140, align: 'center' },
  { prop: 'farrowId', label: '分娩 ID', width: 140, align: 'center' },
  { prop: 'birthWeight', label: '出生重 (kg)', width: 110, align: 'center' },
  { prop: 'tagDate', label: '打标日期', width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'remark', label: '备注', minWidth: 140 }
];

async function load() {
  loading.value = true;
  try {
    const params: PigletEarTagQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res: any = await listPigletEarTag(params);
    list.value = (res.rows ?? []) as PigletnoVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: PigletEarTagQuery) {
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
