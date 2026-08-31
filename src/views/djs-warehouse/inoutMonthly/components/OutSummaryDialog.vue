<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" append-to-body destroy-on-close :close-on-click-modal="true">
    <!-- 搜索：产品名称模糊 + 出库去向多选 + 产品类型多选（甲方 row156 第 2 点） -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('inoutMonthly.out.productName')">
        <el-input
          v-model="query.productName"
          :placeholder="t('inoutMonthly.out.productNamePlaceholder')"
          clearable
          style="width: 180px"
          @keyup.enter="fetchList"
        />
      </el-form-item>
      <el-form-item :label="t('inoutMonthly.out.outDest')">
        <el-select
          v-model="query.stockOutDests"
          :placeholder="t('inoutMonthly.out.outDestPlaceholder')"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          filterable
          style="width: 240px"
        >
          <el-option v-for="d in djs_stock_out_dest" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('inoutMonthly.out.productType')">
        <el-select
          v-model="query.productTypes"
          :placeholder="t('inoutMonthly.out.productTypePlaceholder')"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          style="width: 180px"
        >
          <el-option v-for="d in djs_product_type" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchList">{{ t('inoutMonthly.out.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('inoutMonthly.out.reset') }}</el-button>
        <el-button v-hasPermi="['djs:warehouse:inoutMonthly:outExport']" type="warning" icon="Download" @click="handleExport">
          {{ t('inoutMonthly.out.export') }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border max-height="540">
      <el-table-column
        :label="t('inoutMonthly.out.productNameCol')"
        prop="productName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutMonthly.out.productTypeCol')" prop="productTypeName" min-width="100" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutMonthly.out.productSpec')"
        prop="productSpec"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column
        :label="t('inoutMonthly.out.outDestCol')"
        prop="outDestName"
        min-width="140"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutMonthly.out.outboundQty')" prop="outboundQty" min-width="110" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.outboundQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('inoutMonthly.out.productUnit')" prop="productUnit" min-width="80" align="center" header-align="center" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 出库汇总弹窗（V6-R156）：某月按 产品 × 出库去向 的出库量。
 *
 * form factor 同入库汇总：完整列表放 el-dialog，不做独立路由页；不分页，表内滚。
 * 出库去向下拉给 djs_stock_out_dest 全量（44 个值，故开 filterable），不做白名单过滤。
 */
import { listOutSummary, type InoutSummaryOutVO } from '@/api/djs-warehouse/inoutMonthly';
import { formatQtyByUnit, isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'OutSummaryDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_stock_out_dest, djs_product_type } = toRefs<Record<string, Array<{ label: string; value: string }>>>(
  proxy?.useDict('djs_stock_out_dest', 'djs_product_type')
);

const visible = ref(false);
const loading = ref(false);
/** 当前月份 yyyy-MM */
const currentMonth = ref('');
const list = ref<InoutSummaryOutVO[]>([]);

const query = reactive<{
  productName?: string;
  stockOutDests: string[];
  productTypes: string[];
}>({
  productName: undefined,
  stockOutDests: [],
  productTypes: []
});

const dialogTitle = computed(() => `${t('inoutMonthly.out.title')}（${currentMonth.value}）`);

/**
 * 打开某月出库汇总。
 *
 * @param statMonth 月份 yyyy-MM
 */
function open(statMonth: string) {
  currentMonth.value = statMonth;
  handleResetModel();
  list.value = [];
  visible.value = true;
  fetchList();
}

/** 空串 / 空数组一律归一成 undefined，避免后端收到空条件当成筛选。 */
function buildParams() {
  return {
    statMonth: currentMonth.value,
    productName: query.productName || undefined,
    productTypes: query.productTypes.length ? query.productTypes.map((v) => Number(v)) : undefined,
    stockOutDests: query.stockOutDests.length ? query.stockOutDests : undefined
  };
}

async function fetchList() {
  if (!currentMonth.value) return;
  loading.value = true;
  try {
    const res = await listOutSummary(buildParams());
    list.value = (res.data ?? []) as InoutSummaryOutVO[];
  } finally {
    loading.value = false;
  }
}

function handleResetModel() {
  query.productName = undefined;
  query.stockOutDests = [];
  query.productTypes = [];
}

function handleReset() {
  handleResetModel();
  fetchList();
}

/** 导出当前搜索条件下的出库汇总（与表格同一份数据，甲方 row156 第 4 点）。 */
function handleExport() {
  if (!currentMonth.value) return;
  proxy?.download('/djs/warehouse/inoutMonthly/out/export', buildParams(), `出库汇总_${currentMonth.value}.xlsx`);
}

/** 数量格式化（按行单位分流）：kg/公斤 恒 3 位小数补零，非 kg 去尾零。 */
function fmt(v: number | string | undefined | null, unit?: string | null): string {
  if (v === undefined || v === null || v === '') return isKgUnit(unit) ? '0.000' : '0';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit);
}

defineExpose({ open });
</script>
