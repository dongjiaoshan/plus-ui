<template>
  <el-dialog v-model="visible" :title="dialogTitle" destroy-on-close append-to-body width="760px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="t('demand.field.demandNo')">
            <el-input :value="demandNo" disabled :placeholder="t('demand.placeholder.demandNoAuto')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productType')">
            <el-tag size="default" :type="productTypeColor">{{ productTypeLabel }}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.demandDate')" prop="demandDate">
            <el-date-picker v-model="form.demandDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.expectedArriveDate')" prop="expectedArriveDate">
            <el-date-picker v-model="form.expectedArriveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.storeId')" prop="storeId">
            <el-select v-model="form.storeId" filterable :placeholder="t('demand.placeholder.storeId')" style="width: 100%">
              <el-option v-for="s in storeOptions" :key="String(s.id)" :label="s.storeName" :value="String(s.id)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productId')" prop="productId">
            <el-select
              v-model="form.productId"
              filterable
              :placeholder="t('demand.placeholder.productId')"
              style="width: 100%"
              @change="onProductSelect"
            >
              <el-option v-for="p in productOptions" :key="String(p.id)" :label="`${p.productName} (${p.productId})`" :value="String(p.id)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productName')" prop="productName">
            <el-input v-model="form.productName" maxlength="128" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productSpec')" prop="productSpec">
            <el-input v-model="form.productSpec" maxlength="64" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.demandQuantity')" prop="demandQuantity">
            <el-input-number
              v-model="form.demandQuantity"
              :precision="3"
              :min="0"
              :step="1"
              :placeholder="t('demand.placeholder.demandQuantity')"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productUnit')" prop="productUnit">
            <el-input v-model="form.productUnit" maxlength="16" :placeholder="t('demand.placeholder.productUnit')" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('demand.field.productionDestination')">
            <el-tag size="default" type="info">{{ productionDestination }}</el-tag>
          </el-form-item>
        </el-col>

        <!-- 白条 / 蔬菜：原材料 + 计算量 -->
        <template v-if="props.productType === 'white_bar' || props.productType === 'vegetable'">
          <el-col :span="12">
            <el-form-item :label="t('demand.field.rawMaterial')" prop="rawMaterial">
              <el-input v-model="form.rawMaterial" :placeholder="t('demand.placeholder.rawMaterial')" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('demand.field.materialQty')" prop="materialQty">
              <el-input-number v-model="form.materialQty" :precision="3" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </template>

        <el-col :span="24">
          <el-form-item :label="t('demand.field.demandRemark')" prop="demandRemark">
            <el-input v-model="form.demandRemark" type="textarea" :rows="2" maxlength="500" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('demand.field.demandExplain')" prop="demandExplain">
            <el-input
              v-model="form.demandExplain"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              :placeholder="t('demand.placeholder.demandExplain')"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { addDemand, getDemand, updateDemand } from '@/api/djs-warehouse/demand';
import type { DemandManageForm, DemandProductType } from '@/api/djs-warehouse/demand/types';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { listStore } from '@/api/djs-common/store';
import type { StoreVO } from '@/api/djs-common/store/types';

const props = defineProps<{ productType: DemandProductType }>();
const emit = defineEmits<{ (e: 'success'): void }>();

const { t } = useI18n();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const visible = ref(false);
const submitting = ref(false);
const editing = ref(false);
const demandNo = ref<string>('');

const formRef = ref();

const baseForm = (): DemandManageForm => ({
  demandDate: new Date().toISOString().slice(0, 10),
  storeId: '',
  productId: '',
  productName: '',
  productType: props.productType,
  demandQuantity: undefined as unknown as number,
  productUnit: ''
});
const form = reactive<DemandManageForm>(baseForm());

const storeOptions = ref<StoreVO[]>([]);
const productOptions = ref<ProductInfoVO[]>([]);

async function loadStoreOptions() {
  try {
    const res = await listStore({ pageNum: 1, pageSize: 200 });
    storeOptions.value = ((res as any).rows ?? (res as any).data ?? []) as StoreVO[];
  } catch (e) {
    console.warn('[DemandForm] loadStoreOptions failed', e);
    storeOptions.value = [];
  }
}

async function loadProductOptions() {
  try {
    // 按业态映射 belongType：white_bar / vegetable / gift_box 各取对应字典 key；other 不限定
    const belongType = props.productType === 'other' ? undefined : props.productType;
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType, productStatus: 0 });
    productOptions.value = ((res as any).rows ?? (res as any).data ?? []) as ProductInfoVO[];
  } catch (e) {
    console.warn('[DemandForm] loadProductOptions failed', e);
    productOptions.value = [];
  }
}

function onProductSelect(productSnowflakeId: string) {
  // productSnowflakeId 是 t_warehouse_product_info.id（snowflake，BIGINT 序列化成 string 避 JS 精度）；
  // 业务码 product_id（如 "P0001"）只用于下拉 label 显示，后端 demand.product_id FK 走 snowflake。
  const p = productOptions.value.find((x) => String(x.id) === productSnowflakeId);
  if (!p) return;
  form.productName = p.productName;
  form.productUnit = p.productUnit ?? '';
  form.productSpec = p.productSpec ?? '';
  if (!form.rawMaterial && (p as any).productMaterial) {
    form.rawMaterial = String((p as any).productMaterial);
  }
}

const productTypeLabel = computed(() => {
  switch (props.productType) {
    case 'white_bar':
      return t('demand.productType.white_bar');
    case 'vegetable':
      return t('demand.productType.vegetable');
    case 'gift_box':
      return t('demand.productType.gift_box');
    case 'other':
      return t('demand.productType.other');
    default:
      return props.productType;
  }
});
// 排产去向：按业态派生（doc/02 §需求拆解 line 680-686 定义），DB 无字段，service 层 confirm 时按 product_type 走业务前置校验
const productionDestination = computed(() => {
  switch (props.productType) {
    case 'white_bar':
      return t('demand.productionDestination.white_bar'); // 分割间 + 肉品打包间
    case 'vegetable':
      return t('demand.productionDestination.vegetable'); // 菜品打包间
    case 'gift_box':
      return t('demand.productionDestination.gift_box'); // 礼盒打包
    case 'other':
      return t('demand.productionDestination.other'); // 其他产品打包
    default:
      return '—';
  }
});

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
const dialogTitle = computed(() => (editing.value ? t('demand.form.editTitle') : t('demand.form.addTitle')));

const rules = computed(() => ({
  demandDate: [{ required: true, message: t('demand.field.demandDate.required'), trigger: 'change' }],
  storeId: [{ required: true, message: t('demand.field.storeId.required'), trigger: 'blur' }],
  productId: [{ required: true, message: t('demand.field.productId.required'), trigger: 'blur' }],
  productName: [{ required: true, message: t('demand.field.productName.required'), trigger: 'blur' }],
  demandQuantity: [{ required: true, message: t('demand.field.demandQuantity.required'), trigger: 'change' }],
  productUnit: [{ required: true, message: t('demand.field.productUnit.required'), trigger: 'blur' }]
}));

function reset() {
  editing.value = false;
  demandNo.value = '';
  Object.assign(form, baseForm());
  formRef.value?.clearValidate?.();
}

async function openCreate() {
  reset();
  await Promise.all([loadStoreOptions(), loadProductOptions()]);
  visible.value = true;
}

async function openEdit(id: string) {
  reset();
  editing.value = true;
  await Promise.all([loadStoreOptions(), loadProductOptions()]);
  const res = await getDemand(id);
  const detail = (res as any).data;
  if (!detail) {
    proxy?.$modal.msgError(t('demand.not_found_msg'));
    return;
  }
  Object.assign(form, {
    id: detail.id,
    demandDate: detail.demandDate,
    storeId: detail.storeId,
    productId: detail.productId,
    productName: detail.productName,
    productType: detail.productType,
    productSpec: detail.productSpec,
    demandQuantity: Number(detail.demandQuantity),
    productUnit: detail.productUnit,
    rawMaterial: detail.rawMaterial,
    materialQty: detail.materialQty != null ? Number(detail.materialQty) : undefined,
    demandRemark: detail.demandRemark,
    demandExplain: detail.demandExplain,
    expectedArriveDate: detail.expectedArriveDate,
    remark: detail.remark
  });
  demandNo.value = detail.demandNo;
  visible.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (editing.value && form.id) {
      await updateDemand(form);
    } else {
      await addDemand(form);
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

defineExpose({ openCreate, openEdit });
</script>
