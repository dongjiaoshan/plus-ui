<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="90%" append-to-body destroy-on-close :close-on-click-modal="true">
    <!-- 搜索：产品名称模糊 + 入库方式多选 + 产品类型多选 + 供应商模糊（甲方 row155 第 2 点） -->
    <el-form :inline="true" class="mb-2" @submit.prevent>
      <el-form-item :label="t('inoutMonthly.in.productName')">
        <el-input
          v-model="query.productName"
          :placeholder="t('inoutMonthly.in.productNamePlaceholder')"
          clearable
          style="width: 180px"
          @keyup.enter="fetchList"
        />
      </el-form-item>
      <el-form-item :label="t('inoutMonthly.in.inMode')">
        <el-select
          v-model="query.flowTypes"
          :placeholder="t('inoutMonthly.in.inModePlaceholder')"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          style="width: 220px"
        >
          <el-option v-for="o in inModeOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('inoutMonthly.in.productType')">
        <el-select
          v-model="query.productTypes"
          :placeholder="t('inoutMonthly.in.productTypePlaceholder')"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          style="width: 180px"
        >
          <el-option v-for="d in djs_product_type" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('inoutMonthly.in.supplierName')">
        <el-input
          v-model="query.supplierName"
          :placeholder="t('inoutMonthly.in.supplierNamePlaceholder')"
          clearable
          style="width: 180px"
          @keyup.enter="fetchList"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchList">{{ t('inoutMonthly.in.search') }}</el-button>
        <el-button icon="Refresh" @click="handleReset">{{ t('inoutMonthly.in.reset') }}</el-button>
        <el-button v-hasPermi="['djs:warehouse:inoutMonthly:inExport']" type="warning" icon="Download" @click="handleExport">
          {{ t('inoutMonthly.in.export') }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border max-height="540">
      <el-table-column
        :label="t('inoutMonthly.in.productNameCol')"
        prop="productName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutMonthly.in.productTypeCol')" prop="productTypeName" min-width="100" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutMonthly.in.productSpec')"
        prop="productSpec"
        min-width="110"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
      <el-table-column :label="t('inoutMonthly.in.inModeCol')" prop="inModeName" min-width="120" align="center" header-align="center" />
      <el-table-column :label="t('inoutMonthly.in.inboundQty')" prop="inboundQty" min-width="110" align="center" header-align="center">
        <template #default="{ row }">{{ fmt(row.inboundQty, row.productUnit) }}</template>
      </el-table-column>
      <el-table-column :label="t('inoutMonthly.in.productUnit')" prop="productUnit" min-width="80" align="center" header-align="center" />
      <el-table-column
        :label="t('inoutMonthly.in.supplierNameCol')"
        prop="supplierName"
        min-width="160"
        align="center"
        header-align="center"
        show-overflow-tooltip
      />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 入库汇总弹窗（V6-R155）：某月按 产品 × 入库方式 × 供应商 的入库量。
 *
 * form factor：带搜索 + 导出的完整列表放在 el-dialog 里（不做独立路由页）——
 * 与兄弟页「库存月汇总」的下钻明细同形态，甲方 row154「操作里为：入库汇总和出库汇总」也是操作列按钮语义。
 * 弹窗不分页，一次返当月全量在 el-table 内滚（行数 ≈ 产品数 × 入库方式数 × 供应商数）。
 */
import { listInSummary, type InoutSummaryInVO } from '@/api/djs-warehouse/inoutMonthly';
import { FLOW_TYPE_IN_VALUES } from '@/views/djs-warehouse/flow/scope';
import { formatQtyByUnit, isKgUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'InSummaryDialog' });

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_flow_type, djs_product_type } = toRefs<Record<string, Array<{ label: string; value: string }>>>(
  proxy?.useDict('djs_flow_type', 'djs_product_type')
);

const visible = ref(false);
const loading = ref(false);
/** 当前月份 yyyy-MM */
const currentMonth = ref('');
const list = ref<InoutSummaryInVO[]>([]);

const query = reactive<{
  productName?: string;
  flowTypes: string[];
  productTypes: string[];
  supplierName?: string;
}>({
  productName: undefined,
  flowTypes: [],
  productTypes: [],
  supplierName: undefined
});

/** djs_flow_type 是出入合并字典，入库方式下拉按白名单过滤（与「入库记录」页共用 flow/scope.ts） */
const inModeOptions = computed(() =>
  (djs_flow_type.value ?? []).filter((d) => FLOW_TYPE_IN_VALUES.includes(String(d.value))).map((d) => ({ label: d.label, value: d.value }))
);

const dialogTitle = computed(() => `${t('inoutMonthly.in.title')}（${currentMonth.value}）`);

/**
 * 打开某月入库汇总。
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
    flowTypes: query.flowTypes.length ? query.flowTypes : undefined,
    supplierName: query.supplierName || undefined
  };
}

async function fetchList() {
  if (!currentMonth.value) return;
  loading.value = true;
  try {
    const res = await listInSummary(buildParams());
    list.value = (res.data ?? []) as InoutSummaryInVO[];
  } finally {
    loading.value = false;
  }
}

function handleResetModel() {
  query.productName = undefined;
  query.supplierName = undefined;
  query.flowTypes = [];
  query.productTypes = [];
}

function handleReset() {
  handleResetModel();
  fetchList();
}

/** 导出当前搜索条件下的入库汇总（与表格同一份数据，甲方 row155 第 4 点）。 */
function handleExport() {
  if (!currentMonth.value) return;
  proxy?.download('/djs/warehouse/inoutMonthly/in/export', buildParams(), `入库汇总_${currentMonth.value}.xlsx`);
}

/** 数量格式化（按行单位分流）：kg/公斤 恒 3 位小数补零，非 kg 去尾零；后端 BigDecimal 序列化为 string 统一 Number 强转。 */
function fmt(v: number | string | undefined | null, unit?: string | null): string {
  if (v === undefined || v === null || v === '') return isKgUnit(unit) ? '0.000' : '0';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit);
}

defineExpose({ open });
</script>
