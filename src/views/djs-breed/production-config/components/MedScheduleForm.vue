<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.medType')" prop="medType">
            <el-select v-model="form.medType" :placeholder="t('productionConfig.placeholder.medType')" filterable>
              <el-option v-for="item in djs_med_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.eventTrigger')" prop="eventTrigger">
            <el-select v-model="form.eventTrigger" :placeholder="t('productionConfig.placeholder.eventTrigger')" filterable>
              <el-option v-for="item in djs_med_event_trigger" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('productionConfig.field.daysOffset')" prop="daysOffset">
            <el-input-number
              v-model="form.daysOffset"
              :step="1"
              :placeholder="t('productionConfig.placeholder.daysOffset')"
              class="w-full"
              controls-position="right"
            />
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
      <div class="text-xs text-gray-400 px-2">{{ t('productionConfig.tip.noAutoTrigger') }}</div>
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
import { addMedSchedule, getMedSchedule, updateMedSchedule } from '@/api/djs-breed/production-config';
import type { MedScheduleConfigForm } from '@/api/djs-breed/production-config/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_med_type, djs_med_event_trigger } = toRefs<any>(proxy?.useDict('djs_med_type', 'djs_med_event_trigger'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): MedScheduleConfigForm => ({
  id: undefined,
  medType: '',
  eventTrigger: '',
  daysOffset: 0,
  description: undefined,
  remark: undefined
});

const form = ref<MedScheduleConfigForm>(defaultForm());

const rules = computed(() => ({
  medType: [{ required: true, message: t('productionConfig.rule.medType.required'), trigger: 'change' }],
  eventTrigger: [{ required: true, message: t('productionConfig.rule.eventTrigger.required'), trigger: 'change' }],
  daysOffset: [{ required: true, message: t('productionConfig.rule.daysOffset.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('productionConfig.title.editMed') : t('productionConfig.title.addMed')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getMedSchedule(id);
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
        await updateMedSchedule(form.value);
      } else {
        await addMedSchedule(form.value);
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
