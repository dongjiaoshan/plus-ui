<template>
  <div class="p-2">
    <el-tabs v-model="activeTab" class="px-2">
      <!-- 出库位置 = 分割车间：白条领用进分割（pickup） -->
      <el-tab-pane :label="t('djs.warehouse.packEntry.pickupToCut')" name="cut">
        <div class="pack-station">
          <div class="station-title">{{ t('djs.warehouse.packEntry.pickupToCut') }}</div>

          <div class="station-body">
            <!-- 左：待领用白条卡片网格 -->
            <div class="station-left">
              <div v-loading="barLoading" class="bar-grid">
                <button
                  v-for="b in bars"
                  :key="String(b.id)"
                  type="button"
                  class="bar-card"
                  :class="{ active: String(pickupForm.barInfoId) === String(b.id) }"
                  @click="pickupForm.barInfoId = b.id"
                >
                  <div class="bar-card-head">
                    <span class="bar-card-title">{{ t('djs.warehouse.packEntry.barCardTitle') }}</span>
                    <span class="bar-chip">
                      <el-icon><PriceTag /></el-icon>
                      <span>{{ b.earNo ?? b.barId }}</span>
                    </span>
                  </div>
                  <div class="bar-card-body">
                    <div class="bar-row">
                      <span class="bar-row-label">{{ t('djs.warehouse.packEntry.inTimeLabel') }}</span>
                      <span class="bar-row-value">{{ b.inTime ?? '-' }}</span>
                    </div>
                    <div class="bar-row">
                      <span class="bar-row-label">{{ t('djs.warehouse.packEntry.agingDurationLabel') }}</span>
                      <span class="bar-row-value">{{ agingDuration(b.inTime) }}</span>
                    </div>
                    <div class="bar-row">
                      <span class="bar-row-label">{{ t('djs.warehouse.packEntry.inWeightLabel') }}</span>
                      <span class="bar-row-value">{{ b.inWeight != null ? `${b.inWeight}kg` : '-' }}</span>
                    </div>
                    <div class="bar-row">
                      <span class="bar-row-label">{{ t('djs.warehouse.packEntry.pigAssignLabel') }}</span>
                      <span class="bar-row-value">{{ assignedStoreName }}</span>
                    </div>
                  </div>
                </button>
                <span v-if="!barLoading && bars.length === 0" class="bar-empty">{{ t('djs.warehouse.packEntry.noBars') }}</span>
              </div>
            </div>

            <!-- 右：操作 panel（仿 cut 320px 面板） -->
            <div class="station-right">
              <div class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</div>

              <!-- 猪只耳号 chip（当前选中白条回显） -->
              <div class="panel-section">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
                <div v-if="selectedBar" class="ear-chip">
                  <el-icon><PriceTag /></el-icon>
                  <span>{{ selectedBar.earNo ?? selectedBar.barId }}</span>
                </div>
                <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.barRequired') }}</span>
              </div>

              <!-- 分割方式 -->
              <div class="panel-section">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.isHalf') }}</div>
                <DestToggle v-model="pickupForm.isHalf" :options="isHalfOptions" />
              </div>

              <!-- 需求门店 -->
              <div class="panel-section">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.store') }}</div>
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
              </div>

              <!-- 出库位置（分割车间）button-toggle -->
              <div class="panel-section">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.cutWorkshop') }}</div>
                <div v-loading="locationLoading">
                  <DestToggle
                    v-model="pickupForm.locationId"
                    :options="locationOptions"
                    :empty-text="t('djs.warehouse.packEntry.locationPlaceholder')"
                  />
                </div>
              </div>

              <!-- 备注 -->
              <div class="panel-section">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.remark') }}</div>
                <el-input v-model="pickupForm.remark" type="textarea" :rows="2" maxlength="500" />
              </div>

              <div class="panel-actions">
                <el-button type="primary" size="large" class="action-btn" :loading="pickupSubmitting" @click="handlePickup">
                  {{ t('djs.warehouse.packEntry.confirmPickup') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
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
import { PriceTag } from '@element-plus/icons-vue';
import OssUpload from '@/components/OssUpload/index.vue';
import DestToggle from '../components/DestToggle.vue';
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
const pickupSubmitting = ref(false);
const pickupDefault = () => ({
  barInfoId: '' as number | string | '',
  locationId: '' as number | string | '',
  isHalf: 2 as number,
  targetStoreId: '' as number | string | '',
  remark: undefined as string | undefined
});
const pickupForm = ref(pickupDefault());

const selectedBar = computed(() => bars.value.find((b) => String(b.id) === String(pickupForm.value.barInfoId)));

const isHalfOptions = computed<{ value: number; label: string }[]>(() => [
  { value: 2, label: t('djs.warehouse.packEntry.whole') },
  { value: 1, label: t('djs.warehouse.packEntry.half') }
]);

const locationOptions = computed<{ value: number | string; label: string }[]>(() =>
  locations.value.map((l) => ({ value: l.id, label: l.locationName }))
);

// 卡片「猪只指定」回显当前选中的需求门店（未选为空）
const assignedStoreName = computed<string>(() => {
  if (!pickupForm.value.targetStoreId) return '';
  return stores.value.find((s) => String(s.id) === String(pickupForm.value.targetStoreId))?.storeName ?? '';
});

/** 排酸时长：now - inTime，前端按入库时间算（无后端字段）。 */
function agingDuration(inTime?: string): string {
  if (!inTime) return '-';
  // iOS/Safari 不识别 'YYYY-MM-DD HH:mm'，替换为 '/' 提升兼容性
  const start = new Date(inTime.replace(/-/g, '/'));
  if (Number.isNaN(start.getTime())) return '-';
  let diffMin = Math.floor((Date.now() - start.getTime()) / 60000);
  if (diffMin < 0) diffMin = 0;
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  return `${hours}${t('djs.warehouse.packEntry.agingHour')}${minutes}${t('djs.warehouse.packEntry.agingMinute')}`;
}

async function handlePickup() {
  if (!pickupForm.value.barInfoId) {
    ElMessage.warning(t('djs.warehouse.packEntry.barRequired'));
    return;
  }
  if (!pickupForm.value.locationId) {
    ElMessage.warning(t('djs.warehouse.packEntry.locationRequired'));
    return;
  }
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
.pack-station {
  padding: 12px;
}
.station-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.station-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.station-left {
  flex: 1;
  min-width: 0;
}
.bar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  min-height: 120px;
}
.bar-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.12s ease;
}
.bar-card:hover {
  border-color: var(--el-color-primary-light-5);
}
.bar-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}
.bar-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}
.bar-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.bar-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  background: var(--el-color-warning);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}
.bar-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: flex;
  align-items: center;
  font-size: 13px;
}
.bar-row-label {
  width: 76px;
  flex: 0 0 76px;
  color: var(--el-text-color-secondary);
}
.bar-row-value {
  color: var(--el-text-color-regular);
}
.bar-empty {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  line-height: 40px;
}
.station-right {
  flex: 0 0 320px;
  width: 320px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 16px;
}
.panel-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.action-btn {
  width: 100%;
}
</style>
