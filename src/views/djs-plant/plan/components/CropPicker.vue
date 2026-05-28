<template>
  <div>
    <div class="mb-3 flex items-center gap-2">
      <el-input v-model="keyword" :placeholder="t('plantPlan.wizard.cropSearch')" clearable class="max-w-xs" />
    </div>

    <div v-loading="loading" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <el-card
        v-for="c in filteredCrops"
        :key="c.id"
        :class="['cursor-pointer transition', selectedId === String(c.id) ? 'border-primary shadow' : '']"
        shadow="hover"
        body-style="padding:12px"
        @click="select(c)"
      >
        <div class="flex items-center gap-3">
          <el-image v-if="c.cropImagePreview" :src="String(c.cropImagePreview)" fit="cover" class="h-14 w-14 rounded" />
          <div v-else class="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
            {{ c.cropName?.slice(0, 1) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">{{ c.cropName }}</div>
            <div class="truncate text-xs text-gray-400">{{ c.varietyName || '-' }}</div>
            <div class="truncate text-xs text-gray-400">
              {{ c.minCycle && c.maxCycle ? `${c.minCycle}-${c.maxCycle} 天` : '' }}
            </div>
          </div>
          <el-icon v-if="selectedId === String(c.id)" class="text-primary"><Check /></el-icon>
        </div>
      </el-card>
    </div>
    <div v-if="!loading && !filteredCrops.length" class="py-10 text-center text-gray-400">
      {{ t('plantPlan.wizard.cropEmpty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check } from '@element-plus/icons-vue';
import { listCrop } from '@/api/djs-plant/crop';
import type { CropInfoVO } from '@/api/djs-plant/crop/types';

const props = defineProps<{ modelValue?: string | number }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: string | number): void }>();

const { t } = useI18n();
const loading = ref(false);
const crops = ref<CropInfoVO[]>([]);
const keyword = ref('');

const selectedId = computed(() => (props.modelValue == null ? '' : String(props.modelValue)));

const filteredCrops = computed(() => {
  if (!keyword.value) return crops.value;
  const kw = keyword.value.trim().toLowerCase();
  return crops.value.filter(
    (c) =>
      (c.cropName && c.cropName.toLowerCase().includes(kw)) ||
      (c.cropCode && c.cropCode.toLowerCase().includes(kw)) ||
      (c.varietyName && c.varietyName.toLowerCase().includes(kw))
  );
});

onMounted(async () => {
  loading.value = true;
  try {
    const res = await listCrop({ pageNum: 1, pageSize: 200 });
    crops.value = (res.rows as CropInfoVO[]) || [];
  } finally {
    loading.value = false;
  }
});

function select(c: CropInfoVO) {
  emit('update:modelValue', String(c.id));
}
</script>
