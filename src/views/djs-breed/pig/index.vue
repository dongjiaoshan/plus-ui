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
      :dict-types="dictTypes"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:breed:pig"
      :show-add="false"
      :show-batch-del="false"
      :show-export="true"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 耳号：点击跳详情 -->
      <template #cell-earNo="{ row }">
        <el-link type="primary" @click="openDetail(row.id)">{{ row.earNo }}</el-link>
      </template>

      <!-- 性别：F/M → 中文 -->
      <template #cell-pigSex="{ row }">
        <el-tag :type="row.pigSex === 'F' ? 'success' : 'primary'" size="small">
          {{ row.pigSex === 'F' ? t('pig.sex.female') : t('pig.sex.male') }}
        </el-tag>
      </template>

      <!-- 母猪耳号：点击通过耳号反查跳详情 -->
      <template #cell-motherEar="{ row }">
        <el-link v-if="row.motherEar" type="primary" @click="openByEarNo(row.motherEar)">{{ row.motherEar }}</el-link>
        <span v-else>—</span>
      </template>

      <!-- 操作：详情 + 事件 dropdown -->
      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
        <PigEventDropdown :pig="row" @select="onEventSelect" />
      </template>
    </BizTable>

    <PigDetailModal ref="detailModalRef" @event-fired="reload" @open-related-ear="openByEarNo" />
    <PigEventPlaceholderDialog ref="eventDialogRef" @success="reload" />
  </div>
</template>

<script setup name="DjsBreedPig" lang="ts">
/**
 * 猪只主表列表页（BRD-CORE-001）— admin 端。
 *
 * 用 BizTable 渲染：查询表单（耳号 / 性别 / 状态 / 类型 / 栋舍 / 栏位 / 母猪耳号 / 排除终态）
 * + 列（耳号 / 性别 / 状态 / 类型 / 品种品系 / 出生 / 栋舍栏位 / 母猪耳号 / 胎次 / 入状态时间）。
 *
 * 详情通过 modal（不开独立路由）；事件触发走 PigEventDropdown → PigEventPlaceholderDialog
 * 占位（D5 后 BRD-EVENT-001/003 接管真实表单；D6+ BRD-EVENT-002/004/005 补齐）。
 */
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { listPig } from '@/api/djs-breed/pig';
import type { PigQuery, PigStatusEventCode, PigVO } from '@/api/djs-breed/pig/types';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PigDetailModal from './components/PigDetailModal.vue';
import PigEventDropdown from './components/PigEventDropdown.vue';
import PigEventPlaceholderDialog from './components/PigEventPlaceholderDialog.vue';

const { t } = useI18n();

const tableRef = ref<BizTableExpose>();
const detailModalRef = ref<{ open: (id: number | string) => void }>();
const eventDialogRef = ref<{ open: (pig: PigVO, ev: PigStatusEventCode) => void }>();

const list = ref<PigVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

const dictTypes = ['djs_pig_lifecycle', 'djs_pig_type', 'djs_pig_status_event', 'djs_pig_end_reason'];

const searchModel = reactive<PigQuery>({
  earNo: undefined,
  pigSex: undefined,
  currentStatus: undefined,
  pigType: undefined,
  barnId: undefined,
  penId: undefined,
  motherEar: undefined,
  excludeEnd: undefined
});

const searchSchema: SearchFieldSchema[] = [
  { field: 'earNo', label: t('pig.column.earNo'), type: 'input', placeholder: t('pig.placeholder.earNo'), clearable: true },
  {
    field: 'pigSex',
    label: t('pig.column.pigSex'),
    type: 'select',
    options: [
      { label: t('pig.sex.female'), value: 'F' },
      { label: t('pig.sex.male'), value: 'M' }
    ],
    clearable: true
  },
  { field: 'currentStatus', label: t('pig.column.currentStatus'), type: 'select', dictType: 'djs_pig_lifecycle', clearable: true },
  { field: 'pigType', label: t('pig.column.pigType'), type: 'select', dictType: 'djs_pig_type', clearable: true },
  { field: 'barnId', label: t('pig.column.barnId'), type: 'number', placeholder: t('pig.placeholder.barnId') },
  { field: 'penId', label: t('pig.column.penId'), type: 'number', placeholder: t('pig.placeholder.penId') },
  { field: 'motherEar', label: t('pig.column.motherEar'), type: 'input', placeholder: t('pig.placeholder.motherEar'), clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'earNo', label: t('pig.column.earNo'), minWidth: 140, fixed: 'left' },
  { prop: 'pigSex', label: t('pig.column.pigSex'), width: 80, align: 'center' },
  { prop: 'currentStatus', label: t('pig.column.currentStatus'), width: 110, align: 'center', dictType: 'djs_pig_lifecycle' },
  { prop: 'pigType', label: t('pig.column.pigType'), width: 100, align: 'center', dictType: 'djs_pig_type' },
  { prop: 'pigBreedCode', label: t('pig.column.pigBreedCode'), width: 110, align: 'center' },
  { prop: 'pigStrainCode', label: t('pig.column.pigStrainCode'), width: 110, align: 'center' },
  { prop: 'birthDate', label: t('pig.column.birthDate'), width: 110, align: 'center', formatter: 'date' },
  { prop: 'barnCode', label: t('pig.column.barn'), width: 90, align: 'center' },
  { prop: 'penCode', label: t('pig.column.pen'), width: 90, align: 'center' },
  { prop: 'motherEar', label: t('pig.column.motherEar'), width: 130, align: 'center' },
  { prop: 'parity', label: t('pig.column.parity'), width: 80, align: 'center' },
  { prop: 'statusStartedAt', label: t('pig.column.statusStartedAt'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'endReason', label: t('pig.column.endReason'), width: 100, align: 'center', dictType: 'djs_pig_end_reason', visible: false }
];

async function load() {
  loading.value = true;
  try {
    const params: PigQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPig(params);
    list.value = (res.rows ?? []) as PigVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: PigQuery) {
  // BizTable 内部维护 innerSearchModel，搜索时通过 emit 把当前值传回来 —— 必须 merge 进父 searchModel，
  // 否则 load() 用的还是父级初始的全 undefined。
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.assign(searchModel, {
    earNo: undefined,
    pigSex: undefined,
    currentStatus: undefined,
    pigType: undefined,
    barnId: undefined,
    penId: undefined,
    motherEar: undefined,
    excludeEnd: undefined
  });
  pageNum.value = 1;
  load();
}

function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  load();
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

function openDetail(id: number | string) {
  detailModalRef.value?.open(id);
}

async function openByEarNo(earNo: string) {
  // 通过耳号反查取 id，再走 detail（V1 简单实现：直接走 list filter + 取第一条非 END）
  try {
    // excludeEnd=true：耳号可回收复用（删后下次新猪复用同 earNo + lifecycle_id+1），
    // 这里只跳"活的"那一条；点已 END 的历史 ear 视为无效（_open-issues raise 推荐方案 b）
    const res = await listPig({ earNo, pageNum: 1, pageSize: 1, excludeEnd: true });
    const target = (res.rows ?? [])[0];
    if (!target) {
      ElMessage.warning(t('pig.detail.relatedNotFound', { earNo }));
      return;
    }
    openDetail(target.id);
  } catch {
    // listPig 失败由 axios 拦截器统一提示
  }
}

function onEventSelect(ev: PigStatusEventCode, pig: PigVO) {
  eventDialogRef.value?.open(pig, ev);
}

function reload() {
  load();
}

onMounted(() => {
  load();
});
</script>
