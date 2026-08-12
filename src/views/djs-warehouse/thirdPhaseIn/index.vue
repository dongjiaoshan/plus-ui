<template>
  <div class="p-2">
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
          <!-- precision=3 由 el-input-number 强制截断到 3 位小数（不是只提示） -->
          <el-input-number
            v-model="form.stockNum"
            :precision="3"
            :min="0.001"
            :step="1"
            :controls="false"
            :placeholder="t('thirdPhaseIn.placeholder.stockNum')"
            style="width: 100%"
          />
          <span class="ml-2 text-gray-500">{{ t('thirdPhaseIn.unit.kg') }}</span>
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
import { addThirdPhaseIn, listThirdPhaseIn, THIRD_PHASE_IN_EXPORT_URL } from '@/api/djs-warehouse/thirdPhaseIn';
import type { ThirdPhaseInQuery, ThirdPhaseInVO } from '@/api/djs-warehouse/thirdPhaseIn/types';
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

/** BigDecimal 序列化成字符串，直接拼接会得到 "1.0001.000"，先 Number() 再定长。 */
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
    // 加它是因为「在地块上打【三期】标识」是本功能的核心动作，而它可能打不上
    //（产品对应作物当前没有在种地块时后端降级放行、不阻断入库）。
    // 没有这一列，打不上就是**完全静默**——操作员看到「入库成功」却没有任何地方能发现标识没打上。
    prop: 'plotNames',
    label: t('thirdPhaseIn.column.plotNames'),
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true,
    formatter: (r: BizRow) => {
      const v = (r as unknown as ThirdPhaseInVO).plotNames;
      return v && String(v).trim() ? String(v) : t('thirdPhaseIn.noPlotMarked');
    }
  }
]);

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
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadList();
});
</script>
