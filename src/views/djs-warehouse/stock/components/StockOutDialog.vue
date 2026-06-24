<template>
  <!-- 规则1：录入弹窗用 el-dialog + close-on-click-modal（点蒙层自动关） -->
  <el-dialog
    v-model="visible"
    :title="t('stock.outDialog.title')"
    width="480px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item :label="t('stock.outDialog.currentStock')">
        <el-input :model-value="currentStockText" disabled />
      </el-form-item>
      <el-form-item :label="t('stock.outDialog.outDate')" prop="outDate">
        <el-date-picker
          v-model="form.outDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('stock.outDialog.outDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('stock.outDialog.quantity')" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="0.001"
          :step="1"
          :precision="2"
          controls-position="right"
          :placeholder="t('stock.outDialog.quantityPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('stock.outDialog.stockOutDest')" prop="stockOutDest">
        <el-select v-model="form.stockOutDest" :placeholder="t('stock.outDialog.stockOutDestPlaceholder')" style="width: 100%">
          <el-option v-for="d in stockOutDestOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('stock.outDialog.confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { stockOut } from '@/api/djs-warehouse/stock';
import type { LocationStockVO, StockOutForm } from '@/api/djs-warehouse/stock/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

/**
 * 后台手工出库去向下拉：隐藏 FIX-WMS-FLOWDICT-001 新增的 5 个工序去向
 * （ship_dock / dept_pick / bar_cut / prod_pick / check_loss）—— 这 5 个由各业务出库路径
 * 自动回填、不让后台手工出库选；只保留可手选的最终去向（厨房 / 矿山 / 大冶门店 / 个人 等）。
 */
const HIDDEN_OUT_DEST = new Set(['ship_dock', 'dept_pick', 'bar_cut', 'prod_pick', 'check_loss']);
const stockOutDestOptions = computed(() => (djs_stock_out_dest.value ?? []).filter((d: any) => !HIDDEN_OUT_DEST.has(String(d.value))));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const unit = ref('');
/** 当前库存（出库弹窗只读展示，来自被点击的库存行 productStock） */
const currentStock = ref<number | string | null>(null);

/** 当前库存展示：保留两位小数 + 单位（productStock 后端 BigDecimal 可能是 string） */
const currentStockText = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  const text = Number.isNaN(n) ? String(v) : n.toFixed(2);
  return unit.value ? `${text}${unit.value}` : text;
});

const today = () => new Date().toISOString().slice(0, 10);

const defaultForm = (): StockOutForm => ({
  id: '',
  outDate: today(),
  quantity: undefined,
  stockOutDest: '',
  remark: undefined
});
const form = ref<StockOutForm>(defaultForm());

const rules = computed(() => ({
  outDate: [{ required: true, message: t('stock.outDialog.rule.outDate'), trigger: 'change' }],
  quantity: [{ required: true, message: t('stock.outDialog.rule.quantity'), trigger: 'blur' }],
  stockOutDest: [{ required: true, message: t('stock.outDialog.rule.stockOutDest'), trigger: 'change' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 打开出库弹窗：传入库存行（snowflake id 保持 string 防截断） */
const open = (row: LocationStockVO) => {
  form.value = defaultForm();
  form.value.id = String(row.id);
  unit.value = row.productUnit ?? '';
  currentStock.value = row.productStock ?? null;
  visible.value = true;
};
defineExpose({ open });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  unit.value = '';
  currentStock.value = null;
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await stockOut({
        id: form.value.id,
        outDate: form.value.outDate,
        quantity: form.value.quantity,
        stockOutDest: form.value.stockOutDest,
        remark: form.value.remark
      });
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
