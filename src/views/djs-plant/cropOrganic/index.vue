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
      <template #cell-isWarning="{ row }">
        <el-tag v-if="row.isWarning === 1" type="danger">{{ t('plantCropOrganic.warning.yes') }}</el-tag>
        <el-tag v-else type="success">{{ t('plantCropOrganic.warning.no') }}</el-tag>
      </template>
    </BizTable>

    <CropOrganicForm ref="formRef" @success="fetchList" />
  </div>
</template>

<script setup name="CropOrganicIndex" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import CropOrganicForm from './components/CropOrganicForm.vue';
import { listCropOrganic, delCropOrganic } from '@/api/djs-plant/cropOrganic';
import type { CropOrganicQuery, CropOrganicVO } from '@/api/djs-plant/cropOrganic/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<{ openCreate: () => void; openEdit: (id: number | string) => void }>();

const list = ref<CropOrganicVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const thumbUrlMap = ref<Record<string, string>>({});

const searchModel = reactive<Record<string, any>>({
  cropCertNo: undefined,
  cropCertCompany: undefined,
  isWarning: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'cropCertNo', label: t('plantCropOrganic.field.cropCertNo'), type: 'input' },
  { field: 'cropCertCompany', label: t('plantCropOrganic.field.cropCertCompany'), type: 'input' },
  {
    field: 'isWarning',
    label: t('plantCropOrganic.field.isWarning'),
    type: 'select',
    options: [
      { label: t('plantCropOrganic.warning.yes'), value: 1 },
      { label: t('plantCropOrganic.warning.no'), value: 2 }
    ]
  }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'cropCertNo', label: t('plantCropOrganic.column.cropCertNo'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'cropCertCompany', label: t('plantCropOrganic.column.cropCertCompany'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'cropCertValid', label: t('plantCropOrganic.column.cropCertValid'), minWidth: 120, align: 'center' },
  { prop: 'cropName', label: t('plantCropOrganic.column.cropName'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'cropImagePreview', label: t('plantCropOrganic.column.image'), width: 80, align: 'center' },
  { prop: 'isWarning', label: t('plantCropOrganic.column.warning'), minWidth: 100, align: 'center' },
  { prop: 'createTime', label: t('plantCropOrganic.column.createTime'), minWidth: 160, align: 'center', formatter: 'datetime' }
]);

async function fetchList() {
  loading.value = true;
  try {
    const query: CropOrganicQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      cropCertNo: searchModel.cropCertNo || undefined,
      cropCertCompany: searchModel.cropCertCompany || undefined,
      isWarning: searchModel.isWarning === undefined || searchModel.isWarning === '' ? undefined : Number(searchModel.isWarning)
    };
    const res = await listCropOrganic(query);
    list.value = (res.rows ?? res.data ?? []) as CropOrganicVO[];
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
      cropCertCompany: searchModel.cropCertCompany || undefined,
      isWarning: searchModel.isWarning === undefined || searchModel.isWarning === '' ? undefined : Number(searchModel.isWarning)
    },
    `crop_organic_${new Date().getTime()}.xlsx`
  );
}

onMounted(() => {
  fetchList();
});
</script>
