<template>
  <div class="p-2">
    <el-alert type="info" :closable="false" class="mb-2" :title="t('breedEvent.intro.readonlyTip')" />
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
        <dict-tag :options="djs_introduce_type" :value="row.introduceType" />
      </template>
      <template #cell-pigSex="{ row }">
        <el-tag v-if="row.pigSex" :type="row.pigSex === 'F' ? 'success' : 'primary'" size="small">
          {{ row.pigSex === 'F' ? t('breedEvent.sex.female') : t('breedEvent.sex.male') }}
        </el-tag>
        <span v-else>—</span>
      </template>
    </BizTable>
  </div>
</template>

<script setup name="DjsBreedEventIntro" lang="ts">
import { useI18n } from 'vue-i18n';
import { listPigIntro } from '@/api/djs-breed/event/intro';
import type { PigIntroduceVO, PigIntroQuery } from '@/api/djs-breed/event/intro';
import type { BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// ADR-0004 §2.4 Vue3 字典消费范式
const { djs_introduce_type } = toRefs<any>(proxy?.useDict('djs_introduce_type'));

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

const searchSchema = computed<SearchFieldSchema[]>(() => [
  {
    field: 'introduceNo',
    label: t('breedEvent.intro.field.introduceNo'),
    type: 'input',
    placeholder: t('breedEvent.intro.placeholder.introduceNo'),
    clearable: true
  },
  {
    field: 'introduceType',
    label: t('breedEvent.intro.field.introduceType'),
    type: 'select',
    options: (djs_introduce_type.value || []).map((d: { label: string; value: string }) => ({ label: d.label, value: d.value })),
    clearable: true
  },
  {
    field: 'pigSex',
    label: t('breedEvent.intro.field.pigSex'),
    type: 'select',
    options: [
      { label: t('breedEvent.sex.femaleOption'), value: 'F' },
      { label: t('breedEvent.sex.maleOption'), value: 'M' }
    ],
    clearable: true
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'introduceNo', label: t('breedEvent.intro.column.introduceNo'), minWidth: 160, fixed: 'left' },
  { prop: 'introduceType', label: t('breedEvent.intro.column.introduceType'), width: 100, align: 'center' },
  { prop: 'introduceDate', label: t('breedEvent.intro.column.introduceDate'), width: 110, align: 'center', formatter: 'date' },
  { prop: 'pigCount', label: t('breedEvent.intro.column.pigCount'), width: 80, align: 'center' },
  { prop: 'startEarNo', label: t('breedEvent.intro.column.startEarNo'), width: 140, align: 'center' },
  { prop: 'pigSex', label: t('breedEvent.intro.column.pigSex'), width: 80, align: 'center' },
  { prop: 'pigBreedCode', label: t('breedEvent.intro.column.pigBreedCode'), width: 100, align: 'center' },
  { prop: 'pigStrainCode', label: t('breedEvent.intro.column.pigStrainCode'), width: 100, align: 'center' },
  { prop: 'supplierCode', label: t('breedEvent.intro.column.supplierCode'), width: 120, align: 'center' },
  { prop: 'supplierName', label: t('breedEvent.intro.column.supplierName'), width: 140, align: 'center' },
  { prop: 'remark', label: t('breedEvent.intro.column.remark'), minWidth: 140 },
  { prop: 'createTime', label: t('breedEvent.intro.column.createTime'), width: 160, align: 'center', formatter: 'datetime' },
  { prop: 'supplierId', label: t('breedEvent.intro.column.supplierId'), width: 180, align: 'center', visible: false }
]);

async function load() {
  loading.value = true;
  try {
    const params: PigIntroQuery = {
      ...searchModel,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await listPigIntro(params);
    list.value = (res.rows ?? []) as PigIntroduceVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Record<string, string | undefined>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  load();
}

function handleReset() {
  Object.assign(searchModel, {
    introduceNo: undefined,
    introduceType: undefined,
    pigSex: undefined,
    beginDate: undefined,
    endDate: undefined
  });
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
