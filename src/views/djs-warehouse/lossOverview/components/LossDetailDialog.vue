<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="980px" append-to-body destroy-on-close :close-on-click-modal="true">
    <!-- 搜索：产品名称模糊 + 损耗类型下拉 -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('lossOverview.detail.productName')">
        <el-input
          v-model="query.productName"
          :placeholder="t('lossOverview.detail.productNamePlaceholder')"
          clearable
          style="width: 180px"
          @keyup.enter="fetchDetail"
        />
      </el-form-item>
      <el-form-item :label="t('lossOverview.detail.lossType')">
        <el-select v-model="query.lossType" :placeholder="t('lossOverview.detail.lossTypePlaceholder')" clearable style="width: 180px">
          <el-option v-for="d in djs_loss_type" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchDetail">{{ t('lossOverview.detail.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('lossOverview.detail.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border max-height="500">
      <el-table-column :label="t('lossOverview.detail.lossDate')" prop="lossDate" min-width="160" align="center" header-align="center">
        <template #default="{ row }">{{ formatDateTime(row.lossDate) }}</template>
      </el-table-column>
      <el-table-column :label="t('lossOverview.detail.productCode')" prop="productCode" min-width="120" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('lossOverview.detail.productNameCol')" prop="productName" min-width="140" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column :label="t('lossOverview.detail.lossTypeCol')" prop="lossType" min-width="120" align="center" header-align="center">
        <template #default="{ row }"><dict-tag :options="djs_loss_type" :value="row.lossType" /></template>
      </el-table-column>
      <el-table-column :label="t('lossOverview.detail.lossWeight')" prop="lossWeight" min-width="110" align="center" header-align="center">
        <template #default="{ row }">{{ formatWeight(row.lossWeight) }}</template>
      </el-table-column>
      <el-table-column :label="t('lossOverview.detail.productUnit')" prop="productUnit" min-width="80" align="center" header-align="center" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { getLossDetail, type LossOverviewDetailVO } from '@/api/djs-warehouse/lossOverview';
import { parseTime } from '@/utils/ruoyi';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'LossDetailDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_loss_type } = toRefs<Record<string, any>>(proxy?.useDict('djs_loss_type'));

const visible = ref(false);
const loading = ref(false);
const currentDate = ref('');
const list = ref<LossOverviewDetailVO[]>([]);

const query = reactive<{ productName?: string; lossType?: string }>({
  productName: undefined,
  lossType: undefined
});

const dialogTitle = computed(() => `${t('lossOverview.detail.title')}（${currentDate.value}）`);

function open(date: string) {
  currentDate.value = date;
  query.productName = undefined;
  query.lossType = undefined;
  list.value = [];
  visible.value = true;
  fetchDetail();
}

async function fetchDetail() {
  if (!currentDate.value) return;
  loading.value = true;
  try {
    const res = await getLossDetail({
      date: currentDate.value,
      productName: query.productName || undefined,
      lossType: query.lossType || undefined
    });
    list.value = (res.data ?? []) as LossOverviewDetailVO[];
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  query.productName = undefined;
  query.lossType = undefined;
  fetchDetail();
}

function formatDateTime(v?: string): string {
  if (!v) return '';
  return parseTime(v, '{y}-{m}-{d} {h}:{i}:{s}') as string;
}

/** 损耗量格式化：后端 BigDecimal 序列化为 string，统一 Number 强转保三位小数（第4位四舍五入，row33）。 */
function formatWeight(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : n.toFixed(3);
}

defineExpose({ open });
</script>
