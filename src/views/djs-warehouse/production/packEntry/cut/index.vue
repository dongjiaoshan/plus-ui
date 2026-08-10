<template>
  <div class="pack-station">
    <div class="station-body">
      <!-- 左：页标题 + 待分割白条 + 分割产品卡片；右操作台顶到可视区最上沿（一体秤 dense 范式，同肉品打包）。 -->
      <div class="station-left">
        <!-- 一体秤小屏：页标题挪进左列，右操作台才能顶到可视区最上沿（标题本身保留，不缩小） -->
        <div class="station-title">{{ t('djs.warehouse.packEntry.cutTitle') }}</div>

        <!-- 分割单 chip 行（猪只耳号；来源 cut_record picked/cutting）；白条多时本行内部滚动，不侵占下方产品卡片区 -->
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
          <!-- card-grid--dense 的 245px 下限是按肉品卡「领用剩余重量：42500 g」不折行反推的，
               本页卡片只有品名一行（show-stock=false、无 demandMap），那个前提不成立 →
               本页覆盖成 4 列，14 个分割产品一屏排完不用滚（Kevin 2026-08-10 定）。 -->
          <ProductCardGrid
            v-model="selectedProductId"
            :items="porkProducts"
            :loading="porkProductLoading"
            :show-stock="false"
            dense
            class="cut-card-grid"
          />
        </div>
      </div>

      <!-- 右：操作 panel（三段式：头部固定 + 中部可滚动 + 底部按钮区常驻，与 SkuPackForm / pickup 统一） -->
      <div class="station-right">
        <!-- 一体秤 dense：「操作」标题去掉，整个 head 绝对定位到右台右上角 —— 刷新不占行高，与首段标签（猪只耳号）同排 -->
        <div class="panel-head">
          <!-- row153：刷新按钮，重拉待分割白条 / 分割产品。这是本页唯一的重拉数据入口，不可去掉。 -->
          <el-button class="refresh-btn" :icon="Refresh" :loading="refreshing" @click="handleRefresh">
            {{ t('common.refresh') }}
          </el-button>
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

          <!-- 产品重量 numpad；标签行右侧挂电子秤状态条（连接状态 / 稳定-晃动 / 自动填入）。
               本页录入单位是 kg（precision 3），故 in-gram=false —— 秤读数(kg)原样填入，不做 ×1000。
               ⚠️ ScaleFillBar 内部持有秤连接，本页只放这一个。 -->
          <div class="panel-section">
            <div class="weight-label-row">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
              <ScaleFillBar v-model="curWeight" :in-gram="false" />
            </div>
            <WeightNumpad v-model="curWeight" :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')" unit="kg" :precision="3" />
          </div>

          <!-- 入库位置 button-toggle（冻品库/鲜品库 等冷库库位）。
               只有两个短选项，标签与按钮横排省一行（dense 范式里「一行放得下的短选项组」例外）。 -->
          <div class="panel-section in-location-toggle">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.inLocation') }}</div>
            <div v-loading="locationLoading">
              <DestToggle v-model="form.locationId" :options="locationOptions" :empty-text="t('djs.warehouse.packEntry.locationPlaceholder')" />
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
import { PriceTag, Refresh } from '@element-plus/icons-vue';
import ProductCardGrid from '../components/ProductCardGrid.vue';
import WeightNumpad from '../components/WeightNumpad.vue';
import ScaleFillBar from '../components/ScaleFillBar.vue';
import DestToggle from '../components/DestToggle.vue';
// 【临时】一体秤验收预览数据；秤上验收通过后连同 _preview.ts 一起删
import { isPreviewMode, previewCutProducts, previewCuttable } from '../_preview';
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
    // 【临时】一体秤验收预览（见 _preview.ts 两道闸与清理清单）
    if (isPreviewMode()) {
      porkProducts.value = previewCutProducts() as unknown as ProductInfoVO[];
      return;
    }
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
    // 【临时】一体秤验收预览：造几条待分割白条 chip（见 _preview.ts 两道闸与清理清单）
    cuttable.value = isPreviewMode()
      ? (previewCuttable() as unknown as PigCutRecordVO[])
      : ((((await listCuttable()) as any).data ?? []) as PigCutRecordVO[]);
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

/**
 * row153：刷新按钮 —— 重拉待分割白条 / 分割产品（复用已有加载函数，不清当前录入的产品和重量）。
 * 与 pickup / SkuPackForm 的刷新语义一致：只更新选项数据，半途录入不丢。
 *
 * 注：库位走共享 composable {@code usePackEntryOptions.loadLocations}，它带「已加载则跳过」短路，
 * 首次挂载后不会再发请求 —— 库位是静态主数据，这是既有设计，本按钮沿用，不额外破例重拉。
 */
const refreshing = ref(false);
async function handleRefresh() {
  refreshing.value = true;
  try {
    await Promise.all([loadLocations(), loadCuttable(), loadPorkProducts()]);
    // 库位可能被停用导致当前选中失效 —— 兜底回落默认库位，避免刷新后确认入库因空库位被拦
    if (!form.value.locationId) {
      form.value.locationId = defaultLocationId();
    }
  } finally {
    refreshing.value = false;
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
/* ===== 一体秤 dense 布局（顶尖 ACLAS 安卓一体秤：可视区 1472×634，navbar 50 + tagsview 34 已占 84）=====
   目标：整页零滚动，底部「确认入库」完整可见。范式与已定稿的肉品打包页（SkuPackForm .pack-station--dense）逐条对齐：
   ① 贴顶：容器 padding 顶部 0；页标题挪进左列，右操作台顶到可视区最上沿
   ② 「操作」标题去掉，panel-head 绝对定位到右台右上角（刷新按钮 26px 不占行高）
   ③ 段间距 / 标签行高 / 按钮高度收紧；标签与内容仍上下两行（只有入库位置这种短选项组横排）
   ④ numpad 12 键由 3 列 ×4 行改 4 列 ×3 行 —— 少一行 ~52px，键位反而更宽好点
   ⑤ 页高用 dvh：Android Chrome 的 100vh 是「地址栏隐藏时」的高度，比真可视区大 ~90px，
      多出来的部分被 .app-main{overflow:hidden} 裁掉 → 底部按钮被切一半。旧内核不支持 dvh 时回落到上一条 vh 声明 */
.pack-station {
  padding: 0 8px 8px;
  height: calc(100vh - 84px);
  height: calc(100dvh - 84px);
  display: flex;
  flex-direction: column;
}
.station-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  padding-top: 6px;
  flex: 0 0 auto;
}
/* 白条 chip 行：允许被压缩并在行内滚动（flex: 0 1 auto + max-height）——
   待分割白条多时原先 flex:0 0 auto 会一直往下长，把产品卡片区挤没、并被 .app-main 裁掉。
   卡片本身不压小（三行数据全留），超出两排就在本行内滚。 */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  min-height: 40px;
  max-height: 184px;
  flex: 0 1 auto;
  overflow-y: auto;
  padding-right: 4px;
}
.cut-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 200px;
  flex: 0 0 auto;
  padding: 8px 12px;
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
  gap: 12px;
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
  padding-right: 4px;
}
/* row137：三段式操作台（头部固定 + 中部可滚动 + 底部按钮常驻），撑满卡片网格等高，
   内容超高只在中部 .panel-scroll 内滚动，确认入库按钮常驻面板底部不被截断，与 SkuPackForm / pickup 统一。
   position:relative 供绝对定位的 .panel-head（刷新）挂到右上角。 */
.station-right {
  position: relative;
  flex: 0 0 440px;
  width: 440px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 6px 12px 10px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  align-self: stretch;
  min-height: 0;
}
/* 刷新绝对定位到右台右上角：不占行高，与首段标签（猪只耳号）同排 */
.panel-head {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
}
.refresh-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 13px;
}
.panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.panel-section {
  margin-bottom: 8px;
}
.panel-label {
  font-size: 13px;
  line-height: 26px;
  color: var(--el-text-color-regular);
  margin-bottom: 2px;
}
/* 重量段标签行：左标签 + 右秤状态条（同 SkuPackForm .weight-label-row） */
.weight-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 2px;
}
.weight-label-row > .panel-label {
  margin-bottom: 0;
}
.ear-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.finish-cut-btn {
  flex: 0 0 auto;
  height: 36px;
}
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 15px;
}
.panel-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
}
.action-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
}
/* 入库位置：只有「猪肉鲜品库 / 冻品库」两个短选项，标签与按钮横排省一行，按钮回落 36 高 */
.in-location-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}
.in-location-toggle > .panel-label {
  flex: 0 0 auto;
  margin-bottom: 0;
}
.in-location-toggle > *:not(.panel-label) {
  flex: 1 1 auto;
  min-width: 0;
}
.in-location-toggle :deep(.dest-btn) {
  min-width: 90px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}
/* numpad：12 键 4 列 ×3 行（少一行 ~52px，键位更宽更好点），键高沿用组件默认 44px */
.station-right :deep(.numpad-display) {
  height: 40px;
  margin-bottom: 8px;
}
.station-right :deep(.numpad-keys) {
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
/* 见模板处注释：本页卡片无数据行，245px 下限的前提不成立 → 4 列，14 个产品一屏排完 */
.cut-card-grid.card-grid--dense {
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
}
</style>
