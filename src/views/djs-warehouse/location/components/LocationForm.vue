<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="780px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('location.field.locationCode')" prop="locationCode">
            <el-input v-model="form.locationCode" :placeholder="t('location.placeholder.locationCode')" :disabled="!!form.id" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('location.field.locationName')" prop="locationName">
            <el-input v-model="form.locationName" :placeholder="t('location.placeholder.locationName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('location.field.locationType')" prop="locationType">
            <el-select v-model="form.locationType" :placeholder="t('location.placeholder.locationType')" clearable>
              <el-option v-for="dict in djs_location_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('location.field.locationStatus')" prop="locationStatus">
            <el-radio-group v-model="form.locationStatus">
              <el-radio v-for="dict in djs_location_status" :key="dict.value" :value="Number(dict.value)">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('location.field.capacity')" prop="capacity">
            <el-input-number
              v-model="form.capacity"
              :min="0"
              :precision="2"
              :step="100"
              :placeholder="t('location.placeholder.capacity')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('location.field.locationThumb')" prop="locationThumb">
            <el-input v-model="form.locationThumb" :placeholder="t('location.placeholder.locationThumb')" maxlength="512" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('location.field.locationImg')" prop="locationImg">
            <el-input v-model="form.locationImg" type="textarea" :rows="2" :placeholder="t('location.placeholder.locationImg')" maxlength="2048" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('location.field.remark')" prop="remark">
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
import { addLocation, getLocation, updateLocation } from '@/api/djs-warehouse/location';
import type { LocationInfoForm } from '@/api/djs-warehouse/location/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_location_type, djs_location_status } = toRefs<any>(proxy?.useDict('djs_location_type', 'djs_location_status'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): LocationInfoForm => ({
  id: undefined,
  locationCode: '',
  locationName: '',
  locationType: '',
  locationThumb: undefined,
  locationImg: undefined,
  locationStatus: 1,
  capacity: undefined,
  remark: undefined
});

const form = ref<LocationInfoForm>(defaultForm());

const rules = computed(() => ({
  locationCode: [{ required: true, message: t('location.rule.locationCode.required'), trigger: 'blur' }],
  locationName: [{ required: true, message: t('location.rule.locationName.required'), trigger: 'blur' }],
  locationType: [{ required: true, message: t('location.rule.locationType.required'), trigger: 'change' }],
  locationStatus: [{ required: true, message: t('location.rule.locationStatus.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('location.title.edit') : t('location.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getLocation(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    capacity: data.capacity != null ? Number(data.capacity) : undefined
  };
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
        await updateLocation(form.value);
      } else {
        await addLocation(form.value);
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
