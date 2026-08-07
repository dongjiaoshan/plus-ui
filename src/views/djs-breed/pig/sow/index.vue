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
      <template #cell-earNo="{ row }">
        <el-link type="primary" @click="openDetail(row.id)">{{ row.earNo }}</el-link>
      </template>
      <template #action="{ row }">
        <!-- row162：后备种母猪「转为育肥猪」——与「全部」页签同一入口，母猪页签是管后备母猪的人最先看的地方 -->
        <el-button v-if="canToFatten(row as unknown as PigVO)" type="warning" link size="small" @click="openToFatten(row as unknown as PigVO)">
          {{ t('pig.toFatten.action') }}
        </el-button>
        <el-button v-hasPermi="['djs:breed:pig:edit']" type="primary" link size="small" @click="openEditEarNo(row as unknown as PigVO)">
          {{ t('pig.editEarNo.action') }}
        </el-button>
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- row162：后备种母猪转为育肥猪 -->
    <ToFattenDialog ref="toFattenRef" @success="load" />
    <!-- BRD-LIST-EDIT-001：修改耳号 -->
    <EditEarNoDialog ref="editEarNoRef" @success="load" />
  </div>
</template>

<script setup name="DjsBreedPigSow" lang="ts">
/**
 * 母猪列表（BRD-LIST-001）— admin 端 4 类独立 vue 之一。
 *
 * 列：耳号 / 当前状态 / 进入状态日期 / 胎次 / 上次配种日 / 栋舍 / 栏位 / 备注
 * 隐藏：父猪耳号 / 出生日期（母猪场景不重要）
 * 操作：详情（独立路由 `/djs-breed/pig/detail/:id`）—— admin 只读，事件录入只走 mp（doc/12 偏离审计决策 a）；
 *       例外：row162「转为育肥猪」是客户在猪只主表明确要求的 admin 操作入口，与「全部」页签一致。
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePigListByType } from '../composables/usePigListByType';
import ToFattenDialog from '../components/ToFattenDialog.vue';
import EditEarNoDialog from '../components/EditEarNoDialog.vue';
import type { PigVO } from '@/api/djs-breed/pig/types';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const router = useRouter();

const dictTypes = ['djs_pig_lifecycle'];

const { list, total, loading, pageNum, pageSize, searchModel, load, handleSearch, handleReset, handlePageChange } = usePigListByType('sow');

const searchSchema: SearchFieldSchema[] = [
  { field: 'earNo', label: t('pig.column.earNo'), type: 'input', placeholder: t('pig.placeholder.earNo'), clearable: true },
  { field: 'currentStatus', label: t('pig.column.currentStatus'), type: 'select', dictType: 'djs_pig_lifecycle', clearable: true },
  { field: 'barnName', label: t('pig.column.barn'), type: 'input', placeholder: t('pig.placeholder.barnName'), clearable: true },
  { field: 'penName', label: t('pig.column.pen'), type: 'input', placeholder: t('pig.placeholder.penName'), clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'earNo', label: t('pig.column.earNo'), minWidth: 130, align: 'center', fixed: 'left' },
  { prop: 'currentStatus', label: t('pig.column.currentStatus'), minWidth: 130, align: 'center', dictType: 'djs_pig_lifecycle' },
  { prop: 'statusStartedAt', label: t('pig.column.statusStartedDate'), minWidth: 130, align: 'center', formatter: 'date' },
  { prop: 'parity', label: t('pig.column.parity'), minWidth: 130, align: 'center' },
  { prop: 'liveBornCount', label: t('pig.column.liveBornCount'), minWidth: 130, align: 'center' },
  { prop: 'weanedCount', label: t('pig.column.weanedCount'), minWidth: 130, align: 'center' },
  { prop: 'avgLitterSize', label: t('pig.column.avgLitterSize'), minWidth: 130, align: 'center' },
  { prop: 'lastMatingDate', label: t('pig.column.lastMatingDate'), minWidth: 130, align: 'center', formatter: 'date' },
  { prop: 'barnName', label: t('pig.column.barn'), minWidth: 130, align: 'center' },
  { prop: 'penName', label: t('pig.column.pen'), minWidth: 130, align: 'center' },
  { prop: 'pigBreedCode', label: t('pig.column.pigBreedCode'), width: 120, align: 'center', visible: false },
  { prop: 'pigStrainCode', label: t('pig.column.pigStrainCode'), width: 120, align: 'center', visible: false },
  { prop: 'birthDate', label: t('pig.column.birthDate'), width: 120, align: 'center', formatter: 'date', visible: false },
  { prop: 'remark', label: t('pig.column.remark'), minWidth: 120, visible: false }
];

/** row162：仅「后备」状态的种母猪显示「转为育肥猪」（与后端 toFatten 前置校验同口径）。 */
function canToFatten(row: PigVO): boolean {
  return row?.pigType === 'sow' && row?.currentStatus === 'HB';
}

const toFattenRef = ref<{ open: (row: PigVO) => void }>();
function openToFatten(row: PigVO) {
  toFattenRef.value?.open(row);
}

const editEarNoRef = ref<{ open: (row: PigVO) => void }>();
function openEditEarNo(row: PigVO) {
  editEarNoRef.value?.open(row);
}

function openDetail(id: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

onMounted(() => load());
</script>
