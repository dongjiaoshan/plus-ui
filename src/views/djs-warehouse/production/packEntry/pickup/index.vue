<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="px-2">
      <!-- 出库位置 = 分割车间：白条领用进分割（pickup） -->
      <el-tab-pane :label="t('djs.warehouse.packEntry.pickupToCut')" name="cut">
        <el-card shadow="never" class="pack-card">
          <el-form ref="pickupRef" :model="pickupForm" :rules="pickupRules" label-width="120px" class="max-w-3xl">
            <el-form-item :label="t('djs.warehouse.packEntry.bar')" prop="barInfoId">
              <el-select
                v-model="pickupForm.barInfoId"
                filterable
                clearable
                :loading="barLoading"
                :placeholder="t('djs.warehouse.packEntry.barPlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="b in bars"
                  :key="String(b.id)"
                  :label="`${b.barId} / 耳号 ${b.earNo ?? '-'} / 入库重 ${b.inWeight ?? '-'}kg`"
                  :value="b.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.cutWorkshop')" prop="locationId">
              <el-select
                v-model="pickupForm.locationId"
                filterable
                clearable
                :loading="locationLoading"
                :placeholder="t('djs.warehouse.packEntry.locationPlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="l in locations" :key="String(l.id)" :label="`${l.locationCode} - ${l.locationName}`" :value="l.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.isHalf')" prop="isHalf">
              <el-radio-group v-model="pickupForm.isHalf">
                <el-radio :value="2">{{ t('djs.warehouse.packEntry.whole') }}</el-radio>
                <el-radio :value="1">{{ t('djs.warehouse.packEntry.half') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.store')" prop="targetStoreId">
              <el-select
                v-model="pickupForm.targetStoreId"
                filterable
                clearable
                :loading="storeLoading"
                :placeholder="t('djs.warehouse.packEntry.storePlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="s in stores" :key="String(s.id)" :label="s.storeName" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
              <el-input v-model="pickupForm.remark" type="textarea" :rows="2" maxlength="500" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="pickupSubmitting" @click="handlePickup">
                {{ t('djs.warehouse.packEntry.confirmPickup') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 出库位置 = 发货月台：白条/猪肉发货领用（whiteBarOut） -->
      <el-tab-pane :label="t('djs.warehouse.packEntry.pickupToShip')" name="ship">
        <el-card shadow="never" class="pack-card">
          <el-form ref="shipRef" :model="shipForm" :rules="shipRules" label-width="120px" class="max-w-3xl">
            <el-form-item :label="t('djs.warehouse.packEntry.source')" prop="sourceInhouseId">
              <el-select
                v-model="shipForm.sourceInhouseId"
                filterable
                clearable
                :loading="sourceLoading"
                :placeholder="t('djs.warehouse.packEntry.sourcePlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="s in sources"
                  :key="String(s.id)"
                  :label="`${s.productName} / 耳号 ${s.earNo ?? '-'} / 剩余 ${s.productWeight}${s.productUnit || 'kg'}`"
                  :value="s.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.productWeight')" prop="productWeight">
              <el-input-number
                v-model="shipForm.productWeight"
                :min="0.001"
                :precision="3"
                :step="1"
                controls-position="right"
                style="width: 220px"
              />
              <span class="ml-2 text-gray-500">kg</span>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.store')" prop="storeId">
              <el-select
                v-model="shipForm.storeId"
                filterable
                clearable
                :loading="storeLoading"
                :placeholder="t('djs.warehouse.packEntry.storePlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="s in stores" :key="String(s.id)" :label="s.storeName" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.proof')">
              <OssUpload ref="ossRef" v-model="shipProofModel" biz-type="warehouse_pack_proof" :limit="5" :file-size="10" />
            </el-form-item>
            <el-form-item :label="t('djs.warehouse.packEntry.remark')" prop="remark">
              <el-input v-model="shipForm.remark" type="textarea" :rows="2" maxlength="500" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="shipSubmitting" @click="handleWhiteBarOut">
                {{ t('djs.warehouse.packEntry.confirmShipOut') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="PackEntryPickup" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import OssUpload from '@/components/OssUpload/index.vue';
import { usePackEntryOptions } from '../useOptions';
import { submitPickup, submitWhiteBarOut } from '@/api/djs-warehouse/packEntry';

const { t } = useI18n();

const {
  locations,
  locationLoading,
  stores,
  storeLoading,
  sources,
  sourceLoading,
  bars,
  barLoading,
  loadLocations,
  loadStores,
  loadSources,
  loadBars
} = usePackEntryOptions();

const activeTab = ref('cut');

// ---- 领用到分割车间（pickup） ----
const pickupRef = ref<any>();
const pickupSubmitting = ref(false);
const pickupDefault = () => ({
  barInfoId: '' as number | string | '',
  locationId: '' as number | string | '',
  isHalf: 2 as number,
  targetStoreId: '' as number | string | '',
  remark: undefined as string | undefined
});
const pickupForm = ref(pickupDefault());

const pickupRules = computed(() => ({
  barInfoId: [{ required: true, message: t('djs.warehouse.packEntry.barRequired'), trigger: 'change' }],
  locationId: [{ required: true, message: t('djs.warehouse.packEntry.locationRequired'), trigger: 'change' }]
}));

async function handlePickup() {
  if (!pickupRef.value) return;
  await pickupRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    pickupSubmitting.value = true;
    try {
      await submitPickup({
        barInfoId: pickupForm.value.barInfoId as number | string,
        locationId: pickupForm.value.locationId as number | string,
        isHalf: pickupForm.value.isHalf,
        targetStoreId: pickupForm.value.targetStoreId || undefined,
        remark: pickupForm.value.remark
      });
      ElMessage.success(t('djs.warehouse.packEntry.pickupSuccess'));
      pickupForm.value = pickupDefault();
      await loadBars();
    } finally {
      pickupSubmitting.value = false;
    }
  });
}

// ---- 发货领用（whiteBarOut） ----
const shipRef = ref<any>();
const ossRef = ref<InstanceType<typeof OssUpload>>();
const shipSubmitting = ref(false);
const shipDefault = () => ({
  sourceInhouseId: '' as number | string | '',
  productWeight: undefined as number | undefined,
  storeId: '' as number | string | '',
  proofOssIds: undefined as string | undefined,
  remark: undefined as string | undefined
});
const shipForm = ref(shipDefault());

const shipProofModel = computed<string[]>({
  get: () => (shipForm.value.proofOssIds ? shipForm.value.proofOssIds.split(',').filter(Boolean) : []),
  set: (val: string[]) => {
    shipForm.value.proofOssIds = val && val.length > 0 ? val.join(',') : undefined;
  }
});

const shipRules = computed(() => ({
  sourceInhouseId: [{ required: true, message: t('djs.warehouse.packEntry.sourceRequired'), trigger: 'change' }],
  productWeight: [{ required: true, message: t('djs.warehouse.packEntry.productWeightRequired'), trigger: 'blur' }]
}));

async function handleWhiteBarOut() {
  if (!shipRef.value) return;
  await shipRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    shipSubmitting.value = true;
    try {
      await submitWhiteBarOut({
        sourceInhouseId: shipForm.value.sourceInhouseId as number | string,
        productWeight: shipForm.value.productWeight as number,
        storeId: shipForm.value.storeId || undefined,
        proofOssIds: shipForm.value.proofOssIds,
        remark: shipForm.value.remark
      });
      ElMessage.success(t('djs.warehouse.packEntry.shipOutSuccess'));
      shipForm.value = shipDefault();
      ossRef.value?.setExistingFiles?.([]);
      await loadSources('whiteBar');
    } finally {
      shipSubmitting.value = false;
    }
  });
}

onMounted(async () => {
  await Promise.all([loadLocations(), loadStores(), loadBars(), loadSources('whiteBar')]);
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
