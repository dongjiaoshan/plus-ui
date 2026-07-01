<template>
  <div class="p-2">
    <div class="pack-station">
      <div class="station-title">{{ t('djs.warehouse.packEntry.pickupPageTitle') }}</div>

      <div class="station-body">
        <!-- 左：待领用白条卡片网格（FIX-WMS-CUTPICKUP-SPLIT-001：按燎毛产出行逐条出卡，半只/半扇各一张，可分次领） -->
        <div class="station-left">
          <div v-loading="itemLoading" class="bar-grid">
            <button
              v-for="it in items"
              :key="itemKey(it)"
              type="button"
              class="bar-card"
              :class="{ active: selectedKey === itemKey(it) }"
              @click="selectItem(it)"
            >
              <div class="bar-card-head">
                <span class="bar-card-title">{{ it.productName || t('djs.warehouse.packEntry.barCardTitle') }}</span>
                <span class="bar-chip">
                  <el-icon><PriceTag /></el-icon>
                  <span>{{ it.earNo ?? it.markId ?? it.barId }}</span>
                </span>
              </div>
              <div class="bar-card-body">
                <div v-if="it.whiteBarNo" class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.whiteBarNoLabel') }}</span>
                  <span class="bar-row-value bar-row-value--strong">{{ it.whiteBarNo }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.inTimeLabel') }}</span>
                  <span class="bar-row-value">{{ it.inTime ?? '-' }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.agingDurationLabel') }}</span>
                  <span class="bar-row-value">{{ agingDuration(it.inTime) }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.marketingWeightLabel') }}</span>
                  <span class="bar-row-value">{{ it.marketingWeight != null ? `${Number(it.marketingWeight)}kg` : '-' }}</span>
                </div>
                <div class="bar-row">
                  <span class="bar-row-label">{{ t('djs.warehouse.packEntry.outputWeightLabel') }}</span>
                  <span class="bar-row-value bar-row-value--strong">{{ it.productWeight != null ? `${Number(it.productWeight)}${it.productUnit ?? 'kg'}` : '-' }}</span>
                </div>
              </div>
            </button>
            <span v-if="!itemLoading && items.length === 0" class="bar-empty">{{ t('djs.warehouse.packEntry.noBars') }}</span>
          </div>
        </div>

        <!-- 右：操作 panel（收银台风格） -->
        <div class="station-right">
          <div class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</div>

          <!-- 猪只耳号 chip（当前选中白条回显） -->
          <div class="panel-section">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
            <div v-if="selectedItem" class="ear-chip">
              <el-icon><PriceTag /></el-icon>
              <span>{{ selectedItem.earNo ?? selectedItem.markId ?? selectedItem.barId }}</span>
              <span v-if="selectedItem.productName" class="ear-chip-sub">· {{ selectedItem.productName }}</span>
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
import { ElMessage, ElNotification } from 'element-plus';
import { PriceTag } from '@element-plus/icons-vue';
import WeightNumpad from '../components/WeightNumpad.vue';
import DestToggle from '../components/DestToggle.vue';
import { usePackEntryOptions } from '../useOptions';
import { listPickupItems, submitPickup, submitWhiteBarOut } from '@/api/djs-warehouse/packEntry';
import type { BarPickupItemVO } from '@/api/djs-warehouse/packEntry';

const { t } = useI18n();

const { sources, loadSources, stores, loadStores } = usePackEntryOptions();

/** 出库位置枚举 → 后端两端点：cut=分割车间(submitPickup) / ship=发货月台(whiteBarOut)。 */
type OutDest = 'cut' | 'ship';

// FIX-WMS-CUTPICKUP-SPLIT-001：按燎毛产出行出卡（半只/半扇各一张），取代原「整猪一张卡」
const items = ref<BarPickupItemVO[]>([]);
const itemLoading = ref(false);
const selectedKey = ref('');

const submitting = ref(false);
const pickupDefault = () => ({
  productWeight: undefined as number | undefined,
  outDest: 'cut' as OutDest,
  // 发货月台关联门店（ship 分支必填，后端 WhiteBarOutBo.storeId @NotNull）
  storeId: '' as number | string | ''
});
const pickupForm = ref(pickupDefault());

/** 卡片唯一键：产出行卡用 inhouseId，整只兜底卡用 barInfoId。 */
function itemKey(it: BarPickupItemVO): string {
  return it.inhouseId != null ? `row-${it.inhouseId}` : `bar-${it.barInfoId}`;
}

const selectedItem = computed(() => items.value.find((it) => itemKey(it) === selectedKey.value) ?? null);

const outDestOptions = computed<{ value: OutDest; label: string }[]>(() => [
  { value: 'cut', label: t('djs.warehouse.packEntry.outToCut') },
  { value: 'ship', label: t('djs.warehouse.packEntry.outToShip') }
]);

/** 选中一张卡：高亮 + 把该产出行重量预填进过磅框（可改）。 */
function selectItem(it: BarPickupItemVO) {
  selectedKey.value = itemKey(it);
  pickupForm.value.productWeight = it.productWeight != null ? Number(it.productWeight) : undefined;
}

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

/** 条件缺失（前置校验不通过）走右侧 ElNotification；成功/失败走自动消失的全局 ElMessage，二者区分。 */
function notifyMissing(message: string) {
  ElNotification.warning({ title: t('djs.warehouse.packEntry.cannotSubmit'), message });
}

async function loadItems() {
  itemLoading.value = true;
  try {
    const res = await listPickupItems();
    items.value = ((res as any).data ?? []) as BarPickupItemVO[];
    // 刷新后若当前选中卡已不在列表（已领满/被领走）→ 清空选中
    if (selectedKey.value && !items.value.some((it) => itemKey(it) === selectedKey.value)) {
      selectedKey.value = '';
    }
  } finally {
    itemLoading.value = false;
  }
}

async function handleSubmit() {
  const it = selectedItem.value;
  if (!it) {
    notifyMissing(t('djs.warehouse.packEntry.barRequired'));
    return;
  }
  if (!pickupForm.value.outDest) {
    notifyMissing(t('djs.warehouse.packEntry.outLocationRequired'));
    return;
  }
  // 领用称重校验：必填且不应大于该白条出栏重量（marketing_weight；后端再做累计口径校验）
  const pickupWeight = pickupForm.value.productWeight;
  if (!pickupWeight || pickupWeight <= 0) {
    notifyMissing(t('djs.warehouse.packEntry.productWeightRequired'));
    return;
  }
  if (it.marketingWeight != null && pickupWeight > Number(it.marketingWeight)) {
    notifyMissing(t('djs.warehouse.packEntry.pickupWeightExceed', { weight: Number(it.marketingWeight) }));
    return;
  }
  submitting.value = true;
  try {
    if (pickupForm.value.outDest === 'cut') {
      // 分割车间：按燎毛产出行领用（inhouseId 非空 → 后端拆条消耗，领满才建整猪 cut_record）；
      // 整只兜底卡 inhouseId 缺省 → 整猪路径。带现场过磅，后端再校验累计 ≤ 出栏重量。
      await submitPickup({ barInfoId: it.barInfoId, inhouseId: it.inhouseId, pickupWeight });
      ElMessage.success(t('djs.warehouse.packEntry.pickupSuccess'));
    } else {
      // 发货月台：白条/猪肉发货出库。来源 inhouse 优先取该产出行 id；整只兜底卡回落按耳号匹配 whiteBar 来源。
      if (!pickupForm.value.storeId) {
        notifyMissing(t('djs.warehouse.packEntry.shipStoreRequired'));
        return;
      }
      let sourceInhouseId: number | string | undefined = it.inhouseId;
      if (sourceInhouseId == null) {
        const earNo = it.earNo ?? it.barId;
        const src = sources.value.find((s) => String(s.earNo ?? '') === String(earNo));
        sourceInhouseId = src?.id;
      }
      if (sourceInhouseId == null) {
        notifyMissing(t('djs.warehouse.packEntry.shipSourceNotFound'));
        return;
      }
      await submitWhiteBarOut({ sourceInhouseId, productWeight: pickupWeight, storeId: pickupForm.value.storeId });
      ElMessage.success(t('djs.warehouse.packEntry.shipOutSuccess'));
    }
    pickupForm.value = pickupDefault();
    selectedKey.value = '';
    await Promise.all([loadItems(), loadSources('whiteBar')]);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadItems(), loadSources('whiteBar'), loadStores()]);
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
.bar-row-value--strong {
  color: var(--el-color-warning-dark-2);
  font-weight: 600;
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
.ear-chip-sub {
  font-weight: 500;
  font-size: 14px;
  opacity: 0.85;
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
