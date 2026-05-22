<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="780px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('store.field.storeName')" prop="storeName">
            <el-input v-model="form.storeName" :placeholder="t('store.placeholder.storeName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.shortName')" prop="shortName">
            <el-input v-model="form.shortName" :placeholder="t('store.placeholder.shortName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.storeType')" prop="storeType">
            <el-select v-model="form.storeType" :placeholder="t('store.placeholder.storeType')" clearable>
              <el-option v-for="dict in djs_store_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.businessStatus')" prop="businessStatus">
            <el-select v-model="form.businessStatus" :placeholder="t('store.placeholder.businessStatus')">
              <el-option v-for="dict in djs_store_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.openDate')" prop="openDate">
            <el-date-picker
              v-model="form.openDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('store.placeholder.openDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.posSystemId')" prop="posSystemId">
            <el-input v-model="form.posSystemId" :placeholder="t('store.placeholder.posSystemId')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.managerName')" prop="managerName">
            <el-input v-model="form.managerName" :placeholder="t('store.placeholder.managerName')" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('store.field.managerPhone')" prop="managerPhone">
            <el-input v-model="form.managerPhone" :placeholder="t('store.placeholder.managerPhone')" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('store.field.address')" prop="address">
            <el-input v-model="form.address" :placeholder="t('store.placeholder.address')" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('store.field.image')" prop="imageOssId">
            <OssUpload v-model="imageOssIdsModel" biz-type="store_photo" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('store.field.remark')" prop="remark">
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
import { addStore, getStore, updateStore } from '@/api/djs-common/store';
import type { StoreForm } from '@/api/djs-common/store/types';
import OssUpload from '@/components/OssUpload/index.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_store_type, djs_store_status } = toRefs<any>(proxy?.useDict('djs_store_type', 'djs_store_status'));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const defaultForm = (): StoreForm => ({
  id: undefined,
  storeName: '',
  shortName: undefined,
  openDate: undefined,
  storeType: 'direct',
  businessStatus: '0',
  address: undefined,
  managerName: undefined,
  managerPhone: undefined,
  posSystemId: undefined,
  imageOssId: null,
  remark: undefined
});

const form = ref<StoreForm>(defaultForm());

// OssUpload v-model 期望 number[]，业务字段是单值 imageOssId。做桥接：
const imageOssIdsModel = computed<number[]>({
  get: () => (form.value.imageOssId ? [form.value.imageOssId as number] : []),
  set: (val: number[]) => {
    form.value.imageOssId = val && val.length > 0 ? val[0] : null;
  }
});

const rules = computed(() => ({
  storeName: [{ required: true, message: t('store.rule.storeName.required'), trigger: 'blur' }],
  businessStatus: [{ required: true, message: t('store.rule.businessStatus.required'), trigger: 'change' }],
  managerPhone: [{ pattern: /^$|^1[3-9]\d{9}$/, message: t('store.rule.managerPhone.pattern'), trigger: 'blur' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('store.title.edit') : t('store.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getStore(id);
  form.value = {
    ...defaultForm(),
    ...res.data
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
        await updateStore(form.value);
      } else {
        await addStore(form.value);
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
