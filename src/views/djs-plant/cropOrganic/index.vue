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
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      show-export
      perm-prefix="djs:plant:cropOrganic"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="220"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @del="handleDel"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <template #cell-cropImagePreview="{ row }">
        <ImagePreview
          v-if="firstImageOssId(row) && thumbUrlMap[firstImageOssId(row)]"
          :width="40"
          :height="40"
          :src="thumbUrlMap[firstImageOssId(row)]"
          :preview-src-list="[thumbUrlMap[firstImageOssId(row)]]"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #cell-cropCount="{ row }">
        {{ row.relatedCrops?.length ?? 0 }}
      </template>
      <template #cell-cropName="{ row }">
        <template v-if="row.relatedCrops && row.relatedCrops.length > 0">
          {{ relatedCropNames(row.relatedCrops) }}
        </template>
        <span v-else-if="row.cropName">{{ row.cropName }}</span>
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['djs:plant:cropOrganic:edit']" link type="primary" @click="handleEdit(row)">
          {{ t('biz.table.action.edit') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:cropOrganic:edit']" link type="primary" @click="handleRelate(row)">
          {{ t('plantCropOrganic.relate.action') }}
        </el-button>
        <el-button v-hasPermi="['djs:plant:cropOrganic:remove']" link type="danger" @click="handleDel(row)">
          {{ t('biz.table.action.del') }}
        </el-button>
      </template>
    </BizTable>

    <CropOrganicForm ref="formRef" @success="fetchList" />
    <CropOrganicRelateDialog ref="relateRef" @success="fetchList" />
  </div>
</template>

<script setup name="CropOrganicIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import CropOrganicForm from './components/CropOrganicForm.vue';
import CropOrganicRelateDialog from './components/CropOrganicRelateDialog.vue';
import { listCropOrganic, delCropOrganic } from '@/api/djs-plant/cropOrganic';
import type { CropOrganicQuery, CropOrganicVO, RelatedCropRef } from '@/api/djs-plant/cropOrganic/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();
const relateRef = ref<{ open: (id: number | string) => void }>();

const list = ref<CropOrganicVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, any>>({
  cropCertNo: undefined,
  cropCertCompany: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cropCertNo', label: t('plantCropOrganic.field.cropCertNo'), type: 'input' },
  { field: 'cropCertCompany', label: t('plantCropOrganic.field.cropCertCompany'), type: 'input' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropImagePreview', label: t('plantCropOrganic.column.image'), width: 80, align: 'center' },
  { prop: 'cropCertCompany', label: t('plantCropOrganic.column.cropCertCompany'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'cropCertNo', label: t('plantCropOrganic.column.cropCertNo'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'cropCertValid', label: t('plantCropOrganic.column.cropCertValid'), minWidth: 120, align: 'center' },
  { prop: 'cropCount', label: t('plantCropOrganic.column.cropCount'), minWidth: 110, align: 'center' },
  { prop: 'cropName', label: t('plantCropOrganic.column.cropName'), minWidth: 180, showOverflowTooltip: true },
  { prop: 'updateTime', label: t('plantCropOrganic.column.updateTime'), minWidth: 160, align: 'center', formatter: 'datetime' },
  { prop: 'updateByName', label: t('plantCropOrganic.column.updateByName'), minWidth: 120, align: 'center' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: CropOrganicQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      cropCertNo: searchModel.cropCertNo || undefined,
      cropCertCompany: searchModel.cropCertCompany || undefined
    };
    const res = await listCropOrganic(query);
    list.value = (res.rows ?? res.data ?? []) as CropOrganicVO[];
    total.value = res.total ?? 0;
    await loadThumbUrls();
  } finally {
    loading.value = false;
  }
}

/** 证书图取第一张：列表读 cropImagePreview 恒空，改取多图串 cropImageUrl 的首个 ossId。 */
function firstImageOssId(row: BizRow): string {
  const raw = (row.cropImageUrl as string | undefined) ?? '';
  const first = raw.split(',')[0]?.trim();
  return first ? String(first) : '';
}

async function loadThumbUrls() {
  const ids = Array.from(new Set(list.value.map((r) => firstImageOssId(r as BizRow)).filter((v) => !!v)));
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
    console.warn('[CropOrganic] listOssByIds failed', e);
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
function handleRelate(row: BizRow) {
  relateRef.value?.open(row.id);
}
function relatedCropNames(crops: RelatedCropRef[]): string {
  return crops.map((c) => c.cropName).join('、');
}
async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('plantCropOrganic.confirm.del', { count: ids.length }));
  await delCropOrganic(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}
function handleExport() {
  proxy?.download(
    'djs/plant/cropOrganic/export',
    {
      cropCertNo: searchModel.cropCertNo || undefined,
      cropCertCompany: searchModel.cropCertCompany || undefined
    },
    `crop_organic_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
