<template>
  <div class="pack-station">
    <div class="station-title">{{ t('djs.warehouse.packEntry.cutTitle') }}</div>

    <!-- 分割单 chip 行（猪只耳号；来源 cut_record picked/cutting） -->
    <div v-loading="cuttableLoading" class="chip-row">
      <template v-if="cuttable.length > 0">
        <button
          v-for="r in cuttable"
          :key="String(r.id)"
          type="button"
          class="cut-chip"
          :class="{ active: String(form.cutRecordId) === String(r.id) }"
          @click="form.cutRecordId = r.id"
        >
          <div class="chip-line chip-line-ear">
            <el-icon><PriceTag /></el-icon>
            <!-- 外购无耳号：回退显白条标识号/白条编号(barId)，最后才回退 CUT 业务码（FIX-WMS-OUTSOURCE-001 行53） -->
            <span class="chip-main">{{ r.earNo ?? r.markId ?? r.barId ?? r.cutId }}</span>
          </div>
          <div v-if="r.pickupWeight != null" class="chip-line">
            {{ t('djs.warehouse.packEntry.whiteBarWeightShort') }}：{{ Number(r.pickupWeight).toFixed(2) }}kg
          </div>
          <div v-if="r.remainingWeight != null" class="chip-line">
            {{ t('djs.warehouse.packEntry.remainWeightLabel') }}：{{ Number(r.remainingWeight).toFixed(2) }}kg
          </div>
        </button>
      </template>
      <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noCuttable') }}</span>
    </div>

    <div class="station-body">
      <!-- 左：分割产品卡片网格（按具体产品 belong_type=pork） -->
      <div class="station-left">
        <ProductCardGrid v-model="selectedProductId" :items="porkProducts" :loading="porkProductLoading" :show-stock="false" />
      </div>

      <!-- 右：操作 panel -->
      <div class="station-right">
        <div class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</div>

        <!-- 猪只耳号 chip（当前选中分割单回显）+ 行尾「分割完成」按钮 -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
          <div class="ear-row">
            <div v-if="selectedCut" class="ear-chip">
              <el-icon><PriceTag /></el-icon>
              <span>{{ selectedCut.earNo ?? selectedCut.markId ?? selectedCut.barId ?? selectedCut.cutId }}</span>
            </div>
            <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.cutRecordRequired') }}</span>
            <el-button type="primary" :loading="cutDoneSubmitting" class="finish-cut-btn" @click="openCutDone">
              {{ t('djs.warehouse.packEntry.finishCutShort') }}
            </el-button>
          </div>
        </div>

        <!-- 产品重量 numpad -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
          <WeightNumpad v-model="curWeight" :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')" unit="kg" :precision="3" />
        </div>

        <!-- 入库位置 button-toggle（冻品库/鲜品库 等冷库库位） -->
        <div class="panel-section">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.inLocation') }}</div>
          <div v-loading="locationLoading">
            <DestToggle
              v-model="form.locationId"
              :options="locationOptions"
              :empty-text="t('djs.warehouse.packEntry.locationPlaceholder')"
            />
          </div>
        </div>

        <div class="panel-actions">
          <el-button type="primary" size="large" class="action-btn" :loading="cutOutSubmitting" @click="handleCutOut">
            {{ t('djs.warehouse.packEntry.confirmCutOut') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 白条完成分割：仅确认（滴水损耗后端自动计算，无需录入其他信息） -->
    <el-dialog v-model="cutDoneVisible" :title="t('djs.warehouse.packEntry.finishCut')" width="420px" append-to-body destroy-on-close>
      <div class="cut-done-confirm">{{ t('djs.warehouse.packEntry.finishCutConfirm') }}</div>
      <template #footer>
        <el-button type="primary" :loading="cutDoneSubmitting" @click="handleCutDone">{{ t('common.confirm') }}</el-button>
        <el-button @click="cutDoneVisible = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PackEntryCut" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElNotification } from 'element-plus';
import { PriceTag } from '@element-plus/icons-vue';
import ProductCardGrid from '../components/ProductCardGrid.vue';
import WeightNumpad from '../components/WeightNumpad.vue';
import DestToggle from '../components/DestToggle.vue';
import { usePackEntryOptions } from '../useOptions';
import { listCuttable, submitCutDone, submitCutOut } from '@/api/djs-warehouse/packEntry';
import type { PigCutRecordVO } from '@/api/djs-warehouse/packEntry';
import { listProduct } from '@/api/djs-warehouse/product';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

const { t } = useI18n();

const { locations, locationLoading, loadLocations } = usePackEntryOptions();

// row122①：全量展示库位（不再按名称过滤成「猪肉鲜品/冻品」两类，也不按所选产品存储库位过滤）。
// row122②：把「猪肉鲜品库」排在「冻品库」之前，其余库位按原顺序追加在后。
const FRESH_FIRST = '猪肉鲜品';
const FROZEN_SECOND = '冻品';
const rankLocation = (name: string): number => {
  if (name.includes(FRESH_FIRST)) return 0; // 猪肉鲜品库置顶
  if (name.includes(FROZEN_SECOND)) return 1; // 冻品库次之
  return 2; // 其余库位在后
};
const locationOptions = computed<{ value: number | string; label: string }[]>(() =>
  [...locations.value]
    .sort((a, b) => rankLocation(a.locationName ?? '') - rankLocation(b.locationName ?? ''))
    .map((l) => ({ value: l.id, label: l.locationName }))
);

/** 入库位置默认选中「猪肉鲜品库」（row122②）；无该库位时回退到列表首项，仍无则留空。 */
function defaultLocationId(): number | string | '' {
  const fresh = locationOptions.value.find((o) => o.label?.includes(FRESH_FIRST));
  if (fresh) return fresh.value;
  return locationOptions.value[0]?.value ?? '';
}

// 可选分割产品：产品主数据 belong_type=pork + **原材料(attr=2)**（doc/14：分割只产原料，领用原料→打包成成品）
const porkProducts = ref<ProductInfoVO[]>([]);
const porkProductLoading = ref(false);

async function loadPorkProducts() {
  porkProductLoading.value = true;
  try {
    // 分割车间(productWorkshop=2) 的猪肉**原材料**(productAttr=2)：分割产出入冷库的是原料，不是成品。
    // 成品(attr=1)由打包产出、不可被分割/领用（领用都是原材料，doc/14 §1）。
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType: 'pork', productWorkshop: 2, productAttr: 2, productStatus: 0 } as any);
    porkProducts.value = ((res as any).rows ?? []) as ProductInfoVO[];
  } finally {
    porkProductLoading.value = false;
  }
}

const cuttable = ref<PigCutRecordVO[]>([]);
const cuttableLoading = ref(false);

async function loadCuttable() {
  cuttableLoading.value = true;
  try {
    const res = await listCuttable();
    cuttable.value = ((res as any).data ?? []) as PigCutRecordVO[];
  } finally {
    cuttableLoading.value = false;
  }
}

const form = ref<{ cutRecordId: number | string | ''; locationId: number | string | '' }>({
  cutRecordId: '',
  locationId: ''
});

// 当前录入的单件分割产品（卡片选品 + numpad 录重 → 确认入库逐件提交）
const selectedProductId = ref<number | string | ''>('');
const curWeight = ref<number | undefined>(undefined);

// row122①：取消「按所选产品存储库位过滤/锁定入库库位」的逻辑 —— 入库库位始终全量可选、默认猪肉鲜品库、可自由改。
const selectedCut = computed(() => cuttable.value.find((r) => String(r.id) === String(form.value.cutRecordId)));

const cutOutSubmitting = ref(false);

/** 条件缺失（前置校验不通过）走右侧 ElNotification；成功/失败走自动消失的全局 ElMessage，二者区分。 */
function notifyMissing(message: string) {
  ElNotification.warning({ title: t('djs.warehouse.packEntry.cannotSubmit'), message });
}

async function handleCutOut() {
  if (!form.value.cutRecordId) {
    notifyMissing(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  if (!selectedProductId.value) {
    notifyMissing(t('djs.warehouse.packEntry.cutProductRequired'));
    return;
  }
  if (!curWeight.value || curWeight.value <= 0) {
    notifyMissing(t('djs.warehouse.packEntry.productWeightRequired'));
    return;
  }
  if (!form.value.locationId) {
    notifyMissing(t('djs.warehouse.packEntry.locationRequired'));
    return;
  }
  // 超量软校验（前端，与后端同口径：本次重量 ≤ 当前剩余可分割重量；后端为硬校验兜底）
  const remaining = selectedCut.value?.remainingWeight;
  if (remaining != null && curWeight.value > Number(remaining)) {
    notifyMissing(t('djs.warehouse.packEntry.cutOutExceed', { remaining: Number(remaining).toFixed(2) }));
    return;
  }
  cutOutSubmitting.value = true;
  try {
    await submitCutOut({
      cutRecordId: form.value.cutRecordId as number | string,
      locationId: form.value.locationId as number | string,
      partItems: [{ productId: selectedProductId.value as number | string, productWeight: curWeight.value }]
    });
    ElMessage.success(t('djs.warehouse.packEntry.cutOutSuccess'));
    // 逐件录入：清当前产品/重量，保留分割单 + 库位方便连续称重
    selectedProductId.value = '';
    curWeight.value = undefined;
    await loadCuttable();
  } finally {
    cutOutSubmitting.value = false;
  }
}

// ---- 白条完成分割 ----
const cutDoneVisible = ref(false);
const cutDoneSubmitting = ref(false);

function openCutDone() {
  if (!form.value.cutRecordId) {
    notifyMissing(t('djs.warehouse.packEntry.cutRecordRequired'));
    return;
  }
  cutDoneVisible.value = true;
}

async function handleCutDone() {
  // 滴水损耗由后端自动计算（白条入库重量 − 出库重量），前端不再录入
  cutDoneSubmitting.value = true;
  try {
    await submitCutDone({ cutRecordId: form.value.cutRecordId as number | string });
    ElMessage.success(t('djs.warehouse.packEntry.finishCutSuccess'));
    cutDoneVisible.value = false;
    // 完成后清分割单，入库位置回落默认（猪肉鲜品库），方便下一头连续录入
    form.value = { cutRecordId: '', locationId: defaultLocationId() };
    selectedProductId.value = '';
    curWeight.value = undefined;
    await loadCuttable();
  } finally {
    cutDoneSubmitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadLocations(), loadCuttable(), loadPorkProducts()]);
  // row122②：入库位置默认选中猪肉鲜品库（库位加载完成后再取默认值）
  if (!form.value.locationId) {
    form.value.locationId = defaultLocationId();
  }
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
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 40px;
}
.cut-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 200px;
  padding: 10px 14px;
  border: 1px solid var(--el-color-warning);
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  cursor: pointer;
  transition: all 0.12s ease;
}
/* row121③：选中白条卡片与未选中区分度加大（加粗边框 + 更深底色 + 外发光环） */
.cut-chip.active {
  border-width: 2px;
  border-color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-7);
  box-shadow: 0 0 0 3px var(--el-color-warning-light-5);
}
.chip-line {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.chip-line-ear {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chip-main {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-color-warning-dark-2);
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
/* row121①：右侧操作栏整体收紧（更小内边距 / 段间距 / 控件高度），对齐截图红框更紧凑的诉求 */
.station-right {
  flex: 0 0 380px;
  width: 380px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 14px;
}
.panel-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 6px;
}
.ear-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.finish-cut-btn {
  flex: 0 0 auto;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 15px;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}
.action-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
}
/* 触屏适度放大：数字键盘 / 入库位置按钮（比默认略大、但比原来更紧凑，对齐 row121 收紧诉求） */
.station-right :deep(.numpad-display) {
  height: 46px;
  margin-bottom: 8px;
}
.station-right :deep(.numpad-input) {
  font-size: 19px;
}
.station-right :deep(.numpad-keys) {
  gap: 6px;
}
.station-right :deep(.numpad-key) {
  height: 46px;
  font-size: 19px;
}
.station-right :deep(.dest-btn) {
  min-width: 84px;
  height: 44px;
  font-size: 15px;
}
</style>
