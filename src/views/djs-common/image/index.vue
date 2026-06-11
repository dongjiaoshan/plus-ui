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
        <el-button v-hasPermi="['djs:common:image:add']" type="success" plain icon="UploadFilled" @click="handleBatchOpen">
          {{ t('image.action.batchUpload') }}
        </el-button>
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

    <!-- 批量上传 + 按文件名自动归档 -->
    <el-dialog v-model="batchVisible" :title="t('image.batch.title')" destroy-on-close append-to-body width="720px" @closed="handleBatchClosed">
      <el-alert :title="t('image.batch.tip')" type="info" :closable="false" show-icon class="batch-tip" />
      <OssUpload
        ref="batchUploadRef"
        :model-value="[]"
        biz-type="md_image_library"
        :limit="50"
        :file-size="10"
        @uploaded="handleBatchUploaded"
        @removed="handleBatchRemoved"
      />
      <el-table v-if="batchItems.length > 0" :data="batchItems" size="small" border class="batch-table" max-height="240">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="originalName" :label="t('image.batch.fileName')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="imageName" :label="t('image.batch.imageName')" min-width="160" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <div class="batch-footer">
          <span class="batch-count">{{ t('image.batch.count', { count: batchItems.length }) }}</span>
          <el-button @click="batchVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="batchSubmitting" :disabled="batchItems.length === 0" @click="handleBatchSubmit">
            {{ t('image.batch.submit') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ImageLibrary" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import OssUpload from '@/components/OssUpload/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { addImage, batchImportImage, delImage, getImage, listImage, rematchImage, updateImage } from '@/api/djs-common/image';
import type { ImageBatchItem, ImageLibraryForm, ImageLibraryQuery, ImageLibraryVO } from '@/api/djs-common/image/types';
import type { OssUploadResult } from '@/api/djs-common/oss/types';
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

// 批量上传
const batchVisible = ref(false);
const batchSubmitting = ref(false);
const batchUploadRef = ref<InstanceType<typeof OssUpload>>();
interface BatchRow {
  ossId: string;
  originalName: string;
  imageName: string;
}
const batchItems = ref<BatchRow[]>([]);

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

/** 文件名去扩展名当主名：仅剥最后一段 `.ext`，保留中文 / 中点（白条·猪头.jpg → 白条·猪头） */
function stripExt(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').trim();
}

function handleBatchOpen() {
  batchItems.value = [];
  batchVisible.value = true;
}

/** OssUpload 每张上传成功回调：拿 originalName 去扩展名当 imageName，配对 ossId */
function handleBatchUploaded(result: OssUploadResult) {
  const imageName = stripExt(result.originalName);
  if (!imageName) return;
  // 同一 ossId 去重（防重复 emit）
  if (batchItems.value.some((it) => it.ossId === result.ossId)) return;
  batchItems.value.push({ ossId: result.ossId, originalName: result.originalName, imageName });
}

/** OssUpload 删除某张：从待导入列表移除 */
function handleBatchRemoved(ossId: string) {
  batchItems.value = batchItems.value.filter((it) => it.ossId !== ossId);
}

async function handleBatchSubmit() {
  if (batchItems.value.length === 0) return;
  const items: ImageBatchItem[] = batchItems.value.map((it) => ({ imageName: it.imageName, ossId: it.ossId }));
  batchSubmitting.value = true;
  try {
    const res = await batchImportImage(items);
    const data = res.data;
    const rematched = Object.entries(data?.rematched || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('，');
    proxy?.$modal.msgSuccess(
      t('image.batch.done', {
        imported: data?.imported ?? 0,
        updated: data?.updated ?? 0,
        rematched: rematched || '0'
      })
    );
    batchVisible.value = false;
    fetchList();
  } finally {
    batchSubmitting.value = false;
  }
}

function handleBatchClosed() {
  batchItems.value = [];
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
.batch-tip {
  margin-bottom: 12px;
}
.batch-table {
  margin-top: 12px;
}
.batch-footer {
  display: flex;
  align-items: center;
}
.batch-count {
  margin-right: auto;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
