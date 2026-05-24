<template>
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
    selectable
    show-export
    perm-prefix="djs:common:demo"
    @search="handleSearch"
    @reset="handleReset"
    @add="handleAdd"
    @edit="handleEdit"
    @del="handleDel"
    @export="handleExport"
    @page-change="handlePageChange"
  />
</template>

<script setup lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

/* ------- mock 数据：BizTable 自检 demo，不连后端 ------- */
const ALL_ROWS: BizRow[] = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  name: `示例记录 ${i + 1}`,
  status: i % 3 === 0 ? '0' : '1',
  createTime: new Date(2026, 4, 1 + (i % 28)).toISOString()
}));

const searchSchema: SearchFieldSchema[] = [
  { field: 'name', label: '名称', type: 'input' },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  }
];

const columns: BizTableColumn[] = [
  { prop: 'id', label: '编号', width: 80, align: 'center' },
  { prop: 'name', label: '名称', minWidth: 180 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    formatter: (row) => (row.status === '0' ? '正常' : '停用')
  },
  { prop: 'createTime', label: '创建时间', width: 200, align: 'center', formatter: 'datetime' }
];

const tableRef = ref<BizTableExpose>();
const list = ref<BizRow[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const searchModel = reactive<Record<string, any>>({
  name: undefined,
  status: undefined
});

function fetchList() {
  loading.value = true;
  const filtered = ALL_ROWS.filter((row) => {
    if (searchModel.name && !String(row.name).includes(searchModel.name)) return false;
    if (searchModel.status !== undefined && searchModel.status !== '' && row.status !== searchModel.status) return false;
    return true;
  });
  total.value = filtered.length;
  const start = (pageNum.value - 1) * pageSize.value;
  list.value = filtered.slice(start, start + pageSize.value);
  // 模拟 loading
  setTimeout(() => {
    loading.value = false;
  }, 150);
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handleAdd() {
  ElMessage.info('demo: 新增（业务页接入时换成 dialog 打开）');
}
function handleEdit(row: BizRow) {
  ElMessage.info(`demo: 编辑 #${row.id}`);
}
function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  ElMessage.warning(`demo: 删除 ${ids.join(', ')}`);
}
function handleExport(params: Record<string, any>) {
  ElMessage.success(`demo: 导出，参数 ${JSON.stringify(params)}`);
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>
