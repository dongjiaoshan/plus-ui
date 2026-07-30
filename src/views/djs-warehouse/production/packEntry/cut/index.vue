<template>
  <div class="pack-station">
    <div class="station-title">{{ t('djs.warehouse.packEntry.cutTitle') }}</div>

    <div class="station-body">
      <!-- 左：待分割白条 + 分割产品卡片；右操作列从标题下方起撑满整高，与其它打包页几何一致。 -->
      <div class="station-left">
        <!-- 分割单 chip 行（猪只耳号；来源 cut_record picked/cutting） -->
        <div v-loading="cuttableLoading" class="chip-row">
          <template v-if="cuttable.length > 0">
            <button
              v-for="r in sortedCuttable"
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
                {{ t('djs.warehouse.packEntry.whiteBarWeightShort') }}：{{ Number(r.pickupWeight).toFixed(3) }}kg
              </div>
              <div v-if="r.remainingWeight != null" class="chip-line">
                {{ t('djs.warehouse.packEntry.remainWeightLabel') }}：{{ Number(r.remainingWeight).toFixed(3) }}kg
              </div>
            </button>
          </template>
          <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noCuttable') }}</span>
        </div>
        <div class="card-scroll">
          <ProductCardGrid v-model="selectedProductId" :items="porkProducts" :loading="porkProductLoading" :show-stock="false" />
        </div>
      </div>

      <!-- 右：操作 panel（三段式：头部固定 + 中部可滚动 + 底部按钮区常驻，与 SkuPackForm / pickup 统一） -->
      <div class="station-right">
        <div class="panel-head">
          <div class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</div>
        </div>

        <div class="panel-scroll">
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
        </div>
        <!-- /panel-scroll -->

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

// row152：入库位置只保留「猪肉鲜品库 / 冻品库」两类，按名称过滤。
// 坑：猪肉鲜品库 location_type='veg_fresh'（名字对不上 type，与毛菜鲜品/蔬菜保鲜共享 veg_fresh），
// 所以必须按名称包含关键字过滤，不能按 location_type。
const FRESH_FIRST = '猪肉鲜品';
const FROZEN_SECOND = '冻品';
const ALLOWED_LOCATION_KEYWORDS = [FRESH_FIRST, FROZEN_SECOND];
const rankLocation = (name: string): number => {
  if (name.includes(FRESH_FIRST)) return 0; // 猪肉鲜品库置顶
  if (name.includes(FROZEN_SECOND)) return 1; // 冻品库次之
  return 2;
};
const locationOptions = computed<{ value: number | string; label: string }[]>(() =>
  [...locations.value]
    .filter((l) => ALLOWED_LOCATION_KEYWORDS.some((k) => (l.locationName ?? '').includes(k)))
    .sort((a, b) => rankLocation(a.locationName ?? '') - rankLocation(b.locationName ?? ''))
    .map((l) => ({ value: l.id, label: l.locationName }))
);

/** 入库位置默认选中「猪肉鲜品库」；无该库位时回退到列表首项（冻品库），仍无则留空。 */
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
    const res = await listProduct({ pageNum: 1, pageSize: 500, belongType: 'pork', productWorkshop: '2', productAttr: 2, productStatus: 0 } as any);
    porkProducts.value = ((res as any).rows ?? []) as ProductInfoVO[];
  } finally {
    porkProductLoading.value = false;
  }
}

const cuttable = ref<PigCutRecordVO[]>([]);
const cuttableLoading = ref(false);

// row156：白条 chip 按分割车间「从前到后」稳定升序展示（后端 picked 段 + cutting 段拼接、日期跳跃乱序）。
// PigCutRecordVO 无 pickupTime 字段，用业务码 cutId 排序 —— cutId 与 pickup_time 单调同序（live 已核），
// 回退 id 兜底空码，整体稳定升序。
const sortedCuttable = computed<PigCutRecordVO[]>(() =>
  [...cuttable.value].sort((a, b) => String(a.cutId ?? a.id ?? '').localeCompare(String(b.cutId ?? b.id ?? '')))
);

async function loadCuttable() {
  cuttableLoading.value = true;
  try {
    const res = await listCuttable();
    cuttable.value = ((res as any).data ?? []) as PigCutRecordVO[];
    // row93①：默认选中「最早进分割库」的白条 —— sortedCuttable 按 cutId 升序（= 进分割库先后），取首项。
    // 仅在当前未选中有效分割单时补选（已手选不覆盖；所选已完成/移出列表则改选最早一条）。
    const stillValid = form.value.cutRecordId && cuttable.value.some((r) => String(r.id) === String(form.value.cutRecordId));
    if (!stillValid) {
      form.value.cutRecordId = sortedCuttable.value[0]?.id ?? '';
    }
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
    notifyMissing(t('djs.warehouse.packEntry.cutOutExceed', { remaining: Number(remaining).toFixed(3) }));
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
/* 收银系统风格：整页定高，白条 chip 行 + 标题固定，中部 station-body 占满剩余高度，
   右操作面板内容超视口时内部滚动到底（对齐 SkuPackForm 果蔬/肉品打包页 row127 修法） */
.pack-station {
  padding: 12px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
.station-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  flex: 0 0 auto;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  min-height: 40px;
  flex: 0 0 auto;
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
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
  align-items: stretch;
}
.station-left {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.card-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
/* row137：三段式操作台（头部固定 + 中部可滚动 + 底部按钮常驻），撑满卡片网格等高，
   内容超高只在中部 .panel-scroll 内滚动，确认出库按钮常驻面板底部不被截断，与 SkuPackForm / pickup 统一。 */
.station-right {
  flex: 0 0 440px;
  width: 440px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  align-self: stretch;
  min-height: 0;
}
.panel-head {
  flex: 0 0 auto;
  margin-bottom: 14px;
}
.panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.panel-section {
  margin-bottom: 16px;
}
.panel-label {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
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
  padding: 9px 16px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 16px;
}
.panel-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
}
.action-btn {
  width: 100%;
  height: 52px;
  font-size: 17px;
}
/* r81：触屏数字键盘 / 入库位置按钮放大到 pickup 页那档，不再过度紧凑 */
.station-right :deep(.numpad-display) {
  height: 56px;
  margin-bottom: 10px;
}
.station-right :deep(.numpad-input) {
  font-size: 22px;
}
.station-right :deep(.numpad-keys) {
  gap: 8px;
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
</style>
