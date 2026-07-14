<template>
  <el-dialog v-model="visible" :title="t('product.inbound.title')" destroy-on-close append-to-body width="520px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('product.inbound.product')">
        <el-input :model-value="productName" disabled />
      </el-form-item>
      <!-- row23：采购入库展示供应商（取自商品配置，只读固定不可改） -->
      <el-form-item v-if="purchaseInContext" :label="t('product.inbound.supplier')">
        <el-input :model-value="supplierName || '-'" disabled />
      </el-form-item>
      <el-form-item :label="t('product.inbound.location')" prop="locationId">
        <el-select
          v-model="form.locationId"
          filterable
          :disabled="locationLocked"
          :placeholder="t('product.inbound.locationPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="l in displayLocationOptions" :key="String(l.value)" :label="l.label" :value="l.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="quantityLabel" prop="quantity">
        <el-input-number v-model="form.quantity" :precision="3" :min="0.001" :step="1" style="width: 100%" />
        <span v-if="productUnit && !hideUnit" class="ml-2 text-gray-500">{{ productUnit }}</span>
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

/**
 * 页面隔离 prop（feedback_shared_component_page_isolation）：
 * - hideUnit：入库量后不显单位（采购入库页传 true；商品配置入口不传 → 默认 false，保持原状）。
 * - quantityLabel：入库量 label 覆盖（采购入库页传「入库量」；不传 → 默认「入库数量」）。
 * - purchaseInContext：采购入库场景 → 启用库位类型过滤 + 排除自产产成品库 + 提交回写 store_location_id；
 *   不传 → 默认 false，商品配置入口行为零变化。
 * - buyClass：商品分类，决定库位类型默认值（仅采购入库场景生效）。
 */
const props = withDefaults(defineProps<{ hideUnit?: boolean; quantityLabel?: string; purchaseInContext?: boolean; buyClass?: string }>(), {
  hideUnit: false,
  quantityLabel: '',
  purchaseInContext: false,
  buyClass: ''
});

const visible = ref(false);
const { hideUnit } = toRefs(props);
const quantityLabel = computed(() => props.quantityLabel || t('product.inbound.quantity'));
const submitting = ref(false);
const formRef = ref<ElFormInstance>();

// 自产产成品库类型：采购入库不入这些库
const PRODUCE_LOCATION_TYPES = ['white_bar', 'frozen', 'veg_fresh', 'veg_heavy', 'xian_pin'];

const productId = ref<number | string>('');
const productName = ref('');
const productUnit = ref('');
/** 供应商名称（row23：采购入库只读展示，取自商品配置） */
const supplierName = ref('');
const locationOptions = ref<Array<{ label: string; value: string; locationType?: string }>>([]);
// row118/119：产品配置了存储库位 → 入库锁定到该库位，下拉禁用不可改
const locationLocked = ref(false);

/** 实际渲染的库位下拉：商品配置入口原样；锁定时原样（保证已配库位能渲染）；采购入库未锁定时排除自产产成品库 */
const displayLocationOptions = computed(() => {
  if (!props.purchaseInContext || locationLocked.value) return locationOptions.value;
  return locationOptions.value.filter((l) => {
    const lt = l.locationType ?? '';
    return !PRODUCE_LOCATION_TYPES.includes(lt);
  });
});

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
    const rows = (res.rows ?? res.data ?? []) as Array<{ id: number | string; locationName: string; locationType?: string }>;
    locationOptions.value = rows.map((r) => ({ label: r.locationName, value: String(r.id), locationType: r.locationType ?? '' }));
  } catch (e) {
    console.warn('[ProductInbound] listLocation failed', e);
    locationOptions.value = [];
  }
}

const open = async (row: {
  id: number | string;
  productName?: string;
  productUnit?: string;
  storeLocationId?: number | string;
  buyClass?: string;
  supplierName?: string;
}) => {
  form.value = defaultForm();
  productId.value = row.id;
  productName.value = row.productName ?? '';
  productUnit.value = row.productUnit ?? '';
  supplierName.value = row.supplierName ?? '';
  // 配置了存储库位 → 预填并锁定，入库只能入该库位（多库位 CSV 取首个有效库位，避免整串当 locationId 提交）
  const configuredLoc = String(row.storeLocationId ?? '').split(',')[0].trim();
  if (configuredLoc !== '') {
    form.value.locationId = configuredLoc;
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
  supplierName.value = '';
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
        remark: form.value.remark || undefined,
        autoConfigLocation: props.purchaseInContext || undefined
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
