<template>
  <div>
    <!-- 注释一律写在根 div 之内：写在根节点外面会让 SFC 编译成 Fragment（多根），
         AppMain 的 transition mode="out-in" 解析不出唯一过渡子节点 → leave 永不完成，
         从本页切走后 .app-main 只剩一个注释占位节点，后续所有页面全白（vite dev comments=true 才复现）。
         另：不加外层 padding —— 一体秤小屏要求右操作台贴住可视区上沿，留白全由 .pack-station 自己控。 -->
    <div class="pack-station">
      <div class="station-body">
        <!-- 左：页标题 + 待领用白条卡片网格（FIX-WMS-CUTPICKUP-SPLIT-001：按燎毛产出行逐条出卡，半只/半扇各一张，可分次领） -->
        <div class="station-left">
          <!-- 页标题放在左列：右操作台才能顶到可视区最上沿（标题本身保留，不缩小） -->
          <div class="station-title">{{ t('djs.warehouse.packEntry.pickupPageTitle') }}</div>

          <div class="card-scroll">
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
                    <span class="bar-row-value bar-row-value--strong">{{
                      it.productWeight != null ? `${Number(it.productWeight)}${it.productUnit ?? 'kg'}` : '-'
                    }}</span>
                  </div>
                </div>
              </button>
              <span v-if="!itemLoading && items.length === 0" class="bar-empty">{{ t('djs.warehouse.packEntry.noBars') }}</span>
            </div>
          </div>
        </div>

        <!-- 右：操作 panel（收银台风格；三段式：头部固定 + 中部可滚动 + 底部按钮区常驻） -->
        <div class="station-right">
          <!-- 「操作」标题去掉，整个 head 绝对定位到右台右上角：不占行高，视觉上与首段标签（猪只耳号）同排。
               刷新是本页唯一的重拉数据入口（白条卡 / 来源 / 发货门店），只缩小不删除。 -->
          <div class="panel-head">
            <el-button class="refresh-btn" type="primary" plain :icon="Refresh" :loading="refreshing || itemLoading" @click="handleRefresh">
              {{ t('common.refresh') }}
            </el-button>
          </div>

          <div class="panel-scroll">
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

            <!-- 产品重量数字键盘。标签行右侧挂秤状态条：连接状态 + 稳定/晃动 + 自动填入开关；
                 自动填入开时录入值完全镜像秤读数（放上=实重、取下回 0），关掉才是纯手输 numpad。
                 本页录入单位是 kg（numpad unit="kg" / precision=3），故 in-gram=false。
                 ⚠️ ScaleFillBar 内部持有秤连接，整页只准放这一个。 -->
            <div class="panel-section">
              <div class="weight-label-row">
                <div class="panel-label">{{ t('djs.warehouse.packEntry.productWeight') }}</div>
                <ScaleFillBar v-model="pickupForm.productWeight" :in-gram="false" />
              </div>
              <WeightNumpad
                v-model="pickupForm.productWeight"
                :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')"
                unit="kg"
                :precision="3"
              />
            </div>

            <!-- 出库位置：固定三按钮（分割车间 / 发货月台 / 仓库出库） -->
            <div class="panel-section">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.outLocation') }}</div>
              <DestToggle v-model="pickupForm.outDest" :options="outDestOptions" />
            </div>

            <!-- 发货月台：关联发货门店（ship 分支必填）。row153：只列当天有已确认白条需求的门店，名后带需求数。 -->
            <div v-if="pickupForm.outDest === 'ship'" class="panel-section">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.shipStore') }}</div>
              <el-select
                v-model="pickupForm.storeId"
                v-loading="shipStoreLoading"
                :placeholder="t('djs.warehouse.packEntry.shipStorePlaceholder')"
                filterable
                class="ship-store-select"
              >
                <el-option v-for="s in shipStores" :key="String(s.storeId)" :label="`${s.storeName}(${Number(s.demandQty)})`" :value="s.storeId" />
              </el-select>
            </div>

            <!-- 仓库出库：选出库去向（复用系统字典 djs_stock_out_dest = 矿山/厨房/大冶门店/各收货单位…，warehouse 分支必填） -->
            <div v-if="pickupForm.outDest === 'warehouse'" class="panel-section">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.outDest') }}</div>
              <el-select
                v-model="pickupForm.warehouseOutDest"
                :placeholder="t('djs.warehouse.packEntry.outDestPlaceholder')"
                class="ship-store-select"
              >
                <el-option v-for="d in stockOutDestOptions" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </div>
          </div>
          <!-- /panel-scroll -->

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
import { computed, getCurrentInstance, onMounted, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElNotification } from 'element-plus';
import { PriceTag, Refresh } from '@element-plus/icons-vue';
import WeightNumpad from '../components/WeightNumpad.vue';
// 【临时】一体秤验收预览数据；秤上验收通过后连同 _preview.ts 一起删
import { isPreviewMode, previewBars } from '../_preview';
import ScaleFillBar from '../components/ScaleFillBar.vue';
import DestToggle from '../components/DestToggle.vue';
import { usePackEntryOptions } from '../useOptions';
import { listPickupItems, submitPickup, submitWhiteBarOut, submitWarehouseOut } from '@/api/djs-warehouse/packEntry';
import type { BarPickupItemVO } from '@/api/djs-warehouse/packEntry';
import { filterManualOutDest } from '@/views/djs-warehouse/constants';
import { useScaleConfigStore } from '@/store/modules/scaleConfig';
import request from '@/utils/request';

const { t } = useI18n();
// 只读「自动填入」开关（不调 useScaleWeight——那是工厂函数，再调一次就多开一条 WS + 轮询，
// 整页只准 ScaleFillBar 持有唯一连接）。选卡是否清空录入重量以它为准，见 selectItem。
const scaleCfg = useScaleConfigStore();
const { proxy } = getCurrentInstance()!;

// 出库去向复用系统已有字典 djs_stock_out_dest（矿山/厨房/大冶门店/各收货单位…）；toRefs 解构保响应式（否则冷 store 挂载恒空）
const { djs_stock_out_dest } = toRefs<any>(proxy?.useDict('djs_stock_out_dest'));

/** 只列可手选的最终去向；代码自动回填的内部流转值（发货月台 / 白条分割 / 生产领用…）不进下拉。 */
const stockOutDestOptions = computed(() => filterManualOutDest(djs_stock_out_dest.value));

const { sources, loadSources } = usePackEntryOptions();

/**
 * row153：发货月台门店下拉数据 —— 只列当天有已确认白条需求的门店，storeName 后带需求数。
 * storeId 为雪花字符串（后端 CAST AS CHAR 防 JS 精度截断）。
 */
interface WhiteBarShipStore {
  storeId: string;
  storeName: string;
  demandQty: number | string;
}
const shipStores = ref<WhiteBarShipStore[]>([]);
const shipStoreLoading = ref(false);

/** 加载当天有已确认白条需求的门店（发货月台专用，非发货月台分支不需要）。 */
async function loadShipStores() {
  shipStoreLoading.value = true;
  try {
    const res = await request({ url: '/djs/warehouse/packEntry/whiteBarShipStores', method: 'get' });
    shipStores.value = ((res as any).data ?? []) as WhiteBarShipStore[];
    // 当前所选门店已不在最新可选列表（需求已发完/已取消）→ 清空
    if (pickupForm.value.storeId && !shipStores.value.some((s) => String(s.storeId) === String(pickupForm.value.storeId))) {
      pickupForm.value.storeId = '';
    }
  } finally {
    shipStoreLoading.value = false;
  }
}

/** 出库位置枚举 → 后端三端点：cut=分割车间(submitPickup) / ship=发货月台(whiteBarOut) / warehouse=仓库出库(warehouseOut)。 */
type OutDest = 'cut' | 'ship' | 'warehouse';

// FIX-WMS-CUTPICKUP-SPLIT-001：按燎毛产出行出卡（半只/半扇各一张），取代原「整猪一张卡」
const items = ref<BarPickupItemVO[]>([]);
const itemLoading = ref(false);
const selectedKey = ref('');

const submitting = ref(false);
const pickupDefault = () => ({
  productWeight: undefined as number | undefined,
  outDest: 'cut' as OutDest,
  // 发货月台关联门店（ship 分支必填，后端 WhiteBarOutBo.storeId @NotNull）
  storeId: '' as number | string | '',
  // 仓库出库去向（warehouse 分支必填，字典 djs_stock_out_dest，后端 WarehouseOutBo.outDest @NotBlank）
  warehouseOutDest: '' as string
});
const pickupForm = ref(pickupDefault());

/** 卡片唯一键：产出行卡用 inhouseId，整只兜底卡用 barInfoId。 */
function itemKey(it: BarPickupItemVO): string {
  return it.inhouseId != null ? `row-${it.inhouseId}` : `bar-${it.barInfoId}`;
}

const selectedItem = computed(() => items.value.find((it) => itemKey(it) === selectedKey.value) ?? null);

const outDestOptions = computed<{ value: OutDest; label: string }[]>(() => [
  { value: 'cut', label: t('djs.warehouse.packEntry.outToCut') },
  { value: 'ship', label: t('djs.warehouse.packEntry.outToShip') },
  { value: 'warehouse', label: t('djs.warehouse.packEntry.outToWarehouse') }
]);

/** 解析来源 inhouse id：优先取该产出行 inhouseId；整只兜底卡（inhouseId 缺省）回落按耳号匹配 whiteBar 来源。 */
function resolveSourceInhouseId(it: BarPickupItemVO): number | string | undefined {
  if (it.inhouseId != null) return it.inhouseId;
  const earNo = it.earNo ?? it.barId;
  const src = sources.value.find((s) => String(s.earNo ?? '') === String(earNo));
  return src?.id;
}

/**
 * 选中一张卡：仅高亮 + 按录入模式决定要不要清空已录重量。
 *
 * 二选一（不做两边兼容）：
 * - **自动填入关（手输模式）**：清空。row203 口径——产品重量不自动预填，由用户现场过磅手工输入；
 *   不清会把上一张卡的手输重量带到新卡上，工人直接点确认就串了卡。
 * - **自动填入开（秤是唯一权威源）**：不清。工人的自然顺序是「白条先放上秤 → 再点卡片 → 确认出库」，
 *   此时清空会把秤读数抹掉，而 useScaleAutoFill 的 watch 只跟秤读数变化走——秤上东西没动就不会再回填，
 *   录入框恒空、提交被「请录入产品重量」拦死，必须把肉搬下来再放上去才有值。
 *   放弃的是「换卡自动归零」这层保护：此模式下值本来就完全镜像秤读数（取下即回 0），由秤兜底。
 */
function selectItem(it: BarPickupItemVO) {
  selectedKey.value = itemKey(it);
  if (!scaleCfg.autoFill) {
    pickupForm.value.productWeight = undefined;
  }
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
    // 【临时】一体秤验收预览：造几张待领用白条卡看版式（见 _preview.ts 两道闸与清理清单）
    if (isPreviewMode()) {
      items.value = previewBars() as unknown as BarPickupItemVO[];
      return;
    }
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
  // 领用称重校验：必填 + 不超过该白条入库重量（product_weight = 该产出行白条入库重量）。
  // 上限用入库重量而非整猪出栏重量（marketing_weight）——半只白条入库重量 << 整猪出栏重量，
  // 用出栏重量做上限会放行超量领用（领满=相等仍放行，后端再做累计口径校验）。
  const pickupWeight = pickupForm.value.productWeight;
  if (!pickupWeight || pickupWeight <= 0) {
    notifyMissing(t('djs.warehouse.packEntry.productWeightRequired'));
    return;
  }
  if (it.productWeight != null && pickupWeight > Number(it.productWeight)) {
    notifyMissing(t('djs.warehouse.packEntry.pickupWeightExceed', { weight: Number(it.productWeight) }));
    return;
  }
  submitting.value = true;
  try {
    if (pickupForm.value.outDest === 'cut') {
      // 分割车间：按燎毛产出行领用（inhouseId 非空 → 后端拆条消耗，领满才建整猪 cut_record）；
      // 整只兜底卡 inhouseId 缺省 → 整猪路径。带现场过磅，后端再校验累计 ≤ 出栏重量。
      await submitPickup({ barInfoId: it.barInfoId, inhouseId: it.inhouseId, pickupWeight });
      ElMessage.success(t('djs.warehouse.packEntry.pickupSuccess'));
    } else if (pickupForm.value.outDest === 'ship') {
      // 发货月台：白条/猪肉发货出库。来源 inhouse 优先取该产出行 id；整只兜底卡回落按耳号匹配 whiteBar 来源。
      if (!pickupForm.value.storeId) {
        notifyMissing(t('djs.warehouse.packEntry.shipStoreRequired'));
        return;
      }
      const sourceInhouseId = resolveSourceInhouseId(it);
      if (sourceInhouseId == null) {
        notifyMissing(t('djs.warehouse.packEntry.shipSourceNotFound'));
        return;
      }
      await submitWhiteBarOut({ sourceInhouseId, productWeight: pickupWeight, storeId: pickupForm.value.storeId });
      ElMessage.success(t('djs.warehouse.packEntry.shipOutSuccess'));
    } else {
      // 仓库出库：白条/猪肉出库到仓库（不发往门店），须选出库去向（字典 djs_stock_out_dest）。
      if (!pickupForm.value.warehouseOutDest) {
        notifyMissing(t('djs.warehouse.packEntry.outDestRequired'));
        return;
      }
      const sourceInhouseId = resolveSourceInhouseId(it);
      if (sourceInhouseId == null) {
        notifyMissing(t('djs.warehouse.packEntry.shipSourceNotFound'));
        return;
      }
      await submitWarehouseOut({ sourceInhouseId, productWeight: pickupWeight, outDest: pickupForm.value.warehouseOutDest });
      ElMessage.success(t('djs.warehouse.packEntry.warehouseOutSuccess'));
    }
    pickupForm.value = pickupDefault();
    selectedKey.value = '';
    await Promise.all([loadItems(), loadSources('whiteBar'), loadShipStores()]);
  } finally {
    submitting.value = false;
  }
}

/**
 * row141：刷新按钮——重拉待领用白条卡 / whiteBar 来源 / **发货门店下拉**（复用已有加载函数，不清当前录入）。
 *
 * row158：loading 由专用 refreshing 统管，不再只跟 itemLoading —— 发货门店下拉
 * （loadShipStores，当天有已确认白条需求的门店 + 需求数后缀）比白条卡慢时，
 * 按钮会提前停转，看起来像「门店下拉没被刷新」。三个请求全部落定才结束 loading。
 */
const refreshing = ref(false);
async function handleRefresh() {
  refreshing.value = true;
  try {
    await Promise.all([loadItems(), loadSources('whiteBar'), loadShipStores()]);
  } finally {
    refreshing.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadItems(), loadSources('whiteBar'), loadShipStores()]);
});
</script>

<style scoped>
/* ===== 一体秤 dense 版式（ACLAS 安卓一体秤：navbar 50 + tagsview 34 占掉后，浏览器真可视高仅 ~634-84=550px）=====
   目标：功能一个不减（numpad / 刷新 / 卡片数据行全保留），整页零滚动、底部「确认领用」完整可见。
   ① 整页贴顶：外层不加 padding，本容器只留左右 8px + 底 8px
   ② 页高按 dvh 算 —— Android Chrome 的 100vh 是「地址栏隐藏时」的高度，比真可视区大 ~90px，
      多出来的部分被 .app-main{overflow:hidden} 直接裁掉，底部按钮被切一半就是这么来的；
      旧内核不支持 dvh 时回落到上一条 100vh 声明
   ③ 页标题挪进左列（模板里已换位），右操作台才能顶到可视区最上沿
   ④ 「操作」标题去掉、刷新绝对定位到右台右上角 → 不占行高
   ⑤ numpad 12 键由 3 列 ×4 行改 4 列 ×3 行 —— 少一行 ~52px，键位反而更宽更好点
   标签与内容一律上下两行（把每段标签内联到左侧省不下高度、还难看），只收紧间距。 */
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
/* 右操作面板随左侧白条卡网格拉伸到等高（红框到底） */
.station-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  align-items: stretch;
}
/* 左列 = 页标题（固定） + 卡片滚动区 */
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
/* 245px 下限按「最长数据行不折行」反推，不是拍脑袋（1472×634 秤屏实测）：
   最长数据行「入库时间 2026-08-06 19:51:19」= label 88 + 值 121 = 209px，
   卡头「品名 + 耳号 chip」= 192px，取大者 209 + 左右内边距及边框 26 = 235px 是折行临界，取 245 留余量。
   秤屏左列净宽 800px（侧栏展开）/ 950px（收起）→ 两种情况都落 3 列：
   4 列需 ≤191px(展开) / ≤228px(收起)，都低于 235 的折行临界，硬挤只会让数据行折行、卡片反而变高。
   卡片数据行一行都不删（甲方明确要求），宁可滚动也不压小压密。 */
.bar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 12px;
  align-content: start;
  min-height: 120px;
}
.bar-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 10px 12px;
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
  margin-bottom: 8px;
}
.bar-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.bar-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 6px;
  background: var(--el-color-warning);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}
.bar-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bar-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 1.6;
}
.bar-row-label {
  /* r80：加宽到容纳最长 6 字 label「白条入库重量」单行不折 */
  width: 88px;
  flex: 0 0 88px;
  white-space: nowrap;
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
/* 右台三段式：头部（绝对定位、不占行高） + 中部滚动 + 底部按钮常驻。
   position:relative 是 .panel-head 绝对定位的参照；内边距顶部只留 6px 不贴边框。 */
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
  min-height: 0;
}
/* 刷新（本页唯一的重拉数据入口：白条卡 / 来源 / 发货门店）——缩小 + 绝对定位到右台右上角，
   不占行高，与首段标签（猪只耳号）同排。只准缩小，不准删。 */
.panel-head {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
  margin-bottom: 0;
}
.refresh-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 13px;
}
/* 中部：头部之下、按钮之上的可滚动区 */
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
/* 重量段标签行：左=标签、右=秤状态条（连接状态 / 稳定-晃动 / 自动填入开关），
   秤条并进标签行不多占一行；标签与 numpad 仍是上下两行。 */
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
.ear-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
  font-weight: 600;
  font-size: 14px;
}
.ear-chip-sub {
  font-weight: 500;
  font-size: 13px;
  opacity: 0.85;
}
.panel-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 10px;
}
.action-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
}
/* 触屏尺寸：键位 / 去向按钮仍 ≥40px 热区，只压掉多余留白。
   numpad 12 键 4 列 ×3 行（少一行 ~52px）。 */
.station-right :deep(.numpad-display) {
  height: 40px;
  margin-bottom: 8px;
}
.station-right :deep(.numpad-input) {
  font-size: 20px;
}
.station-right :deep(.numpad-keys) {
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.station-right :deep(.numpad-key) {
  height: 46px;
  font-size: 20px;
}
.station-right :deep(.dest-btn) {
  min-width: 90px;
  height: 40px;
  font-size: 15px;
}
.ship-store-select {
  width: 100%;
}
.station-right :deep(.ship-store-select .el-select__wrapper) {
  min-height: 44px;
}
</style>
