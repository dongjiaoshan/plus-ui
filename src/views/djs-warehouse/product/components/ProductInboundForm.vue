<template>
  <el-dialog v-model="visible" :title="t('product.inbound.title')" destroy-on-close append-to-body width="520px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('product.inbound.product')">
        <el-input :model-value="productName" disabled />
      </el-form-item>
      <el-form-item :label="t('product.inbound.location')" prop="locationId">
        <el-select
          v-model="form.locationId"
          filterable
          :disabled="locationLocked"
          :placeholder="t('product.inbound.locationPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="l in locationOptions" :key="String(l.value)" :label="l.label" :value="l.value" />
        </el-select>
        <span v-if="locationLocked" class="ml-2 text-gray-500">{{ t('product.inbound.locationLocked') }}</span>
      </el-form-item>
      <el-form-item :label="t('product.inbound.quantity')" prop="quantity">
        <el-input-number v-model="form.quantity" :precision="3" :min="0.001" :step="1" style="width: 100%" />
        <span v-if="productUnit" class="ml-2 text-gray-500">{{ productUnit }}</span>
      </el-form-item>
      <el-form-item :label="t('product.inbound.remark')">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('product.inbound.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { inboundProduct } from '@/api/djs-warehouse/product';
import type { ProductInboundForm } from '@/api/djs-warehouse/product/types';
import { listLocation } from '@/api/djs-warehouse/location';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

const productId = ref<number | string>('');
const productName = ref('');
const productUnit = ref('');
const locationOptions = ref<Array<{ label: string; value: string }>>([]);
// row118/119：产品配置了存储库位 → 入库锁定到该库位，下拉禁用不可改
const locationLocked = ref(false);

const defaultForm = (): { locationId: string; quantity: number | undefined; remark: string } => ({
  locationId: '',
  quantity: undefined,
  remark: ''
});
const form = ref(defaultForm());

const rules = computed(() => ({
  locationId: [{ required: true, message: t('product.inbound.locationRequired'), trigger: 'change' }],
  quantity: [{ required: true, message: t('product.inbound.quantityRequired'), trigger: 'blur' }]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

async function loadLocationOptions() {
  if (locationOptions.value.length > 0) return;
  try {
    const res = await listLocation({ pageNum: 1, pageSize: 500 } as any);
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string }>;
    locationOptions.value = rows.map((r) => ({ label: r.locationName, value: String(r.id) }));
  } catch (e) {
    console.warn('[ProductInbound] listLocation failed', e);
    locationOptions.value = [];
  }
}

const open = async (row: { id: number | string; productName?: string; productUnit?: string; storeLocationId?: number | string }) => {
  form.value = defaultForm();
  productId.value = row.id;
  productName.value = row.productName ?? '';
  productUnit.value = row.productUnit ?? '';
  // 配置了存储库位 → 预填并锁定，入库只能入该库位
  if (row.storeLocationId !== undefined && row.storeLocationId !== null && String(row.storeLocationId) !== '') {
    form.value.locationId = String(row.storeLocationId);
    locationLocked.value = true;
  } else {
    locationLocked.value = false;
  }
  visible.value = true;
  await loadLocationOptions();
};
defineExpose({ open });

const handleClosed = () => {
  formRef.value?.resetFields();
  form.value = defaultForm();
  locationLocked.value = false;
};

const submit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload: ProductInboundForm = {
        productId: productId.value,
        locationId: form.value.locationId,
        quantity: Number(form.value.quantity),
        remark: form.value.remark || undefined
      };
      await inboundProduct(payload);
      proxy?.$modal.msgSuccess(t('common.opSuccess'));
      visible.value = false;
      emit('success');
    } finally {
      submitting.value = false;
    }
  });
};
</script>
