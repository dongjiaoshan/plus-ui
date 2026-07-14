<template>
  <div>
    <div class="mb-3 flex items-center gap-2">
      <el-input v-model="keyword" :placeholder="t('plantPlan.wizard.cropSearch')" clearable class="max-w-xs" />
    </div>

    <div v-loading="loading" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      <el-card
        v-for="c in filteredCrops"
        :key="c.id"
        :class="[
          'cursor-pointer border-2 border-transparent transition-all duration-200',
          selectedId === String(c.id) ? '!border-primary shadow' : ''
        ]"
        shadow="hover"
        body-style="padding:12px"
        @click="select(c)"
      >
        <div class="flex items-center gap-3">
          <el-image v-if="c.imageUrl" :src="c.imageUrl" fit="cover" class="h-14 w-14 rounded">
            <template #error>
              <div class="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
                {{ c.cropName?.slice(0, 1) }}
              </div>
            </template>
          </el-image>
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

const props = defineProps<{ modelValue?: string | number; planSeason?: string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void;
  (e: 'select-crop', crop: CropInfoVO): void;
}>();

const { t } = useI18n();
const loading = ref(false);
const crops = ref<CropInfoVO[]>([]);
const keyword = ref('');

const selectedId = computed(() => (props.modelValue == null ? '' : String(props.modelValue)));

// 计划季节 → 作物 plantingSeason 命中：作物季节字段历史混存多种写法
// （字典值 spring / 中文短名 春 / 字典 label 春季），逐 token 包含匹配兼容
const SEASON_TOKENS: Record<string, string[]> = {
  spring: ['spring', '春季', '春'],
  summer: ['summer', '夏季', '夏'],
  autumn: ['autumn', '秋季', '秋'],
  winter: ['winter', '冬季', '冬']
};

function matchSeason(c: CropInfoVO): boolean {
  if (!props.planSeason) return true;
  const tokens = SEASON_TOKENS[props.planSeason] ?? [props.planSeason];
  const ps = c.plantingSeason || '';
  return tokens.some((tk) => ps.includes(tk));
}

const filteredCrops = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return crops.value.filter((c) => {
    if (!matchSeason(c)) return false;
    if (!kw) return true;
    return (
      (c.cropName && c.cropName.toLowerCase().includes(kw)) ||
      (c.cropCode && c.cropCode.toLowerCase().includes(kw)) ||
      (c.varietyName && c.varietyName.toLowerCase().includes(kw))
    );
  });
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
  emit('select-crop', c);
}
</script>
