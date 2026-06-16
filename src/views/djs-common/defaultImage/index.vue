<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <span>{{ t('defaultImage.title') }}</span>
        <span class="hint">{{ t('defaultImage.hint') }}</span>
      </template>
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column :label="t('defaultImage.column.category')" width="220" align="center" header-align="center">
          <template #default="{ row }">
            <span>{{ categoryLabel(row.categoryKey) }}</span>
            <el-tag v-if="row.isGlobal === 1" type="info" size="small" class="ml">{{ t('defaultImage.global') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('defaultImage.column.image')" align="center" header-align="center">
          <template #default="{ row }">
            <DefaultImageCell :row="row" @saved="fetchList" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="DefaultImageConfig" lang="ts">
import { listDefaultImage } from '@/api/djs-common/image';
import type { DefaultImageVO } from '@/api/djs-common/image/types';
import DefaultImageCell from './components/DefaultImageCell.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const rows = ref<DefaultImageVO[]>([]);
const loading = ref(false);

const CATEGORY_LABEL: Record<string, string> = {
  pork: '猪肉',
  vegetable: '蔬菜',
  white_bar: '白条',
  dry_good: '干货',
  egg: '蛋',
  gift_box: '礼盒',
  global: '全局默认'
};

function categoryLabel(key: string): string {
  return CATEGORY_LABEL[key] ?? key;
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await listDefaultImage();
    rows.value = (res.data ?? []) as DefaultImageVO[];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.hint {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.ml {
  margin-left: 8px;
}
</style>
