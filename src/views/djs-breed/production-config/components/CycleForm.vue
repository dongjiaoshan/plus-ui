<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.configKey')" prop="configKey">
            <el-input v-model="form.configKey" :disabled="!!form.id" :placeholder="t('productionConfig.placeholder.configKey')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.defaultValue')" prop="defaultValue">
            <el-input-number v-model="form.defaultValue" :min="0" :step="1" :disabled="!!form.id" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.customValue')" prop="customValue">
            <el-input-number
              v-model="form.customValue"
              :min="0"
              :step="1"
              :placeholder="t('productionConfig.placeholder.customValue')"
              class="w-full"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.unit')" prop="unit">
            <el-input v-model="form.unit" :placeholder="t('productionConfig.placeholder.unit')" maxlength="16" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.description')" prop="description">
            <el-input v-model="form.description" :placeholder="t('productionConfig.placeholder.description')" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('productionConfig.field.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="text-xs text-gray-400 px-2 leading-relaxed">
        {{ t('productionConfig.tip.customOverridesDefault') }}<br />
        {{ t('productionConfig.tip.noAutoTrigger') }}
      </div>
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
import { addProductionCycle, getProductionCycle, updateProductionCycle } from '@/api/djs-breed/production-config';
import type { ProductionCycleConfigForm } from '@/api/djs-breed/production-config/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): ProductionCycleConfigForm => ({
  id: undefined,
  configKey: '',
  defaultValue: 0,
  customValue: null,
  unit: '天',
  description: undefined,
  remark: undefined
});

const form = ref<ProductionCycleConfigForm>(defaultForm());

const rules = computed(() => ({
  configKey: [{ required: true, message: t('productionConfig.rule.configKey.required'), trigger: 'blur' }],
  defaultValue: [{ required: true, message: t('productionConfig.rule.defaultValue.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('productionConfig.title.editCycle') : t('productionConfig.title.addCycle')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getProductionCycle(id);
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
        await updateProductionCycle(form.value);
      } else {
        await addProductionCycle(form.value);
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
