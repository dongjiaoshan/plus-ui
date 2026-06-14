<template>
  <!-- 作物详情抽屉（替代旧整页路由页 /djs-plant/overview/crop-detail）：只读明细 + 导出 + 分页 -->
  <el-drawer v-model="visible" :title="drawerTitle" size="80%" :destroy-on-close="true" @open="onOpen">
    <!-- 右上 icon-only 导出按钮（无文字 label） -->
    <template #header="{ titleId, titleClass }">
      <div class="flex items-center justify-between w-full pr-4">
        <span :id="titleId" :class="titleClass">{{ drawerTitle }}</span>
        <el-tooltip :content="t('plantOverview.detail.export')" placement="top">
          <el-button type="primary" icon="Download" circle :disabled="!props.cropId" @click="handleExport" />
        </el-tooltip>
      </div>
    </template>

    <!-- 只读明细表（按原型列顺序）：无行操作列、无筛选条 -->
    <el-table v-loading="loading" :data="list" row-key="id" border stripe>
      <el-table-column :label="t('plantOverview.detail.col.cropName')" prop="cropName" min-width="110" show-overflow-tooltip />
      <el-table-column :label="t('plantOverview.detail.col.plotCode')" prop="plotCode" min-width="100" show-overflow-tooltip />
      <el-table-column :label="t('plantOverview.detail.col.plotName')" prop="plotName" min-width="120" show-overflow-tooltip />
      <el-table-column :label="t('plantOverview.detail.col.harvestStatus')" min-width="100" align="center">
        <template #default="{ row }">
          <dict-tag :options="djs_pick_status" :value="row.harvestStatus" />
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
        <template #default="{ row }">{{ row.expectedYield == null ? '-' : Number(row.expectedYield).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column :label="t('plantOverview.detail.col.actualYield')" min-width="120" align="right">
        <template #default="{ row }">{{ row.actualYield == null ? '-' : Number(row.actualYield).toFixed(2) }}</template>
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
  </el-drawer>
</template>

<script setup name="CropDetailDrawer" lang="ts">
import { listCropDetail } from '@/api/djs-plant/overview';
import type { CropDetailVO } from '@/api/djs-plant/overview/types';
import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { djs_pick_status } = toRefs<any>(proxy?.useDict('djs_pick_status'));

/** 抽屉开关（父用 v-model 控制）。 */
const visible = defineModel<boolean>({ required: true });

/** 父传入的下钻作物 id（snowflake，按 string 透传，不转 Number 防丢精度）+ 作物名（标题回填）。 */
const props = defineProps<{ cropId?: string; cropName?: string }>();

/** 作物名本地副本（首行可回填，故不直接用 props）。 */
const localCropName = ref<string>('');

const list = ref<CropDetailVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);

const drawerTitle = computed(() => `${t('plantOverview.detail.title')}–${localCropName.value || '-'}`);

/** 抽屉打开时重置分页 + 回填作物名 + 拉首页。 */
function onOpen() {
  localCropName.value = props.cropName || '';
  pageNum.value = 1;
  loadList();
}

async function loadList() {
  if (!props.cropId) return;
  loading.value = true;
  try {
    const res = await listCropDetail(props.cropId, { pageNum: pageNum.value, pageSize: pageSize.value } as PageQuery);
    list.value = (res.rows as CropDetailVO[]) || [];
    total.value = res.total || 0;
    // 标题回填作物名（未携带时取首行）
    if (!localCropName.value && list.value.length > 0) localCropName.value = list.value[0].cropName || '';
  } finally {
    loading.value = false;
  }
}

function handleExport() {
  if (!props.cropId) return;
  proxy?.download('djs/plant/overview/cropDetail/export', { cropId: props.cropId }, `plant_crop_detail_${new Date().getTime()}.xlsx`);
}
</script>
