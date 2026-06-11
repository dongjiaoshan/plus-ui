<template>
  <div class="cell">
    <OssUpload ref="ossUploadRef" v-model="idsModel" biz-type="md_image_library" :limit="1" :file-size="10" />
    <el-button v-hasPermi="['djs:common:defaultImage:edit']" type="primary" plain size="small" :loading="saving" @click="handleSave">
      {{ t('common.save') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import OssUpload from '@/components/OssUpload/index.vue';
import { updateDefaultImage } from '@/api/djs-common/image';
import type { DefaultImageVO } from '@/api/djs-common/image/types';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ row: DefaultImageVO }>();
const emit = defineEmits<{ (e: 'saved'): void }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ossUploadRef = ref<InstanceType<typeof OssUpload>>();
const ossId = ref<string | null>(props.row.ossId ?? null);
const saving = ref(false);

const idsModel = computed<string[]>({
  get: () => (ossId.value ? [ossId.value] : []),
  set: (val: string[]) => {
    ossId.value = val && val.length > 0 ? val[0] : null;
  }
});

async function backfill() {
  if (props.row.ossId) {
    try {
      const ossRes = await listOssByIds(props.row.ossId);
      const items = (ossRes.data || []).map((o) => ({
        ossId: String(o.ossId),
        url: o.url,
        originalName: o.originalName
      }));
      await nextTick();
      ossUploadRef.value?.setExistingFiles(items);
    } catch (e) {
      console.warn('[DefaultImageCell] listOssByIds failed for', props.row.categoryKey, e);
    }
  }
}

async function handleSave() {
  saving.value = true;
  try {
    await updateDefaultImage({ id: props.row.id, ossId: ossId.value });
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    emit('saved');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  backfill();
});
</script>

<style scoped>
.cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
</style>
