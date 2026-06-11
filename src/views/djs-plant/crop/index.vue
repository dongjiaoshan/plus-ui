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
      :dict-types="['djs_crop_family', 'djs_planting_season']"
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
          v-if="row.cropImagePreview && thumbUrlMap[String(row.cropImagePreview)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[String(row.cropImagePreview)]"
          :preview-src-list="[thumbUrlMap[String(row.cropImagePreview)]]"
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

const searchModel = reactive<Record<string, any>>({
  cropCode: undefined,
  cropName: undefined,
  varietyName: undefined,
  cropFamily: undefined,
  plantingSeason: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cropCode', label: t('plantCrop.field.cropCode'), type: 'input' },
  { field: 'cropName', label: t('plantCrop.field.cropName'), type: 'input' },
  { field: 'varietyName', label: t('plantCrop.field.varietyName'), type: 'input' },
  { field: 'cropFamily', label: t('plantCrop.field.cropFamily'), type: 'select', dictType: 'djs_crop_family' },
  { field: 'plantingSeason', label: t('plantCrop.field.plantingSeason'), type: 'select', dictType: 'djs_planting_season' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropCode', label: t('plantCrop.column.cropCode'), width: 100, showOverflowTooltip: true },
  { prop: 'cropImagePreview', label: t('plantPlot.column.plotImage'), width: 80, align: 'center' },
  { prop: 'cropName', label: t('plantCrop.column.cropName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'varietyName', label: t('plantCrop.column.varietyName'), width: 140, showOverflowTooltip: true },
  { prop: 'cropFamily', label: t('plantCrop.column.cropFamily'), width: 100, align: 'center', dictType: 'djs_crop_family' },
  {
    prop: 'plantingSeason',
    label: t('plantCrop.column.plantingSeason'),
    width: 140,
    align: 'center',
    dictType: 'djs_planting_season',
    showOverflowTooltip: true
  },
  {
    prop: 'maxCycle',
    label: t('plantCrop.column.cycle'),
    width: 110,
    align: 'right',
    formatter: (r: BizRow) => (r.minCycle && r.maxCycle ? `${r.minCycle}-${r.maxCycle} 天` : '-')
  },
  {
    prop: 'predictedPer',
    label: t('plantCrop.column.predictedPer'),
    width: 130,
    align: 'right',
    formatter: (r: BizRow) => (r.predictedPer != null ? `${r.predictedPer} kg/亩` : '-')
  },
  {
    prop: 'pickUnitPrice',
    label: t('plantCrop.column.pickUnitPrice'),
    width: 120,
    align: 'right',
    formatter: (r: BizRow) => (r.pickUnitPrice != null ? `¥${r.pickUnitPrice}/斤` : '-')
  },
  { prop: 'createTime', label: t('plantCrop.column.createTime'), width: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: CropInfoQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      cropCode: searchModel.cropCode || undefined,
      cropName: searchModel.cropName || undefined,
      varietyName: searchModel.varietyName || undefined,
      cropFamily: searchModel.cropFamily || undefined,
      plantingSeason: searchModel.plantingSeason || undefined
    };
    const res = await listCrop(query);
    list.value = (res.rows ?? res.data ?? []) as CropInfoVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => r.cropImagePreview).filter((v): v is string => !!v)));
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
  proxy?.download(
    'djs/plant/crop/export',
    {
      cropCode: searchModel.cropCode || undefined,
      cropName: searchModel.cropName || undefined,
      varietyName: searchModel.varietyName || undefined,
      cropFamily: searchModel.cropFamily || undefined,
      plantingSeason: searchModel.plantingSeason || undefined
    },
    `crop_${new Date().getTime()}.xlsx`
  );
}
function handleFormSuccess() {
  fetchList();
}

onMounted(fetchList);
</script>
