<template>
  <div class="p-2">
    <el-card shadow="never">
      <el-form :inline="true" class="mb-2">
        <el-form-item :label="t('warehouseStat.field.dateRange')">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="t('warehouseStat.field.start')" :end-placeholder="t('warehouseStat.field.end')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">{{ t('warehouseStat.search') }}</el-button>
          <el-button icon="Refresh" @click="handleReset">{{ t('warehouseStat.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="pagedList" border>
        <el-table-column :label="k('statDate')" prop="statDate" min-width="110" align="center" fixed="left" />
        <el-table-column :label="k('cropName')" min-width="140" align="center" fixed="left">
          <template #default="{ row }">{{ row.cropName || row.cropCode || '-' }}</template>
        </el-table-column>
        <el-table-column :label="k('image')" width="80" align="center">
          <template #default="{ row }">
            <ImagePreview
              v-if="row.imageOssId && imageUrlMap[String(row.imageOssId)]"
              :width="40"
              :height="40"
              :src="imageUrlMap[String(row.imageOssId)]"
              :preview-src-list="[imageUrlMap[String(row.imageOssId)]]"
            />
            <el-icon v-else class="text-gray-300" :size="26"><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column v-for="c in metricCols" :key="c" :label="k(c)" :prop="c" min-width="120" align="center">
          <template #default="{ row }">{{ num(row[c]) }}</template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" :auto-scroll="false" />
    </el-card>
  </div>
</template>

<script setup name="WarehouseStatCrop" lang="ts">
import ImagePreview from '@/components/ImagePreview/index.vue';
import { listWarehouseCrop, type WarehouseCropVO } from '@/api/djs-warehouse/warehouseStat';
import { listByIds as listOssByIds } from '@/api/system/oss';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const k = (key: string) => t(`warehouseStat.crop.${key}`);
const num = (v: unknown) => (v === null || v === undefined || v === '' ? '-' : v + '');

const metricCols = ['pickWeight', 'feedWeight', 'vegHandleRate', 'receiveWeight', 'sendPlatformWeight', 'transportLossRate', 'outWeight', 'netVegLossRate'];

const list = ref<WarehouseCropVO[]>([]);
const imageUrlMap = ref<Record<string, string>>({});
const loading = ref(false);
const dateRange = ref<string[]>();
const pageNum = ref(1);
const pageSize = ref(10);

const total = computed(() => list.value.length);
const pagedList = computed(() => list.value.slice((pageNum.value - 1) * pageSize.value, pageNum.value * pageSize.value));

async function resolveImages() {
  const ossIds = Array.from(new Set(list.value.map((r) => r.imageOssId).filter((id): id is string => !!id)));
  if (ossIds.length === 0) {
    imageUrlMap.value = {};
    return;
  }
  const res = await listOssByIds(ossIds.join(','));
  const map: Record<string, string> = {};
  (res.data ?? []).forEach((o: any) => {
    if (o?.ossId != null && o?.url) map[String(o.ossId)] = o.url;
  });
  imageUrlMap.value = map;
}

async function fetchList() {
  loading.value = true;
  try {
    const range = dateRange.value ?? [];
    const res = await listWarehouseCrop({ dateFrom: range[0] || undefined, dateTo: range[1] || undefined });
    list.value = (res.data ?? []) as WarehouseCropVO[];
    await resolveImages();
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}
function handleReset() {
  dateRange.value = undefined;
  pageNum.value = 1;
  fetchList();
}

onMounted(fetchList);
</script>
