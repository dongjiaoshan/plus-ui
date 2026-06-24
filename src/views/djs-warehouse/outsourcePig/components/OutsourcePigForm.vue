<template>
  <el-dialog
    v-model="visible"
    :title="t('djs.warehouse.outsourcePig.title.add')"
    destroy-on-close
    append-to-body
    width="560px"
    :close-on-click-modal="true"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('djs.warehouse.outsourcePig.field.pigMarkNo')" prop="pigMarkNo">
        <el-input v-model="form.pigMarkNo" maxlength="64" clearable :placeholder="t('djs.warehouse.outsourcePig.placeholder.pigMarkNo')" />
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.outsourcePig.field.purchaseDate')" prop="purchaseDate">
        <el-date-picker
          v-model="form.purchaseDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="t('djs.warehouse.outsourcePig.placeholder.purchaseDate')"
        />
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.outsourcePig.field.slaughterDate')" prop="slaughterDate">
        <el-date-picker
          v-model="form.slaughterDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="t('djs.warehouse.outsourcePig.placeholder.slaughterDate')"
        />
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.outsourcePig.field.pigWeight')" prop="pigWeight">
        <el-input-number
          v-model="form.pigWeight"
          :min="0"
          :precision="2"
          :controls="false"
          style="width: 100%"
          :placeholder="t('djs.warehouse.outsourcePig.placeholder.pigWeight')"
        >
          <template #suffix>
            <span class="text-gray-500">kg</span>
          </template>
        </el-input-number>
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.outsourcePig.field.supplier')" prop="supplierId">
        <el-select
          v-model="form.supplierId"
          filterable
          clearable
          style="width: 100%"
          :placeholder="t('djs.warehouse.outsourcePig.placeholder.supplier')"
        >
          <el-option v-for="s in supplierOptions" :key="String(s.id)" :label="s.supplierName" :value="String(s.id)" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.outsourcePig.field.buyer')" prop="buyer">
        <el-select v-model="form.buyer" filterable clearable style="width: 100%" :placeholder="t('djs.warehouse.outsourcePig.placeholder.buyer')">
          <el-option
            v-for="u in buyerOptions"
            :key="String(u.userId)"
            :label="u.nickName || u.userName || String(u.userId)"
            :value="String(u.userId)"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('common.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addOutsourcePig } from '@/api/djs-warehouse/outsourcePig';
import type { OutsourcePigForm } from '@/api/djs-warehouse/outsourcePig/types';
import { listSupplier } from '@/api/djs-common/supplier';
import { listUser } from '@/api/system/user';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const supplierOptions = ref<Array<{ id: number | string; supplierName: string }>>([]);
const buyerOptions = ref<Array<{ userId: number | string; nickName?: string; userName?: string }>>([]);

// 到场时间不再手填：由关联白条「燎毛间称重完成时刻」(bar_info.in_time) 自动回填到列表（FIX-WMS-OUTSOURCE-001 行38）
const defaultForm = (): OutsourcePigForm => ({
  pigMarkNo: undefined,
  purchaseDate: undefined,
  slaughterDate: undefined,
  pigWeight: undefined,
  supplierId: undefined,
  buyer: undefined
});
const form = ref<OutsourcePigForm>(defaultForm());

const rules = computed(() => ({
  purchaseDate: [{ required: true, message: t('djs.warehouse.outsourcePig.rule.purchaseDate.required'), trigger: 'change' }],
  slaughterDate: [{ required: true, message: t('djs.warehouse.outsourcePig.rule.slaughterDate.required'), trigger: 'change' }],
  pigWeight: [{ required: true, message: t('djs.warehouse.outsourcePig.rule.pigWeight.required'), trigger: 'blur' }],
  supplierId: [{ required: true, message: t('djs.warehouse.outsourcePig.rule.supplier.required'), trigger: 'change' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

const openCreate = async () => {
  reset();
  visible.value = true;
  await Promise.all([loadSupplierOptions(), loadBuyerOptions()]);
};
defineExpose({ openCreate });

const reset = () => (form.value = defaultForm());
const handleClosed = () => {
  formRef.value?.resetFields();
  reset();
};

const loadSupplierOptions = async () => {
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; supplierName: string }>;
    supplierOptions.value = rows.map((r) => ({ id: r.id, supplierName: r.supplierName }));
  } catch (e) {
    console.warn('[OutsourcePigForm] loadSupplierOptions failed', e);
    supplierOptions.value = [];
  }
};

const loadBuyerOptions = async () => {
  try {
    const res = await listUser({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ userId: number | string; nickName?: string; userName?: string }>;
    buyerOptions.value = rows.map((r) => ({ userId: r.userId, nickName: r.nickName, userName: r.userName }));
  } catch (e) {
    console.warn('[OutsourcePigForm] loadBuyerOptions failed', e);
    buyerOptions.value = [];
  }
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await addOutsourcePig(form.value);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
