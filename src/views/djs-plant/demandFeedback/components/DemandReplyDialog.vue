<template>
  <el-dialog v-model="visible" :title="t('cropDemand.title.reply')" destroy-on-close append-to-body width="720px" @closed="handleClosed">
    <el-descriptions v-loading="loading" :column="1" border class="mb-4">
      <el-descriptions-item :label="t('cropDemand.field.demandCategory')">
        <dict-tag v-if="detail?.demandCategory" :options="djs_plant_demand_category" :value="detail.demandCategory" />
        <span v-else>—</span>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.demandContent')">
        <div class="demand-text">{{ detail?.demandContent || '—' }}</div>
      </el-descriptions-item>
      <el-descriptions-item :label="t('cropDemand.field.imageOssIds')">
        <div v-if="imageUrls.length > 0" class="demand-images">
          <ImagePreview v-for="url in imageUrls" :key="url" :src="url" :width="88" :height="88" />
        </div>
        <span v-else>{{ t('cropDemand.empty.images') }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('cropDemand.field.replyContent')" prop="replyContent">
        <el-input
          v-model="form.replyContent"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
          :placeholder="t('cropDemand.placeholder.replyContent')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import ImagePreview from '@/components/ImagePreview/index.vue';
import { getCropDemand, replyCropDemand } from '@/api/djs-plant/cropDemand';
import type { CropDemandReplyForm, CropDemandVO } from '@/api/djs-plant/cropDemand/types';
import { resolveDemandImageUrls, DEMAND_CATEGORY_DICT } from './demandShared';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_plant_demand_category } = toRefs(useDict(DEMAND_CATEGORY_DICT));

const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const detail = ref<CropDemandVO | undefined>(undefined);
const imageUrls = ref<string[]>([]);

const defaultForm = (): CropDemandReplyForm => ({ id: '', replyContent: '' });
const form = ref<CropDemandReplyForm>(defaultForm());

const rules = computed(() => ({
  replyContent: [{ required: true, message: t('cropDemand.rule.replyContent.required'), trigger: 'blur' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 无论待回复还是已回复都走这个入口；已回复时把旧回复内容回填，支持后续修改。 */
const open = async (id: number | string) => {
  visible.value = true;
  loading.value = true;
  form.value = defaultForm();
  detail.value = undefined;
  imageUrls.value = [];
  try {
    const res = await getCropDemand(id);
    detail.value = res.data;
    form.value = { id, replyContent: res.data?.replyContent ?? '' };
    imageUrls.value = await resolveDemandImageUrls(res.data?.imageOssIds);
  } finally {
    loading.value = false;
  }
};

defineExpose({ open });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  detail.value = undefined;
  imageUrls.value = [];
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await replyCropDemand(form.value);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>

<style scoped>
.demand-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.demand-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
