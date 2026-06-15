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
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedPigSow" lang="ts">
/**
 * 母猪列表（BRD-LIST-001）— admin 端 4 类独立 vue 之一。
 *
 * 列：耳号 / 当前状态 / 进入状态日期 / 胎次 / 上次配种日 / 栋舍 / 栏位 / 备注
 * 隐藏：父猪耳号 / 出生日期（母猪场景不重要）
 * 操作：详情（独立路由 `/djs-breed/pig/detail/:id`）—— admin 只读，事件录入只走 mp（doc/12 偏离审计决策 a）
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePigListByType } from '../composables/usePigListByType';
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

function openDetail(id: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

onMounted(() => load());
</script>
