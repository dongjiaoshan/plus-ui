<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="640px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item :label="t('farm.field.barn')" prop="barnId">
            <el-input :model-value="barnLabel" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.penCode')" prop="penCode">
            <el-input v-model="form.penCode" :placeholder="t('farm.placeholder.penCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.penName')" prop="penName">
            <el-input v-model="form.penName" :placeholder="t('farm.placeholder.penName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.penType')" prop="penType">
            <el-select v-model="form.penType" :placeholder="t('farm.placeholder.penType')" style="width: 100%">
              <el-option v-for="dict in penTypeDict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.capacity')" prop="capacity">
            <el-input-number v-model="form.capacity" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('farm.field.penStatus')" prop="penStatus">
            <el-switch v-model="form.penStatus" :active-value="1" :inactive-value="0" />
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
import { addPen, getPen, updatePen } from '@/api/djs-breed/farm';
import type { PenForm as PenFormType } from '@/api/djs-breed/farm/types';
import { useDict } from '@/utils/dict';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const barnLabel = ref('');

const dicts = useDict('djs_pen_type');
const penTypeDict = computed(() => dicts['djs_pen_type'] ?? []);

const defaultForm = (barnId: number | string = 0): PenFormType => ({
  id: undefined,
  barnId,
  penCode: '',
  penName: '',
  penType: '',
  capacity: undefined,
  penStatus: 1,
  remark: undefined
});

const form = ref<PenFormType>(defaultForm());

const rules = computed(() => ({
  penCode: [
    { required: true, message: t('farm.rule.penCode.required'), trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_.-]+$/, message: t('farm.rule.penCode.pattern'), trigger: 'blur' }
  ],
  penName: [{ required: true, message: t('farm.rule.penName.required'), trigger: 'blur' }],
  penType: [{ required: true, message: t('farm.rule.penType.required'), trigger: 'change' }],
  penStatus: [{ required: true, message: t('farm.rule.penStatus.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('farm.title.editPen') : t('farm.title.addPen')));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 新建：必须由外部传入栋舍 id + 显示名（前端不让用户改 barnId，避免误选） */
const openCreate = (barnId: number | string, barnName: string) => {
  form.value = defaultForm(barnId);
  barnLabel.value = barnName;
  visible.value = true;
};

const openEdit = async (id: number | string, barnName: string) => {
  const res = await getPen(id);
  form.value = { ...defaultForm(res.data.barnId), ...res.data };
  barnLabel.value = barnName;
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
        await updatePen(form.value);
      } else {
        await addPen(form.value);
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
