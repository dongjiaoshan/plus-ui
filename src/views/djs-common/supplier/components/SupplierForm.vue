<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="820px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.supplierName')" prop="supplierName">
            <el-input v-model="form.supplierName" :placeholder="t('supplier.placeholder.supplierName')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.supplierType')" prop="supplierType">
            <el-select v-model="form.supplierType" :placeholder="t('supplier.placeholder.supplierType')" clearable>
              <el-option v-for="dict in djs_supplier_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.licenseNo')" prop="licenseNo">
            <el-input v-model="form.licenseNo" :placeholder="t('supplier.placeholder.licenseNo')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.businessLicenseNo')" prop="businessLicenseNo">
            <el-input v-model="form.businessLicenseNo" :placeholder="t('supplier.placeholder.businessLicenseNo')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.cooperationStartDate')" prop="cooperationStartDate">
            <el-date-picker
              v-model="form.cooperationStartDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('supplier.placeholder.cooperationStartDate')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.businessStatus')" prop="businessStatus">
            <el-select v-model="form.businessStatus" :placeholder="t('supplier.placeholder.businessStatus')">
              <el-option v-for="dict in djs_supplier_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.liaisonName')" prop="liaisonName">
            <el-input v-model="form.liaisonName" :placeholder="t('supplier.placeholder.liaisonName')" maxlength="32" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.liaisonPhone')" prop="liaisonPhone">
            <el-input v-model="form.liaisonPhone" :placeholder="t('supplier.placeholder.liaisonPhone')" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('supplier.field.address')" prop="address">
            <el-input v-model="form.address" :placeholder="t('supplier.placeholder.address')" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.settleType')" prop="settleType">
            <el-select v-model="form.settleType" :placeholder="t('supplier.placeholder.settleType')" clearable>
              <el-option v-for="dict in djs_settle_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.bankName')" prop="bankName">
            <el-input v-model="form.bankName" :placeholder="t('supplier.placeholder.bankName')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('supplier.field.bankAccount')" prop="bankAccount">
            <el-input v-model="form.bankAccount" :placeholder="t('supplier.placeholder.bankAccount')" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('supplier.field.licenseImage')" prop="licenseImageOssId">
            <OssUpload ref="ossUploadRef" v-model="licenseImageIdsModel" biz-type="supplier_license" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('supplier.field.remark')" prop="remark">
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
import { addSupplier, getSupplier, updateSupplier } from '@/api/djs-common/supplier';
import type { SupplierForm } from '@/api/djs-common/supplier/types';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_supplier_type, djs_supplier_status, djs_settle_type } = toRefs<any>(
  proxy?.useDict('djs_supplier_type', 'djs_supplier_status', 'djs_settle_type')
);

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const ossUploadRef = ref<InstanceType<typeof OssUpload>>();

const defaultForm = (): SupplierForm => ({
  id: undefined,
  supplierName: '',
  licenseNo: undefined,
  licenseImageOssId: null,
  businessLicenseNo: undefined,
  cooperationStartDate: undefined,
  supplierType: '',
  liaisonName: undefined,
  liaisonPhone: undefined,
  address: undefined,
  businessStatus: '0',
  settleType: 'cash',
  bankAccount: undefined,
  bankName: undefined,
  remark: undefined
});

const form = ref<SupplierForm>(defaultForm());

// OssUpload v-model 期望 number[]，业务字段是单值 licenseImageOssId
const licenseImageIdsModel = computed<number[]>({
  get: () => (form.value.licenseImageOssId ? [form.value.licenseImageOssId as number] : []),
  set: (val: number[]) => {
    form.value.licenseImageOssId = val && val.length > 0 ? val[0] : null;
  }
});

const rules = computed(() => ({
  supplierName: [{ required: true, message: t('supplier.rule.supplierName.required'), trigger: 'blur' }],
  supplierType: [{ required: true, message: t('supplier.rule.supplierType.required'), trigger: 'change' }],
  businessStatus: [{ required: true, message: t('supplier.rule.businessStatus.required'), trigger: 'change' }],
  liaisonPhone: [
    {
      pattern: /^$|^[0-9+\-\s]{6,20}$/,
      message: t('supplier.rule.liaisonPhone.pattern'),
      trigger: 'blur'
    }
  ]
}));

const dialogTitle = computed(() => (form.value.id ? t('supplier.title.edit') : t('supplier.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = () => {
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  const res = await getSupplier(id);
  form.value = {
    ...defaultForm(),
    ...res.data
  };
  visible.value = true;
  // 回填 OssUpload 已有图片（OssUpload 内部 watch 不主动反查 URL，必须父组件调 setExistingFiles）
  const ossId = form.value.licenseImageOssId;
  if (ossId) {
    try {
      const ossRes = await listOssByIds(ossId as number);
      const items = (ossRes.data || []).map((o) => ({
        ossId: Number(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      await nextTick();
      ossUploadRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[SupplierForm] listOssByIds failed for licenseImageOssId', ossId, e);
    }
  }
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
        await updateSupplier(form.value);
      } else {
        await addSupplier(form.value);
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
