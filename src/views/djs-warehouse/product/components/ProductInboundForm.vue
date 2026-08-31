<template>
  <el-dialog v-model="visible" :title="t('product.inbound.title')" destroy-on-close append-to-body width="520px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('product.inbound.product')">
        <el-input :model-value="productName" disabled />
      </el-form-item>
      <!-- row141：供应商改为按本次到货实际选择（原 row23 是只读展示商品配置里那一个）。
           默认预选商品配置的供应商，可改；改了只影响这一笔入库流水，不回写商品配置。 -->
      <el-form-item v-if="purchaseInContext" :label="t('product.inbound.supplier')">
        <!-- 不给 clearable：清空态没法表达成「本次没有供应商」——
             提交时空值会被后端当作「没传」而回落商品配置那个供应商，
             于是界面显示空、追溯记录里却挂着一个供应商，操作员看到的和落库的对不上。
             甲方要的是「根据实际进行选择」，清空不是一个有意义的操作。 -->
        <el-select
          v-model="form.supplierId"
          filterable
          :placeholder="t('product.inbound.supplierPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="sp in supplierOptions" :key="sp.value" :label="sp.label" :value="sp.value" />
        </el-select>
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
      <!-- row141：库位下面补「商品单位」，只读 —— 它决定下面入库量能不能填小数，摆出来用户才知道为什么 -->
      <el-form-item v-if="purchaseInContext" :label="t('product.inbound.unit')">
        <el-input :model-value="productUnit || '-'" disabled />
      </el-form-item>
      <el-form-item :label="quantityLabel" prop="quantity">
        <!-- row141：kg 类单位保留三位小数（超出部分按「保留三位」截断，符合甲方原话）；
             非 kg 单位**不设 precision** —— el-input-number 的 precision=0 会把 1.6 静默四舍五入成 2，
             用户想入 1 瓶结果入了 2 瓶且毫无提示。改成不动用户输入、由下面的校验规则明确报错。
             后端 assertQuantityScale 同口径兜底。 -->
        <el-input-number
          v-model="form.quantity"
          :precision="quantityPrecision"
          :min="quantityMin"
          :step="quantityStep"
          style="width: 100%"
        />
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
import { listSupplier } from '@/api/djs-common/supplier';
import { isCountingUnit } from '@/utils/weight';
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
/** 供应商下拉项（row141：采购入库按本次实际到货选，默认预选商品配置那一个） */
const supplierOptions = ref<Array<{ label: string; value: string }>>([]);
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

const defaultForm = (): { locationId: string; quantity: number | undefined; remark: string; supplierId: string } => ({
  locationId: '',
  quantity: undefined,
  remark: '',
  supplierId: ''
});
const form = ref(defaultForm());

// row141：入库量输入口径随商品单位分流，与后端 assertQuantityScale 同一套规则。
// 计数类单位（瓶/袋/盒/个…）只能整数；计量类单位（kg/吨/升/斤/米…）给 precision=3
// （甲方原话「保留三位小数」，截断是它的字面意思）。
// 计数类**故意不给 precision** —— precision=0 会把 1.6 静默四舍五入成 2，
// 「想入 1 瓶变成入 2 瓶」比报个错严重得多。非整数交给下面 rules 明确拒绝。
const quantityPrecision = computed(() => (isCountingUnit(productUnit.value) ? undefined : 3));
const quantityStep = computed(() => (isCountingUnit(productUnit.value) ? 1 : 0.1));
const quantityMin = computed(() => (isCountingUnit(productUnit.value) ? 1 : 0.001));

const rules = computed(() => ({
  locationId: [{ required: true, message: t('product.inbound.locationRequired'), trigger: 'change' }],
  quantity: [
    { required: true, message: t('product.inbound.quantityRequired'), trigger: 'blur' },
    {
      // row141：计数类单位只能整数 —— 明确报错而不是把用户填的数悄悄改掉
      validator: (_r: unknown, value: number | undefined, cb: (e?: Error) => void) => {
        if (value == null || Number.isNaN(Number(value))) return cb();
        if (isCountingUnit(productUnit.value) && !Number.isInteger(Number(value))) {
          return cb(new Error(t('product.inbound.quantityIntegerOnly', { unit: productUnit.value || '-' })));
        }
        cb();
      },
      trigger: 'blur'
    }
  ]
}));

const emit = defineEmits<{ (e: 'success'): void }>();

async function loadSupplierOptions() {
  if (supplierOptions.value.length > 0) return;
  try {
    const res = await listSupplier({ pageNum: 1, pageSize: 500 } as any);
    const rows = ((res as any).rows ?? (res as any).data ?? []) as Array<{ id: number | string; supplierName: string }>;
    supplierOptions.value = rows.map((r) => ({ label: r.supplierName, value: String(r.id) }));
  } catch (e) {
    console.warn('[ProductInbound] listSupplier failed', e);
    supplierOptions.value = [];
  }
}

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
  supplierId?: number | string;
  supplierName?: string;
}) => {
  form.value = defaultForm();
  productId.value = row.id;
  productName.value = row.productName ?? '';
  productUnit.value = row.productUnit ?? '';
  // 预选商品配置上的供应商；没配就留空让用户自己选
  form.value.supplierId = row.supplierId != null && String(row.supplierId) !== '' ? String(row.supplierId) : '';
  // 配置了存储库位 → 预填并锁定，入库只能入该库位（多库位 CSV 取首个有效库位，避免整串当 locationId 提交）
  const configuredLoc = String(row.storeLocationId ?? '').split(',')[0].trim();
  if (configuredLoc !== '') {
    form.value.locationId = configuredLoc;
    locationLocked.value = true;
  } else {
    locationLocked.value = false;
  }
  visible.value = true;
  await Promise.all([loadLocationOptions(), props.purchaseInContext ? loadSupplierOptions() : Promise.resolve()]);
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
        remark: form.value.remark || undefined,
        // row141：本次到货的供应商；不传则后端回落商品配置快照（商品配置入口老行为不变）
        supplierId: props.purchaseInContext && form.value.supplierId ? form.value.supplierId : undefined,
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
