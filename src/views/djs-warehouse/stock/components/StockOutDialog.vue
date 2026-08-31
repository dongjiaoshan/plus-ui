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
        <!-- 出库量精度随计量单位分流（同采购入库口径）：计量类单位三位小数，计数类单位整数。
             计数类**不设 precision** —— el-input-number 的 precision=0 会把 1.6 静默四舍五入成 2，
             用户想出 1 瓶结果出了 2 瓶且毫无提示；非整数交给下面的校验规则明确报错。 -->
        <el-input-number
          v-model="form.quantity"
          :min="0.001"
          :max="maxQuantity"
          :step="1"
          :precision="quantityPrecision"
          controls-position="right"
          :placeholder="t('stock.outDialog.quantityPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 计量单位（只读，取该产品商品配置单位） -->
      <el-form-item :label="t('stock.outDialog.measureUnit')">
        <el-input :model-value="unit || '-'" disabled />
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
import { todayYmd } from '@/utils/date';
import { stockOut } from '@/api/djs-warehouse/stock';
import type { LocationStockVO, StockOutForm } from '@/api/djs-warehouse/stock/types';
import { filterManualOutDest } from '@/views/djs-warehouse/constants';
import { formatQtyByUnit, isCountingUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

/**
 * 后台手工出库去向下拉：只保留可手选的最终去向（厨房 / 矿山 / 大冶门店 / 各收货单位 等），
 * 隐藏由各业务出库路径自动回填的内部流转值（见 HIDDEN_OUT_DEST）。
 */
const stockOutDestOptions = computed(() => filterManualOutDest(djs_stock_out_dest.value));

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const unit = ref('');
/** 当前库存（出库弹窗只读展示，来自被点击的库存行 productStock） */
const currentStock = ref<number | string | null>(null);

/** 当前库存展示（按单位分流）：kg/公斤 恒 3 位小数补零，非 kg 去尾零 + 单位（productStock 后端 BigDecimal 可能是 string） */
const currentStockText = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  const text = Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit.value);
  return unit.value ? `${text}${unit.value}` : text;
});

/** 出库量上限 = 当前库存（超出禁止提交，row186-FE 前端拦）。库存缺失时回退 Infinity 不拦。 */
const maxQuantity = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return Infinity;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? Infinity : n;
});

const today = () => todayYmd();

const defaultForm = (): StockOutForm => ({
  id: '',
  outDate: today(),
  quantity: undefined,
  stockOutDest: '',
  remark: undefined
});
const form = ref<StockOutForm>(defaultForm());

/**
 * 出库量精度随产品单位分流，与采购入库（ProductInboundForm）同一套规则：
 * 计量类单位（kg / 吨 / 升 / 斤 / 米…）给 precision=3 —— 库存按 DECIMAL(12,3) 记账，
 * 写死两位会让 65.880 这类库存出不干净；计数类单位（瓶 / 袋 / 盒 / 个…）不给 precision，
 * 由下面的规则明确报错。
 *
 * ⚠️ min 恒 0.001、step 恒 1，**不随单位变**：el-input-number 会在失焦时把低于 min 的值
 * 静默钳到 min，计数类若取 min=1，用户填 0.5 瓶会被无声改成 1 瓶（想出 0.5 结果出了 1，还是往上取）
 * —— 那正是本段一开始要避免的静默改数。step 同理不动，点一下箭头加 1 是既有手感。
 */
const quantityPrecision = computed(() => (isCountingUnit(unit.value) ? undefined : 3));

const rules = computed(() => ({
  outDate: [{ required: true, message: t('stock.outDialog.rule.outDate'), trigger: 'change' }],
  quantity: [
    { required: true, message: t('stock.outDialog.rule.quantity'), trigger: 'blur' },
    {
      // 计数类单位只能整数 —— 明确报错而不是把用户填的数悄悄改掉
      validator: (_r: unknown, value: number | undefined, cb: (e?: Error) => void) => {
        if (value == null || Number.isNaN(Number(value))) return cb();
        if (isCountingUnit(unit.value) && !Number.isInteger(Number(value))) {
          return cb(new Error(t('stock.outDialog.rule.quantityIntegerOnly', { unit: unit.value || '-' })));
        }
        cb();
      },
      trigger: 'blur'
    }
  ],
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
