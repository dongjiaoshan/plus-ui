<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" append-to-body destroy-on-close :close-on-click-modal="true">
    <!-- 搜索：产品名称模糊（支持输入） + 库位下拉 + 导出 -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('stockOverview.detail.productName')">
        <el-input
          v-model="query.productName"
          :placeholder="t('stockOverview.detail.productNamePlaceholder')"
          clearable
          style="width: 180px"
          @keyup.enter="fetchDetail"
        />
      </el-form-item>
      <el-form-item :label="t('stockOverview.detail.location')">
        <el-select v-model="query.locationId" :placeholder="t('stockOverview.detail.locationPlaceholder')" clearable filterable style="width: 180px">
          <el-option v-for="o in locationOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchDetail">{{ t('stockOverview.detail.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('stockOverview.detail.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border max-height="540">
      <el-table-column
        :label="t('stockOverview.detail.productCode')"
        prop="productCode"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('stockOverview.detail.productNameCol')"
        prop="productName"
        min-width="130"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('stockOverview.detail.productSpec')"
        prop="productSpec"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{ row.productSpec || '-' }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.productUnit')" prop="productUnit" min-width="70" align="center" header-align="center" />
      <el-table-column
        :label="t('stockOverview.detail.locationCol')"
        prop="locationName"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('stockOverview.detail.beginStock')" prop="beginStock" min-width="100" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.beginStock, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.inboundQty')" prop="inboundQty" min-width="90" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.inboundQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.outboundQty')" prop="outboundQty" min-width="90" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.outboundQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.lossQty')" prop="lossQty" min-width="90" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.lossQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.feedQty')" prop="feedQty" min-width="100" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.feedQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('stockOverview.detail.endStock')" prop="endStock" min-width="100" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.endStock, row.productUnit) }}</template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { getStockMonthlyDetail, type StockOverviewDetailVO } from '@/api/djs-warehouse/stockOverview';
import { listLocation } from '@/api/djs-warehouse/location';
import { formatQtyByUnit, isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'StockOverviewDetailDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const loading = ref(false);
const currentMonth = ref('');
const list = ref<StockOverviewDetailVO[]>([]);
/** 库位下拉选项 */
const locationOptions = ref<Array<{ label: string; value: string | number }>>([]);

const query = reactive<{ productName?: string; locationId?: string | number }>({
  productName: undefined,
  locationId: undefined
});

const dialogTitle = computed(() => `${t('stockMonthly.detail.title')}（${currentMonth.value}）`);

/**
 * 打开当月明细。
 *
 * @param monthStart 该月首日 yyyy-MM-01（后端按 [首日, 下月首日) 取整月区间）
 */
async function open(monthStart: string) {
  currentMonth.value = monthStart;
  query.productName = undefined;
  query.locationId = undefined;
  list.value = [];
  visible.value = true;
  if (locationOptions.value.length === 0) {
    await loadLocationOptions();
  }
  fetchDetail();
}

async function fetchDetail() {
  if (!currentMonth.value) return;
  loading.value = true;
  try {
    const res = await getStockMonthlyDetail({
      monthStart: currentMonth.value,
      productName: query.productName || undefined,
      locationId: query.locationId || undefined
    });
    list.value = (res.data ?? []) as StockOverviewDetailVO[];
  } finally {
    loading.value = false;
  }
}

/** 拉库位列表填充下拉。 */
async function loadLocationOptions() {
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 1000 });
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string }>;
    locationOptions.value = rows.map((r) => ({ label: r.locationName, value: r.id }));
  } catch (e) {
    console.warn('[StockOverview] listLocation failed', e);
    locationOptions.value = [];
  }
}

function handleReset() {
  query.productName = undefined;
  query.locationId = undefined;
  fetchDetail();
}

/** 数量格式化（按行单位分流）：kg/公斤 恒 3 位小数补零（与损耗总览明细同一数值同一显示），非 kg 去尾零；后端 BigDecimal 序列化为 string 统一 Number 强转。 */
function fmt(v: number | string | undefined | null, unit?: string | null): string {
  if (v === undefined || v === null || v === '') return isKgUnit(unit) ? '0.000' : '0';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit);
}

defineExpose({ open });
</script>
