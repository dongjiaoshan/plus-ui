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
        <el-button v-hasPermi="['djs:breed:pig:edit']" type="primary" link size="small" @click="openEditEarNo(row as unknown as PigVO)">
          {{ t('pig.editEarNo.action') }}
        </el-button>
        <el-button type="primary" link size="small" @click="openDetail(row.id)">
          {{ t('common.detail') }}
        </el-button>
      </template>
    </BizTable>

    <!-- BRD-LIST-EDIT-001：修改耳号 -->
    <EditEarNoDialog ref="editEarNoRef" @success="load" />
  </div>
</template>

<script setup name="DjsBreedPigBoar" lang="ts">
/**
 * 公猪列表（BRD-LIST-001）— admin 端 4 类独立 vue 之一。
 *
 * 列：耳号 / 当前状态 / 进入状态时间 / 配种次数 / 品种 / 品系 / 栋舍 / 栏位
 * 状态：公猪空状态（活体，非种母猪无繁殖态）/ END（终态默认隐藏）—— 公猪无 PZ/FM 等繁殖态
 * 操作：详情（独立路由）
 */
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePigListByType } from '../composables/usePigListByType';
import EditEarNoDialog from '../components/EditEarNoDialog.vue';
import type { PigVO } from '@/api/djs-breed/pig/types';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const router = useRouter();

const dictTypes = ['djs_pig_lifecycle'];

const { list, total, loading, pageNum, pageSize, searchModel, load, handleSearch, handleReset, handlePageChange } = usePigListByType('boar');

const searchSchema: SearchFieldSchema[] = [
  { field: 'earNo', label: t('pig.column.earNo'), type: 'input', placeholder: t('pig.placeholder.earNo'), clearable: true },
  { field: 'currentStatus', label: t('pig.column.currentStatus'), type: 'select', dictType: 'djs_pig_lifecycle', clearable: true },
  { field: 'barnName', label: t('pig.column.barn'), type: 'input', placeholder: t('pig.placeholder.barnName'), clearable: true }
];

const columns: BizTableColumn[] = [
  { prop: 'earNo', label: t('pig.column.earNo'), minWidth: 130, align: 'center', fixed: 'left' },
  { prop: 'currentStatus', label: t('pig.column.currentStatus'), minWidth: 130, align: 'center', dictType: 'djs_pig_lifecycle' },
  { prop: 'statusStartedAt', label: t('pig.column.statusStartedAt'), minWidth: 130, align: 'center', formatter: 'datetime' },
  { prop: 'matingCount', label: t('pig.column.matingCount'), minWidth: 130, align: 'center' },
  { prop: 'pigBreedName', label: t('pig.column.pigBreedCode'), minWidth: 130, align: 'center' },
  { prop: 'pigStrainName', label: t('pig.column.pigStrainCode'), minWidth: 130, align: 'center' },
  { prop: 'barnName', label: t('pig.column.barn'), minWidth: 130, align: 'center' },
  { prop: 'penName', label: t('pig.column.pen'), minWidth: 130, align: 'center' },
  { prop: 'birthDate', label: t('pig.column.birthDate'), width: 120, align: 'center', formatter: 'date', visible: false },
  { prop: 'introduceDate', label: t('pig.column.introduceDate'), width: 120, align: 'center', formatter: 'date', visible: false },
  { prop: 'remark', label: t('pig.column.remark'), minWidth: 120, visible: false }
];

function openDetail(id: number | string) {
  router.push({ path: `/djs-breed/pig/detail/${id}` });
}

const editEarNoRef = ref<{ open: (row: PigVO) => void }>();
function openEditEarNo(row: PigVO) {
  editEarNoRef.value?.open(row);
}

function handleExport() {
  ElMessage.info(t('pig.exportTodo'));
}

onMounted(() => load());
</script>
