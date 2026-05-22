<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('farm.field.barnCode')" prop="barnCode">
            <el-input v-model="form.barnCode" :placeholder="t('farm.placeholder.barnCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.barnName')" prop="barnName">
            <el-input v-model="form.barnName" :placeholder="t('farm.placeholder.barnName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.barnType')" prop="barnType">
            <el-select v-model="form.barnType" :placeholder="t('farm.placeholder.barnType')" style="width: 100%">
              <el-option v-for="dict in barnTypeDict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.capacity')" prop="capacity">
            <el-input-number v-model="form.capacity" :min="0" :step="10" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.barnStatus')" prop="barnStatus">
            <el-switch v-model="form.barnStatus" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('farm.field.remark')" prop="remark">
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
import { addBarn, getBarn, updateBarn } from '@/api/djs-breed/farm';
import type { BarnForm as BarnFormType } from '@/api/djs-breed/farm/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const dicts = useDict('djs_barn_type');
const barnTypeDict = computed(() => dicts['djs_barn_type'] ?? []);

const defaultForm = (): BarnFormType => ({
  id: undefined,
  barnCode: '',
  barnName: '',
  barnType: '',
  capacity: undefined,
  barnStatus: 1,
  remark: undefined
});

const form = ref<BarnFormType>(defaultForm());

const rules = computed(() => ({
  barnCode: [
    { required: true, message: t('farm.rule.barnCode.required'), trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_.-]+$/, message: t('farm.rule.barnCode.pattern'), trigger: 'blur' }
  ],
  barnName: [{ required: true, message: t('farm.rule.barnName.required'), trigger: 'blur' }],
  barnType: [{ required: true, message: t('farm.rule.barnType.required'), trigger: 'change' }],
  barnStatus: [{ required: true, message: t('farm.rule.barnStatus.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('farm.title.editBarn') : t('farm.title.addBarn')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getBarn(id);
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
        await updateBarn(form.value);
      } else {
        await addBarn(form.value);
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
