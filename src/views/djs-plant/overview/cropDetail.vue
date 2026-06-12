<template>
  <div class="p-2">
    <!-- 面包屑：首页/种植管理/种植总览/作物详情 -->
    <el-card shadow="never" class="mb-2">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <el-button link icon="ArrowLeft" @click="goBack">{{ t('plantOverview.detail.back') }}</el-button>
          <span class="text-base font-medium">{{ t('plantOverview.detail.title') }}–{{ cropName || '-' }}</span>
        </div>
        <!-- 右上 icon-only 导出按钮（无文字 label） -->
        <el-tooltip :content="t('plantOverview.detail.export')" placement="top">
          <el-button type="primary" icon="Download" circle :disabled="!cropId" @click="handleExport" />
        </el-tooltip>
      </div>
    </el-card>

    <el-card shadow="never">
      <!-- 14 列只读明细表（按原型列顺序）：无行操作列、无筛选条 -->
      <el-table v-loading="loading" :data="list" row-key="id" border stripe>
        <el-table-column :label="t('plantOverview.detail.col.cropName')" prop="cropName" min-width="110" show-overflow-tooltip />
        <el-table-column :label="t('plantOverview.detail.col.plotName')" prop="plotName" min-width="120" show-overflow-tooltip />
        <el-table-column :label="t('plantOverview.detail.col.harvestStatus')" min-width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.planSeason')" min-width="100" align="center">
          <template #default="{ row }">
            <dict-tag :options="djs_planting_season" :value="row.planSeason" />
          </template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.planPlantDate')" min-width="110" align="center">
          <template #default="{ row }">{{ row.planPlantDate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.plantDate')" min-width="120" align="center">
          <template #default="{ row }">{{ row.plantDate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.plantTeamName')" prop="plantTeamName" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.plantTeamName || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.beginHarvestdate')" min-width="130" align="center">
          <template #default="{ row }">{{ row.beginHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.endHarvestdate')" min-width="130" align="center">
          <template #default="{ row }">{{ row.endHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.earliestHarvestdate')" min-width="130" align="center">
          <template #default="{ row }">{{ row.earliestHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.lastHarvestdate')" min-width="130" align="center">
          <template #default="{ row }">{{ row.lastHarvestdate || '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.plotArea')" min-width="110" align="right">
          <template #default="{ row }">{{ row.plotArea ?? '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.expectedYield')" min-width="120" align="right">
          <template #default="{ row }">{{ row.expectedYield ?? '-' }}</template>
        </el-table-column>
        <el-table-column :label="t('plantOverview.detail.col.actualYield')" min-width="120" align="right">
          <template #default="{ row }">{{ row.actualYield ?? '-' }}</template>
        </el-table-column>
      </el-table>

      <!-- 底部分页器（共 N 条 / 每页 / 页码 / 前往 N 页） -->
      <el-pagination
        v-show="total > 0"
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        class="mt-3 justify-end"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadList"
        @current-change="loadList"
      />
    </el-card>
  </div>
</template>

<script setup name="PlantOverviewCropDetail" lang="ts">
import { listCropDetail } from '@/api/djs-plant/overview';
import type { CropDetailVO } from '@/api/djs-plant/overview/types';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const { djs_pick_status, djs_planting_season } = toRefs<any>(proxy?.useDict('djs_pick_status', 'djs_planting_season'));

/** 下钻携带的作物 id（snowflake，按 string 透传，不转 Number 防丢精度）。 */
const cropId = ref<string>((route.query.cropId as string) || '');
const cropName = ref<string>((route.query.cropName as string) || '');

const list = ref<CropDetailVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);

async function loadList() {
  if (!cropId.value) return;
  loading.value = true;
  try {
    const res = await listCropDetail(cropId.value, { pageNum: pageNum.value, pageSize: pageSize.value } as PageQuery);
    list.value = (res.rows as CropDetailVO[]) || [];
    total.value = res.total || 0;
    // 列表行回填作物名（路由未携带时取首行）
    if (!cropName.value && list.value.length > 0) cropName.value = list.value[0].cropName || '';
  } finally {
    loading.value = false;
  }
}

function handleExport() {
  if (!cropId.value) return;
  proxy?.download('djs/plant/overview/cropDetail/export', { cropId: cropId.value }, `plant_crop_detail_${new Date().getTime()}.xlsx`);
}

function goBack() {
  router.back();
}

onMounted(loadList);
</script>
