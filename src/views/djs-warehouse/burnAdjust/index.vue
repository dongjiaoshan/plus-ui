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
          {{ weightText(current?.arriveWeight) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('burnAdjust.field.pendingWeight')">
          {{ weightText(current?.pendingWeight) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('burnAdjust.field.productWeight')" prop="productWeight">
          <el-input-number v-model="form.productWeight" :min="0.001" :max="maxWeight" :precision="3" :step="0.1" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
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

/**
 * 可填上限 = 猪只接收重量 − 其它产出行已入库重量 = 待入库重量 + 本行当前重量。
 * 未称重（接收重量为空）时不设上限，与后端「arrive 为空跳过上限校验」同口径。
 */
const maxWeight = computed<number>(() => {
  const row = current.value;
  if (!row || row.arriveWeight == null || row.arriveWeight === '') return Number.MAX_SAFE_INTEGER;
  const pending = Number(row.pendingWeight ?? 0);
  const self = Number(row.productWeight ?? 0);
  return Number((pending + self).toFixed(3));
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
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid || !current.value || form.productWeight == null) return;
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
