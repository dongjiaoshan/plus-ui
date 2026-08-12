<template>
  <div class="p-2">
    <!-- 页头合计（甲方 row92「通过三期标识可以统计三期的总入库和总出库」）：全量口径，不随下方筛选变化 -->
    <el-card shadow="hover" class="summary-bar">
      <span class="summary-item">
        {{ t('thirdPhaseIn.summary.totalIn') }}
        <span class="summary-value">{{ totalInText }}</span>
      </span>
      <el-divider direction="vertical" />
      <span class="summary-item">
        {{ t('thirdPhaseIn.summary.totalOut') }}
        <span class="summary-value">{{ totalOutText }}</span>
      </span>
      <span v-if="summaryFailed" class="summary-error">{{ t('thirdPhaseIn.summary.loadFailed') }}</span>
    </el-card>

    <BizTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      :search-schema="searchSchema"
      :search-model="searchModel"
      :page-num="pageNum"
      :page-size="pageSize"
      perm-prefix="djs:warehouse:thirdPhaseIn"
      :show-add="false"
      :show-batch-del="false"
      :show-row-edit="false"
      :show-row-del="false"
      show-export
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
      @page-change="handlePageChange"
    >
      <!-- 甲方要求按钮文案是「新增入库」，与 BizTable 内置「新增」不同，故走 extra slot 自定义 -->
      <template #toolbar-extra>
        <el-col :span="1.5">
          <el-button v-hasPermi="['djs:warehouse:thirdPhaseIn:add']" type="primary" plain icon="Plus" @click="handleAdd">
            {{ t('thirdPhaseIn.action.add') }}
          </el-button>
        </el-col>
      </template>
    </BizTable>

    <el-dialog v-model="dialogVisible" :title="t('thirdPhaseIn.dialog.title')" append-to-body destroy-on-close width="520px" @closed="handleClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="t('thirdPhaseIn.field.product')" prop="productId">
          <el-select
            v-model="form.productId"
            filterable
            remote
            clearable
            :remote-method="searchProducts"
            :loading="productLoading"
            :placeholder="t('thirdPhaseIn.placeholder.product')"
            style="width: 100%"
          >
            <el-option v-for="p in productOptions" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('thirdPhaseIn.field.stockNum')" prop="stockNum">
          <!-- precision=3 由 el-input-number 强制截断到 3 位小数（不是只提示）。
               单位跟输入框同一行（row91）：.el-form-item__content 是 flex-wrap:wrap，输入框写死
               width:100% 会把 kg 挤到第二行 —— 改成 flex:1 让它吃剩余宽，kg 用 flex:none 占尾。 -->
          <div class="unit-field">
            <el-input-number
              v-model="form.stockNum"
              :precision="3"
              :min="0.001"
              :step="1"
              :controls="false"
              :placeholder="t('thirdPhaseIn.placeholder.stockNum')"
              class="unit-field__input"
            />
            <span class="unit-field__unit">{{ t('thirdPhaseIn.unit.kg') }}</span>
          </div>
        </el-form-item>

        <!-- 入库库位锁死毛菜鲜品库（甲方口径「毛菜保鲜室」），不可选其他库位 -->
        <el-form-item :label="t('thirdPhaseIn.field.location')">
          <el-input :model-value="t('thirdPhaseIn.fixedLocation')" disabled />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="submitForm">{{ t('common.confirm') }}</el-button>
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ThirdPhaseIn" lang="ts">
import BizTable from '@/components/BizTable/index.vue';
import type { BizRow, BizTableColumn, SearchFieldSchema } from '@/components/BizTable/types';
import { addThirdPhaseIn, getThirdPhaseSummary, listThirdPhaseIn, THIRD_PHASE_IN_EXPORT_URL } from '@/api/djs-warehouse/thirdPhaseIn';
import type { ThirdPhaseInQuery, ThirdPhaseInVO, ThirdPhaseSummaryVO } from '@/api/djs-warehouse/thirdPhaseIn/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { VEG_FRESH_LOCATION_ID } from '../constants';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const list = ref<ThirdPhaseInVO[]>([]);
const total = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// ---- 列表 ----

const searchModel = reactive<Record<string, unknown>>({
  inTimeRange: undefined,
  cropName: undefined
});

const searchSchema = computed<SearchFieldSchema[]>(() => [
  { field: 'inTimeRange', label: t('thirdPhaseIn.field.inTime'), type: 'daterange' },
  { field: 'cropName', label: t('thirdPhaseIn.field.cropName'), type: 'input', placeholder: t('thirdPhaseIn.placeholder.cropName') }
]);

/**
 * BigDecimal 序列化成字符串，直接拼接会得到 "1.0001.000"，先 Number() 再定长。
 *
 * 数值与单位之间用**普通空格**，与全库其余 25 处 `${n.toFixed(3)} kg` 拼法一致 —— 不引入 `\u00A0`：
 * 该列真放不下时 `.el-table .cell` 的 `overflow-wrap: break-word` 会硬断，`\u00A0` 拦不住
 *（只把断点挪到 NBSP 处，第二行还多个前导空白，更难看）。**这一列不换行是靠列上的
 * `showOverflowTooltip` 保证的**（Element Plus 给 cell 挂 `white-space: nowrap`），不是靠分隔符。
 *
 * 为什么必须靠它：入库量域上限是 `999999999.999`（DDL `DECIMAL(12,3)` + Bo `@Digits(integer = 9)`，
 * 弹框只有 `:min` 没有 `:max`），实测「999999999.999 kg」= 124.84px > 本列最窄内容宽 106px
 *（minWidth 130 − cell padding 24）—— 整数位 ≥ 7 位（即 ≥ 1,000,000 kg）就会裂两行。
 * 页头合计走全量 SUM，是最先越过这个阈值的地方。
 *
 * 甲方 row91 报的换行在**新增入库弹框**，那处由 `.unit-field` flex 壳解决。
 */
function fmtWeight(v: unknown): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  return Number.isNaN(n) ? '-' : `${n.toFixed(3)} ${t('thirdPhaseIn.unit.kg')}`;
}

function fmtText(v: unknown): string {
  return v !== undefined && v !== null && v !== '' ? String(v) : '-';
}

const columns = computed<BizTableColumn[]>(() => [
  {
    prop: 'inTime',
    label: t('thirdPhaseIn.column.inTime'),
    minWidth: 150,
    align: 'center',
    formatter: (r: BizRow) => fmtText(r.inTime)
  },
  {
    prop: 'cropName',
    label: t('thirdPhaseIn.column.cropName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => fmtText(r.cropName)
  },
  {
    prop: 'productName',
    label: t('thirdPhaseIn.column.productName'),
    minWidth: 150,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => fmtText(r.productName)
  },
  {
    prop: 'stockNum',
    label: t('thirdPhaseIn.column.stockNum'),
    minWidth: 130,
    align: 'center',
    // 甲方 row91「KG 单位显示不换行」：本表另外 5 个文本列都靠 showOverflowTooltip 保证单行
    //（Element Plus 给 cell 挂 white-space: nowrap），入库量列原来是唯一的例外 ——
    // 域上限 999999999.999 kg 会超出最窄内容宽 106px 而裂行，见 fmtWeight 注释。
    showOverflowTooltip: true,
    formatter: (r: BizRow) => fmtWeight(r.stockNum)
  },
  {
    prop: 'locationName',
    label: t('thirdPhaseIn.column.locationName'),
    minWidth: 130,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => fmtText(r.locationName)
  },
  {
    prop: 'operatorName',
    label: t('thirdPhaseIn.column.operatorName'),
    minWidth: 110,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => fmtText(r.operatorName)
  },
  {
    // 超原型增强（已登记 doc/12-UI-偏离审计）：甲方只列了 6 列，这是第 7 列。
    // 恒显示「三期」——甲方 row92「标识地块为：三期」：三期没有对应的真实地块，本列表达的是
    //「本次入库打的是三期标识」，不是「打到哪几块真实地块」，所以不读行上的地块字段。
    // 纯展示列，后端 ThirdPhaseInVo 没有对应字段；prop 只作 BizTable 的列显隐 key。
    prop: 'plotTag',
    label: t('thirdPhaseIn.column.plotTag'),
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true,
    formatter: () => t('plotTag.thirdPhase')
  }
]);

// ---- 页头合计 ----

const summary = ref<ThirdPhaseSummaryVO | null>(null);
/** 合计端点失败标记：页面上给出可见提示，不静默当成 0 */
const summaryFailed = ref(false);

const totalInText = computed(() => fmtWeight(summary.value?.totalIn));
const totalOutText = computed(() => fmtWeight(summary.value?.totalOut));

/** 合计加载失败只降级这一条（两个数字显示 '-' + 失败提示），不阻断下方列表。 */
async function loadSummary() {
  try {
    const res = await getThirdPhaseSummary();
    summary.value = res.data ?? null;
    summaryFailed.value = false;
  } catch (e) {
    console.warn('[ThirdPhaseIn] getThirdPhaseSummary failed', e);
    summary.value = null;
    summaryFailed.value = true;
  }
}

/** daterange 绑成 [start, end] 数组，拆成 beginTime / endTime 传后端。 */
function rangeOf(v: unknown): { begin?: string; end?: string } {
  return Array.isArray(v) && v.length === 2 ? { begin: v[0] || undefined, end: v[1] || undefined } : {};
}

/** 搜索条件（不含分页），列表与导出共用。 */
function buildFilter(): Omit<ThirdPhaseInQuery, 'pageNum' | 'pageSize'> {
  const { begin, end } = rangeOf(searchModel.inTimeRange);
  return {
    beginTime: begin,
    endTime: end,
    cropName: (searchModel.cropName as string | undefined) || undefined
  };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await listThirdPhaseIn({ ...buildFilter(), pageNum: pageNum.value, pageSize: pageSize.value });
    const r = res as unknown as { rows?: ThirdPhaseInVO[]; total?: number };
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

function handleReset() {
  Object.keys(searchModel).forEach((k) => {
    searchModel[k] = undefined;
  });
  pageNum.value = 1;
  loadList();
}

function handlePageChange(pn: number, ps: number) {
  pageNum.value = pn;
  pageSize.value = ps;
  loadList();
}

function handleExport() {
  proxy?.download(THIRD_PHASE_IN_EXPORT_URL, { ...buildFilter() }, `${t('thirdPhaseIn.pageTitle')}_${new Date().getTime()}.xlsx`);
}

// ---- 新增入库弹框 ----

const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

interface ThirdPhaseInFormModel {
  productId: string;
  stockNum: number | undefined;
}

const defaultForm = (): ThirdPhaseInFormModel => ({ productId: '', stockNum: undefined });
const form = ref<ThirdPhaseInFormModel>(defaultForm());

const productLoading = ref(false);
const productOptions = ref<Array<{ label: string; value: string }>>([]);

/**
 * 候选产品 = 果蔬类原材料（belong_type=vegetable + product_attr=2 + 启用），复用产品列表端点。
 * 甲方要求「仅果蔬类原材料产品」；关键词为空时给一页默认候选，打开弹框即可选。
 */
async function searchProducts(keyword?: string) {
  productLoading.value = true;
  try {
    const res = await listProduct({
      productName: keyword?.trim() || undefined,
      belongType: 'vegetable',
      productAttr: 2,
      productStatus: 0,
      pageNum: 1,
      pageSize: 50
    });
    const rows = ((res as unknown as { rows?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
    productOptions.value = rows.map((r) => ({
      label: r.productSpec ? `${r.productName}（${r.productSpec}）` : r.productName,
      value: String(r.id)
    }));
  } catch (e) {
    console.warn('[ThirdPhaseIn] listProduct failed', e);
    productOptions.value = [];
  } finally {
    productLoading.value = false;
  }
}

const rules = computed<ElFormRules>(() => ({
  productId: [{ required: true, message: t('thirdPhaseIn.rule.product'), trigger: 'change' }],
  stockNum: [
    { required: true, message: t('thirdPhaseIn.rule.stockNum'), trigger: 'blur' },
    {
      trigger: 'blur',
      validator: (_rule: unknown, value: unknown, callback: (err?: Error) => void) => {
        if (value === undefined || value === null || value === '') {
          callback(new Error(t('thirdPhaseIn.rule.stockNum')));
          return;
        }
        const n = Number(value);
        if (Number.isNaN(n) || n <= 0) {
          callback(new Error(t('thirdPhaseIn.rule.stockNumPositive')));
          return;
        }
        // el-input-number precision=3 已截断，这里兜底拦住粘贴 / 程序化赋值的超精度值
        const decimals = String(n).split('.')[1]?.length ?? 0;
        if (decimals > 3) {
          callback(new Error(t('thirdPhaseIn.rule.stockNumScale')));
          return;
        }
        callback();
      }
    }
  ]
}));

function handleAdd() {
  form.value = defaultForm();
  dialogVisible.value = true;
  searchProducts();
}

function handleClosed() {
  formRef.value?.resetFields();
  form.value = defaultForm();
  productOptions.value = [];
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await addThirdPhaseIn({
      productId: form.value.productId,
      stockNum: Number(form.value.stockNum),
      locationId: VEG_FRESH_LOCATION_ID
    });
    proxy?.$modal.msgSuccess(t('thirdPhaseIn.tip.addSuccess'));
    dialogVisible.value = false;
    loadList();
    // 新入库直接改变三期总入库，合计跟着刷
    loadSummary();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadList();
  loadSummary();
});
</script>

<style scoped>
/* 页头合计横条：一行两项，窄屏换行。左右 8px 与 BizTable 内层卡片（根节点 p-2）对齐 */
.summary-bar {
  margin: 0 8px 2px;
}
.summary-bar :deep(.el-card__body) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
}
.summary-item {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.summary-value {
  color: var(--el-color-primary);
  font-size: 18px;
  font-weight: 600;
  margin-left: 6px;
}
.summary-error {
  color: var(--el-color-warning);
  font-size: 13px;
  margin-left: 8px;
}

/* 输入框 + 单位同一行：输入框吃剩余宽，单位不参与收缩、不换行 */
.unit-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.unit-field__input {
  flex: 1;
  min-width: 0;
}
.unit-field__unit {
  flex: none;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
}
</style>
