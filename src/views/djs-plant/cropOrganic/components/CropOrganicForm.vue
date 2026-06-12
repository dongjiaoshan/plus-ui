<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="800px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('plantCropOrganic.field.cropCertNo')" prop="cropCertNo">
            <el-input v-model="form.cropCertNo" :placeholder="t('plantCropOrganic.placeholder.cropCertNo')" :disabled="!!form.id" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantCropOrganic.field.cropCertCompany')" prop="cropCertCompany">
            <el-input v-model="form.cropCertCompany" :placeholder="t('plantCropOrganic.placeholder.cropCertCompany')" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantCropOrganic.field.cropCertValid')" prop="cropCertValid">
            <el-date-picker
              v-model="form.cropCertValid"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t('plantCropOrganic.placeholder.cropCertValid')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('plantCropOrganic.field.cropImagePreview')" prop="cropImagePreview">
            <OssUpload ref="ossThumbRef" v-model="thumbOssIdsModel" biz-type="plant_organic" :limit="1" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantCropOrganic.field.cropImageUrl')" prop="cropImageUrl">
            <OssUpload ref="ossImgRef" v-model="imgOssIdsModel" biz-type="plant_organic" :limit="9" :file-size="10" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('plantCropOrganic.field.relatedCrops')" prop="cropIds">
            <el-transfer
              v-model="form.cropIds"
              :data="cropTransferData"
              :titles="[t('plantCropOrganic.relate.unselected'), t('plantCropOrganic.relate.selected')]"
              filterable
              :filter-placeholder="t('plantCropOrganic.relate.search')"
              style="width: 100%"
            />
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
import { addCropOrganic, getCropOrganic, updateCropOrganic } from '@/api/djs-plant/cropOrganic';
import { listCrop } from '@/api/djs-plant/crop';
import OssUpload from '@/components/OssUpload/index.vue';
import { listByIds as listOssByIds } from '@/api/system/oss';
import type { CropOrganicForm } from '@/api/djs-plant/cropOrganic/types';
import type { CropInfoVO } from '@/api/djs-plant/crop/types';
import { useI18n } from 'vue-i18n';
import { useOssBridge } from '@/composables/useOssBridge';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const ossThumbRef = ref<InstanceType<typeof OssUpload>>();
const ossImgRef = ref<InstanceType<typeof OssUpload>>();

const allCrops = ref<CropInfoVO[]>([]);

const cropTransferData = computed(() =>
  allCrops.value.map((c) => ({
    key: String(c.id),
    label: `${c.cropCode}  ${c.cropName}`,
    disabled: false
  }))
);

const defaultForm = (): CropOrganicForm & { cropIds: string[] } => ({
  id: undefined,
  cropCertNo: '',
  cropCertCompany: '',
  cropCertValid: '',
  cropIds: [],
  cropImagePreview: undefined,
  cropImageUrl: undefined
});

const form = ref<CropOrganicForm & { cropIds: string[] }>(defaultForm());

// OssUpload v-model string[]（雪花 ossId 全链路 string）；业务字段是单/多 ossId 字符串（useOssBridge 桥接）
const thumbOssIdsModel = useOssBridge(form, 'cropImagePreview', 'single');
const imgOssIdsModel = useOssBridge(form, 'cropImageUrl', 'multi');

const rules = computed(() => ({
  cropCertNo: [{ required: true, message: t('plantCropOrganic.rule.cropCertNo.required'), trigger: 'blur' }],
  cropCertCompany: [{ required: true, message: t('plantCropOrganic.rule.cropCertCompany.required'), trigger: 'blur' }],
  cropCertValid: [{ required: true, message: t('plantCropOrganic.rule.cropCertValid.required'), trigger: 'change' }]
}));

const dialogTitle = computed(() => (form.value.id ? t('plantCropOrganic.title.edit') : t('plantCropOrganic.title.add')));

const emit = defineEmits<{ (e: 'success'): void }>();

async function ensureCropList() {
  if (allCrops.value.length > 0) return;
  try {
    const res = await listCrop({ pageNum: 1, pageSize: 1000 } as any);
    allCrops.value = (res.rows ?? res.data ?? []) as CropInfoVO[];
  } catch (e) {
    console.warn('[CropOrganicForm] listCrop failed', e);
  }
}

const openCreate = async () => {
  await ensureCropList();
  form.value = defaultForm();
  visible.value = true;
};

const openEdit = async (id: number | string) => {
  await ensureCropList();
  const res = await getCropOrganic(id);
  const data = res.data;
  form.value = {
    ...defaultForm(),
    ...data,
    // el-transfer key 必须 string；后端 relatedCrops 是 [{cropId, cropName}]
    cropIds: (data.relatedCrops ?? []).map((c) => String(c.cropId))
  };
  visible.value = true;

  await nextTick();
  if (form.value.cropImagePreview) {
    try {
      const ossRes = await listOssByIds(form.value.cropImagePreview);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossThumbRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[CropOrganicForm] thumb listOssByIds failed', e);
    }
  }
  if (form.value.cropImageUrl) {
    try {
      const ossRes = await listOssByIds(form.value.cropImageUrl);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      ossImgRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[CropOrganicForm] img listOssByIds failed', e);
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
        await updateCropOrganic(form.value);
      } else {
        await addCropOrganic(form.value);
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
