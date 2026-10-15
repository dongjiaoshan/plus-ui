<template>
  <div class="p-2">
    <BizTable
      ref="tableRef"
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :dict-types="['djs_yes_no']"
      :page-num="pageNum"
      :page-size="pageSize"
      row-key="id"
      perm-prefix="djs:warehouse:burnAdjust"
      :show-add="false"
      :show-batch-del="false"
      :show-export="false"
      :show-row-edit="false"
      :show-row-del="false"
      :action-width="110"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ row }">
        <!-- 猪只已点「处理完成」→ 不出调整入口（后端同样硬拦，不依赖此处显隐做安全边界） -->
        <el-button v-if="row.burnFinished !== 1" v-hasPermi="['djs:warehouse:burnAdjust:edit']" link type="primary" @click="openAdjust(row)">
          {{ t('burnAdjust.action.adjust') }}
        </el-button>
        <span v-else>—</span>
      </template>
    </BizTable>

    <el-dialog v-model="dialogVisible" :title="t('burnAdjust.dialog.title')" destroy-on-close append-to-body width="480px" @closed="handleClosed">
      <el-descriptions :column="1" border size="small" class="mb-[16px]">
        <el-descriptions-item :label="t('burnAdjust.field.productName')">
          {{ current?.productName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('burnAdjust.field.arriveWeight')">
          {{ weightText(receivedWeight) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('burnAdjust.field.marketingWeight')">
          {{ weightText(current?.marketingWeight) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-alert v-if="adjustWarning" :title="adjustWarning" type="warning" :closable="false" class="mb-[16px]" />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('burnAdjust.field.productWeight')" prop="productWeight">
          <el-input-number
            v-model="form.productWeight"
            :min="maxWeight < 0.001 ? 0 : 0.001"
            :max="maxWeight"
            :disabled="missingMarketingWeight || maxWeight < 0.001"
            :precision="3"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">{{ t('common.confirm') }}</el-button>
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BurnAdjust" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, BizTableExpose, SearchFieldSchema } from '@/components/BizTable/types';
import { listBurnAdjust, adjustBurnInhouseWeight } from '@/api/djs-warehouse/burnAdjust';
import type { BurnInhouseAdjustQuery, BurnInhouseAdjustVO } from '@/api/djs-warehouse/burnAdjust';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<BizTableExpose>();

const list = ref<BurnInhouseAdjustVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

/** 默认查询区间 = 近五天（含今天）。放前端而不是后端兜底：让「页面上显示的筛选条件」= 「实际生效的条件」。 */
const DEFAULT_RANGE_DAYS = 5;

function toDateStr(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function defaultRange(): [string, string] {
  const end = new Date();
  const begin = new Date();
  begin.setDate(begin.getDate() - (DEFAULT_RANGE_DAYS - 1));
  return [toDateStr(begin), toDateStr(end)];
}

const searchModel = reactive<Record<string, unknown>>({
  inboundDateRange: defaultRange(),
  productName: undefined,
  isAdjusted: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'inboundDateRange', label: t('burnAdjust.field.inboundDate'), type: 'daterange' },
  { field: 'productName', label: t('burnAdjust.field.productName'), type: 'input', placeholder: t('burnAdjust.placeholder.productName') },
  {
    field: 'isAdjusted',
    label: t('burnAdjust.field.isAdjusted'),
    type: 'select',
    clearable: true,
    dictType: 'djs_yes_no',
    placeholder: t('burnAdjust.placeholder.isAdjusted')
  }
]);

/** 入库时间显示到时分（后端给的是 yyyy-MM-dd HH:mm:ss）。 */
function minuteText(v: unknown): string {
  const s = v == null ? '' : String(v);
  return s ? s.slice(0, 16) : '-';
}

function weightText(v: unknown): string {
  if (v == null || v === '') return '-';
  return `${Number(v).toFixed(3)} kg`;
}

const columns = computed<BizTableColumn[]>(() => [
  { prop: 'inboundTime', label: t('burnAdjust.column.inboundTime'), minWidth: 140, formatter: (r: BizRow) => minuteText(r.inboundTime) },
  { prop: 'productName', label: t('burnAdjust.column.productName'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'productWeight', label: t('burnAdjust.column.productWeight'), minWidth: 120, formatter: (r: BizRow) => weightText(r.productWeight) },
  { prop: 'earNo', label: t('burnAdjust.column.earNo'), minWidth: 140, formatter: (r: BizRow) => (r.earNo ? String(r.earNo) : '-') },
  {
    prop: 'burnFinished',
    label: t('burnAdjust.column.burnFinished'),
    minWidth: 150,
    dictType: 'djs_yes_no'
  },
  {
    prop: 'locationName',
    label: t('burnAdjust.column.locationName'),
    minWidth: 120,
    formatter: (r: BizRow) => (r.locationName ? String(r.locationName) : '-')
  },
  { prop: 'isAdjusted', label: t('burnAdjust.column.isAdjusted'), minWidth: 100, dictType: 'djs_yes_no' },
  {
    prop: 'operatorName',
    label: t('burnAdjust.column.operator'),
    minWidth: 100,
    formatter: (r: BizRow) => (r.operatorName ? String(r.operatorName) : '-')
  },
  {
    prop: 'adjustTime',
    label: t('burnAdjust.column.adjustTime'),
    minWidth: 140,
    formatter: (r: BizRow) => (r.adjustTime ? minuteText(r.adjustTime) : '-')
  },
  {
    prop: 'adjustByName',
    label: t('burnAdjust.column.adjustBy'),
    minWidth: 100,
    formatter: (r: BizRow) => (r.adjustByName ? String(r.adjustByName) : '-')
  }
]);

/** daterange 字段绑成 [start, end]，拆成起止两个查询参数。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

function buildFilter(): BurnInhouseAdjustQuery {
  const { begin, end } = rangeOf(searchModel.inboundDateRange);
  const adjusted = searchModel.isAdjusted;
  return {
    inboundDateFrom: begin,
    inboundDateTo: end,
    productName: (searchModel.productName as string | undefined) || undefined,
    isAdjusted: adjusted === undefined || adjusted === null || adjusted === '' ? undefined : Number(adjusted)
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listBurnAdjust({ ...buildFilter(), pageNum: pageNum.value, pageSize: pageSize.value });
    const r = res as unknown as { rows?: BurnInhouseAdjustVO[]; total?: number };
    list.value = r.rows ?? [];
    total.value = r.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload?: Record<string, unknown>) {
  Object.assign(searchModel, payload ?? {});
  pageNum.value = 1;
  loadList();
}

/** 重置回到「近五天」这个默认态，而不是清成不限日期 —— 否则一按重置就全表扫。 */
function handleReset() {
  searchModel.inboundDateRange = defaultRange();
  searchModel.productName = undefined;
  searchModel.isAdjusted = undefined;
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

/* ---------------- 调整弹框 ---------------- */

const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const current = ref<BurnInhouseAdjustVO>();
const form = reactive<{ productWeight: number | undefined }>({ productWeight: undefined });

/** 三位小数统一换算成克再相加，避免 0.3 − 0.1 一类浮点误差缩小可录上限。 */
function grams(value: number | string | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const weight = Number(value);
  return Number.isFinite(weight) && weight >= 0 ? Math.round(weight * 1000) : undefined;
}

const missingMarketingWeight = computed(() => (grams(current.value?.marketingWeight) ?? 0) <= 0);
const otherWeightGrams = computed(() => {
  const total = grams(current.value?.inboundedWeight);
  const self = grams(current.value?.productWeight);
  return total == null || self == null || total < self ? undefined : total - self;
});

/** 可录本行上限 = 出栏重 − 其他产品全历史累计；缺少可核验重量时禁调。 */
const maxWeight = computed(() => {
  const marketing = grams(current.value?.marketingWeight);
  const other = otherWeightGrams.value;
  return marketing == null || other == null ? 0 : Math.max(marketing - other, 0) / 1000;
});
const adjustWarning = computed(() => {
  if (missingMarketingWeight.value) return t('burnAdjust.rule.marketingWeightRequired');
  if (otherWeightGrams.value == null) return t('burnAdjust.rule.inboundWeightUnavailable');
  return maxWeight.value < 0.001 ? t('burnAdjust.rule.noRemainingWeight') : '';
});
/** 接收重量预览 = 其他产品累计 + 本行新重，随着用户输入即时变化。 */
const receivedWeight = computed(() => {
  const other = otherWeightGrams.value;
  const self = grams(form.productWeight);
  return other == null || self == null ? undefined : (other + self) / 1000;
});
const canSubmit = computed(() => {
  const self = form.productWeight;
  return (
    current.value?.burnFinished !== 1 &&
    !missingMarketingWeight.value &&
    self != null &&
    Number.isFinite(self) &&
    self >= 0.001 &&
    self <= maxWeight.value
  );
});

const rules = computed(() => ({
  productWeight: [{ required: true, message: t('burnAdjust.rule.productWeight'), trigger: 'blur' }]
}));

function openAdjust(row: BizRow) {
  current.value = row as BurnInhouseAdjustVO;
  form.productWeight = row.productWeight == null ? undefined : Number(row.productWeight);
  dialogVisible.value = true;
}

function handleClosed() {
  formRef.value?.resetFields();
  current.value = undefined;
  form.productWeight = undefined;
}

function submit() {
  if (!canSubmit.value || submitting.value) return;
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid || !canSubmit.value || !current.value || form.productWeight == null) return;
    submitting.value = true;
    try {
      await adjustBurnInhouseWeight({ id: String(current.value.id), productWeight: form.productWeight });
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      dialogVisible.value = false;
      await loadList();
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  loadList();
});
</script>
