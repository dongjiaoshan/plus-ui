<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="biz-tabs">
      <!-- tab1 品种 -->
      <el-tab-pane :label="t('breeding.tab.type')" name="type">
        <BizTable
          :data="infoTypeList"
          :total="infoTypeTotal"
          :loading="infoTypeLoading"
          :columns="infoColumns"
          :search-schema="infoSearchSchema"
          :search-model="infoTypeSearch"
          :page-num="infoTypePageNum"
          :page-size="infoTypePageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:breeding"
          @search="onInfoSearch(1)"
          @reset="onInfoReset(1)"
          @add="onInfoAdd(1)"
          @edit="onInfoEdit"
          @del="onInfoDel(1, $event)"
          @page-change="onInfoPageChange(1, $event)"
        />
      </el-tab-pane>

      <!-- tab2 品种配种 -->
      <el-tab-pane :label="t('breeding.tab.typeConfig')" name="typeConfig">
        <BizTable
          :data="configTypeList"
          :total="configTypeTotal"
          :loading="configTypeLoading"
          :columns="configColumns"
          :search-schema="configSearchSchema"
          :search-model="configTypeSearch"
          :page-num="configTypePageNum"
          :page-size="configTypePageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:breeding"
          @search="onConfigSearch(1)"
          @reset="onConfigReset(1)"
          @add="onConfigAdd(1)"
          @edit="onConfigEdit"
          @del="onConfigDel(1, $event)"
          @page-change="onConfigPageChange(1, $event)"
        />
      </el-tab-pane>

      <!-- tab3 品系 -->
      <el-tab-pane :label="t('breeding.tab.strain')" name="strain">
        <BizTable
          :data="infoStrainList"
          :total="infoStrainTotal"
          :loading="infoStrainLoading"
          :columns="infoColumns"
          :search-schema="infoSearchSchema"
          :search-model="infoStrainSearch"
          :page-num="infoStrainPageNum"
          :page-size="infoStrainPageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:breeding"
          @search="onInfoSearch(2)"
          @reset="onInfoReset(2)"
          @add="onInfoAdd(2)"
          @edit="onInfoEdit"
          @del="onInfoDel(2, $event)"
          @page-change="onInfoPageChange(2, $event)"
        />
      </el-tab-pane>

      <!-- tab4 品系配种 -->
      <el-tab-pane :label="t('breeding.tab.strainConfig')" name="strainConfig">
        <BizTable
          :data="configStrainList"
          :total="configStrainTotal"
          :loading="configStrainLoading"
          :columns="configColumns"
          :search-schema="configSearchSchema"
          :search-model="configStrainSearch"
          :page-num="configStrainPageNum"
          :page-size="configStrainPageSize"
          row-key="id"
          selectable
          perm-prefix="djs:breed:breeding"
          @search="onConfigSearch(2)"
          @reset="onConfigReset(2)"
          @add="onConfigAdd(2)"
          @edit="onConfigEdit"
          @del="onConfigDel(2, $event)"
          @page-change="onConfigPageChange(2, $event)"
        />
      </el-tab-pane>
    </el-tabs>

    <BreedInfoForm ref="infoFormRef" @success="handleInfoSuccess" />
    <BreedConfigForm ref="configFormRef" @success="handleConfigSuccess" />
  </div>
</template>

<script setup name="BreedingConfig" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import BreedInfoForm from './components/BreedInfoForm.vue';
import BreedConfigForm from './components/BreedConfigForm.vue';
import { delBreedConfig, delBreedInfo, listBreedConfig, listBreedInfo } from '@/api/djs-breed/breeding';
import type { BreedConfigQuery, BreedConfigVO, BreedInfoQuery, BreedInfoVO } from '@/api/djs-breed/breeding/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeTab = ref<'type' | 'typeConfig' | 'strain' | 'strainConfig'>('type');

const infoFormRef = ref<{ openCreate: (s: number) => void; openEdit: (id: number | string) => void }>();
const configFormRef = ref<{ openCreate: (s: number) => void; openEdit: (id: number | string) => void }>();

// ============= BreedInfo state（品种 / 品系 两组独立） =============
const infoTypeList = ref<BreedInfoVO[]>([]);
const infoTypeTotal = ref(0);
const infoTypeLoading = ref(false);
const infoTypePageNum = ref(1);
const infoTypePageSize = ref(10);
const infoTypeSearch = reactive<Record<string, any>>({ breedStrainCode: undefined, breedStrainName: undefined });

const infoStrainList = ref<BreedInfoVO[]>([]);
const infoStrainTotal = ref(0);
const infoStrainLoading = ref(false);
const infoStrainPageNum = ref(1);
const infoStrainPageSize = ref(10);
const infoStrainSearch = reactive<Record<string, any>>({ breedStrainCode: undefined, breedStrainName: undefined, parentCode: undefined });

// ============= BreedConfig state（品种配种 / 品系配种 两组） =============
const configTypeList = ref<BreedConfigVO[]>([]);
const configTypeTotal = ref(0);
const configTypeLoading = ref(false);
const configTypePageNum = ref(1);
const configTypePageSize = ref(10);
const configTypeSearch = reactive<Record<string, any>>({ motherCode: undefined, fatherCode: undefined, cubCode: undefined });

const configStrainList = ref<BreedConfigVO[]>([]);
const configStrainTotal = ref(0);
const configStrainLoading = ref(false);
const configStrainPageNum = ref(1);
const configStrainPageSize = ref(10);
const configStrainSearch = reactive<Record<string, any>>({ motherCode: undefined, fatherCode: undefined, cubCode: undefined });

const infoSearchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'breedStrainCode', label: t('breeding.field.breedStrainCode'), type: 'input' },
  { field: 'breedStrainName', label: t('breeding.field.breedStrainName'), type: 'input' },
  { field: 'parentCode', label: t('breeding.field.parentCode'), type: 'input' }
]);

const configSearchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'motherCode', label: t('breeding.field.motherCode'), type: 'input' },
  { field: 'fatherCode', label: t('breeding.field.fatherCode'), type: 'input' },
  { field: 'cubCode', label: t('breeding.field.cubCode'), type: 'input' }
]);

const infoColumns = computed<BizTableColumn[]>(() => [
  { prop: 'breedStrainCode', label: t('breeding.column.breedStrainCode'), width: 140 },
  { prop: 'breedStrainName', label: t('breeding.column.breedStrainName'), minWidth: 140 },
  { prop: 'description', label: t('breeding.column.description'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'remark', label: t('breeding.column.remark'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'createTime', label: t('breeding.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

const configColumns = computed<BizTableColumn[]>(() => [
  { prop: 'motherCode', label: t('breeding.column.motherCode'), width: 140 },
  { prop: 'motherName', label: t('breeding.column.motherName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'fatherCode', label: t('breeding.column.fatherCode'), width: 140 },
  { prop: 'fatherName', label: t('breeding.column.fatherName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'cubCode', label: t('breeding.column.cubCode'), width: 140 },
  { prop: 'offspringName', label: t('breeding.column.offspringName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'remark', label: t('breeding.column.remark'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'createTime', label: t('breeding.column.createTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

// ============= BreedInfo handlers =============
async function fetchInfo(breedStrain: number) {
  if (breedStrain === 1) {
    infoTypeLoading.value = true;
    try {
      const query: BreedInfoQuery = {
        pageNum: infoTypePageNum.value,
        pageSize: infoTypePageSize.value,
        breedStrain,
        breedStrainCode: infoTypeSearch.breedStrainCode || undefined,
        breedStrainName: infoTypeSearch.breedStrainName || undefined
      };
      const res = await listBreedInfo(query);
      infoTypeList.value = (res.rows ?? res.data ?? []) as BreedInfoVO[];
      infoTypeTotal.value = res.total ?? 0;
    } finally {
      infoTypeLoading.value = false;
    }
  } else {
    infoStrainLoading.value = true;
    try {
      const query: BreedInfoQuery = {
        pageNum: infoStrainPageNum.value,
        pageSize: infoStrainPageSize.value,
        breedStrain,
        breedStrainCode: infoStrainSearch.breedStrainCode || undefined,
        breedStrainName: infoStrainSearch.breedStrainName || undefined,
        parentCode: infoStrainSearch.parentCode || undefined
      };
      const res = await listBreedInfo(query);
      infoStrainList.value = (res.rows ?? res.data ?? []) as BreedInfoVO[];
      infoStrainTotal.value = res.total ?? 0;
    } finally {
      infoStrainLoading.value = false;
    }
  }
}

function onInfoSearch(breedStrain: number) {
  if (breedStrain === 1) infoTypePageNum.value = 1;
  else infoStrainPageNum.value = 1;
  fetchInfo(breedStrain);
}
function onInfoReset(breedStrain: number) {
  onInfoSearch(breedStrain);
}
function onInfoPageChange(breedStrain: number, payload: number | [number, number]) {
  // BizTable 的 page-change 触发参数有可能是 (pageNum, pageSize)；按其类型签名 [p, s]
  // 这里兼容：直接刷新当前页（pageNum/pageSize 已由 BizTable v-model 同步）
  if (Array.isArray(payload)) {
    if (breedStrain === 1) {
      infoTypePageNum.value = payload[0];
      infoTypePageSize.value = payload[1];
    } else {
      infoStrainPageNum.value = payload[0];
      infoStrainPageSize.value = payload[1];
    }
  }
  fetchInfo(breedStrain);
}
function onInfoAdd(breedStrain: number) {
  infoFormRef.value?.openCreate(breedStrain);
}
function onInfoEdit(row: BizRow) {
  infoFormRef.value?.openEdit(row.id);
}
async function onInfoDel(breedStrain: number, rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('breeding.confirm.delInfo', { count: ids.length }));
  await delBreedInfo(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchInfo(breedStrain);
}
function handleInfoSuccess() {
  const strain = activeTab.value === 'strain' ? 2 : 1;
  fetchInfo(strain);
}

// ============= BreedConfig handlers =============
async function fetchConfig(breedStrain: number) {
  if (breedStrain === 1) {
    configTypeLoading.value = true;
    try {
      const query: BreedConfigQuery = {
        pageNum: configTypePageNum.value,
        pageSize: configTypePageSize.value,
        breedStrain,
        motherCode: configTypeSearch.motherCode || undefined,
        fatherCode: configTypeSearch.fatherCode || undefined,
        cubCode: configTypeSearch.cubCode || undefined
      };
      const res = await listBreedConfig(query);
      configTypeList.value = (res.rows ?? res.data ?? []) as BreedConfigVO[];
      configTypeTotal.value = res.total ?? 0;
    } finally {
      configTypeLoading.value = false;
    }
  } else {
    configStrainLoading.value = true;
    try {
      const query: BreedConfigQuery = {
        pageNum: configStrainPageNum.value,
        pageSize: configStrainPageSize.value,
        breedStrain,
        motherCode: configStrainSearch.motherCode || undefined,
        fatherCode: configStrainSearch.fatherCode || undefined,
        cubCode: configStrainSearch.cubCode || undefined
      };
      const res = await listBreedConfig(query);
      configStrainList.value = (res.rows ?? res.data ?? []) as BreedConfigVO[];
      configStrainTotal.value = res.total ?? 0;
    } finally {
      configStrainLoading.value = false;
    }
  }
}

function onConfigSearch(breedStrain: number) {
  if (breedStrain === 1) configTypePageNum.value = 1;
  else configStrainPageNum.value = 1;
  fetchConfig(breedStrain);
}
function onConfigReset(breedStrain: number) {
  onConfigSearch(breedStrain);
}
function onConfigPageChange(breedStrain: number, payload: number | [number, number]) {
  if (Array.isArray(payload)) {
    if (breedStrain === 1) {
      configTypePageNum.value = payload[0];
      configTypePageSize.value = payload[1];
    } else {
      configStrainPageNum.value = payload[0];
      configStrainPageSize.value = payload[1];
    }
  }
  fetchConfig(breedStrain);
}
function onConfigAdd(breedStrain: number) {
  configFormRef.value?.openCreate(breedStrain);
}
function onConfigEdit(row: BizRow) {
  configFormRef.value?.openEdit(row.id);
}
async function onConfigDel(breedStrain: number, rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('breeding.confirm.delConfig', { count: ids.length }));
  await delBreedConfig(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchConfig(breedStrain);
}
function handleConfigSuccess() {
  const strain = activeTab.value === 'strainConfig' ? 2 : 1;
  fetchConfig(strain);
}

onMounted(() => {
  fetchInfo(1);
  fetchInfo(2);
  fetchConfig(1);
  fetchConfig(2);
});
</script>

<style scoped>
.biz-tabs :deep(.el-tabs__content) {
  padding-top: 4px;
}
</style>
