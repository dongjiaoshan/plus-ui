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
      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedPigFattening" lang="ts">
/**
 * 育肥猪列表（BRD-LIST-001）— admin 端 4 类独立 vue 之一。
 *
 * 列：耳号 / 性别 / 出生日期 / 入栏日期(status_started_at) / 栋舍 / 栏位 / 备注
 *
 * 育肥猪关注：背膘 / 体重——这两个字段在 t_farm_pig_growth 而非 pig_info，
 * 详情页 tab4「生长曲线」展示；列表暂不直显（要 join，N+1 风险），如需 V2 增"最近背膘 / 最近体重"
 * 列可加 BackendOptimization：service 端 batch 反查最新 growth 记录 join 进 PigVo。
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePigListByType } from '../composables/usePigListByType';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const router = useRouter();

const dictTypes: string[] = [];

const { list, total, loading, pageNum, pageSize, searchModel, load, handleSearch, handleReset, handlePageChange } = usePigListByType('fattening');

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
  { field: 'barnId', label: t('pig.column.barnId'), type: 'number', placeholder: t('pig.placeholder.barnId') }
];

const columns: BizTableColumn[] = [
  { prop: 'earNo', label: t('pig.column.earNo'), minWidth: 140, fixed: 'left' },
  { prop: 'pigSex', label: t('pig.column.pigSex'), minWidth: 140, align: 'center' },
  { prop: 'birthDate', label: t('pig.column.birthDate'), minWidth: 140, align: 'center', formatter: 'date' },
  { prop: 'statusStartedAt', label: t('pig.column.enterFattenAt'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'barnName', label: t('pig.column.barn'), minWidth: 140, align: 'center' },
  { prop: 'penName', label: t('pig.column.pen'), minWidth: 140, align: 'center' },
  { prop: 'fatherEar', label: t('pig.column.fatherEar'), minWidth: 140, align: 'center', visible: false },
  { prop: 'motherEar', label: t('pig.column.motherEar'), minWidth: 140, align: 'center', visible: false },
  { prop: 'remark', label: t('pig.column.remark'), minWidth: 140, visible: false }
];

function openDetail(id: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

onMounted(() => load());
</script>
