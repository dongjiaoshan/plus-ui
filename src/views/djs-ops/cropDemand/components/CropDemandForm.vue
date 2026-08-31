<template>
  <el-dialog v-model="visible" :title="t('cropDemand.title.add')" destroy-on-close append-to-body width="720px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('cropDemand.field.demandCategory')" prop="demandCategory">
        <el-select v-model="form.demandCategory" :placeholder="t('cropDemand.placeholder.demandCategory')" clearable style="width: 100%">
          <el-option v-for="d in djs_plant_demand_category" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('cropDemand.field.demandContent')" prop="demandContent">
        <el-input
          v-model="form.demandContent"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
          :placeholder="t('cropDemand.placeholder.demandContent')"
        />
      </el-form-item>
      <el-form-item :label="t('cropDemand.field.imageOssIds')" prop="imageOssIds">
        <OssUpload v-model="imgOssIdsModel" :biz-type="DEMAND_OSS_BIZ_TYPE" :limit="9" :file-size="10" />
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
import OssUpload from '@/components/OssUpload/index.vue';
import { addCropDemand } from '@/api/djs-plant/cropDemand';
import type { CropDemandForm } from '@/api/djs-plant/cropDemand/types';
import { DEMAND_CATEGORY_DICT, DEMAND_OSS_BIZ_TYPE } from '@/views/djs-plant/demandFeedback/components/demandShared';
import { useOssBridge } from '@/composables/useOssBridge';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_plant_demand_category } = toRefs(useDict(DEMAND_CATEGORY_DICT));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): CropDemandForm => ({
  demandCategory: '',
  demandContent: '',
  imageOssIds: undefined
});

const form = ref<CropDemandForm>(defaultForm());

// OssUpload v-model 是 string[]，业务字段是逗号拼的 ossId 串（雪花 ossId 全链路 string）
const imgOssIdsModel = useOssBridge(form, 'imageOssIds', 'multi');

const rules = computed(() => ({
  demandCategory: [{ required: true, message: t('cropDemand.rule.demandCategory.required'), trigger: 'change' }],
  demandContent: [{ required: true, message: t('cropDemand.rule.demandContent.required'), trigger: 'blur' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 只有新增入口：甲方操作列没有编辑，需求提交后不可改（避免已被回复的需求被偷改）。 */
const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

defineExpose({ openCreate });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await addCropDemand(form.value);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
