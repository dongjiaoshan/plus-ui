<template>
  <!-- row185：形态与「产品出库」保持一致（el-dialog + 点蒙层自动关），仅出库去向收窄为两项 -->
  <el-dialog
    v-model="visible"
    :title="t('stock.internalDialog.title')"
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
      <el-form-item :label="t('stock.internalDialog.outDate')" prop="outDate">
        <el-date-picker
          v-model="form.outDate"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="t('stock.outDialog.outDatePlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('stock.internalDialog.quantity')" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="0.001"
          :max="maxQuantity"
          :step="1"
          :precision="3"
          controls-position="right"
          :placeholder="t('stock.outDialog.quantityPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('stock.outDialog.measureUnit')">
        <el-input :model-value="unit || '-'" disabled />
      </el-form-item>
      <el-form-item :label="t('stock.internalDialog.outDest')" prop="outDest">
        <el-select v-model="form.outDest" :placeholder="t('stock.outDialog.stockOutDestPlaceholder')" style="width: 100%">
          <el-option v-for="d in destOptions" :key="d.value" :label="d.label" :value="d.value" />
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
import { submitInternalHandle } from '@/api/djs-warehouse/vegOut';
import type { LocationStockVO } from '@/api/djs-warehouse/stock/types';
import { formatQtyByUnit } from '@/utils/weight';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * 出库去向固定两项（row185 甲方明确「保留为两项」）：
 * 果蔬月台 veg_dock / 饲料饲喂 feed。不走字典全量下拉，也不复用 filterManualOutDest
 * （feed 在 HIDDEN_OUT_DEST 里被隐藏，但本场景甲方要它可选）。
 */
const destOptions = computed(() => [
  { value: 'veg_dock', label: t('stock.internalDialog.destVegDock') },
  { value: 'feed', label: t('stock.internalDialog.destFeed') }
]);

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const unit = ref('');
const stockId = ref<string>('');
const currentStock = ref<number | string | null>(null);

const currentStockText = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  const text = Number.isNaN(n) ? String(v) : formatQtyByUnit(n, unit.value);
  return unit.value ? `${text}${unit.value}` : text;
});

/** 出库量上限 = 当前库存（后端另有 fail-fast 硬拦） */
const maxQuantity = computed(() => {
  const v = currentStock.value;
  if (v === undefined || v === null || v === '') return Infinity;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? Infinity : n;
});

const today = () => new Date().toISOString().slice(0, 10);

const defaultForm = () => ({ outDate: today(), quantity: undefined as number | undefined, outDest: '' });
const form = ref(defaultForm());

const rules = computed(() => ({
  outDate: [{ required: true, message: t('stock.outDialog.rule.outDate'), trigger: 'change' }],
  quantity: [{ required: true, message: t('stock.outDialog.rule.quantity'), trigger: 'blur' }],
  outDest: [{ required: true, message: t('stock.outDialog.rule.stockOutDest'), trigger: 'change' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

const open = (row: LocationStockVO) => {
  form.value = defaultForm();
  stockId.value = String(row.id);
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
      await submitInternalHandle({
        outDate: form.value.outDate,
        outDest: form.value.outDest,
        items: [{ stockId: stockId.value, quantity: form.value.quantity }]
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
