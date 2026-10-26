<template>
  <div class="p-2">
    <BizTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      :show-batch-del="false"
      perm-prefix="djs:warehouse:tareSpec"
      @search="handleSearch"
      @reset="handleReset"
      @add="formRef?.openCreate()"
      @page-change="handlePageChange"
    >
      <template #cell-tareWeight="{ row }">{{ Number(row.tareWeight).toFixed(3) }}</template>
      <template #cell-positions="{ row }">{{ positionLabels(row.positions) }}</template>
      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:warehouse:tareSpec:edit']" link type="primary" icon="Edit" @click="formRef?.openEdit(row.id)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:warehouse:tareSpec:remove']" link type="danger" icon="Delete" @click="handleDel(row as TareSpecVO)" />
        </el-tooltip>
      </template>
    </BizTable>

    <TareSpecForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="TareSpec" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import TareSpecForm from './components/TareSpecForm.vue';
import { delTareSpec, listTareSpec, type TareSpecVO } from '@/api/djs-warehouse/tareSpec';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_tare_position } = toRefs(proxy!.useDict('djs_tare_position'));

const formRef = ref<{ openCreate: () => void; openEdit: (id: string) => void }>();
const list = ref<TareSpecVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const searchModel = reactive<{ specName?: string }>({ specName: undefined });

const searchSchema = computed<SearchFieldSchema[]>(() => [{ field: 'specName', label: t('tareSpec.specName'), type: 'input' }]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'specName', label: t('tareSpec.specName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'tareWeight', label: t('tareSpec.tareWeightKg'), minWidth: 110 },
  { prop: 'isDefault', label: t('tareSpec.isDefault'), minWidth: 90, dictType: 'djs_yes_no' },
  { prop: 'positions', label: t('tareSpec.positions'), minWidth: 260, showOverflowTooltip: true },
  { prop: 'createTime', label: t('tareSpec.createTime'), minWidth: 180, formatter: 'datetime' },
  { prop: 'createByName', label: t('tareSpec.createBy'), minWidth: 100 },
  { prop: 'updateTime', label: t('tareSpec.updateTime'), minWidth: 180, formatter: 'datetime' }
]);

function positionLabels(csv: string): string {
  return (csv || '')
    .split(',')
    .filter(Boolean)
    .map((v) => djs_tare_position.value.find((d) => d.value === v)?.label || v)
    .join('、');
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listTareSpec({ pageNum: pageNum.value, pageSize: pageSize.value, specName: searchModel.specName || undefined });
    list.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  if (payload) searchModel.specName = (payload.specName as string | undefined) || undefined;
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  searchModel.specName = undefined;
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
async function handleDel(row: TareSpecVO) {
  await proxy?.$modal.confirm(t('tareSpec.delConfirm', { name: row.specName }));
  await delTareSpec([row.id]);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

onMounted(fetchList);
</script>
