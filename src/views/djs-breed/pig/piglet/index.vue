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
      <template #cell-pigSex="{ row }">
        <el-tag :type="row.pigSex === 'F' ? 'success' : 'primary'" size="small">
          {{ row.pigSex === 'F' ? t('pig.sex.female') : t('pig.sex.male') }}
        </el-tag>
      </template>
      <template #cell-motherEar="{ row }">
        <el-link v-if="row.motherEar" type="primary" @click="openByEarNo(row.motherEar)">{{ row.motherEar }}</el-link>
        <span v-else>—</span>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedPigPiglet" lang="ts">
/**
 * 仔猪列表（BRD-LIST-001）— admin 端 4 类独立 vue 之一。
 *
 * 列：耳号 / 性别 / 父猪耳号 / 母猪耳号 / 出生日期 / 当前状态 / 进入状态时间 / 栋舍 / 栏位
 * 母系点击 → 反查跳母猪详情
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { listPig } from '@/api/djs-breed/pig';
import { usePigListByType } from '../composables/usePigListByType';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const router = useRouter();

const dictTypes = ['djs_pig_lifecycle'];

const { list, total, loading, pageNum, pageSize, searchModel, load, handleSearch, handleReset, handlePageChange } = usePigListByType('piglet');

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
  { field: 'motherEar', label: t('pig.column.motherEar'), type: 'input', placeholder: t('pig.placeholder.motherEar'), clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'earNo', label: t('pig.column.earNo'), minWidth: 140, fixed: 'left' },
  { prop: 'pigSex', label: t('pig.column.pigSex'), width: 80, align: 'center' },
  { prop: 'fatherEar', label: t('pig.column.fatherEar'), width: 130, align: 'center' },
  { prop: 'motherEar', label: t('pig.column.motherEar'), width: 130, align: 'center' },
  { prop: 'birthDate', label: t('pig.column.birthDate'), width: 110, align: 'center', formatter: 'date' },
  { prop: 'currentStatus', label: t('pig.column.currentStatus'), width: 100, align: 'center', dictType: 'djs_pig_lifecycle' },
  { prop: 'statusStartedAt', label: t('pig.column.statusStartedAt'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'barnCode', label: t('pig.column.barn'), width: 90, align: 'center' },
  { prop: 'penCode', label: t('pig.column.pen'), width: 90, align: 'center' },
  { prop: 'remark', label: t('pig.column.remark'), minWidth: 120, visible: false }
];

function openDetail(id: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

async function openByEarNo(earNo: string) {
  try {
    const res = (await listPig({ earNo, pageNum: 1, pageSize: 1, excludeEnd: true })) as any;
    const target = (res.rows ?? [])[0];
    if (!target) {
      ElMessage.warning(t('pig.detail.relatedNotFound', { earNo }));
      return;
    }
    openDetail(target.id);
  } catch {
    // axios 拦截器统一处理
  }
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

onMounted(() => load());
</script>
