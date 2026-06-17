<template>
  <div class="p-2">
    <div class="pack-station">
      <div class="station-title">{{ t('djs.warehouse.packEntry.pickupPageTitle') }}</div>

      <div class="station-body">
        <!-- 左：待领用白条卡片网格（耳号/入库时间/排酸时长/入库重量） -->
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
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.marketingWeightLabel') }}</span>
                  <span class="bar-row-value">{{ b.marketingWeight != null ? `${b.marketingWeight}kg` : '-' }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.inWeightLabel') }}</span>
                  <span class="bar-row-value">{{ b.inWeight != null ? `${b.inWeight}kg` : '-' }}</span>
                </div>
              </div>
            </button>
            <span v-if="!barLoading && bars.length === 0" class="bar-empty">{{ t('djs.warehouse.packEntry.noBars') }}</span>
          </div>
        </div>

        <!-- 右：操作 panel（收银台风格） -->
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

          <!-- 产品重量数字键盘 -->
          <div class="panel-section">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
            <WeightNumpad v-model="pickupForm.productWeight" :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')" unit="kg" :precision="3" />
          </div>

          <!-- 出库位置：固定两按钮（分割车间 / 发货月台） -->
          <div class="panel-section">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.outLocation') }}</div>
            <DestToggle v-model="pickupForm.outDest" :options="outDestOptions" />
          </div>

          <!-- 发货月台：关联发货门店（ship 分支必填） -->
          <div v-if="pickupForm.outDest === 'ship'" class="panel-section">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.shipStore') }}</div>
            <el-select
              v-model="pickupForm.storeId"
              :placeholder="t('djs.warehouse.packEntry.shipStorePlaceholder')"
              filterable
              class="ship-store-select"
            >
              <el-option
                v-for="s in stores"
                :key="String(s.id)"
                :label="s.storeName"
                :value="s.id"
              />
            </el-select>
          </div>

          <div class="panel-actions">
            <el-button type="primary" size="large" class="action-btn" :loading="submitting" @click="handleSubmit">
              {{ t('djs.warehouse.packEntry.confirmPickup') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="PackEntryPickup" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { PriceTag } from '@element-plus/icons-vue';
import WeightNumpad from '../components/WeightNumpad.vue';
import DestToggle from '../components/DestToggle.vue';
import { usePackEntryOptions } from '../useOptions';
import { submitPickup, submitWhiteBarOut } from '@/api/djs-warehouse/packEntry';

const { t } = useI18n();

const { sources, loadSources, bars, barLoading, loadBars, stores, loadStores } = usePackEntryOptions();

/** 出库位置枚举 → 后端两端点：cut=分割车间(submitPickup) / ship=发货月台(whiteBarOut)。 */
type OutDest = 'cut' | 'ship';

const submitting = ref(false);
const pickupDefault = () => ({
  barInfoId: '' as number | string | '',
  productWeight: undefined as number | undefined,
  outDest: 'cut' as OutDest,
  // 发货月台关联门店（ship 分支必填，后端 WhiteBarOutBo.storeId @NotNull）
  storeId: '' as number | string | ''
});
const pickupForm = ref(pickupDefault());

const selectedBar = computed(() => bars.value.find((b) => String(b.id) === String(pickupForm.value.barInfoId)));

const outDestOptions = computed<{ value: OutDest; label: string }[]>(() => [
  { value: 'cut', label: t('djs.warehouse.packEntry.outToCut') },
  { value: 'ship', label: t('djs.warehouse.packEntry.outToShip') }
]);

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

async function handleSubmit() {
  const bar = selectedBar.value;
  if (!bar) {
    ElMessage.warning(t('djs.warehouse.packEntry.barRequired'));
    return;
  }
  if (!pickupForm.value.outDest) {
    ElMessage.warning(t('djs.warehouse.packEntry.outLocationRequired'));
    return;
  }
  // 领用称重校验：必填且不应大于该白条出栏重量（marketing_weight）
  const pickupWeight = pickupForm.value.productWeight;
  if (!pickupWeight || pickupWeight <= 0) {
    ElMessage.warning(t('djs.warehouse.packEntry.productWeightRequired'));
    return;
  }
  if (bar.marketingWeight != null && pickupWeight > bar.marketingWeight) {
    ElMessage.warning(t('djs.warehouse.packEntry.pickupWeightExceed', { weight: bar.marketingWeight }));
    return;
  }
  submitting.value = true;
  try {
    if (pickupForm.value.outDest === 'cut') {
      // 分割车间：领用进分割车间（领用阶段不采集库位，service 后续 cutOut 阶段采集）；
      // 带现场领用称重，后端再校验 ≤ 出栏重量
      await submitPickup({ barInfoId: bar.id, pickupWeight, isHalf: 2 });
      ElMessage.success(t('djs.warehouse.packEntry.pickupSuccess'));
    } else {
      // 发货月台：白条/猪肉发货出库（需重量 + 来源 inhouse，按耳号匹配白条来源过程产品 + 关联发货门店）
      if (!pickupForm.value.storeId) {
        ElMessage.warning(t('djs.warehouse.packEntry.shipStoreRequired'));
        return;
      }
      const earNo = bar.earNo ?? bar.barId;
      const src = sources.value.find((s) => String(s.earNo ?? '') === String(earNo));
      if (!src) {
        ElMessage.warning(t('djs.warehouse.packEntry.shipSourceNotFound'));
        return;
      }
      await submitWhiteBarOut({ sourceInhouseId: src.id, productWeight: pickupWeight, storeId: pickupForm.value.storeId });
      ElMessage.success(t('djs.warehouse.packEntry.shipOutSuccess'));
    }
    pickupForm.value = pickupDefault();
    await Promise.all([loadBars(), loadSources('whiteBar')]);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadBars(), loadSources('whiteBar'), loadStores()]);
});
</script>

<style scoped>
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
  flex: 0 0 440px;
  width: 440px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 24px;
  background: var(--el-bg-color);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 22px;
}
.panel-label {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 16px;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
.action-btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
}
/* 触屏放大：数字键盘 / 出库位置按钮（组件内默认偏小，本台面页面级放大） */
.station-right :deep(.numpad-display) {
  height: 56px;
}
.station-right :deep(.numpad-input) {
  font-size: 22px;
}
.station-right :deep(.numpad-key) {
  height: 56px;
  font-size: 22px;
}
.station-right :deep(.dest-btn) {
  min-width: 96px;
  height: 52px;
  font-size: 16px;
}
.ship-store-select {
  width: 100%;
}
.station-right :deep(.ship-store-select .el-select__wrapper) {
  min-height: 52px;
}
</style>
