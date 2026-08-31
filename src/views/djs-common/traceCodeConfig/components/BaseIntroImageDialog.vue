<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="560px" @closed="handleClosed">
    <el-form label-width="110px">
      <el-form-item :label="t('traceCodeConfig.field.configName')">
        <span>{{ form.configName }}</span>
      </el-form-item>
      <el-form-item :label="t('traceCodeConfig.field.baseIntroImage')">
        <OssUpload ref="ossUploadRef" v-model="imageOssIdsModel" biz-type="trace" :limit="1" :file-size="10" />
      </el-form-item>
    </el-form>
    <div class="tip">{{ t('traceCodeConfig.tip.fallback') }}</div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getTraceCodeConfig, updateTraceCodeConfigImage } from '@/api/djs-common/traceCodeConfig';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const ossUploadRef = ref<InstanceType<typeof OssUpload>>();

interface DialogForm {
  id: number | string | undefined;
  configName: string;
  baseIntroImageOssId: string | null;
}

const defaultForm = (): DialogForm => ({
  id: undefined,
  configName: '',
  baseIntroImageOssId: null
});

const form = ref<DialogForm>(defaultForm());

// OssUpload v-model 是 string[]（ossId 雪花全链路 string，禁 Number）；业务字段是单值
const imageOssIdsModel = computed<string[]>({
  get: () => (form.value.baseIntroImageOssId ? [form.value.baseIntroImageOssId] : []),
  set: (val: string[]) => {
    form.value.baseIntroImageOssId = val && val.length > 0 ? val[0] : null;
  }
});

const dialogTitle = computed(() => t('traceCodeConfig.title.upload'));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 列表行传进来的最小信息（BizTable slot 的 row 是 Record<string, any>，这里只取用得上的两项） */
interface OpenPayload {
  id: number | string;
  configName?: string;
}

/** 打开弹窗：重新拉一次详情，避免列表数据过期 */
const open = async (row: OpenPayload) => {
  form.value = defaultForm();
  const res = await getTraceCodeConfig(row.id);
  const data = res.data;
  form.value = {
    id: data?.id ?? row.id,
    configName: data?.configName ?? row.configName ?? '',
    baseIntroImageOssId: data?.baseIntroImageOssId ? String(data.baseIntroImageOssId) : null
  };
  visible.value = true;
  // 回填 OssUpload 已有图片（OssUpload 内部不 watch modelValue 反查 URL，必须父组件调 setExistingFiles）
  const ossId = form.value.baseIntroImageOssId;
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
      console.warn('[BaseIntroImageDialog] listOssByIds failed for ossId', ossId, e);
    }
  }
};

defineExpose({ open });

const handleClosed = () => {
  form.value = defaultForm();
};

const submit = async () => {
  if (!form.value.id) return;
  submitting.value = true;
  try {
    await updateTraceCodeConfigImage({
      id: form.value.id,
      baseIntroImageOssId: form.value.baseIntroImageOssId
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.tip {
  padding-left: 110px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}
</style>
