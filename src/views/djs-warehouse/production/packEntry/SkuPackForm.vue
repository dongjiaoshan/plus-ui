<template>
  <el-card shadow="never" class="pack-card">
    <template #header>
      <span class="font-bold">{{ title }}</span>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="max-w-3xl">
      <!-- 来源过程产品（果蔬=地块来源 / 肉品=白条耳号来源 / 其他=过程产品来源） -->
      <el-form-item v-if="kind !== 'gift'" :label="sourceLabel" prop="sourceInhouseId">
        <el-select
          v-model="form.sourceInhouseId"
          filterable
          clearable
          :loading="sourceLoading"
          :placeholder="t('djs.warehouse.packEntry.sourcePlaceholder')"
          style="width: 100%"
          @change="onSourceChange"
        >
          <el-option v-for="s in sources" :key="String(s.id)" :label="sourceOptionLabel(s)" :value="s.id" />
        </el-select>
      </el-form-item>

      <!-- 目标产品 SKU（果蔬/肉品/其他=普通 SKU；礼盒=礼盒 SKU） -->
      <el-form-item :label="kind === 'gift' ? t('djs.warehouse.packEntry.giftBox') : t('djs.warehouse.packEntry.targetProduct')" prop="productId">
        <el-select
          v-model="form.productId"
          filterable
          clearable
          :loading="productLoading"
          :placeholder="t('djs.warehouse.packEntry.targetProductPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="p in products" :key="String(p.id)" :label="`${p.productId} - ${p.productName}`" :value="p.id" />
        </el-select>
      </el-form-item>

      <!-- 重量（普通打包）/ 盒数（礼盒） -->
      <el-form-item v-if="kind === 'gift'" :label="t('djs.warehouse.packEntry.packBoxCount')" prop="packBoxCount">
        <el-input-number v-model="form.packBoxCount" :min="1" :precision="0" :step="1" controls-position="right" style="width: 220px" />
        <span class="ml-2 text-gray-500">{{ t('djs.warehouse.packEntry.box') }}</span>
      </el-form-item>
      <el-form-item v-else :label="t('djs.warehouse.packEntry.productWeight')" prop="productWeight">
        <el-input-number v-model="form.productWeight" :min="0.001" :precision="3" :step="1" controls-position="right" style="width: 220px" />
        <span class="ml-2 text-gray-500">{{ selectedUnit }}</span>
      </el-form-item>

      <!-- 单位（仅肉品/其他打包需手填 kg/个；果蔬固定 kg） -->
      <el-form-item v-if="kind === 'dry'" :label="t('djs.warehouse.packEntry.productUnit')" prop="productUnit">
        <el-radio-group v-model="form.productUnit">
          <el-radio value="kg">kg</el-radio>
          <el-radio value="个">{{ t('djs.warehouse.packEntry.unitPiece') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 规格（可选） -->
      <el-form-item v-if="kind !== 'gift'" :label="t('djs.warehouse.packEntry.productSpec')" prop="productSpec">
        <el-input v-model="form.productSpec" maxlength="64" :placeholder="t('djs.warehouse.packEntry.productSpecPlaceholder')" style="width: 220px" />
      </el-form-item>

      <!-- 入库库位 -->
      <el-form-item :label="t('djs.warehouse.packEntry.location')" prop="locationId">
        <el-select
          v-model="form.locationId"
          filterable
          clearable
          :loading="locationLoading"
          :placeholder="t('djs.warehouse.packEntry.locationPlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="l in locations" :key="String(l.id)" :label="`${l.locationCode} - ${l.locationName}`" :value="l.id" />
        </el-select>
      </el-form-item>

      <!-- 发送位置 / 需求门店 -->
      <el-form-item :label="t('djs.warehouse.packEntry.store')" prop="storeId">
        <el-select
          v-model="form.storeId"
          filterable
          clearable
          :loading="storeLoading"
          :placeholder="t('djs.warehouse.packEntry.storePlaceholder')"
          style="width: 100%"
        >
          <el-option v-for="s in stores" :key="String(s.id)" :label="s.storeName" :value="s.id" />
        </el-select>
      </el-form-item>

      <!-- 凭证图 -->
      <el-form-item :label="t('djs.warehouse.packEntry.proof')">
        <OssUpload ref="ossRef" v-model="proofModel" biz-type="warehouse_pack_proof" :limit="5" :file-size="10" />
      </el-form-item>

      <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
        <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import OssUpload from '@/components/OssUpload/index.vue';
import { usePackEntryOptions } from './useOptions';
import { submitDryPack, submitGiftPack, submitVegPack } from '@/api/djs-warehouse/packEntry';
import type { DryPackBo, GiftPackBo, PackSourceVO, VegPackBo } from '@/api/djs-warehouse/packEntry';

/**
 * SKU 打包共享表单（A5）。
 *
 * 三业态共用：
 *   kind='dry'  肉品打包 / 其他产品打包（来源过程产品 → 目标 SKU + 单位 kg/个）
 *   kind='veg'  果蔬打包（地块来源蔬菜 → 目标蔬菜 SKU，单位固定 kg）
 *   kind='gift' 礼盒打包（仅选礼盒 SKU + 盒数，service 自动按组件清单扣减）
 */
const props = defineProps<{
  kind: 'dry' | 'veg' | 'gift';
  title: string;
  /** 目标产品 productType 过滤：dry/veg=1 产品；gift=3 礼盒 */
  productType: number;
}>();

const { t } = useI18n();

const {
  products,
  productLoading,
  locations,
  locationLoading,
  stores,
  storeLoading,
  sources,
  sourceLoading,
  loadProducts,
  loadLocations,
  loadStores,
  loadSources
} = usePackEntryOptions();

const formRef = ref<any>();
const ossRef = ref<InstanceType<typeof OssUpload>>();
const submitting = ref(false);

interface PackFormShape {
  sourceInhouseId: number | string | '';
  productId: number | string | '';
  productWeight: number | undefined;
  packBoxCount: number | undefined;
  productUnit: string;
  productSpec: string | undefined;
  locationId: number | string | '';
  storeId: number | string | '';
  proofOssIds: string | undefined;
  remark: string | undefined;
}

const defaultForm = (): PackFormShape => ({
  sourceInhouseId: '',
  productId: '',
  productWeight: undefined,
  packBoxCount: undefined,
  productUnit: 'kg',
  productSpec: undefined,
  locationId: '',
  storeId: '',
  proofOssIds: undefined,
  remark: undefined
});

const form = ref<PackFormShape>(defaultForm());

const proofModel = computed<string[]>({
  get: () => (form.value.proofOssIds ? form.value.proofOssIds.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    form.value.proofOssIds = val && val.length > 0 ? val.join(',') : undefined;
  }
});

const sourceLabel = computed(() => (props.kind === 'veg' ? t('djs.warehouse.packEntry.sourceVeg') : t('djs.warehouse.packEntry.source')));

const selectedUnit = computed<string>(() => {
  if (props.kind === 'veg') return 'kg';
  return form.value.productUnit || 'kg';
});

function sourceOptionLabel(s: PackSourceVO): string {
  const parts: string[] = [s.productName];
  if (s.earNo) parts.push(`耳号 ${s.earNo}`);
  if (s.plotId) parts.push(`地块 ${s.plotId}`);
  parts.push(`剩余 ${s.productWeight}${s.productUnit || 'kg'}`);
  return parts.join(' / ');
}

function onSourceChange() {
  // 来源带规格时回填规格，方便录入
  const src = sources.value.find((x) => String(x.id) === String(form.value.sourceInhouseId));
  if (src?.productSpec && !form.value.productSpec) {
    form.value.productSpec = src.productSpec;
  }
}

const rules = computed(() => {
  const base: Record<string, any> = {
    productId: [{ required: true, message: t('djs.warehouse.packEntry.targetProductRequired'), trigger: 'change' }],
    locationId: [{ required: true, message: t('djs.warehouse.packEntry.locationRequired'), trigger: 'change' }]
  };
  if (props.kind === 'gift') {
    base.packBoxCount = [{ required: true, message: t('djs.warehouse.packEntry.packBoxCountRequired'), trigger: 'blur' }];
  } else {
    base.sourceInhouseId = [{ required: true, message: t('djs.warehouse.packEntry.sourceRequired'), trigger: 'change' }];
    base.productWeight = [{ required: true, message: t('djs.warehouse.packEntry.productWeightRequired'), trigger: 'blur' }];
    if (props.kind === 'dry') {
      base.productUnit = [{ required: true, message: t('djs.warehouse.packEntry.productUnitRequired'), trigger: 'change' }];
    }
  }
  return base;
});

function handleReset() {
  form.value = defaultForm();
  ossRef.value?.setExistingFiles?.([]);
  formRef.value?.clearValidate?.();
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (props.kind === 'gift') {
        const bo: GiftPackBo = {
          giftBoxProductId: form.value.productId as number | string,
          packBoxCount: form.value.packBoxCount as number,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        await submitGiftPack(bo);
      } else if (props.kind === 'veg') {
        const bo: VegPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: form.value.productWeight as number,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          productSpec: form.value.productSpec,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        await submitVegPack(bo);
      } else {
        const bo: DryPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: form.value.productWeight as number,
          productUnit: form.value.productUnit,
          locationId: form.value.locationId as number | string,
          storeId: form.value.storeId || undefined,
          productSpec: form.value.productSpec,
          proofOssIds: form.value.proofOssIds,
          remark: form.value.remark
        };
        await submitDryPack(bo);
      }
      ElMessage.success(t('djs.warehouse.packEntry.submitSuccess'));
      handleReset();
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(async () => {
  await Promise.all([loadProducts(props.productType), loadLocations(), loadStores()]);
  if (props.kind === 'veg') await loadSources('veg');
  else if (props.kind === 'dry') await loadSources('dry');
});
</script>

<style scoped>
.pack-card {
  margin: 8px;
}
.max-w-3xl {
  max-width: 720px;
}
</style>
