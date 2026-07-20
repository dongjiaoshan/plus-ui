<template>
  <!-- 录入弹窗用 el-dialog + close-on-click-modal（点蒙层自动关；不设 :close-on-click-modal="false"） -->
  <el-dialog
    v-model="visible"
    :title="t('stock.transferDialog.title')"
    width="480px"
    append-to-body
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <!-- 源库位（只读，来自被点击的库存行 locationName） -->
      <el-form-item :label="t('stock.transferDialog.fromLocation')">
        <el-input :model-value="fromLocation || '-'" disabled />
      </el-form-item>
      <!-- 目标库位（只读固定「冻品库」，不可选） -->
      <el-form-item :label="t('stock.transferDialog.toLocation')">
        <el-input :model-value="t('stock.transferDialog.frozenLocation')" disabled />
      </el-form-item>
      <!-- 当前库存（只读） -->
      <el-form-item :label="t('stock.transferDialog.currentStock')">
        <el-input :model-value="currentStockText" disabled />
      </el-form-item>
      <el-form-item :label="t('stock.transferDialog.transferDate')" prop="transferDate">
        <el-date-picker
          v-model="form.transferDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('stock.transferDialog.transferDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('stock.transferDialog.quantity')" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="0.001"
          :max="maxQuantity"
          :step="1"
          :precision="2"
          controls-position="right"
          :placeholder="t('stock.transferDialog.quantityPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 计量单位（只读，取该产品单位） -->
      <el-form-item :label="t('stock.transferDialog.measureUnit')">
        <el-input :model-value="unit || '-'" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('stock.transferDialog.confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { pigTransfer } from '@/api/djs-warehouse/stock';
import type { LocationStockVO, StockTransferForm } from '@/api/djs-warehouse/stock/types';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const unit = ref('');
/** 源库位名称（转移弹窗只读展示，来自被点击的库存行 locationName） */
const fromLocation = ref('');
/** 当前库存（转移弹窗只读展示，来自被点击的库存行 productStock） */
const currentStock = ref<number | string | null>(null);

/** 当前库存展示（按单位分流）：kg/公斤 恒 3 位小数补零，非 kg 去尾零 + 单位（productStock 后端 BigDecimal 可能是 string） */
const currentStockText = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  const text = Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit.value);
  return unit.value ? `${text}${unit.value}` : text;
});

/** 转移量上限 = 当前库存（超出禁止提交，前端拦）。库存缺失时回退 Infinity 不拦。 */
const maxQuantity = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return Infinity;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? Infinity : n;
});

const today = () => new Date().toISOString().slice(0, 10);

const defaultForm = (): StockTransferForm => ({
  id: '',
  transferDate: today(),
  quantity: undefined,
  remark: undefined
});
const form = ref<StockTransferForm>(defaultForm());

const rules = computed(() => ({
  transferDate: [{ required: true, message: t('stock.transferDialog.rule.transferDate'), trigger: 'change' }],
  quantity: [{ required: true, message: t('stock.transferDialog.rule.quantity'), trigger: 'blur' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

/** 打开转移弹窗：传入库存行（snowflake id 保持 string 防截断） */
const open = (row: LocationStockVO) => {
  form.value = defaultForm();
  form.value.id = String(row.id);
  unit.value = row.productUnit ?? '';
  fromLocation.value = row.locationName ?? '';
  currentStock.value = row.productStock ?? null;
  visible.value = true;
};
defineExpose({ open });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  unit.value = '';
  fromLocation.value = '';
  currentStock.value = null;
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await pigTransfer({
        id: form.value.id,
        transferDate: form.value.transferDate,
        quantity: form.value.quantity,
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
