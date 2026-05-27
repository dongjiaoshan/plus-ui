<!--
  OssUpload — admin 端 OSS STS 直传上传组件（SYS-INFRA-002）

  用法：
    <OssUpload
      v-model="form.imageOssIds"
      biz-type="pig_photo"
      :limit="9"
      :file-size="10"
      :file-types="['png', 'jpg', 'jpeg', 'webp']"
    />

  数据契约：
    - v-model 绑定 ossId 数组（number[]），业务表保存这个，不存 URL
    - 内部通过 GET /djs/oss/sts/credential 拿预签名 URL，浏览器 fetch PUT 直传 OSS
    - 上传成功后调 POST /djs/oss/sts/notify 回写 sys_oss 表拿 ossId
    - emit('uploaded', OssUploadResult) — 每张图上传成功后触发，含 ossId + url
    - emit('removed', ossId) — 删除时触发（V1 不真删 OSS，仅清出 v-model；OSS 文件留作审计）

  约束：
    - 不引入 ali-oss 包（待 Kevin 批准），使用浏览器原生 fetch PUT
    - 文件大小默认 10MB；类型默认 png/jpg/jpeg/webp
    - 失败重试 1 次（弱网兜底），更复杂的本地缓存重传队列在 SYS-INFRA-003 小程序端
-->
<template>
  <div class="djs-oss-upload">
    <el-upload
      ref="uploadRef"
      :http-request="customUpload"
      :show-file-list="true"
      :accept="acceptAttr"
      :limit="limit"
      :before-upload="beforeUpload"
      :on-exceed="onExceed"
      :on-remove="onRemove"
      :file-list="fileList"
      list-type="picture-card"
      multiple
    >
      <el-icon><Plus /></el-icon>
      <template #file="{ file }">
        <div class="upload-card">
          <img v-if="file.url" :src="file.url" class="thumbnail" :alt="file.name" />
          <div v-if="(file as any).status === 'uploading'" class="overlay">
            <span>{{ t('djs.oss.uploading') }} {{ (file as any).percentage ?? 0 }}%</span>
          </div>
          <div v-if="(file as any).status === 'fail'" class="overlay error">
            <span>{{ t('djs.oss.uploadFailed') }}</span>
          </div>
          <div class="actions">
            <el-icon v-if="file.url" class="action" @click="onPreview(file)"><ZoomIn /></el-icon>
            <el-icon class="action" @click="onRemoveByFile(file)"><Delete /></el-icon>
          </div>
        </div>
      </template>
    </el-upload>

    <div v-if="showTip" class="upload-tip">
      <span>{{ t('djs.oss.fileTooLarge', { max: fileSize }) }} · </span>
      <span>{{ t('djs.oss.typeNotAllowed', { types: fileTypes.join('/') }) }}</span>
    </div>

    <el-dialog v-model="previewVisible" :title="t('djs.oss.preview')" width="640px" append-to-body>
      <img v-if="previewUrl" :src="previewUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Delete, Plus, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage, type UploadFile, type UploadRawFile, type UploadUserFile } from 'element-plus';
import { getOssStsCredential, notifyOssUploaded } from '@/api/djs-common/oss';
import type { OssStsCredentialVO, OssUploadResult } from '@/api/djs-common/oss/types';

interface Props {
  /** v-model：ossId 数组（业务表保存的值） */
  modelValue?: number | number[] | null;
  /** 业务类型（决定 OSS 目录前缀），见后端 OssStsServiceImpl.ALLOWED_BIZ_TYPES */
  bizType: string;
  /** 最大文件数 */
  limit?: number;
  /** 单文件大小限制（MB） */
  fileSize?: number;
  /** 允许的扩展名（小写，不含点） */
  fileTypes?: string[];
  /** 是否显示底部提示 */
  showTip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  limit: 9,
  fileSize: 10,
  fileTypes: () => ['png', 'jpg', 'jpeg', 'webp'],
  showTip: true
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: number[]): void;
  (e: 'uploaded', result: OssUploadResult): void;
  (e: 'removed', ossId: number): void;
}>();

const { t } = useI18n();
const uploadRef = ref();
const fileList = ref<UploadUserFile[]>([]);
const previewVisible = ref(false);
const previewUrl = ref('');

/** 内部 ossId → UploadResult 映射（删除时取 url） */
const resultMap = ref<Map<number, OssUploadResult>>(new Map());

const acceptAttr = computed(() => props.fileTypes.map((t) => '.' + t).join(','));

/**
 * 不再 watch props.modelValue 反向重建 fileList —— element-plus el-upload 在 listType=picture-card 模式下自己维护
 * uploadFiles 数组（含 blob URL → 上传完成后我们覆盖为 OSS URL），外部父组件用 `setExistingFiles(...)` 显式回填编辑场景，
 * 用 `onRemove` 删除后通过 `syncModel` 反向 emit。如果在这里再 watch + 覆盖 fileList，会把 el-upload 内部刚 push 的临时 file
 * 抹掉，导致"上传成功但缩略图不显示"。详见 D08 _open-issues §[D08-1.10]。
 */

function syncModel() {
  const ids = Array.from(resultMap.value.keys());
  emit('update:modelValue', ids);
}

function beforeUpload(rawFile: UploadRawFile): boolean {
  const ext = rawFile.name.split('.').pop()?.toLowerCase() ?? '';
  if (!props.fileTypes.includes(ext)) {
    ElMessage.error(t('djs.oss.typeNotAllowed', { types: props.fileTypes.join('/') }));
    return false;
  }
  const maxBytes = props.fileSize * 1024 * 1024;
  if (rawFile.size > maxBytes) {
    ElMessage.error(t('djs.oss.fileTooLarge', { max: props.fileSize }));
    return false;
  }
  return true;
}

function onExceed() {
  ElMessage.warning(t('djs.oss.reachLimit', { limit: props.limit }));
}

/** el-upload 自定义上传函数：拿 STS → fetch PUT → notify */
async function customUpload(opts: { file: File }) {
  const file = opts.file;
  try {
    await uploadWithRetry(file, 1);
  } catch (e) {
    console.error('[OssUpload] upload failed', e);
    ElMessage.error(t('djs.oss.uploadFailed'));
    throw e;
  }
}

async function uploadWithRetry(file: File, retries: number): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await doUpload(file);
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`[OssUpload] attempt ${attempt + 1} failed`, e);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

async function doUpload(file: File): Promise<void> {
  // 1. 拿 STS 凭证
  const credRes = await getOssStsCredential(props.bizType);
  const cred: OssStsCredentialVO = credRes.data as unknown as OssStsCredentialVO;
  if (!cred || cred.mode !== 'PRESIGNED_PUT' || !cred.uploadUrl) {
    throw new Error('Unsupported STS mode: ' + (cred?.mode ?? 'unknown'));
  }

  // 2. 浏览器原生 fetch PUT 直传（不引 ali-oss 依赖）
  const putRes = await fetch(cred.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' }
  });
  if (!putRes.ok) {
    throw new Error(`OSS PUT failed: ${putRes.status} ${putRes.statusText}`);
  }

  // 3. 回写后端落 sys_oss
  const notifyRes = await notifyOssUploaded({
    ossKey: cred.ossKey,
    originalName: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream',
    bizType: props.bizType
  });
  const ossId = notifyRes.data as unknown as number;

  // 4. URL = OSS public URL（minio dev 桶 access_policy=public）
  // notify 端点已经在后端构造好 sys_oss.url，但端点返回只有 ossId；前端用前端拼回 + 显示用
  const publicUrl = buildPublicUrlFallback(cred, cred.ossKey);

  const result: OssUploadResult = {
    ossId,
    url: publicUrl,
    ossKey: cred.ossKey,
    originalName: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream'
  };
  resultMap.value.set(ossId, result);

  // 让 el-upload 内部 uploadFiles 中刚 push 的临时 file 显示我们拿到的 OSS URL。
  // element-plus picture-card 默认 file.url = createObjectURL(blob)；OSS 上传完后我们覆盖为 OSS 公网 URL，
  // 并把 uid 改成 ossId 便于 onRemove 时定位 resultMap。直接修改 file 字段是 element-plus reactive 数组，会触发模板重渲染。
  const internal = (uploadRef.value as any)?.uploadFiles?.find((f: any) => f.raw === file) as UploadUserFile | undefined;
  if (internal) {
    internal.url = publicUrl;
    internal.uid = ossId;
    internal.status = 'success';
  }
  // 同步外部 fileList ref（v-model 反查删除用）
  fileList.value = [...fileList.value.filter((f) => Number(f.uid) !== ossId), { name: file.name, url: publicUrl, uid: ossId, status: 'success' } as UploadUserFile];

  emit('uploaded', result);
  syncModel();
  ElMessage.success(t('djs.oss.uploadSuccess'));
}

/** dev / public bucket 兜底拼 URL（端点 + bucket + key），不走 https/domain 的复杂处理 */
function buildPublicUrlFallback(cred: OssStsCredentialVO, key: string): string {
  // PRESIGNED PUT URL 形如 http://host:9000/bucket/key?xxx，去掉 query 当 public URL（minio dev 公开桶）
  if (cred.uploadUrl) {
    const idx = cred.uploadUrl.indexOf('?');
    return idx >= 0 ? cred.uploadUrl.substring(0, idx) : cred.uploadUrl;
  }
  return `http://${cred.endpoint}/${cred.bucket}/${key}`;
}

function onRemove(file: UploadFile) {
  const ossId = file.uid as number;
  if (resultMap.value.has(ossId)) {
    resultMap.value.delete(ossId);
    emit('removed', ossId);
    syncModel();
  }
}

function onRemoveByFile(file: UploadFile) {
  // 触发 el-upload 内部 remove
  uploadRef.value?.handleRemove(file);
}

function onPreview(file: UploadFile) {
  previewUrl.value = file.url ?? '';
  previewVisible.value = true;
}

/** 暴露给父组件：编辑场景时手动塞已上传的 ossId+url 列表（外层从 /resource/oss/listByIds 拉到） */
function setExistingFiles(items: { ossId: number; url: string; originalName: string }[]) {
  fileList.value = items.map((i) => ({ name: i.originalName, url: i.url, uid: i.ossId, status: 'success' }) as UploadUserFile);
  // 同步到 resultMap 让删除路径生效
  items.forEach((i) =>
    resultMap.value.set(i.ossId, {
      ossId: i.ossId,
      url: i.url,
      ossKey: '',
      originalName: i.originalName,
      size: 0,
      mime: ''
    })
  );
  syncModel();
}

defineExpose({ setExistingFiles });
</script>

<style scoped>
.djs-oss-upload {
  width: 100%;
}

.upload-card {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
}

.overlay.error {
  background: rgba(245, 108, 108, 0.6);
}

.actions {
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  gap: 6px;
}

.action {
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
