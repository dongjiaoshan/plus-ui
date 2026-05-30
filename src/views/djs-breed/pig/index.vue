<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" type="card" class="pig-tabs">
      <el-tab-pane :label="t('pig.tab.all')" name="all">
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

          <!-- 当前状态：END 状态额外显示 end_reason（出栏 / 死亡 / 淘汰）；非 END 走默认字典翻译。
               设计：lifecycle.END 是「终止」抽象终态，end_reason 是结束的具体原因（djs_pig_end_reason 字典：DEAD/CULL/MARKET）。 -->
          <template #cell-currentStatus="{ row }">
            <template v-if="row.currentStatus === 'END'">
              <el-tag type="info" size="small">
                {{ statusLabel(row.currentStatus) }}<span v-if="row.endReason"> · {{ endReasonLabel(row.endReason) }}</span>
              </el-tag>
            </template>
            <el-tag v-else :type="statusTagType(row.currentStatus)" size="small">
              {{ statusLabel(row.currentStatus) }}
            </el-tag>
          </template>

          <!-- 操作：详情（D7 BRD-LIST-001 起 admin 只读，无事件录入） -->
          <template #action="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row.id)">
              {{ t('common.detail') }}
            </el-button>
          </template>
        </BizTable>
      </el-tab-pane>

      <el-tab-pane :label="t('pig.tab.sow')" name="sow" lazy>
        <PigListSow v-if="activeTab === 'sow'" />
      </el-tab-pane>
      <el-tab-pane :label="t('pig.tab.boar')" name="boar" lazy>
        <PigListBoar v-if="activeTab === 'boar'" />
      </el-tab-pane>
      <el-tab-pane :label="t('pig.tab.piglet')" name="piglet" lazy>
        <PigListPiglet v-if="activeTab === 'piglet'" />
      </el-tab-pane>
      <el-tab-pane :label="t('pig.tab.fattening')" name="fattening" lazy>
        <PigListFattening v-if="activeTab === 'fattening'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="DjsBreedPig" lang="ts">
/**
 * 猪只主表列表页（BRD-CORE-001 + D7 BRD-LIST-001 + D07-HOTFIX-002 菜单合并）— admin 入口。
 *
 * 5 个 Tab：全部 / 母猪 / 公猪 / 仔猪 / 育肥
 *   - 全部：跨类型总览（本组件 BizTable 直接渲染，listPig 不带 pigType）
 *   - 4 个子类型：复用原 sow/boar/piglet/fattening/index.vue 组件（保留各自的字段差异化）
 *
 * 子 Tab 用 `lazy` + `v-if` 双保险，只在用户点击切换时才初始化 → 避免一次性触发 4 次 listPig。
 * D7 起 admin 全只读，事件录入统一走 mp。
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { listPig } from '@/api/djs-breed/pig';
import type { PigQuery, PigVO } from '@/api/djs-breed/pig/types';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import PigListSow from './sow/index.vue';
import PigListBoar from './boar/index.vue';
import PigListPiglet from './piglet/index.vue';
import PigListFattening from './fattening/index.vue';

const { t } = useI18n();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_pig_lifecycle, djs_pig_end_reason } = toRefs<any>(proxy?.useDict('djs_pig_lifecycle', 'djs_pig_end_reason'));

function statusLabel(code?: string): string {
  if (!code) return '—';
  const d = (djs_pig_lifecycle.value ?? []).find((x: any) => String(x.value) === String(code));
  return d?.label ?? code;
}
function endReasonLabel(code?: string): string {
  if (!code) return '';
  const d = (djs_pig_end_reason.value ?? []).find((x: any) => String(x.value) === String(code));
  return d?.label ?? code;
}
function statusTagType(code?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  // 业务态色彩：配种类（PZ/PH）primary 蓝 / 分娩(FM) success 绿 / 异常(LC/FQ) warning 橙 / 终止 info 灰 / 其余 default
  if (!code) return 'info';
  if (['PZ', 'PH', 'BOAR_ACTIVE'].includes(code)) return 'primary';
  if (['FM', 'DN'].includes(code)) return 'success';
  if (['LC', 'FQ'].includes(code)) return 'warning';
  return 'info';
}

const activeTab = ref<'all' | 'sow' | 'boar' | 'piglet' | 'fattening'>('all');

const tableRef = ref<BizTableExpose>();

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
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

async function openByEarNo(earNo: string) {
  // 通过耳号反查取 id，再走路由详情（V1 简单实现：list filter + 取第一条非 END）
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

onMounted(() => {
  load();
});
</script>
