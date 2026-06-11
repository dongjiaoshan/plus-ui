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
      :dict-types="['sys_normal_disable']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      selectable
      perm-prefix="djs:common:image"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @del="handleDel"
      @page-change="handlePageChange"
    >
      <template #toolbar-extra>
        <el-button v-hasPermi="['djs:common:image:rematch']" type="warning" plain icon="RefreshRight" :loading="rematching" @click="handleRematch">
          {{ t('image.action.rematch') }}
        </el-button>
      </template>

      <template #cell-imageUrl="{ row }">
        <el-image v-if="row.imageUrl" :src="row.imageUrl" :preview-src-list="[row.imageUrl]" fit="cover" preview-teleported class="img-thumb" />
        <span v-else class="img-empty">{{ t('image.noImage') }}</span>
      </template>

      <template #action="{ row }">
        <el-tooltip :content="t('biz.table.action.edit')" placement="top">
          <el-button v-hasPermi="['djs:common:image:edit']" link type="primary" icon="Edit" @click="handleEdit(row)" />
        </el-tooltip>
        <el-tooltip :content="t('biz.table.action.del')" placement="top">
          <el-button v-hasPermi="['djs:common:image:remove']" link type="danger" icon="Delete" @click="handleDel(row)" />
        </el-tooltip>
      </template>
    </BizTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('image.field.imageName')" prop="imageName">
          <el-input v-model="form.imageName" :placeholder="t('image.placeholder.imageName')" maxlength="64" />
        </el-form-item>
        <el-form-item :label="t('image.field.aliases')" prop="aliases">
          <el-input v-model="form.aliases" :placeholder="t('image.placeholder.aliases')" maxlength="255" />
        </el-form-item>
        <el-form-item :label="t('image.field.image')" prop="ossId">
          <OssUpload ref="ossUploadRef" v-model="imageIdsModel" biz-type="md_image_library" :limit="1" :file-size="10" />
        </el-form-item>
        <el-form-item :label="t('image.field.sortOrder')" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item :label="t('image.field.status')" prop="status">
          <el-switch v-model="form.status" active-value="0" inactive-value="1" />
        </el-form-item>
        <el-form-item :label="t('image.field.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ImageLibrary" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import OssUpload from '@/components/OssUpload/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { addImage, delImage, getImage, listImage, rematchImage, updateImage } from '@/api/djs-common/image';
import type { ImageLibraryForm, ImageLibraryQuery, ImageLibraryVO } from '@/api/djs-common/image/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();
const formRef = ref<ElFormInstance>();
const ossUploadRef = ref<InstanceType<typeof OssUpload>>();

const list = ref<ImageLibraryVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const rematching = ref(false);

const dialogVisible = ref(false);
const submitting = ref(false);

const searchModel = reactive<Record<string, any>>({
  imageName: undefined,
  aliases: undefined,
  status: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'imageName', label: t('image.field.imageName'), type: 'input' },
  { field: 'aliases', label: t('image.field.aliases'), type: 'input' },
  { field: 'status', label: t('image.field.status'), type: 'select', dictType: 'sys_normal_disable' }
]);

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'imageUrl', label: t('image.column.preview'), width: 90, align: 'center' },
  { prop: 'imageName', label: t('image.column.imageName'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'aliases', label: t('image.column.aliases'), minWidth: 200, showOverflowTooltip: true },
  { prop: 'sortOrder', label: t('image.column.sortOrder'), width: 80, align: 'center' },
  { prop: 'status', label: t('image.column.status'), width: 90, align: 'center', dictType: 'sys_normal_disable' },
  { prop: 'remark', label: t('image.column.remark'), minWidth: 140, showOverflowTooltip: true },
  { prop: 'updateTime', label: t('image.column.updateTime'), width: 170, align: 'center', formatter: 'datetime' }
]);

const defaultForm = (): ImageLibraryForm => ({
  id: undefined,
  imageName: '',
  aliases: undefined,
  ossId: null,
  sortOrder: 0,
  status: '0',
  remark: undefined
});

const form = ref<ImageLibraryForm>(defaultForm());

// OssUpload v-model string[]（ossId 全链路 string）；业务字段单值 ossId
const imageIdsModel = computed<string[]>({
  get: () => (form.value.ossId ? [form.value.ossId] : []),
  set: (val: string[]) => {
    form.value.ossId = val && val.length > 0 ? val[0] : null;
  }
});

const rules = computed(() => ({
  imageName: [{ required: true, message: t('image.rule.imageName.required'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('image.title.edit') : t('image.title.add')));

function buildQuery(): ImageLibraryQuery {
  return {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    imageName: searchModel.imageName || undefined,
    aliases: searchModel.aliases || undefined,
    status: searchModel.status || undefined
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listImage(buildQuery());
    list.value = (res.rows ?? res.data ?? []) as ImageLibraryVO[];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, any>) {
  if (payload) Object.assign(searchModel, payload);
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
  form.value = defaultForm();
  dialogVisible.value = true;
}

async function handleEdit(row: BizRow) {
  const res = await getImage(row.id);
  form.value = { ...defaultForm(), ...res.data };
  dialogVisible.value = true;
  const ossId = form.value.ossId;
  if (ossId) {
    try {
      const ossRes = await listOssByIds(ossId);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      await nextTick();
      ossUploadRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[ImageLibrary] listOssByIds failed for ossId', ossId, e);
    }
  }
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (form.value.id) {
      await updateImage(form.value);
    } else {
      await addImage(form.value);
    }
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    dialogVisible.value = false;
    fetchList();
  } finally {
    submitting.value = false;
  }
}

async function handleDel(rowOrRows: BizRow | BizRow[]) {
  const ids = Array.isArray(rowOrRows) ? rowOrRows.map((r) => r.id) : [rowOrRows.id];
  await proxy?.$modal.confirm(t('image.confirm.del', { count: ids.length }));
  await delImage(ids);
  proxy?.$modal.msgSuccess(t('common.opSuccess'));
  fetchList();
}

async function handleRematch() {
  await proxy?.$modal.confirm(t('image.confirm.rematch'));
  rematching.value = true;
  try {
    const res = await rematchImage();
    const detail = Object.entries(res.data || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('，');
    proxy?.$modal.msgSuccess(t('image.rematch.done', { detail: detail || '0' }));
    fetchList();
  } finally {
    rematching.value = false;
  }
}

function handleClosed() {
  formRef.value?.resetFields();
  form.value = defaultForm();
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.img-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}
.img-empty {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>
