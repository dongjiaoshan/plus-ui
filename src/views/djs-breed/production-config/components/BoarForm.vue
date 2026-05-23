<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="160px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.boarId')" prop="boarId">
            <el-input-number
              v-model="form.boarId"
              :min="1"
              :step="1"
              :placeholder="t('productionConfig.placeholder.boarId')"
              class="w-full"
              controls-position="right"
            />
            <div class="text-xs text-gray-400 mt-1">{{ t('productionConfig.placeholder.boarId') }}</div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.spermQualityThreshold')" prop="spermQualityThreshold">
            <el-input-number
              v-model="form.spermQualityThreshold"
              :min="0"
              :precision="2"
              :step="0.1"
              :placeholder="t('productionConfig.placeholder.spermQualityThreshold')"
              class="w-full"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.breedingIntervalDays')" prop="breedingIntervalDays">
            <el-input-number
              v-model="form.breedingIntervalDays"
              :min="0"
              :step="1"
              :placeholder="t('productionConfig.placeholder.breedingIntervalDays')"
              class="w-full"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
          </el-form-item>
        </el-col>
      </el-row>
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
import { addBoarConfig, getBoarConfig, updateBoarConfig } from '@/api/djs-breed/production-config';
import type { BoarConfigForm } from '@/api/djs-breed/production-config/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): BoarConfigForm => ({
  id: undefined,
  boarId: null,
  spermQualityThreshold: 0,
  breedingIntervalDays: 0,
  remark: undefined
});

const form = ref<BoarConfigForm>(defaultForm());

const rules = computed(() => ({
  spermQualityThreshold: [{ required: true, message: t('productionConfig.rule.spermQualityThreshold.required'), trigger: 'change' }],
  breedingIntervalDays: [{ required: true, message: t('productionConfig.rule.breedingIntervalDays.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('productionConfig.title.editBoar') : t('productionConfig.title.addBoar')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getBoarConfig(id);
  form.value = { ...defaultForm(), ...res.data };
  visible.value = true;
};

defineExpose({ openCreate, openEdit });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (form.value.id) {
        await updateBoarConfig(form.value);
      } else {
        await addBoarConfig(form.value);
      }
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
