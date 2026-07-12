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
      :dict-types="['djs_planting_season', 'djs_crop_family']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:plant:crop"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-cropImagePreview="{ row }">
        <ImagePreview
          v-if="effImgId(row) && thumbUrlMap[String(effImgId(row))]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(effImgId(row))]"
          :preview-src-list="[thumbUrlMap[String(effImgId(row))]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.view')" placement="top">
          <el-button v-hasPermi="['djs:plant:crop:list']" link type="primary" icon="View" @click="handleView(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:plant:crop:edit']" link type="primary" icon="Edit" @click="handleEdit(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:plant:crop:remove']" link type="danger" icon="Delete" @click="handleDel(row)" />
        </el-tooltip>
      </template>
    </BizTable>

    <CropForm ref="formRef" @success="handleFormSuccess" />
    <CropView ref="cropViewRef" />
  </div>
</template>

<script setup name="CropIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import CropForm from './components/CropForm.vue';
import CropView from './components/CropView.vue';
import { delCrop, listCrop } from '@/api/djs-plant/crop';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { listUser } from '@/api/system/user';
import type { CropInfoQuery, CropInfoVO } from '@/api/djs-plant/crop/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const cropViewRef = ref<{ open: (id: number | string) => void }>();

const list = ref<CropInfoVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});
// 更新人员筛选下拉：value=用户ID，label=昵称（无昵称回退登录名）
const userOptions = ref<Array<{ label: string; value: number | string }>>([]);

const searchModel = reactive<Record<string, any>>({
  cropName: undefined,
  cropFamily: undefined,
  varietyName: undefined,
  varietyOrigin: undefined,
  hasOrganic: undefined,
  organicWarning: undefined,
  updateTime: undefined,
  updateBy: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cropName', label: t('plantCrop.field.cropName'), type: 'input' },
  { field: 'cropFamily', label: t('plantCrop.field.cropFamily'), type: 'input' },
  { field: 'varietyName', label: t('plantCrop.field.varietyName'), type: 'input' },
  { field: 'varietyOrigin', label: t('plantCrop.search.varietyOrigin'), type: 'input' },
  {
    field: 'hasOrganic',
    label: t('plantCrop.search.hasOrganic'),
    type: 'select',
    clearable: true,
    options: [
      { label: t('plantCrop.option.yes'), value: 1 },
      { label: t('plantCrop.option.no'), value: 2 }
    ]
  },
  {
    field: 'organicWarning',
    label: t('plantCrop.search.organicWarning'),
    type: 'select',
    clearable: true,
    options: [
      { label: t('plantCrop.option.warningYes'), value: 1 },
      { label: t('plantCrop.option.warningNo'), value: 2 }
    ]
  },
  { field: 'updateTime', label: t('plantCrop.search.updateTime'), type: 'daterange' },
  {
    field: 'updateBy',
    label: t('plantCrop.search.updateBy'),
    type: 'select',
    clearable: true,
    options: userOptions.value
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropImagePreview', label: t('plantCrop.column.cropImage'), width: 80, align: 'center' },
  { prop: 'cropName', label: t('plantCrop.column.cropName'), minWidth: 130, showOverflowTooltip: true },
  { prop: 'cropCode', label: t('plantCrop.column.cropCode'), width: 100, showOverflowTooltip: true },
  { prop: 'cropFamily', label: t('plantCrop.column.cropFamily'), width: 110, align: 'center', dictType: 'djs_crop_family', showOverflowTooltip: true },
  { prop: 'varietyName', label: t('plantCrop.column.varietyName'), width: 130, showOverflowTooltip: true },
  { prop: 'varietyOrigin', label: t('plantCrop.label.varietyOrigin'), width: 140, showOverflowTooltip: true },
  {
    prop: 'plantingSeason',
    label: t('plantCrop.column.plantingSeason'),
    width: 240,
    align: 'center',
    dictType: 'djs_planting_season',
    showOverflowTooltip: true
  },
  {
    prop: 'predictedPer',
    label: t('plantCrop.column.predictedPer'),
    width: 120,
    align: 'right',
    formatter: (r: BizRow) => (r.predictedPer != null ? Number(r.predictedPer).toFixed(3) : '-')
  },
  {
    prop: 'maxYield',
    label: t('plantCrop.label.maxYield'),
    width: 120,
    align: 'right',
    formatter: (r: BizRow) => (r.maxYield != null ? Number(r.maxYield).toFixed(3) : '-')
  },
  {
    prop: 'avgYield',
    label: t('plantCrop.label.avgYield'),
    width: 120,
    align: 'right',
    formatter: (r: BizRow) => (r.avgYield != null ? Number(r.avgYield).toFixed(3) : '-')
  },
  {
    prop: 'historyPlantCount',
    label: t('plantCrop.label.historyPlantCount'),
    width: 110,
    align: 'right',
    formatter: (r: BizRow) => (r.historyPlantCount != null ? `${r.historyPlantCount} 次` : '0 次')
  },
  { prop: 'relatedProductName', label: t('plantCrop.label.relatedProduct'), width: 140, align: 'center', showOverflowTooltip: true },
  { prop: 'updateByName', label: t('plantCrop.label.updateByName'), width: 110, align: 'center', showOverflowTooltip: true },
  { prop: 'updateTime', label: t('plantCrop.label.updateTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function loadUserOptions() {
  try {
    const res = await listUser({ pageNum: 1, pageSize: 1000 });
    const rows = res.rows ?? [];
    userOptions.value = rows.map((u) => ({ label: u.nickName || u.userName || String(u.userId), value: u.userId }));
  } catch (e) {
    console.warn('[Crop] listUser failed', e);
    userOptions.value = [];
  }
}

function buildQuery(): CropInfoQuery {
  const range = searchModel.updateTime;
  const params: Record<string, any> = {};
  if (Array.isArray(range) && range[0] && range[1]) {
    params.beginTime = range[0];
    params.endTime = range[1];
  }
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    cropName: searchModel.cropName || undefined,
    cropFamily: searchModel.cropFamily || undefined,
    varietyName: searchModel.varietyName || undefined,
    varietyOrigin: searchModel.varietyOrigin || undefined,
    hasOrganic: searchModel.hasOrganic ?? undefined,
    organicWarning: searchModel.organicWarning ?? undefined,
    updateBy: searchModel.updateBy ?? undefined,
    params: Object.keys(params).length ? params : undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listCrop(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as CropInfoVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

// 作物图片列取值兜底：优先 cropImagePreview（新口径），回落 imageOssId / cropImageUrl 首图
// （老作物数据只有 image_oss_id、crop_image_preview 为 NULL，与编辑弹框回填口径一致）
function effImgId(row: CropInfoVO | BizRow): string | undefined {
  const r = row as CropInfoVO;
  return r.cropImagePreview || r.imageOssId || (r.cropImageUrl ? String(r.cropImageUrl).split(',')[0] : undefined) || undefined;
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => effImgId(r)).filter((v): v is string => !!v)));
  if (ids.length === 0) {
    thumbUrlMap.value = {};
    return;
  }
  try {
    const res = await listOssByIds(ids.join(','));
    const map: Record<string, string> = {};
    (res.data ?? []).forEach((o: any) => {
      if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
    });
    thumbUrlMap.value = map;
  } catch (e) {
    console.warn('[Crop] listOssByIds failed', e);
    thumbUrlMap.value = {};
  }
}

function handleSearch(payload: Record<string, any>) {
  Object.assign(searchModel, payload);
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  Object.keys(searchModel).forEach((k) => (searchModel[k] = undefined));
  pageNum.value = 1;
  fetchList();
}
function handlePageChange(p: number, s: number) {
  pageNum.value = p;
  pageSize.value = s;
  fetchList();
}
function handleAdd() {
  formRef.value?.openCreate();
}
function handleEdit(row: BizRow) {
  formRef.value?.openEdit(row.id);
}
function handleView(row: BizRow) {
  cropViewRef.value?.open(row.id);
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('plantCrop.confirm.del', { count: ids.length }));
  await delCrop(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  const range = searchModel.updateTime;
  proxy?.download(
    'djs/plant/crop/export',
    {
      cropName: searchModel.cropName || undefined,
      cropFamily: searchModel.cropFamily || undefined,
      varietyName: searchModel.varietyName || undefined,
      varietyOrigin: searchModel.varietyOrigin || undefined,
      hasOrganic: searchModel.hasOrganic ?? undefined,
      organicWarning: searchModel.organicWarning ?? undefined,
      updateBy: searchModel.updateBy ?? undefined,
      'params[beginTime]': Array.isArray(range) && range[0] ? range[0] : undefined,
      'params[endTime]': Array.isArray(range) && range[1] ? range[1] : undefined
    },
    `crop_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(() => {
  loadUserOptions();
  fetchList();
});
</script>
