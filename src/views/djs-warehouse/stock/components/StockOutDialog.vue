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
        <span v-if="unit" class="ml-2 text-gray-400">{{ unit }}</span>
      </el-form-item>
      <el-form-item :label="t('stock.outDialog.stockOutDest')" prop="stockOutDest">
        <el-select v-model="form.stockOutDest" :placeholder="t('stock.outDialog.stockOutDestPlaceholder')" style="width: 100%">
          <el-option v-for="d in djs_stock_out_dest" :key="d.value" :label="d.label" :value="d.value" />
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

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();
const unit = ref('');

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
  visible.value = true;
};
defineExpose({ open });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  unit.value = '';
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
