<template>
  <el-dialog v-model="visible" :title="t('plantCropOrganic.relate.title')" destroy-on-close append-to-body width="700px" @closed="handleClosed">
    <div v-if="certNo" class="relate-cert-no">{{ t('plantCropOrganic.field.cropCertNo') }}：{{ certNo }}</div>
    <el-transfer
      v-model="selectedCropIds"
      :data="cropTransferData"
      :titles="[t('plantCropOrganic.relate.unselected'), t('plantCropOrganic.relate.selected')]"
      filterable
      :filter-placeholder="t('plantCropOrganic.relate.search')"
      style="width: 100%"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getCropOrganic, updateCropOrganic } from '@/api/djs-plant/cropOrganic';
import { listCrop } from '@/api/djs-plant/crop';
import type { CropOrganicForm } from '@/api/djs-plant/cropOrganic/types';
import type { CropInfoVO } from '@/api/djs-plant/crop/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const certId = ref<number | string>();
const certNo = ref<string>('');
const certForm = ref<CropOrganicForm>();

const allCrops = ref<CropInfoVO[]>([]);
const selectedCropIds = ref<string[]>([]);

const cropTransferData = computed(() =>
  allCrops.value.map((c) => ({
    key: String(c.id),
    label: `${c.cropCode}  ${c.cropName}`,
    disabled: false
  }))
);

const emit = defineEmits<{ (e: 'success'): void }>();

async function ensureCropList() {
  if (allCrops.value.length > 0) return;
  try {
    const res = await listCrop({ pageNum: 1, pageSize: 1000 } as any);
    allCrops.value = (res.rows ?? res.data ?? []) as CropInfoVO[];
  } catch (e) {
    console.warn('[CropOrganicRelateDialog] listCrop failed', e);
  }
}

const open = async (id: number | string) => {
  await ensureCropList();
  const res = await getCropOrganic(id);
  const data = res.data;
  certId.value = id;
  certNo.value = data.cropCertNo;
  certForm.value = {
    id: data.id,
    cropCertNo: data.cropCertNo,
    cropCertCompany: data.cropCertCompany,
    cropCertValid: data.cropCertValid,
    cropImagePreview: data.cropImagePreview,
    cropImageUrl: data.cropImageUrl
  };
  selectedCropIds.value = (data.relatedCrops ?? []).map((c) => String(c.cropId));
  visible.value = true;
};

defineExpose({ open });

const handleClosed = () => {
  selectedCropIds.value = [];
  certId.value = undefined;
  certNo.value = '';
  certForm.value = undefined;
};

const submit = async () => {
  if (!certForm.value) return;
  submitting.value = true;
  try {
    await updateCropOrganic({
      ...certForm.value,
      cropIds: selectedCropIds.value
    });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.relate-cert-no {
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}
</style>
