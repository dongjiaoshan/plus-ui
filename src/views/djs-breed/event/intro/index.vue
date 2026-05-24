<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2">
      <template #title> 引种登记为 <strong>只读历史</strong>。新增请到小程序端的「引种登记」录入（饲养员在猪舍扫码 + 拍凭证）。 </template>
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
      perm-prefix="djs:breed:event:intro"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #cell-introduceType="{ row }">
        <el-tag :type="row.introduceType === 'external' ? 'warning' : 'success'" size="small">
          {{ row.introduceType === 'external' ? '外部引种' : '内部调拨' }}
        </el-tag>
      </template>
      <template #cell-pigSex="{ row }">
        <el-tag v-if="row.pigSex" :type="row.pigSex === 'F' ? 'success' : 'primary'" size="small">
          {{ row.pigSex === 'F' ? '母' : '公' }}
        </el-tag>
        <span v-else>—</span>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventIntro" lang="ts">
import { listPigIntro } from '@/api/djs-breed/event/intro';
import type { PigIntroduceVO, PigIntroQuery } from '@/api/djs-breed/event/intro';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const tableRef = ref<BizTableExpose>();
const list = ref<PigIntroduceVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<PigIntroQuery>({
  introduceNo: undefined,
  introduceType: undefined,
  pigSex: undefined,
  beginDate: undefined,
  endDate: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'introduceNo', label: '引种单号', type: 'input', placeholder: '前缀如 INT2026', clearable: true },
  {
    field: 'introduceType',
    label: '引种方式',
    type: 'select',
    options: [
      { label: '外部引种', value: 'external' },
      { label: '内部调拨', value: 'internal' }
    ],
    clearable: true
  },
  {
    field: 'pigSex',
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
  { prop: 'introduceNo', label: '引种单号', minWidth: 160, fixed: 'left' },
  { prop: 'introduceType', label: '引种方式', width: 100, align: 'center' },
  { prop: 'introduceDate', label: '引种日期', width: 110, align: 'center', formatter: 'date' },
  { prop: 'pigCount', label: '猪只数', width: 80, align: 'center' },
  { prop: 'startEarNo', label: '起始耳号', width: 140, align: 'center' },
  { prop: 'pigSex', label: '性别', width: 80, align: 'center' },
  { prop: 'pigBreedCode', label: '品种', width: 100, align: 'center' },
  { prop: 'pigStrainCode', label: '品系', width: 100, align: 'center' },
  { prop: 'supplierId', label: '供应商ID', width: 120, align: 'center' },
  { prop: 'remark', label: '备注', minWidth: 140 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center', formatter: 'datetime' }
];

async function load() {
  loading.value = true;
  try {
    const params: PigIntroQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res: any = await listPigIntro(params);
    list.value = (res.rows ?? []) as PigIntroduceVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: PigIntroQuery) {
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
