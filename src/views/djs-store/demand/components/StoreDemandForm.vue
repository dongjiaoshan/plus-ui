<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="720px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" :disabled="readonly">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.demandNo')">
            <el-input :value="demandNo" disabled :placeholder="t('storeDemand.placeholder.demandNoAuto')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.productType')">
            <el-tag size="default" :type="productTypeColor">{{ t(`storeDemand.productType.${props.productType}`) }}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.demandDate')" prop="demandDate">
            <el-date-picker v-model="form.demandDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.expectedArriveDate')" prop="expectedArriveDate">
            <el-date-picker v-model="form.expectedArriveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.storeId')" prop="storeId">
            <el-select v-model="form.storeId" filterable :placeholder="t('storeDemand.placeholder.storeId')" style="width: 100%">
              <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.productId')" prop="productId">
            <el-select
              v-model="form.productId"
              filterable
              :placeholder="t('storeDemand.placeholder.productId')"
              style="width: 100%"
              @change="onProductSelect"
            >
              <el-option v-for="p in productOptions" :key="String(p.id)" :label="p.productName" :value="String(p.id)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.productName')" prop="productName">
            <el-input v-model="form.productName" maxlength="128" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.productSpec')" prop="productSpec">
            <el-input v-model="form.productSpec" maxlength="64" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.demandQuantity')" prop="demandQuantity">
            <el-input-number
              v-model="form.demandQuantity"
              :precision="3"
              :min="0"
              :step="1"
              :placeholder="t('storeDemand.placeholder.demandQuantity')"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('storeDemand.field.productUnit')" prop="productUnit">
            <el-input v-model="form.productUnit" maxlength="16" :placeholder="t('storeDemand.placeholder.productUnit')" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="t('storeDemand.field.demandRemark')" prop="demandRemark">
            <el-input v-model="form.demandRemark" type="textarea" :rows="3" maxlength="500" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ readonly ? t('common.close') : t('common.cancel') }}</el-button>
      <el-button v-if="!readonly" type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { addStoreDemand, getStoreDemand, updateStoreDemand } from '@/api/djs-store/demand';
import type { StoreDemandForm, StoreDemandProductType } from '@/api/djs-store/demand/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';

const props = defineProps<{ productType: StoreDemandProductType; defaultStoreId?: string }>();
const emit = defineEmits<{ (e: 'success'): void }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const editing = ref(false);
const readonly = ref(false);
const demandNo = ref<string>('');

const formRef = ref();

const baseForm = (): StoreDemandForm => ({
  demandDate: new Date().toISOString().slice(0, 10),
  storeId: props.defaultStoreId ?? '',
  productId: '',
  productName: '',
  productType: props.productType,
  demandQuantity: undefined as unknown as number,
  productUnit: ''
});
const form = reactive<StoreDemandForm>(baseForm());

const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as unknown as { rows?: StoreVO[] }).rows ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[StoreDemandForm] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadProductOptions() {
  try {
    const belongType = props.productType === 'other' ? undefined : props.productType;
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType, productStatus: 0 });
    productOptions.value = ((res as unknown as { rows?: ProductInfoVO[] }).rows ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[StoreDemandForm] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

function onProductSelect(productSnowflakeId: string) {
  const p = productOptions.value.find((x) => String(x.id) === productSnowflakeId);
  if (!p) return;
  form.productName = p.productName;
  form.productUnit = p.productUnit ?? '';
  form.productSpec = p.productSpec ?? '';
}

const productTypeColor = computed(() => {
  switch (props.productType) {
    case 'white_bar':
      return 'danger';
    case 'vegetable':
      return 'success';
    case 'gift_box':
      return 'warning';
    default:
      return 'info';
  }
});
const dialogTitle = computed(() => {
  if (readonly.value) return t('storeDemand.form.detailTitle');
  return editing.value ? t('storeDemand.form.editTitle') : t('storeDemand.form.addTitle');
});

const rules = computed(() => ({
  demandDate: [{ required: true, message: t('storeDemand.field.demandDate.required'), trigger: 'change' }],
  storeId: [{ required: true, message: t('storeDemand.field.storeId.required'), trigger: 'blur' }],
  productId: [{ required: true, message: t('storeDemand.field.productId.required'), trigger: 'blur' }],
  productName: [{ required: true, message: t('storeDemand.field.productName.required'), trigger: 'blur' }],
  demandQuantity: [{ required: true, message: t('storeDemand.field.demandQuantity.required'), trigger: 'change' }],
  productUnit: [{ required: true, message: t('storeDemand.field.productUnit.required'), trigger: 'blur' }]
}));

function reset() {
  editing.value = false;
  readonly.value = false;
  demandNo.value = '';
  Object.assign(form, baseForm());
  formRef.value?.clearValidate?.();
}

async function openCreate() {
  reset();
  await Promise.all([loadStoreOptions(), loadProductOptions()]);
  visible.value = true;
}

async function loadDetail(id: string) {
  await Promise.all([loadStoreOptions(), loadProductOptions()]);
  const res = await getStoreDemand(id);
  const detail = (res as unknown as { data?: Record<string, unknown> }).data;
  if (!detail) {
    proxy?.$modal.msgError(t('storeDemand.not_found_msg'));
    return false;
  }
  Object.assign(form, {
    id: detail.id,
    demandDate: detail.demandDate,
    storeId: detail.storeId,
    productId: detail.productId,
    productName: detail.productName,
    productType: detail.productType,
    productSpec: detail.productSpec,
    demandQuantity: detail.demandQuantity != null ? Number(detail.demandQuantity) : undefined,
    productUnit: detail.productUnit,
    demandRemark: detail.demandRemark,
    expectedArriveDate: detail.expectedArriveDate,
    remark: detail.remark
  });
  demandNo.value = String(detail.demandNo ?? '');
  return true;
}

async function openEdit(id: string) {
  reset();
  editing.value = true;
  if (await loadDetail(id)) visible.value = true;
}

async function openDetail(id: string) {
  reset();
  readonly.value = true;
  if (await loadDetail(id)) visible.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (editing.value && form.id) {
      await updateStoreDemand(form);
    } else {
      await addStoreDemand(form);
    }
    proxy?.$modal.msgSuccess(t('common.opSuccess'));
    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

function handleClosed() {
  reset();
}

defineExpose({ openCreate, openEdit, openDetail });
</script>
