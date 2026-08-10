<template>
  <div class="pack-station" :class="{ 'pack-station--mini': mini, 'pack-station--dense': dense }">
    <div v-if="!dense" class="station-title">{{ title }}</div>

    <div class="station-body">
      <!-- 左：产品卡片网格（可滚动）+ 底部固定需求门店 tags -->
      <div class="station-left">
        <!-- dense 一体秤小屏：页标题挪进左列，右操作台才能顶到可视区最上沿（标题本身保留，不缩小） -->
        <div v-if="dense" class="station-title">{{ title }}</div>

        <!-- 果蔬打包：未匹配到领用原料对应成品时回退展示全部果蔬成品，给一行轻提示（doc#12） -->
        <div v-if="kind === 'veg' && vegMaterialFallback" class="veg-fallback-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ t('djs.warehouse.packEntry.vegMaterialFallback') }}</span>
        </div>
        <div class="card-scroll">
          <ProductCardGrid
            v-model="form.productId"
            :items="displayProducts"
            :loading="productLoading || (earGroup && sourceLoading)"
            :demand-map="demandMap"
            :stock-map="sourceFilterActive ? wipStockMap : kind === 'veg' ? vegStockMap : stockMap"
            :stock-unit="kind === 'veg' ? 'kg' : undefined"
            :stock-unit-map="sourceFilterActive ? wipStockUnitMap : undefined"
            :show-stock="showStock"
            :large="wide && !mini && !dense"
            :compact="mini"
            :dense="dense"
            :weight-in-gram="weightInGram"
            @change="onProductChange"
          />
        </div>

        <!-- 底部固定需求门店 tags（固定项常驻）：未选产品显示占位提示，选目标产品后展示各门店未发货需求份数（整数、0 不显示） -->
        <div class="demand-bar">
          <span class="demand-label">{{ t('djs.warehouse.packEntry.demandStores') }}</span>
          <div v-loading="demandLoading" class="demand-tags">
            <span v-if="!form.productId" class="text-gray-400">{{ t('djs.warehouse.packEntry.selectProductFirst') }}</span>
            <template v-else-if="visibleStoreDemands.length > 0">
              <el-tag
                v-for="sd in visibleStoreDemands"
                :key="String(sd.storeId)"
                size="large"
                class="demand-tag mr-2 mb-1 cursor-pointer"
                :type="String(form.storeId) === String(sd.storeId) ? 'primary' : 'info'"
                :effect="String(form.storeId) === String(sd.storeId) ? 'dark' : 'plain'"
                @click="pickDemandStore(sd.storeId)"
              >
                {{ sd.storeName }}({{ fmtCopies(sd.copies) }}{{ demandChipUnit }})
              </el-tag>
            </template>
            <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noDemand') }}</span>
          </div>
        </div>
      </div>

      <!-- 右：操作 panel（三段式：头部固定 + 中部可滚动 + 底部按钮区常驻，按钮绝不被底部门店需求条遮挡） -->
      <div class="station-right" :class="{ 'station-right--wide': wide }">
        <!-- dense 下「操作」标题去掉，整个 head 绝对定位到右台右上角：不占行高，视觉上与首段标签同排 -->
        <div class="panel-head">
          <span v-if="!dense" class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</span>
          <div class="panel-head-actions">
            <!-- 124#5：肉品打包隐藏右上角「打包序号 NO.x」（hidePackNo=true）；其他打包页仍显示 -->
            <span v-if="!hidePackNo" class="pack-no">{{ t('djs.warehouse.packEntry.packNo') }} NO.{{ packNo }}</span>
            <!-- admin row79-82：四类打包页共用刷新入口，重拉来源、成品、库存和需求。 -->
            <!-- admin row147：打包站是触屏作业，按钮放大到 large 并加宽点击区，方便手指点中（dense 小屏回落到 default）。 -->
            <el-button class="refresh-btn" :size="dense ? 'default' : 'large'" :icon="Refresh" :loading="refreshing" @click="handleRefresh">
              {{ t('common.refresh') }}
            </el-button>
          </div>
        </div>

        <!-- 中部可滚动区（头部之下、按钮之上；内容超高在此内部滚动，不外溢到页脚） -->
        <div class="panel-scroll">
          <!-- 肉品打包：右台顶部回显选中猪只耳号 chip（对齐原型） -->
          <div v-if="showEarChip" class="panel-section">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
            <div v-if="selectedSource && selectedSource.earNo" class="ear-chip">
              <el-icon><PriceTag /></el-icon>
              <span>{{ selectedSource.earNo }}</span>
            </div>
            <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.sourceRequired') }}</span>
          </div>

          <!-- 肉品：耳号 button-toggle（顶部，按已领用出库猪肉来源耳号去重，选耳号再过滤来源） -->
          <template v-if="earGroup">
            <div class="panel-section">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.earNo') }}</div>
              <div v-loading="sourceLoading">
                <DestToggle
                  v-model="selectedEarNo"
                  :options="earToggleOptions"
                  :empty-text="t('djs.warehouse.packEntry.noEarSource')"
                  @change="onEarChange"
                />
              </div>
            </div>
          </template>

          <!-- 果蔬：地块 button-toggle（顶部，选地块再过滤来源） -->
          <template v-if="plotGroup">
            <div class="panel-section">
              <div class="panel-label">{{ t('djs.warehouse.packEntry.plot') }}</div>
              <div v-loading="sourceLoading || plotLoading">
                <DestToggle
                  v-model="selectedPlotId"
                  :options="plotToggleOptions"
                  :empty-text="t('djs.warehouse.packEntry.noPlotSource')"
                  @change="onPlotChange"
                />
              </div>
            </div>
          </template>

          <!-- 来源过程产品（肉品/果蔬=来源 chip 选择；礼盒无；可按 showSource 隐藏） -->
          <div v-if="kind !== 'gift' && showSource" class="panel-section">
            <div class="panel-label">{{ kind === 'veg' ? t('djs.warehouse.packEntry.sourceVeg') : t('djs.warehouse.packEntry.source') }}</div>
            <div v-loading="sourceLoading">
              <DestToggle
                v-model="form.sourceInhouseId"
                :options="sourceToggleOptions"
                :empty-text="t('djs.warehouse.packEntry.sourcePlaceholder')"
                @change="onSourceChange"
              />
            </div>
          </div>

          <!-- 重量 numpad（普通打包）/ 盒数 numpad（礼盒）/ 份数 numpad（其他产品按份数计量） -->
          <div class="panel-section">
            <!-- 标签行：左=标签、右=秤状态条（接秤的页才有）；标签与录入内容始终上下两行，不做左右分栏 -->
            <div class="weight-label-row">
              <!-- mini 称重页由 ScaleWeightInput 自带标签头，隐藏此外层标签避免重复 -->
              <div v-if="!(mini && kind !== 'gift' && !shouldUnitByCopies)" class="panel-label">
                {{
                  kind === 'gift'
                    ? t('djs.warehouse.packEntry.packAmount')
                    : dryNonKgAmountMode
                      ? t('djs.warehouse.packEntry.packAmount')
                      : t('djs.warehouse.packEntry.productWeight')
                }}
              </div>
              <!-- 接秤的页（scaleFill）：秤状态 + 自动填入；自动填入开时录入值实时镜像秤读数 -->
              <ScaleFillBar v-if="showScaleBar" v-model="form.productWeight" :in-gram="kind === 'veg' || effWeightInGram" />
            </div>
            <div class="weight-col">
              <!-- mini 小屏：秤重量做成可编辑输入框（替代触屏 numpad，自动填入 + 可手改） -->
              <ScaleWeightInput
                v-if="mini && kind !== 'gift' && !shouldUnitByCopies"
                v-model="form.productWeight"
                :in-gram="kind === 'veg' || effWeightInGram"
                :unit="selectedUnit"
                :label="t('djs.warehouse.packEntry.productWeight')"
              />
              <WeightNumpad
                v-else-if="kind === 'gift'"
                v-model="form.packBoxCount"
                :placeholder="t('djs.warehouse.packEntry.packAmount')"
                :unit="selectedProduct?.productUnit || t('djs.warehouse.packEntry.box')"
                :precision="0"
              />
              <WeightNumpad
                v-else
                v-model="form.productWeight"
                :placeholder="
                  dryNonKgAmountMode
                    ? t('djs.warehouse.packEntry.packAmount')
                    : shouldUnitByCopies
                      ? t('djs.warehouse.packEntry.packCopies')
                      : t('djs.warehouse.packEntry.weightPlaceholder')
                "
                :unit="selectedUnit"
                :precision="numpadPrecision"
              />
              <!-- row74（Kevin 2026-07-14）：所有打包一律不展示「剩余可打包份数」提示。
                 remainingPackableCopies computed 仍保留，供份数模式提交前的 copiesExceed 前端软校验用（见 submit 校验）。 -->
            </div>
          </div>

          <!-- 电子秤实时重量（非 mini：大显示 + 填入/归零/去皮）；mini 已并入 ScaleWeightInput 输入框 -->
          <div v-if="!mini && enableScale && kind !== 'gift' && !shouldUnitByCopies" class="panel-section">
            <ScaleReader :in-gram="kind === 'veg' || effWeightInGram" @fill="(v) => (form.productWeight = v)" />
          </div>

          <!-- 发送位置 button-toggle（其他产品打包二选无礼盒；礼盒不显示） -->
          <!-- 124#3：发送位置按钮（发货月台/礼盒）加大，触屏易点（send-dest-toggle 放大 dest-btn） -->
          <div v-if="sendDests.length > 0" class="panel-section send-dest-toggle">
            <div class="panel-label">{{ t('djs.warehouse.packEntry.sendDest') }}</div>
            <DestToggle v-model="form.deliverDest" :options="sendDests" />
          </div>
        </div>
        <!-- /panel-scroll -->

        <div class="panel-actions">
          <el-button
            v-if="showPrintTrace"
            type="primary"
            size="large"
            class="action-btn"
            :loading="submitting"
            :disabled="printTraceDisabled"
            @click="handleSubmit(true)"
          >
            {{ t('djs.warehouse.packEntry.confirmPrintTrace') }}
          </el-button>
          <el-button type="primary" size="large" class="action-btn" :loading="submitting" @click="handleSubmit(false)">
            {{ t('common.confirm') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 追溯码二维码标签卡（复用门店追溯标签组件，扫码落地 /trace/{type}/{code}） -->
    <TraceLabelDialog ref="traceLabelRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { InfoFilled, PriceTag, Refresh } from '@element-plus/icons-vue';
import ProductCardGrid from './components/ProductCardGrid.vue';
import WeightNumpad from './components/WeightNumpad.vue';
import ScaleFillBar from './components/ScaleFillBar.vue';
import ScaleReader from './components/ScaleReader.vue';
import ScaleWeightInput from './components/ScaleWeightInput.vue';
import DestToggle from './components/DestToggle.vue';
import TraceLabelDialog from '@/views/djs-store/trace/components/TraceLabelDialog.vue';
import { traceTypeFromCode } from '@/views/djs-store/trace/components/traceType';
import { parseTime } from '@/utils/ruoyi';
import { usePackEntryOptions } from './useOptions';
import {
  listMaterialStock,
  listStoreDemand,
  listStoreDemandBatch,
  submitDryPack,
  submitGiftPack,
  submitVegPack
} from '@/api/djs-warehouse/packEntry';
import type { DeliverDest, DryPackBo, GiftPackBo, PackSourceVO, StoreDemandCopiesVO, VegPackBo } from '@/api/djs-warehouse/packEntry';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

/**
 * SKU 打包共享操作台（A5）——对齐原型左卡片网格 + 右 numpad panel form factor。
 *
 * 三业态共用：
 *   kind='dry'  肉品打包 / 其他产品打包（来源过程产品 → 目标 SKU + 单位 kg/个）
 *   kind='veg'  果蔬打包（地块来源蔬菜 → 目标蔬菜 SKU，单位固定 kg）
 *   kind='gift' 礼盒打包（仅选礼盒 SKU + 盒数；礼盒 = 自产 + belong_type=gift_box，独立成品打 N 盒，不消耗组件）
 *
 * 交互对齐（DJS-FIX-WMS-PACK）：
 *   左：ProductCardGrid 选目标产品（规格/需求量/原材料库存）+ 底部需求门店 tags
 *   右：来源 → WeightNumpad 录重 → DestToggle 发送位置/入库位置 → 确认 / 确认并打印追溯码
 *   sendDestKinds  发送位置可选项：肉品/果蔬=三选(发货月台/邮寄/礼盒) 其他=二选(发货月台/邮寄) gift 不显示
 *   showPrintTrace 是否显示「确认并打印追溯码」：肉品/果蔬=true 其他/礼盒=false
 */
const props = withDefaults(
  defineProps<{
    kind: 'dry' | 'veg' | 'gift';
    title: string;
    /** 目标产品 productType 过滤：dry/veg=1 自产；礼盒不传（按 belong_type=gift_box 过滤，djs_product_type 已废弃 3） */
    productType?: number;
    /** 目标产品 belong_type 过滤（如 'pork' 肉品打包仅猪肉产品）；不传=不限 */
    belongType?: string;
    /** 目标产品 belong_type 集合过滤（如 ['egg','dry_good','other'] 其他产品打包）；非空落 belong_type IN */
    belongTypes?: string[];
    /** 目标产品 djs_product_workshop 车间码字符串过滤（如 '3'）；命中「挂了该车间」的产品，不传=不限 */
    productWorkshop?: string;
    /** 目标产品 djs_product_attr 过滤（1=生产产品/打包目标成品，取数逻辑 doc#13）；不传=不限 */
    productAttr?: number;
    /** 发送位置可选项（缺省三选）；传 [] 不显示 */
    sendDestKinds?: DeliverDest[];
    /** 是否显示「确认并打印追溯码」 */
    showPrintTrace?: boolean;
    /** 卡片是否显示「原材料库存」行（其他产品打包原型无此行；缺省随业态：礼盒不显示其余显示） */
    showStock?: boolean;
    /** 顶部地块卡片选择（果蔬打包专用：按来源 plotId 分组，选地块再选该地块来源） */
    plotGroup?: boolean;
    /** 顶部耳号选择条（肉品打包专用：按已领用出库猪肉来源 earNo 去重，选耳号再选该耳号来源） */
    earGroup?: boolean;
    /** 是否显示「来源/来源产品」chip 选择区（肉品/其他产品打包按需隐藏；缺省显示） */
    showSource?: boolean;
    /**
     * 其他产品打包：隐藏来源选择 panel，但仍是「领用驱动」——选目标成品后按其有效原材料
     * 自动解析今日领用来源 inhouse（无追溯码、来源对工人无意义、不需手选）。
     * 与 showSource 互斥（一个手选、一个自动）；两者任一为真都算「领用驱动 dry」。
     */
    autoSource?: boolean;
    /** 是否显示「猪只耳号」回显 chip（其他产品打包隐藏；缺省随业态：dry 显示） */
    showEar?: boolean;
    /** 宽版布局（肉品打包：产品卡片放大 + 右操作台加宽，填充空白）；缺省紧凑版，其他打包页零影响 */
    wide?: boolean;
    /**
     * 录入/展示单位用「克(g)」（肉品打包 124#6）：numpad 单位显 g、整数录入，提交前 ÷1000 换算成 kg 落库
     * （系统权威量纲=kg，与果蔬 g→kg 同口径）；卡片「领用剩余重量」用 formatKgToG 展示为克。
     * 缺省 false，其他打包页录入仍按 kg，零影响。
     */
    weightInGram?: boolean;
    /** 隐藏右上角「打包序号 NO.x」（肉品打包 124#5）；缺省显示，其他打包页零影响 */
    hidePackNo?: boolean;
    /**
     * 挂载/刷新后自动选中第一个有门店需求的产品（肉品打包 124#1，减少选择）；
     * 缺省 false，其他打包页零影响。同时自动选中第一个猪只耳号（124#4，仅 earGroup 生效）。
     */
    autoSelectFirst?: boolean;
    /** 是否显示电子秤实时重量小部件（enableScale 的页试点，如肉品打包）；缺省 false，其他页零影响 */
    enableScale?: boolean;
    /**
     * 重量录入接电子秤（numpad 上方加一条：连接状态 + 稳定/晃动 + 自动填入开关）。
     * 自动填入开时录入值完全镜像秤推送重量（放上=实重、取下=0），关掉才是纯手输 numpad。
     * 与 mini（ScaleWeightInput 自带头）互斥；缺省 false，其他打包页零影响。
     */
    scaleFill?: boolean;
    /** 小屏 mini 模式（TSX-615 一体秤适配试点）：右台上移 / 卡片缩小一排多个 / 去 numpad / 秤重量做成可编辑输入框；缺省 false，其他页零影响 */
    mini?: boolean;
    /**
     * dense 小屏紧凑模式（一体秤浏览器可视高 ~600px，整页零滚动）：保留 numpad 与全部功能，只压高度——
     * 「操作」头去掉（打包序号+刷新上提到页标题行）/ 各段标签内联到控件左侧 / 段间距收紧 /
     * numpad 12 键改 4 列 ×3 行 / 页高按 dvh 算。缺省 false，其他打包页零影响。
     */
    dense?: boolean;
  }>(),
  {
    productType: undefined,
    belongType: undefined,
    belongTypes: undefined,
    productWorkshop: undefined,
    productAttr: undefined,
    sendDestKinds: () => ['platform', 'mail', 'gift'],
    showPrintTrace: true,
    showStock: undefined,
    plotGroup: false,
    earGroup: false,
    showSource: true,
    autoSource: false,
    showEar: undefined,
    wide: false,
    weightInGram: false,
    hidePackNo: false,
    autoSelectFirst: false,
    enableScale: false,
    scaleFill: false,
    mini: false,
    dense: false
  }
);

/**
 * submitted：单次打包提交成功后触发（携带新建 production.id），
 * 供父页（如果蔬打包）刷新「当日损耗」等派生统计。不监听则无副作用（向后兼容）。
 */
const emit = defineEmits<{ submitted: [id: number | string | undefined] }>();

const { t } = useI18n();

const showPrintTrace = computed(() => props.showPrintTrace);

// 缺省随业态：礼盒无原材料库存，其余显示；显式传 showStock 时以传入为准（其他产品打包传 false）
const showStock = computed(() => (props.showStock == null ? props.kind !== 'gift' : props.showStock));

const SEND_DEST_LABEL_KEY: Record<DeliverDest, string> = {
  platform: 'djs.warehouse.packEntry.sendDestPlatform',
  mail: 'djs.warehouse.packEntry.sendDestMail',
  gift: 'djs.warehouse.packEntry.sendDestGift'
};
const sendDests = computed(() => (props.sendDestKinds ?? []).map((v) => ({ value: v as number | string, label: t(SEND_DEST_LABEL_KEY[v]) })));

const {
  products,
  productLoading,
  sources,
  sourceLoading,
  plotMap,
  plotLoading,
  stores,
  loadProducts,
  loadVegProductsByMaterial,
  loadStores,
  loadSources,
  loadPlots
} = usePackEntryOptions();

// doc/14 §1：打包来源 = 全部「活动（未打包）」inhouse WIP。不再按「近 1-2 天」过滤——
// 统一 WIP 模型下，未打包的领用库存持续可见直到被打包消耗（consumeInhouse 按实重扣减），
// 旧日期的未打包 WIP 仍属「待打包」，按日期藏掉会让原料库存口径错（漏计旧 WIP）。
const effectiveSources = computed<PackSourceVO[]>(() => sources.value);

const submitting = ref(false);
const refreshing = ref(false);

/** 追溯码二维码标签卡组件 ref（提交成功后 open 生成二维码供打印）。 */
const traceLabelRef = ref<InstanceType<typeof TraceLabelDialog>>();

/** 打包序号 NO.x：会话内递增（每次成功提交 +1），对齐原型右台「打包序号 NO.2」展示。 */
const packNo = ref(1);

/** 肉品打包右台顶部回显猪只耳号 chip：dry 业态且来源带耳号时显示（其他产品打包可关闭）。 */
const showEarChip = computed(() => props.kind === 'dry' && (props.showEar == null ? true : props.showEar));

interface PackFormShape {
  sourceInhouseId: number | string | '';
  productId: number | string | '';
  productWeight: number | undefined;
  packBoxCount: number | undefined;
  productUnit: string;
  productSpec: string | undefined;
  locationId: number | string | '';
  storeId: number | string | '';
  deliverDest: DeliverDest | undefined;
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
  // 发送位置默认「发货月台」(platform)：肉品/果蔬/其他打包首选发货月台（最常用），每次提交 reset 后仍保持默认。
  // 礼盒(gift)不展示发送位置、sendDestKinds 不含 platform → 保持 undefined。
  deliverDest: (props.sendDestKinds ?? []).includes('platform') ? 'platform' : undefined,
  proofOssIds: undefined,
  remark: undefined
});

const form = ref<PackFormShape>(defaultForm());

// 门店(N份) 标签条：选目标产品后按 productId 拉各门店未发货需求份数
const storeDemands = ref<StoreDemandCopiesVO[]>([]);
const demandLoading = ref(false);
let storeDemandRequestSeq = 0;
let storeDemandInFlight: { productId: string; promise: Promise<void> } | undefined;

function loadStoreDemand(productId: number | string | ''): Promise<void> {
  if (!productId) {
    storeDemandRequestSeq++;
    storeDemandInFlight = undefined;
    storeDemands.value = [];
    demandLoading.value = false;
    return Promise.resolve();
  }
  const key = String(productId);
  if (storeDemandInFlight?.productId === key) return storeDemandInFlight.promise;
  const requestSeq = ++storeDemandRequestSeq;
  demandLoading.value = true;
  const task = (async () => {
    const res = await listStoreDemand(productId);
    // 产品快速切换时，较慢的旧响应不得覆盖当前产品需求。
    if (requestSeq === storeDemandRequestSeq) {
      storeDemands.value = ((res as any).data ?? []) as StoreDemandCopiesVO[];
    }
  })().finally(() => {
    if (storeDemandInFlight?.promise === task) {
      storeDemandInFlight = undefined;
      demandLoading.value = false;
    }
  });
  storeDemandInFlight = { productId: key, promise: task };
  return task;
}

function pickDemandStore(storeId: number | string) {
  form.value.storeId = storeId;
}

// 需求门店 tags：只显示份数 > 0 的门店（原型/测试：0 份不显示）
const visibleStoreDemands = computed(() => storeDemands.value.filter((sd) => (Number(sd.copies) || 0) > 0));

watch(
  () => form.value.productId,
  (pid) => {
    void loadStoreDemand(pid);
  }
);

// row130#4：点选产品后若有门店需求，默认选中其中一个门店（取第一个有未发货需求的门店）。
// 仅在当前未选中有效门店时自动补选——已手选门店不覆盖；所选门店已打满（不在可见需求里）则改选第一个。
watch(visibleStoreDemands, (list) => {
  if (!form.value.productId || list.length === 0) return;
  const stillValid = form.value.storeId && list.some((sd) => String(sd.storeId) === String(form.value.storeId));
  if (!stillValid) {
    form.value.storeId = list[0].storeId;
  }
});

// 发送位置默认选第一项（发货月台 platform）；礼盒无 sendDests 时保持空
watch(
  sendDests,
  (dests) => {
    if (!form.value.deliverDest && dests.length > 0) {
      form.value.deliverDest = dests[0].value as DeliverDest;
    }
  },
  { immediate: true }
);

// 卡片网格「需求量」聚合：各产品所有门店未发货需求份数之和（productId → 总份数）
const demandMap = ref<Record<string, number>>({});

/**
 * 需求量显示口径（row66）：卡片「需求量」与底部门店需求 chip 必须用同一口径，否则单门店时
 * 卡片(不取整 3.292)与 chip(Math.round 3)对不上。统一保留至多 3 位小数（kg 精度，对齐 veg 日损耗 toFixed(3)），
 * 并消除浮点求和尾差（如 2+0.099 的 FP 噪声）。
 * 注：copies 后端为 kg 量（demand_quantity − 已打包 kg），单位标签「份」对 kg 产品的口径待确认（见 queue）。
 */
function fmtCopies(v: number | string | undefined | null): number {
  const n = Number(v) || 0;
  return Math.round(n * 1000) / 1000;
}

async function loadDemandMap() {
  // 批量端点去前端 N+1（onMounted / 每次「确定」后 refreshAfterPack 从 N 请求降为 1 请求）。
  // 口径与原逐产品 reduce 完全一致：同 fmtCopies、同 Number()||0、同求和。
  const ids = products.value.map((p) => p.id);
  if (ids.length === 0) {
    demandMap.value = {};
    return;
  }
  const map: Record<string, number> = {};
  // 请求失败时让刷新链报错并保留上一版需求数据；将失败伪装成 0 会让操作员误判
  // “需求已完成”，也会使卡片在瞬时网络错误后展示假数据。
  const res = await listStoreDemandBatch(ids);
  const grouped = ((res as any).data ?? {}) as Record<string, StoreDemandCopiesVO[]>;
  ids.forEach((id) => {
    const rows = grouped[String(id)] ?? [];
    map[String(id)] = fmtCopies(rows.reduce((sum, r) => sum + (Number(r.copies) || 0), 0));
  });
  demandMap.value = map;
}

/**
 * 卡片网格「原材料库存」（库存口径统一，取数逻辑 doc#13）：
 * key = 成品雪花 id 字符串，value = 该成品 product_material 指向的原材料 location_stock 合计（number）
 * 或 null（成品未配 product_material，前端展示 '—'，不参与校验）。
 *
 * 与打包校验/扣减口径完全一致（后端 listMaterialStock → sumProductStock），
 * 修复原先「卡片取来源 inhouse 汇总 ≠ 后端按 product_material 扣减」的口径分裂。
 */
const stockMap = ref<Record<string, number | null>>({});

async function loadMaterialStock() {
  if (!showStock.value) return;
  const ids = products.value.map((p) => p.id);
  if (ids.length === 0) {
    stockMap.value = {};
    return;
  }
  const res = await listMaterialStock(ids);
  const remote = ((res as any).data ?? {}) as Record<string, string>;
  const map: Record<string, number | null> = {};
  // 后端只返「已配 product_material」成品的库存；未在返回里的成品置 null → 卡片展示 '—'
  products.value.forEach((p) => {
    const key = String(p.id);
    map[key] = key in remote ? Number(remote[key]) : null;
  });
  stockMap.value = map;
}

/**
 * 果蔬打包成品「按领用原料 product_material 匹配」回退提示（doc#12）：
 * 推导原料 id 为空 或 命中成品为空 → 回退展示全部果蔬自产成品并提示，避免静默空白。
 */
const vegMaterialFallback = ref(false);

/**
 * 果蔬打包成品加载（doc#12）：从已加载的 veg 来源推导本次领用原料 id（去重、跳过空 productId），
 * 调按 product_material 反查的端点；推导为空或命中为空 → 回退全部果蔬成品 + 顶部轻提示。
 * 依赖 sources 已 loadSources('veg') 完成。
 */
async function loadVegProducts() {
  // 今天领用过滤（doc/14 §5）：后端 listSourceForVeg 已按 DATE(produce_date)=今天 过滤，
  // 这里只从「今天领用」的 veg 来源推导本次领用原料 id。
  const materialIds = Array.from(
    new Set(
      effectiveSources.value
        .map((s) => s.productId)
        .filter((id): id is number => id != null)
        .map((id) => String(id))
    )
  );
  // 今天没领用 → 直接空（须先 mp 领用才有料；不回退显示全部）
  if (materialIds.length === 0) {
    products.value = [];
    vegMaterialFallback.value = false;
    return;
  }
  const count = await loadVegProductsByMaterial(materialIds);
  // 有当天领用但 product_material 未配（命中 0）→ 仍回退显全部 + 提示（doc#12 安全兜底：
  // 可打包却因未配料空白会卡住工人；此时显全部 + 顶部提示，与「无领用直接空」区分）。
  if (count === 0) {
    vegMaterialFallback.value = true;
    await loadVegProductsByMaterial([]);
  } else {
    vegMaterialFallback.value = false;
  }
}

function onProductChange(item: ProductInfoVO) {
  // 选卡片回填默认单位/规格，方便录入
  if (item.productUnit) form.value.productUnit = item.productUnit;
  if (item.productSpec && !form.value.productSpec) form.value.productSpec = item.productSpec;
  // 肉品打包：换产品 → 清耳号 + 来源（耳号按产品过滤，残留旧产品耳号会导致来源歧义）
  if (props.earGroup) {
    selectedEarNo.value = '';
    form.value.sourceInhouseId = '';
  }
  // 果蔬打包：换产品 → 清地块 + 来源（地块现按产品过滤，残留旧产品地块会落到错误来源/空高亮）
  if (props.plotGroup) {
    selectedPlotId.value = '';
    form.value.sourceInhouseId = '';
  }
}

// 果蔬地块：按来源 plotId 分组成 button-toggle；选地块后来源下拉只显示该地块来源
const selectedPlotId = ref<number | string | ''>('');

/** 外购无地块来源（plotId==null）的「无地块信息」选项哨兵 value（doc#13）；选中时提交不带 plotId。 */
const NO_PLOT_SENTINEL = '__no_plot__';

/** 无耳号猪肉（外购/无耳标，earNo==null）的「无耳号」选项哨兵 value（镜像 NO_PLOT_SENTINEL）；选中时按无耳号来源解析、追溯不打印耳号。 */
const NO_EAR_SENTINEL = '__no_ear__';

const plotToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.plotGroup) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  let hasNoPlot = false;
  // 已选目标产品时，地块只列该产品有效原材料的来源（成品→原材料 / 成品即原材料），避免地块歧义（镜像 earToggleOptions）
  const matId = materialIdOf(form.value.productId);
  effectiveSources.value.forEach((s) => {
    if (matId && String(s.productId) !== matId) return;
    if (s.plotId == null) {
      // 外购无地块来源聚合成单个「无地块信息」可选项（doc#13），不再过滤丢弃
      hasNoPlot = true;
      return;
    }
    const key = String(s.plotId);
    if (!seen.has(key)) {
      seen.set(key, { value: s.plotId, label: plotMap.value[key] || `${t('djs.warehouse.packEntry.plot')} ${key}` });
    }
  });
  const opts = Array.from(seen.values());
  if (hasNoPlot) {
    opts.push({ value: NO_PLOT_SENTINEL, label: t('djs.warehouse.packEntry.noPlotInfo') });
  }
  return opts;
});

// row44：地块选项就绪且尚未选时，自动选中第一项（对齐肉品耳号 autoSelectFirst，多地块也默认选首个），
// 「领用剩余重量」随所选地块聚合（见 vegStockMap）。含「无地块信息」单独成项的情况。
watch(
  plotToggleOptions,
  (opts) => {
    if (props.plotGroup && opts.length > 0 && !selectedPlotId.value) {
      selectedPlotId.value = opts[0].value;
    }
  },
  { immediate: true }
);

/**
 * 成品的「有效原材料 id」（doc/14 §5）：配了 product_material → 原材料 id（领用原料 → 打包成该成品）；
 * 否则成品即原材料（product_material 空）→ 成品自身 id。**领用只领原料(attr=2)，inhouse 永远落在原料上**，
 * 故按原材料维度单向反查即可（猪皮原料 → 猪皮200/500 多成品共享同一原料池）。
 */
function effectiveMaterialId(p: ProductInfoVO): string {
  return p.productMaterial != null ? String(p.productMaterial) : String(p.id);
}
/** 由成品 productId 反查其有效原材料 id（来源 inhouse 按原材料维度匹配耳号用）。 */
function materialIdOf(productId: number | string | ''): string {
  if (!productId) return '';
  const p = products.value.find((x) => String(x.id) === String(productId));
  return p ? effectiveMaterialId(p) : String(productId);
}

// 其他产品打包「领用驱动 dry」模式：手选来源(showSource) 或 自动解析来源(autoSource) 都算（互斥但同口径）；
// 肉品打包(earGroup) 单列。果蔬(veg)/礼盒(gift) 不在内。
const dryReqMode = computed(() => props.kind === 'dry' && !props.earGroup && (props.showSource || props.autoSource));

// 「按今天领用来源过滤成品」生效场景：① 肉品打包(earGroup) ② 其他产品打包(dryReqMode，egg/dry_good/other)。
// 两者来源都是「今天已领用原料 inhouse」(meat/dry source)；果蔬(veg)走 loadVegProducts 自带过滤、礼盒(gift)无来源，均不在此列。
const sourceFilterActive = computed(() => props.earGroup || dryReqMode.value);

/**
 * 自动解析来源（autoSource，其他产品打包无追溯码/无需手选来源）：选目标成品后，按其有效原材料
 * 匹配今日领用来源 inhouse；多条领用时取剩余最多的一条（单次打包从单条来源扣，与原手选 chip 同口径）。
 * 成品未在领用列表（理论上 displayProducts 已滤掉）→ 清空，validate 兜底拦。
 */
function resolveAutoSource() {
  if (!props.autoSource) return;
  const matId = materialIdOf(form.value.productId);
  if (!matId) {
    form.value.sourceInhouseId = '';
    return;
  }
  const candidates = effectiveSources.value.filter((s) => String(s.productId) === matId);
  if (candidates.length === 0) {
    form.value.sourceInhouseId = '';
    return;
  }
  const best = candidates.reduce((a, b) => ((Number(b.productWeight) || 0) > (Number(a.productWeight) || 0) ? b : a));
  form.value.sourceInhouseId = best.id;
}

// autoSource：目标产品或领用来源变化 → 重解析来源（覆盖选卡片 / 提交后刷新 / 来源加载完成各场景）。
watch([() => form.value.productId, effectiveSources], () => {
  if (props.autoSource) resolveAutoSource();
});

// 左侧卡片：只显「今天有领用原料」的成品 —— 即其有效原材料出现在 sources（已领用原料 inhouse）。
// 同一原材料的多个规格成品（猪皮原料 → 猪皮200/500）都会命中（一料多品共享池，doc/14 §5）。
const requisitionedProductIds = computed<Set<string>>(() => {
  const set = new Set<string>();
  if (!sourceFilterActive.value) return set;
  effectiveSources.value.forEach((s) => {
    if (s.productId != null) set.add(String(s.productId));
  });
  return set;
});

const displayProducts = computed<ProductInfoVO[]>(() =>
  sourceFilterActive.value ? products.value.filter((p) => requisitionedProductIds.value.has(effectiveMaterialId(p))) : products.value
);

// 124#1：肉品打包挂载/刷新后，若尚未选产品，自动选中第一个「有门店需求」的产品（减少选择）。
// 依赖 displayProducts + demandMap（各成品聚合门店需求份数）均已加载。产品或需求变化后重触发，
// 但仅在「未选产品」时补选，不覆盖用户手选。缺省 autoSelectFirst=false，其他打包页零影响。
watch(
  [displayProducts, demandMap],
  ([items, dmap]) => {
    if (!props.autoSelectFirst) return;
    if (form.value.productId) return;
    const first = items.find((p) => Number(dmap[String(p.id)] || 0) > 0);
    if (first) form.value.productId = first.id;
  },
  { immediate: true }
);

// 「领用剩余重量」= 今日领用待打包库存（doc/14 §5）：成品经有效原材料 id 聚合今日领用来源 inhouse 的 productWeight。
// 同一原材料的多个成品卡共享同一池（一料多品）。**肉品打包(earGroup) 与 其他产品打包(dry+showSource) 同口径**——
// 都以「今天领用的原料 inhouse」(sources) 为库存，与右侧来源 chip / 后端 consumeInhouse 扣减口径一致。
// 不取仓库 location_stock 全量（那是该原料的仓库总余额、跨库位累加、远大于本次领用，
// 摆在「领用剩余重量」行会误导工人——如领 200 枚却显 9847）。
const wipStockMap = computed<Record<string, number | null>>(() => {
  const m: Record<string, number | null> = {};
  if (!sourceFilterActive.value) return m;
  const byMaterial: Record<string, number> = {};
  effectiveSources.value.forEach((s) => {
    if (s.productId == null) return;
    const k = String(s.productId);
    byMaterial[k] = (byMaterial[k] ?? 0) + (Number(s.productWeight) || 0);
  });
  products.value.forEach((p) => {
    const w = byMaterial[effectiveMaterialId(p)];
    if (w == null) return;
    // admin row20：按 3 位小数(1g)舍入，不能按 2 位(0.01kg=10g)——否则 4.498kg 被舍成 4.50kg、
    // g 展示成 4500g 丢掉 2g（领用5000g打包502g应剩4498g，原显4500g）。
    m[String(p.id)] = Math.round(w * 1000) / 1000;
  });
  // 肉品打包(earGroup) 选中耳号后，「领用剩余重量」应显该耳号的领用剩余(per-ear)，而非跨耳号合计——
  // 同一原料从多个猪只耳号领用时，切换耳号剩余重量随之变化。
  // row26：per-ear 剩余按「原材料 + 耳号」整体折算，同一原材料的**所有**成品卡都显示同一 per-ear 值
  //        （不只覆盖当前选中卡）——同料多品的领用剩余重量必须一致，都随所选耳号联动（客户 2026-07-21）。
  if (props.earGroup && selectedEarNo.value && selectedProduct.value) {
    const matId = effectiveMaterialId(selectedProduct.value);
    const isNoEar = selectedEarNo.value === NO_EAR_SENTINEL;
    let earWeight = 0;
    effectiveSources.value.forEach((s) => {
      if (String(s.productId) !== matId) return;
      if (isNoEar ? !!s.earNo : String(s.earNo) !== String(selectedEarNo.value)) return;
      earWeight += Number(s.productWeight) || 0;
    });
    const earVal = Math.round(earWeight * 1000) / 1000;
    products.value.forEach((p) => {
      if (effectiveMaterialId(p) === matId) {
        m[String(p.id)] = earVal;
      }
    });
  }
  return m;
});

// 「领用剩余重量」单位 = 成品有效原材料（领用来源）的单位，而非成品自身单位。
// 例：原料土鸡蛋单位「枚」，成品「鸡蛋10个装」单位「份」——库存值是原料的枚数，须按「枚」展示（200 枚），
// 否则渲染成「200 份」（200 枚≠200 份，单位错位）。份数换算交由右台「剩余可打包份数」
// （remainingPackableCopies = floor(枚 / materialNum)）呈现。肉品 pork 原料/成品同为 kg，传此 map 后结果不变。
const wipStockUnitMap = computed<Record<string, string>>(() => {
  const u: Record<string, string> = {};
  if (!sourceFilterActive.value) return u;
  const unitByMaterial: Record<string, string> = {};
  effectiveSources.value.forEach((s) => {
    if (s.productId == null || !s.productUnit) return;
    const k = String(s.productId);
    if (!(k in unitByMaterial)) unitByMaterial[k] = s.productUnit;
  });
  products.value.forEach((p) => {
    const unit = unitByMaterial[effectiveMaterialId(p)];
    if (unit) u[String(p.id)] = unit;
  });
  return u;
});

/**
 * 果蔬打包「领用剩余重量」= 成品经 product_material 反查原材料后，聚合该原材料全部活动来源 inhouse(sources) 的 productWeight。
 * **同一原材料的多个成品卡共享同一领用池**。
 * 取 `sources`（全部活动 inhouse，不限日期）；成品未配 product_material → 不入 map（卡片显 '—'）。
 *
 * 不再扣减「已打包总重」：后端 consumeInhouse 打包时已从源 inhouse 行实时扣减本次重量，
 * sources 重新加载后已反映扣减；前端若再减 packedWeightMap 会把同一次打包量重复扣两次（row45 双重扣减 bug）。
 * 数值全程 Number() 强转（防 BigDecimal 序列化字符串拼接坑）。
 *
 * row30（领用剩余重量常显）：镜像肉品 wipStockMap「选耳号后覆盖同料卡」两段式——
 * 第一步按**不分地块**的完整 sources 给所有配了 product_material 的成品卡一个「地块无关领用总重量」基线（常显）；
 * 第二步仅当已选目标成品 + 选中地块时，按所选地块(含无地块哨兵)重算所选产品原材料的量、覆盖该原材料对应的同料卡。
 * 之前无条件按 selectedPlotId 过滤 sources（挂载即被 immediate watch 设成首地块），只含该地块有来源的原材料 →
 * 其它地块领用的产品卡无 map 条目 → hasStockEntry=false 整行不显示（row30 根因）。
 */
const vegStockMap = computed<Record<string, number | null>>(() => {
  const m: Record<string, number | null> = {};
  if (props.kind !== 'veg') return m;
  // 第一步：按原材料 id 聚合**完整** sources（不分地块）的来源 inhouse 重量（source.productId = 原材料 id；已含后端打包扣减），
  // 给所有配了 product_material 的成品卡「地块无关领用总重量」基线，实现常显。
  const totalByMaterial: Record<string, number> = {};
  sources.value.forEach((s) => {
    if (s.productId == null) return;
    const k = String(s.productId);
    totalByMaterial[k] = (totalByMaterial[k] ?? 0) + (Number(s.productWeight) || 0);
  });
  products.value.forEach((p) => {
    if (p.productMaterial == null) return;
    const picked = totalByMaterial[String(p.productMaterial)];
    if (picked == null) return;
    // 保留 3 位小数（kg 精度=1g，与 wipStockMap / fmtCopies 一致）：领用剩余重量按克(g)展示（×1000），
    // 若在此按 2 位小数取整（×100/100）会把第 3 位=1g 精度截掉（9.701kg→9.70→9700g，row35）。
    m[String(p.id)] = Math.round(Math.max(0, picked) * 1000) / 1000;
  });
  // 第二步（row44）：已选目标成品 + 选中地块后，「领用剩余重量」按所选地块(含无地块哨兵)聚合覆盖同料卡，
  // 与肉品选耳号 per-ear 同口径；提交超量校验(~validate)与剩余可打包份数(remainingPackableCopies)对「已选产品」取此地块化值，行为不变。
  // 未选产品 / 未选地块 → 保留第一步的不分地块总量基线（常显），其余卡不受影响。
  if (props.plotGroup && selectedPlotId.value && selectedProduct.value && selectedProduct.value.productMaterial != null) {
    const matId = String(selectedProduct.value.productMaterial);
    let plotWeight = 0;
    sources.value.forEach((s) => {
      if (s.productId == null || String(s.productId) !== matId) return;
      const matchPlot = selectedPlotId.value === NO_PLOT_SENTINEL ? s.plotId == null : String(s.plotId) === String(selectedPlotId.value);
      if (!matchPlot) return;
      plotWeight += Number(s.productWeight) || 0;
    });
    const plotVal = Math.round(Math.max(0, plotWeight) * 1000) / 1000;
    products.value.forEach((p) => {
      if (p.productMaterial != null && String(p.productMaterial) === matId) {
        m[String(p.id)] = plotVal;
      }
    });
  }
  return m;
});

// 肉品耳号：按来源 earNo 去重成 button-toggle；同一耳号可能跨多产品（如 DEMO0015 同属骨类/演示精瘦肉），
// 故选中目标产品后只列该产品的耳号，保证「选耳号 → 唯一确定来源 inhouse」。
const selectedEarNo = ref<number | string | ''>('');

/**
 * admin row111/112：没有可追溯来源时仍允许普通打包，但不能生成/打印追溯码。
 * 仅命中显式“无耳号/无地块信息”哨兵时禁用；有真实来源时立即恢复。
 */
const printTraceDisabled = computed(
  () => (props.earGroup && selectedEarNo.value === NO_EAR_SENTINEL) || (props.plotGroup && selectedPlotId.value === NO_PLOT_SENTINEL)
);

const earToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.earGroup) return [];
  const matId = materialIdOf(form.value.productId);
  // admin row18：未选左侧产品（无 matId）时右侧不显示任何猪只耳号——两边都应空，选了产品才按其原材料列耳号。
  if (!matId) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  let hasNoEar = false;
  effectiveSources.value.forEach((s) => {
    // 已选目标产品时，耳号只列该产品有效原材料的来源（成品→原材料 / 成品即原材料），避免来源歧义
    if (String(s.productId) !== matId) return;
    // 无耳号猪肉（外购/无耳标）聚合成单个「无耳号」可选项（镜像 plotToggleOptions 的 hasNoPlot），不再过滤丢弃
    if (!s.earNo) {
      hasNoEar = true;
      return;
    }
    const key = String(s.earNo);
    if (!seen.has(key)) {
      seen.set(key, { value: s.earNo, label: s.earNo });
    }
  });
  const opts = Array.from(seen.values());
  if (hasNoEar) {
    opts.push({ value: NO_EAR_SENTINEL, label: t('djs.warehouse.packEntry.noEarInfo') });
  }
  return opts;
});

// 124#4：肉品打包耳号默认选中一个——耳号选项就绪且尚未选时，自动选第一个并解析来源（onEarChange）。
// 换产品会清空 selectedEarNo（onProductChange），故新产品的耳号选项到位后会再次自动补选。
// 缺省 autoSelectFirst=false，其他打包页零影响；仅 earGroup 生效。
watch(
  earToggleOptions,
  (opts) => {
    if (!props.autoSelectFirst || !props.earGroup) return;
    if (opts.length > 0 && !selectedEarNo.value) {
      selectedEarNo.value = opts[0].value;
      onEarChange();
    }
  },
  { immediate: true }
);

const displaySources = computed(() => {
  let list = effectiveSources.value;
  if (props.plotGroup && selectedPlotId.value) {
    if (selectedPlotId.value === NO_PLOT_SENTINEL) {
      // 「无地块信息」：仅外购无地块来源（doc#13）
      list = list.filter((s) => s.plotId == null);
    } else {
      list = list.filter((s) => String(s.plotId) === String(selectedPlotId.value));
    }
  }
  if (props.earGroup && selectedEarNo.value) {
    list =
      selectedEarNo.value === NO_EAR_SENTINEL ? list.filter((s) => !s.earNo) : list.filter((s) => String(s.earNo) === String(selectedEarNo.value));
  }
  return list;
});

// 当前选中来源（右台顶部回显耳号 / 提交时取规格）
const selectedSource = computed<PackSourceVO | undefined>(() =>
  effectiveSources.value.find((s) => String(s.id) === String(form.value.sourceInhouseId))
);

function sourceChipLabel(s: PackSourceVO): string {
  if (props.kind === 'dry' && s.earNo) {
    return s.earNo;
  }
  return `${s.productName} ${t('djs.warehouse.packEntry.remainShort')} ${s.productWeight}${s.productUnit || 'kg'}`;
}

// 来源 chip 选择项（替代 el-select，对齐原型右台 chip）：肉品=猪只耳号 chip，果蔬=蔬菜名+剩余
const sourceToggleOptions = computed<{ value: number | string; label: string }[]>(() =>
  displaySources.value.map((s) => ({ value: s.id, label: sourceChipLabel(s) }))
);

// 果蔬打包来源区已隐藏（showSource=false）：选地块 = 选来源（对齐肉品「选耳号」）。
// 按「目标成品的有效原材料 + 地块」唯一确定来源 inhouse；成品→原材料(N:1) 或成品即原材料按有效原材料 id 匹配；
// 「无地块信息」哨兵匹配无地块来源；无匹配则清空。
function onPlotChange() {
  const matId = materialIdOf(form.value.productId);
  const src = effectiveSources.value.find((x) => {
    const matchMat = !matId || String(x.productId) === matId;
    const matchPlot = selectedPlotId.value === NO_PLOT_SENTINEL ? x.plotId == null : String(x.plotId) === String(selectedPlotId.value);
    return matchMat && matchPlot;
  });
  form.value.sourceInhouseId = src ? src.id : '';
}

// 地块/目标产品变化 → 重解析来源（覆盖单地块自动选中 watch 不触发 @change、以及换产品换原材料）。
watch([selectedPlotId, () => form.value.productId], () => {
  if (props.plotGroup) onPlotChange();
});

// 肉品打包来源区已隐藏（showSource=false）：只按猪只耳号溯源（门店做溯源码）。
// 选耳号后按「目标成品的有效原材料 + 耳号」唯一确定来源 inhouse（扣减 + 追溯绑该耳号）；
// 成品→原材料(N:1) 或 成品即原材料，按有效原材料 id 匹配来源；无匹配则清空。
function onEarChange() {
  const matId = materialIdOf(form.value.productId);
  const isNoEar = selectedEarNo.value === NO_EAR_SENTINEL;
  const earSrc = effectiveSources.value.find(
    (x) => (isNoEar ? !x.earNo : String(x.earNo) === String(selectedEarNo.value)) && (!matId || String(x.productId) === matId)
  );
  form.value.sourceInhouseId = earSrc ? earSrc.id : '';
}

// 当前选中目标成品（份数判定 / 卡片展示 / 提交换算用）。
const selectedProduct = computed<ProductInfoVO | undefined>(() => products.value.find((p) => String(p.id) === String(form.value.productId)));

/** 单位归一化：trim + 转小写，用于不区分大小写的单位判定（客户要求）。 */
function normUnit(u?: string): string {
  return (u ?? '').trim().toLowerCase();
}
/** 重量制单位判定：kg / 千克 / 公斤 / g / 克 视为重量单位（其余如「枚」「份」为计数制）。 */
function isWeightUnit(u?: string): boolean {
  const n = normUnit(u);
  return n === 'kg' || n === '千克' || n === '公斤' || n === 'g' || n === '克';
}
/** KG 产品判定（不区分大小写）：kg / 公斤 视为按重量口径的产品（客户要求）。 */
function isKgUnit(u?: string): boolean {
  const s = normUnit(u);
  return s === 'kg' || s === '公斤';
}
/** 当前选中成品的「领用来源原材料」单位：其他产品打包 wipStockUnitMap 给原料单位（鸡蛋=枚），回落 form.productUnit。 */
const rawUnitOfSelected = computed<string>(() => wipStockUnitMap.value[String(form.value.productId)] || form.value.productUnit);
/**
 * 其他产品打包（dry 非礼盒/非肉品）且原材料是**计件**单位（枚/份/袋…）→「打包量」计量模式：
 * label / placeholder 显「打包量」、单位显所选成品单位（而非原材料单位）。
 * 重量原料（isWeightUnit，如干羊肚菌 70g 的原料按 kg 领用）走重量模式、label 显「产品重量」——
 * 文案跟着「实际录入的是什么」走（原材料是重量就录重量），不看成品单位（成品「份」不代表录的是份数）。
 *
 * ⚠️ 判据必须是 `isWeightUnit`（kg/千克/公斤/g/克）而**不是** `isKgUnit`（只认 kg/公斤）——
 * 单位是人手填的自由文本，库里已经同时存在 `kg` 和 `Kg`。原料单位写成「千克」「g」「克」时，
 * 用 isKgUnit 会判成「计件」→ 录入框仍按重量收（shouldUnitByCopies 用的是 isWeightUnit，两者不一致），
 * 却把录的克数当打包量回传给后端扣需求，工人会撞上「剩余 1，本次 500」而根本打不了这个包。
 */
const dryNonKgAmountMode = computed<boolean>(() => dryReqMode.value && !!selectedProduct.value && !isWeightUnit(rawUnitOfSelected.value));
/**
 * 每份规格（每份消耗的原材料量）：优先 materialNum（30 枚礼盒=30）；为空时**仅当 productSpec 里的数字紧跟原料单位**
 * （如「8枚」原料=枚 → 8）才解析。防「5000g/袋」「5L/桶」这类规格（原料=袋/桶，数字是克/升不是每份袋数/桶数）
 * 被误解析成每份用量（row17 clean-QA 回归：会把 5000 当每份袋数 → 超扣 / 阻断打包）。
 * 无法得出有效正数时返回 NaN（下游 Number.isFinite && >0 兜底，回落重量/原料单位模式）。
 */
const perCopyMeasure = computed<number>(() => {
  const p = selectedProduct.value;
  if (!p) return NaN;
  const m = Number(p.materialNum);
  if (Number.isFinite(m) && m > 0) return m;
  const raw = (rawUnitOfSelected.value ?? '').trim();
  if (raw) {
    const esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mt = String(p.productSpec ?? '').match(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${esc}`));
    if (mt) {
      const n = parseFloat(mt[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return NaN;
});

/**
 * 其他产品打包「按份数计量」开关（req A + row17）：仅在「其他产品打包」业态（kind='dry' 且 showSource/autoSource 且
 * 非肉品 earGroup=false）生效。判定条件由「配了 materialNum」放宽为「计数制原材料（领用原料单位非重量，如鸡蛋 raw=枚）
 * + 有有效每份规格 perCopyMeasure（materialNum 优先、空则解析 productSpec 前导数）」——这样 4/8/15 枚（materialNum 为空）
 * 也能走份数口径。重量制原材料（干货 raw=kg/g）保持重量模式，避免 copies×规格把 g 当 kg 扣减。
 * 肉品打包(earGroup)/果蔬(veg)/礼盒(gift) 均不触发。
 */
const shouldUnitByCopies = computed<boolean>(() => {
  if (!dryReqMode.value || !selectedProduct.value) return false;
  if (isWeightUnit(rawUnitOfSelected.value)) return false;
  const m = perCopyMeasure.value;
  return Number.isFinite(m) && m > 0;
});

/**
 * 门店需求 chip 单位（row10）：取产品自身单位，与卡片需求量单位（row9 ProductCardGrid 用 productUnit）保持一致——
 * KG 产品显 kg、盒/桶/袋 显对应单位、缺省回退「份」。避免同一屏卡片显「盒」而底部 chip 显「份」的单位错位。
 */
const demandChipUnit = computed<string>(() => selectedProduct.value?.productUnit || t('djs.warehouse.packEntry.copiesUnit'));

// 产品重量单位展示（row12 点2/点3，Kevin 2026-06-22 拍板量纲对齐到 kg）：
// 果蔬(veg)产品称重录入单位显「g」（操作员按克称重），但系统权威量纲=kg —— 提交/校验前
// 统一把 g 输入 ÷1000 换算成 kg（见 vegWeightKg / validate / handleSubmit），落库 kg；
// 「领用剩余重量」「门店需求」「日损耗」等展示量统一 kg，不与录入 g 混用。
// 其他产品按份数计量（shouldUnitByCopies）时显「份」（提交前换算成 kg）。
// 其他产品「重量模式」（dryReqMode 且无 materialNum，如腊肉）：录入的是「每份重量」，单位 = 原料的重量单位
// （如 kg），不用成品的计数单位（腊肉「袋」会把「录入重量」错配成「录入袋数」）。邓博 2026-06-25：
// 重量模式录入的就是重量、扣的就是原材料的重量；点确定 = 打包一份。
// 其余业态（肉品等）按当前选中产品的 product_unit 显示（onProductChange 选卡片时已回填 form.productUnit）。
// row29：其他产品打包中「重量模式（非份数计量）且原料单位=kg」的产品，录入/展示按克(g)，
// 提交前 ÷1000 换算成 kg 落库（与肉品 weightInGram、果蔬 kind=veg 同口径）；枚/份计量产品（如鸡蛋）不受影响。
const dryWeightInGram = computed<boolean>(
  () => props.kind === 'dry' && !shouldUnitByCopies.value && (wipStockUnitMap.value[String(form.value.productId)] || form.value.productUnit) === 'kg'
);
/** 有效「按克录入」标志：显式 weightInGram（肉品）或 其他产品 kg 重量模式（row29）。 */
const effWeightInGram = computed<boolean>(() => props.weightInGram || dryWeightInGram.value);

const selectedUnit = computed<string>(() => {
  if (props.kind === 'veg') return 'g';
  // 124#6 / row29：肉品打包 + 其他产品 kg 重量模式录入单位显「g」（克），提交前 ÷1000 换算成 kg 落库（见 packWeightKg）
  if (effWeightInGram.value) return 'g';
  // row60：其他产品打包（dry 非礼盒）原材料非 kg 时，单位显所选成品单位（份/盒/袋…），而非原材料单位
  if (dryNonKgAmountMode.value) return selectedProduct.value?.productUnit || form.value.productUnit || t('djs.warehouse.packEntry.copiesUnit');
  if (shouldUnitByCopies.value) return t('djs.warehouse.packEntry.copiesUnit');
  // 肉品打包(earGroup) + 其他产品打包(dryReqMode) 均按「领用来源原材料」单位显示（排骨原料=kg），
  // 而非成品自身单位（成品「份」会把按重量录入的肉品错标成「份」）。
  if (sourceFilterActive.value) return wipStockUnitMap.value[String(form.value.productId)] || 'kg';
  return form.value.productUnit || 'kg';
});

/**
 * numpad 小数位：份数计量整数（0）；克(g)录入整数（124#6，肉品按克整数录入）；其余重量按 3 位小数。
 */
const numpadPrecision = computed<number>(
  // 打包量模式（dryNonKgAmountMode，含份数模式）录的是**件数**，只收整数：
  // 不设 0 位时罐/桶/袋这一档会落到 3 位小数，工人能敲「1.5 桶」，而这个数直接进 shipped_count 扣需求。
  // 克(g)录入同样整数。其余（重量模式）保留 3 位小数。
  () => (dryNonKgAmountMode.value || shouldUnitByCopies.value || effWeightInGram.value ? 0 : 3)
);

/**
 * 是否在重量录入框上方挂秤状态条（连接 / 稳定 / 自动填入）。
 * 只在「按重量录入」的形态下才有意义：礼盒录盒数、份数模式录件数，都不是秤上的重量；
 * mini 的 ScaleWeightInput 自带同款头，不重复挂。
 */
const showScaleBar = computed<boolean>(
  () => props.scaleFill && !props.mini && props.kind !== 'gift' && !shouldUnitByCopies.value && !dryNonKgAmountMode.value
);

/**
 * 果蔬录入量 g → 系统权威量纲 kg（÷1000）。其余业态 numpad 录入本就是 kg，原样透传。
 * 提交（VegPackBo.productWeight）+ 前端超量校验 + 追溯标签重量均用此 kg 值，避免 g/kg 混用差 1000 倍。
 */
function packWeightKg(): number | undefined {
  const raw = Number(form.value.productWeight);
  if (!Number.isFinite(raw) || raw <= 0) return undefined;
  // 果蔬 + 肉品打包 + 其他产品 kg 重量模式（effWeightInGram，124#6/row29）录入均为 g → ÷1000 换算成 kg；其余业态 numpad 录入本就是 kg。
  return props.kind === 'veg' || effWeightInGram.value ? raw / 1000 : raw;
}

/**
 * 剩余可打包份数 = floor(剩余总量 / 该产品「其它产品打包计量规则」materialNum)。
 * 剩余总量取当前展示的库存口径（果蔬=领用剩余重量 vegStockMap，肉品=meatStockMap，其余=stockMap）；
 * materialNum 为空 / ≤ 0 或剩余总量缺失（'—' 占位）→ 返 null（不显示份数，兜底不报错）。
 * 数值全程 Number() 强转（防 BigDecimal 序列化字符串拼接坑）。
 */
const remainingPackableCopies = computed<number | null>(() => {
  const p = selectedProduct.value;
  if (!p) return null;
  // row17：每份规格与提交换算同源（materialNum 优先、空则解析 productSpec 前导数），让 4/8/15 枚也有份数软上限。
  const measure = perCopyMeasure.value;
  if (!measure || measure <= 0) return null;
  const stockSource = sourceFilterActive.value ? wipStockMap.value : props.kind === 'veg' ? vegStockMap.value : stockMap.value;
  const remain = stockSource[String(p.id)];
  if (remain == null) return null;
  const remainNum = Number(remain);
  if (!Number.isFinite(remainNum)) return null;
  return Math.floor(remainNum / measure);
});

function onSourceChange() {
  const src = sources.value.find((x) => String(x.id) === String(form.value.sourceInhouseId));
  if (src?.productSpec && !form.value.productSpec) {
    form.value.productSpec = src.productSpec;
  }
}

/** 条件缺失（前置校验不通过）走右侧 ElNotification；成功/失败走自动消失的全局 ElMessage，二者区分。 */
function notifyMissing(message: string) {
  ElNotification.warning({ title: t('djs.warehouse.packEntry.cannotSubmit'), message });
}

function validate(): boolean {
  if (!form.value.productId) {
    notifyMissing(t('djs.warehouse.packEntry.targetProductRequired'));
    return false;
  }
  // 门店必选（req C）：礼盒也是门店下单的生产产品，礼盒打包须选门店（按门店礼盒需求扣盒数）。
  // 例外：组件打包发送位置=礼盒（成品作礼盒组件、被礼盒打包消耗、门店在礼盒打包环节绑定）→ 不强制门店。
  const isGiftComponent = props.kind !== 'gift' && form.value.deliverDest === 'gift';
  if (!isGiftComponent && !form.value.storeId) {
    notifyMissing(t('djs.warehouse.packEntry.storeRequired'));
    return false;
  }
  // req3：选中门店需求已打满（不在可见门店需求里）→ 不可再为其打包
  if (!isGiftComponent && form.value.storeId && !visibleStoreDemands.value.some((sd) => String(sd.storeId) === String(form.value.storeId))) {
    notifyMissing(t('djs.warehouse.packEntry.storeDemandFulfilled'));
    return false;
  }
  if (props.kind === 'gift') {
    if (!form.value.packBoxCount || form.value.packBoxCount < 1) {
      notifyMissing(t('djs.warehouse.packEntry.packBoxCountRequired'));
      return false;
    }
  } else {
    // 肉品打包来源区隐藏(showSource=false)走耳号自动解析；其他产品打包(autoSource)按目标成品有效原材料
    // 自动解析来源；果蔬(plotGroup)选地块自动解析。三者最终都须有 sourceInhouseId（否则后端 @NotNull 400）。
    // autoSource 解析为空 = 该成品今日无领用来源（理论上不会进列表），给明确提示而非让后端报 400。
    if ((props.showSource || props.plotGroup || props.autoSource) && !form.value.sourceInhouseId) {
      notifyMissing(t('djs.warehouse.packEntry.sourceRequired'));
      return false;
    }
    if (!form.value.productWeight || form.value.productWeight <= 0) {
      notifyMissing(t('djs.warehouse.packEntry.productWeightRequired'));
      return false;
    }
    // row10：KG 产品（productUnit=kg/公斤，如筒子骨散装）称重必须 ≥ 所选门店剩余需求重量（sd.copies 为 kg 量纲）。
    // 严格小于则拦截并提示（等于视为满足，客户规则：KG 只能重不能少、一次称重满足整单）；组件打包（发送位置=礼盒，无门店）
    // 跳过；门店需求缺失时不前端拦截交后端。packWeightKg 对肉品已 g÷1000 得 kg，与 sd.copies 同量纲比较。
    if (!isGiftComponent && form.value.storeId && isKgUnit(selectedProduct.value?.productUnit)) {
      const d = visibleStoreDemands.value.find((sd) => String(sd.storeId) === String(form.value.storeId));
      const remainKg = d ? Number(d.copies) : null;
      const packKg = packWeightKg();
      if (remainKg != null && Number.isFinite(remainKg) && packKg != null && packKg < remainKg) {
        notifyMissing(t('djs.warehouse.packEntry.weightBelowDemand'));
        return false;
      }
    }
    // 其他产品按份数计量（req A）：录入的是「份数」，校验 ≤ 剩余可打包份数（remainingPackableCopies）。
    // remainingPackableCopies 为 null（未配料 / 库存缺失）时不前端拦截，交后端校验。
    if (shouldUnitByCopies.value) {
      const max = remainingPackableCopies.value;
      if (max != null && Number(form.value.productWeight) > max) {
        notifyMissing(t('djs.warehouse.packEntry.copiesExceed', { max }));
        return false;
      }
    }
    // row53 + row34：录入框显示「打包量」时（dryNonKgAmountMode，含份数模式与按件直录如鸡蛋），
    // 打包量即需求扣减量 → 不得超过所选门店剩余需求量（demand-driven 上限，FE 先拦给友好提示，
    // 后端 deductDemandOnPack 仍有硬拦 + DB 原子守卫）。
    // 组件打包（发送位置=礼盒，无门店）跳过；门店需求缺失时不前端拦截，交后端校验。
    if (dryNonKgAmountMode.value && !isGiftComponent && form.value.storeId) {
      const demand = visibleStoreDemands.value.find((sd) => String(sd.storeId) === String(form.value.storeId));
      const remainDemand = demand ? Number(demand.copies) : null;
      if (remainDemand != null && Number.isFinite(remainDemand) && Number(form.value.productWeight) > remainDemand) {
        notifyMissing(t('djs.warehouse.packEntry.demandCopiesExceed', { max: remainDemand }));
        return false;
      }
    }
    // 果蔬：按重量超量校验（量纲对齐 row12 点3）——录入 g 换算成 kg 后，与领用剩余重量（vegStockMap，kg）比对，
    // 超出领用剩余即拦截（与后端 requireInhouseEnough 同口径，避免提交才被后端拒）。
    if (props.kind === 'veg') {
      const packKg = packWeightKg();
      if (packKg == null) {
        notifyMissing(t('djs.warehouse.packEntry.productWeightRequired'));
        return false;
      }
      const remainKg = vegStockMap.value[String(form.value.productId)];
      // remainKg 为 null/undefined（成品未配 product_material）→ 不前端拦截，交后端校验
      if (remainKg != null && packKg > Number(remainKg)) {
        // row154：提示按 g 展示（录入框单位即 g），比较仍走 kg 口径
        notifyMissing(t('djs.warehouse.packEntry.vegWeightExceed', { remain: kgToG(Number(remainKg)) }));
        return false;
      }
    }
  }
  // 入库库位不再前端采集（service 默认取产品配置库位/首个可用库位兜底，FIX-WMS-PACK-CASHIER）
  return true;
}

/**
 * 打包实称相对单包规则（product_info.material_num）的允许**超出**百分比。
 * 口径非对称：只能大于不能小于；超出该百分比只提示、确认后可继续。
 * 与后端 `ProductProductionServiceImpl.PACK_MEASURE_OVER_TOLERANCE_PERCENT` 同值，改动必须两侧同步。
 */
const PACK_MEASURE_OVER_TOLERANCE_PERCENT = 3;
/** 允许上界系数（1.03）。 */
const PACK_MEASURE_UPPER_FACTOR = 1 + PACK_MEASURE_OVER_TOLERANCE_PERCENT / 100;

/**
 * 「其他产品打包」业态白名单，与后端 `ProductProductionServiceImpl.BELONG_TYPES_OTHER_PACK` 同集合。
 */
const OTHER_PACK_BELONG_TYPES = ['egg', 'dry_good', 'other'];

/**
 * 当前所选产品的打包计量规则（kg）。未配置 materialNum / 非正数 → null（不校验）。
 *
 * 生效业态：
 * - 肉品(pork) / 果蔬(vegetable)：无条件按 materialNum 校验（原口径）。
 * - 其他产品(egg/dry_good/other)：甲方 2026-08-06（V6 row45）「当产品的原材料单位是KG时，
 *   其生产产品有计量规则时，在打包时判断逻辑和果蔬产品一致」→ 补上这道闸。
 *
 * ⚠️ 其他产品这一支的两条边界（改之前先读完）：
 * 1. 判据用 `isKgUnit`（kg/公斤）而**不是** `isWeightUnit`（还认 g/克）。materialNum 的量纲是 kg，
 *    而只有原料单位是 kg 时录入框才按克收、提交前 ÷1000 换算成 kg（见 dryWeightInGram / packWeightKg）；
 *    原料单位写成 g/克 时录入的就是克且原样提交，拿克去比 kg 规则会把每次打包都判成「低于规则」硬拒。
 *    后端 `isOtherPackKgMeasureMode` 用的是同一个 kg 口径，两侧必须一致。
 * 2. 打包量/份数模式（dryNonKgAmountMode / shouldUnitByCopies）录的是**件数**不是重量，
 *    绝不套这条重量规则。isKgUnit ⊂ isWeightUnit ⇒ 这两个模式在 kg 原料下本就为 false，
 *    此处显式判一次是把「哪种模式走哪条」写死在代码里，别再靠推导。
 */
function packMeasureRuleKg(): number | null {
  const product = selectedProduct.value;
  if (!product) return null;
  const isPorkOrVeg = product.belongType === 'pork' || product.belongType === 'vegetable';
  const isOtherKgWeightMode =
    OTHER_PACK_BELONG_TYPES.includes(product.belongType ?? '') &&
    !dryNonKgAmountMode.value &&
    !shouldUnitByCopies.value &&
    isKgUnit(rawUnitOfSelected.value);
  if (!isPorkOrVeg && !isOtherKgWeightMode) return null;
  const rule = Number(product.materialNum);
  return Number.isFinite(rule) && rule > 0 ? rule : null;
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * row154：打包重量提示统一按 **g** 展示。
 *
 * 校验口径本身仍走 kg（与后端 BigDecimal 同量纲，见 {@link isMeasureBelowRule}），
 * 只在拼提示文案时把 kg 换算成 g —— 打包页录入框单位就是 g（124#6 / row29），
 * 提示再说 kg 会让操作员两个量纲来回换算。
 * 保留最多 3 位小数（1g 以下的尾差不抹掉），整数则不带小数点。
 */
const kgToG = (kg: number): number => Math.round(kg * 1e6) / 1e3;

/**
 * 实称低于规则重量 —— **硬拒**支（不能少于规则重量，不给「继续」）。
 *
 * 两端先按 kg 6 位小数取整再比，与后端 BigDecimal 判定对齐——否则浮点尾差
 * 会把「恰好等于规则」的重量误判成偏低，前端拦下、后端本会放行，产生死角。
 */
function isMeasureBelowRule(rule: number, actual: number): boolean {
  return round6(actual) < round6(rule);
}

/**
 * 实称超出规则重量 {@link PACK_MEASURE_OVER_TOLERANCE_PERCENT}% —— **提示**支（确认后可继续提交）。
 */
function isMeasureOverTolerance(rule: number, actual: number): boolean {
  return round6(actual) > round6(rule * PACK_MEASURE_UPPER_FACTOR);
}

// 称重是否满足打包规则，**只在点「确定」/「确认并打印追溯码」时判**（见 confirmPackMeasureRule），
// 录入过程中不提醒 —— numpad 是逐键 emit 的，输入 300 会途经 3、30 两个「不足」中间态，
// 边输边弹等于每次称重都先挨两次警告。
//
// ⚠️ 这条与更早一轮的要求相反（那轮要「拿到重量就提示」，实现是一个 700ms 防抖的 watch）。
// 已按最新要求撤掉那个 watch，别再改回边输边提示。

/**
 * 肉品、果蔬按产品 materialNum（单包规则重量 kg）校验称重：与后端 validatePackMeasureRule 同口径
 * （非对称，只能大于不能小于）。
 * - 实称 < 规则 → 弹警告 + **拒绝提交**（返回 null，与「用户取消」同路径不提交）。
 * - 实称 ∈ [规则, 规则×1.03] → 直接提交。
 * - 实称 > 规则×1.03 → 弹确认框，取消则不提交，确认后由 allowOverMeasure 透传给后端复核放行。
 *
 * @returns null = 不提交（偏低被拒 / 用户取消）；true = 已确认超出继续；false = 无需确认，直接提交
 */
async function confirmPackMeasureRule(): Promise<boolean | null> {
  const rule = packMeasureRuleKg();
  const actual = packWeightKg();
  if (rule == null || actual == null) return false;
  if (isMeasureBelowRule(rule, actual)) {
    ElNotification.warning({
      title: t('djs.warehouse.packEntry.measureBelowTitle'),
      message: t('djs.warehouse.packEntry.measureBelowTip', { rule: kgToG(rule), actual: kgToG(actual) })
    });
    return null;
  }
  if (!isMeasureOverTolerance(rule, actual)) return false;
  try {
    await ElMessageBox.confirm(
      t('djs.warehouse.packEntry.measureDeviationConfirm', {
        rule: kgToG(rule),
        actual: kgToG(actual),
        tolerance: PACK_MEASURE_OVER_TOLERANCE_PERCENT
      }),
      t('djs.warehouse.packEntry.measureDeviationTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    return true;
  } catch {
    return null;
  }
}

function handleReset() {
  form.value = defaultForm();
  storeDemands.value = [];
  selectedPlotId.value = '';
  selectedEarNo.value = '';
}

/** printTrace=true：提交后弹出追溯码供「打印」展示（仅肉品/果蔬有此按钮）。 */
async function handleSubmit(printTrace: boolean) {
  // 确认框也属于一次提交事务：在打开确认框前就获取 single-flight 锁，
  // 防双击“确定”或与“确认并打印”交叉点击生成两条生产记录。
  if (submitting.value) return;
  submitting.value = true;
  try {
    // disabled 只约束鼠标交互；函数内二次守门，防键盘/程序调用绕过。
    if (printTrace && printTraceDisabled.value) return;
    if (!validate()) return;
    const allowOverMeasure = await confirmPackMeasureRule();
    if (allowOverMeasure == null) return;
    let res: any;
    // 成功/失败统一走全局自动消失的 ElMessage（与「条件缺失」走右侧 ElNotification 区分）。
    // （API 已带 suppressErrorMsg 抑制拦截器 toast）。inner try 只包提交，成功后逻辑不受影响。
    try {
      if (props.kind === 'gift') {
        // 礼盒提交（纯礼盒页 kind='gift'）：入库库位不再前端采集
        // （locationId 省略；service 默认取产品配置库位/首个可用库位兜底）
        const bo: GiftPackBo = {
          giftBoxProductId: form.value.productId as number | string,
          packBoxCount: form.value.packBoxCount as number,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          remark: form.value.remark
        };
        res = await submitGiftPack(bo);
      } else if (props.kind === 'veg') {
        // 录入 g → 落库 kg（÷1000，row12 点3 量纲对齐）；packWeightKg 已在 validate 保证非空
        const bo: VegPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: packWeightKg() as number,
          allowOverMeasure,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          productSpec: form.value.productSpec,
          remark: form.value.remark
        };
        res = await submitVegPack(bo);
      } else {
        // 份数计量（req A + row17）：录入「份数」，提交前换算成原材料消耗量 = 份数 × 每份规格（perCopyMeasure：
        // materialNum 优先、空则解析 productSpec 前导数）；落库单位取原材料单位（鸡蛋=枚，见 rawUnitOfSelected），
        // 与 consumeInhouse 按数值扣减口径一致（后端零改）。「份」仅是 UI 概念。
        // 重量模式（其他产品重量制原材料，如腊肉/干货）：录入的就是「每份重量」，按原料重量单位落库（与录入/扣减一致，
        // 不落成品计数单位「袋」）；点确定 = 打包一份，后端 resolveDemandDeductQty 计数单位+无计量→扣 1 份。
        const copies = Number(form.value.productWeight);
        const measure = perCopyMeasure.value;
        // 124#6/row29：肉品打包 + 其他产品 kg 重量模式录入为 g → 提交前 ÷1000 换算成 kg（packWeightKg），单位强制 'kg' 落库；
        // 份数计量按 copies×perCopyMeasure；其余重量模式原样透传（录入本就是 kg）。
        const dryWeight = shouldUnitByCopies.value
          ? copies * measure
          : effWeightInGram.value
            ? (packWeightKg() as number)
            : (form.value.productWeight as number);
        const dryUnit = shouldUnitByCopies.value
          ? rawUnitOfSelected.value || 'kg'
          : effWeightInGram.value
            ? 'kg'
            : sourceFilterActive.value
              ? wipStockUnitMap.value[String(form.value.productId)] || 'kg'
              : form.value.productUnit;
        const bo: DryPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: dryWeight,
          // row34：录入框显示的是「打包量」时（原材料按件计量，如鸡蛋=枚），把**成品数量**单独回传给后端扣需求。
          // productWeight 在份数模式下已被换算成原材料消耗量（2 份 × 30 枚 = 60），拿它扣需求会扣错量纲。
          // 重量模式（录入的是重量）不传 → 后端回落原口径「一次打包扣 1 份」。
          packQuantity: dryNonKgAmountMode.value ? copies : undefined,
          allowOverMeasure,
          productUnit: dryUnit,
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          productSpec: form.value.productSpec,
          remark: form.value.remark
        };
        res = await submitDryPack(bo);
      }
    } catch (submitErr: any) {
      // 提交失败：自动消失的 ElMessage 展示，message 取后端 reject 的 Error.message（如礼盒「组件不足…」长文案）；
      // showClose 让用户可手动关、duration 略放宽以便读长文案、grouping 合并重复失败。
      ElMessage({
        type: 'error',
        message: t('djs.warehouse.packEntry.packFailedTitle') + '：' + (submitErr?.message || String(submitErr)),
        showClose: true,
        duration: 4000,
        grouping: true
      });
      return;
    }
    packNo.value += 1;
    ElMessage.success({ message: t('djs.warehouse.packEntry.submitSuccess'), grouping: true });
    emit('submitted', res?.data?.id);
    const traceCode: string | undefined = res?.data?.traceCode;
    if (printTrace) {
      if (traceCode) {
        // 必须在 refreshAfterPack 清空表单之前捕获本次重量 / 成品 / 耳号 / 地块 / 门店
        // 追溯标签重量统一 kg（果蔬录入 g 已 ÷1000 换算；其余业态本就是 kg）
        const w = packWeightKg();
        const sel = products.value.find((p) => String(p.id) === String(form.value.productId));
        const storeName = stores.value.find((s) => String(s.id) === String(form.value.storeId))?.storeName;
        const earNoStr = selectedEarNo.value && selectedEarNo.value !== NO_EAR_SENTINEL ? String(selectedEarNo.value) : undefined;
        const plotName = plotMap.value?.[String(selectedPlotId.value)] || undefined;
        traceLabelRef.value?.open(
          {
            // ProductInfoVO 的「产品编码」字段是 productId（业务编码，非雪花 id）
            productCode: sel?.productId,
            // 生产序号 = 后端回传的 produce_no 业务码（不能为空，row14 点2）
            serialNo: res?.data?.produceNo,
            packCode: res?.data?.id != null ? String(res.data.id) : undefined,
            produceDate: parseTime(new Date(), '{y}-{m}-{d}'),
            productName: sel?.productName,
            storeName,
            earNo: earNoStr,
            sourceValue: earNoStr || plotName,
            produceCode: traceCode,
            traceType: traceTypeFromCode(traceCode)
            // 产品重量只读展示本次打包实重，不可修改
          },
          w
        );
      } else {
        ElMessage.warning(t('djs.warehouse.packEntry.noTraceCode'));
      }
    }
    await refreshAfterPack();
  } finally {
    submitting.value = false;
  }
}

/**
 * 打包提交成功后刷新（不整页 reset）：
 * - 保持当前产品选中（req2：一个产品可连续打包多份，不每次清空重选）；
 * - 重新拉来源 → 用完的地块/耳号从 toggle 消失（req4）；
 * - 刷新需求 / 库存 / 已打包份数 → 该产品需求份数打完则卡片标「打包完成」并自动取消选中（req3）。
 */
async function performRefreshAfterPack() {
  const keepProductId = String(form.value.productId || '');
  // 只清本次录入量 + 来源/地块/耳号选择，保留产品
  form.value.productWeight = undefined;
  form.value.packBoxCount = undefined;
  form.value.sourceInhouseId = '';
  selectedPlotId.value = '';
  selectedEarNo.value = '';
  // 重新拉来源（耳号/地块库存用完后从 toggle 消失）+ 成品卡片
  if (props.kind === 'veg') {
    await loadSources('veg');
    await loadVegProducts();
  } else if (props.kind === 'dry') {
    await loadSources(props.earGroup ? 'meat' : 'dry');
  }
  await Promise.all([loadDemandMap(), loadMaterialStock()]);
  // 恢复产品选中：仍在卡片列表 → 保持（只要领用原料还在就能继续打包，不再因「需求打满」清空，Kevin 2026-06-25）；否则清空（料已不在）
  const stillThere = products.value.some((p) => String(p.id) === keepProductId);
  if (keepProductId && stillThere) {
    form.value.productId = keepProductId;
    // req3（Kevin 2026-06-25）：重新拉底部门店需求 chip——每打一份对应门店份数 -1、打满的门店
    // 从 chip 消失（不可再选）。保留产品时 productId 不变、watch 不触发，必须在此显式重拉。
    await loadStoreDemand(keepProductId);
    // 当前选中门店若已打满（不在可见 chip 里）→ 取消选中，避免继续为已满足门店打包
    if (form.value.storeId && !visibleStoreDemands.value.some((sd) => String(sd.storeId) === String(form.value.storeId))) {
      form.value.storeId = undefined;
    }
  } else {
    form.value.productId = '';
    storeDemands.value = [];
  }
}

let refreshInFlight: Promise<void> | undefined;

async function refreshAfterPack() {
  // 提交后的定向刷新必须排在已有刷新之后，再进入同一互斥区；手动刷新在此期间
  // 会复用本 Promise，避免两套来源/需求/库存请求相互覆盖。
  if (refreshInFlight) await refreshInFlight;
  refreshing.value = true;
  const task = performRefreshAfterPack().finally(() => {
    if (refreshInFlight === task) {
      refreshInFlight = undefined;
      refreshing.value = false;
    }
  });
  refreshInFlight = task;
  await task;
}

/**
 * 【本地布局预览】写死一批成品 + 来源 + 需求，仅用于在「今天没有领用记录」时看卡片区排版效果。
 *
 * 两道闸，缺一不生效：① `import.meta.env.DEV`（生产/staging 构建里恒为 false，推上去也永远走不到这条分支，
 * 秤上不可能看到这批假数据）② URL 带 `?preview=1`（不带就是真实数据，本地照常验真实行为）。
 * 用法：http://localhost/djs-warehouse/wh-production/packEntry/meat?preview=1
 *
 * 数据取自 staging 真实的猪肉成品名，覆盖满 46 个（全量上限）——真实一天只领几个部位、卡片远少于此，
 * 这里灌满是为了看最坏情况下会不会滚。看完把 ?preview=1 去掉即可，不用改代码。
 */
const PREVIEW_NAMES = [
  '黑毛猪五花肉250g/份',
  '黑毛猪五花肉500g/份',
  '黑毛猪前腿肉1000g/份',
  '黑毛猪前腿肉250g/份',
  '黑毛猪前腿肉500g/份',
  '黑毛猪后腿肉1000g/份',
  '黑毛猪后腿肉250g/份',
  '黑毛猪后腿肉500g/份',
  '黑毛猪扇子骨1000g/份',
  '黑毛猪扇子骨500g/份',
  '黑毛猪扇子骨750g/份',
  '黑毛猪板油1000g/份',
  '黑毛猪板油1500g/份',
  '黑毛猪板油2000g/份',
  '黑毛猪板油500g/份',
  '黑毛猪猪尾巴',
  '黑毛猪猪心',
  '黑毛猪猪肚',
  '黑毛猪猪肝',
  '黑毛猪猪肠',
  '黑毛猪猪脚1000g/份',
  '黑毛猪猪脚500g/份',
  '黑毛猪猪脚750g/份',
  '黑毛猪猪腰子',
  '黑毛猪筒子骨500g/份',
  '黑毛猪筒子骨700g/份',
  '黑毛猪精梅花肉250g/份',
  '黑毛猪精梅花肉500g/份',
  '黑毛猪精肋排骨1000g/份',
  '黑毛猪精肋排骨250g/份',
  '黑毛猪精肋排骨500g/份',
  '黑毛猪纯瘦肉250g/份',
  '黑毛猪纯瘦肉500g/份',
  '黑毛猪肥肉1000g/份',
  '黑毛猪肥肉500g/份',
  '黑毛猪腰柳肉250g/份',
  '黑毛猪腰柳肉400g/份',
  '黑毛猪蹄髈1000g/份',
  '黑毛猪蹄髈750g/份',
  '黑毛猪通排1000g/份',
  '黑毛猪通排500g/份',
  '黑毛猪里脊肉250g/份',
  '黑毛猪里脊肉500g/份',
  '黑毛猪龙骨500g/份',
  '黑毛猪龙骨750g/份',
  '黑猪腊肉'
];

// 故意用普通函数不用 computed：location.search 不是响应式依赖，computed 会把首次结果永久缓存，
// 在已打开的页面上补 ?preview=1 就再也不生效（keep-alive 下 onActivated 重跑也拿到旧值）。
const isPreviewMode = (): boolean => import.meta.env.DEV && props.dense && new URLSearchParams(window.location.search).get('preview') === '1';

function fillPreviewData(): void {
  const materialId = '900000000000000001';
  // 雪花 id 必须字符串拼：数值超 Number.MAX_SAFE_INTEGER，相加会把不同 id 算成同一个
  const mocked = PREVIEW_NAMES.map((productName, i) => ({
    id: '90000000000000' + String(1000 + i),
    productName,
    productCode: 'PREVIEW' + String(i).padStart(3, '0'),
    productSpec: /(\d+g\/份)$/.exec(productName)?.[1] ?? '散装',
    productUnit: productName.includes('g/份') ? '份' : 'kg',
    productType: 1,
    belongType: 'pork',
    productAttr: 1,
    productMaterial: materialId
  })) as unknown as ProductInfoVO[];
  products.value = mocked;
  sources.value = [
    { id: '80000000000000001', productId: materialId, productName: '黑毛猪白条', productUnit: 'kg', productWeight: 42.5, earNo: '2026-08-10-001' },
    { id: '80000000000000002', productId: materialId, productName: '黑毛猪白条', productUnit: 'kg', productWeight: 31.2, earNo: '2026-08-10-002' }
  ] as unknown as PackSourceVO[];
  const demand: Record<string, number> = {};
  mocked.forEach((p, i) => (demand[String(p.id)] = (i % 7) + 2));
  demandMap.value = demand;
}

/**
 * 全量重新拉取页面数据（来源 / 成品 / 门店需求 / 原材料库存）——与 onMounted 初始加载等价。
 * 供父页「刷新」按钮（row130#2）+ 提交成功后自动刷新（refreshAfterPack）调用。
 * row125/128/130#5「打包后需求量不减」根因是前端不刷新：后端 fulfillDirectDemandOnPack/deductDemandOnPack
 * 各打包路径均已扣 shipped_count（无需改后端），此处 reload 重拉最新 demandMap / loadStoreDemand 即呈现减后需求量。
 */
async function performReload() {
  // 本地布局预览：灌写死数据后直接返回，不打任何接口（dev + ?preview=1 才会进这里）
  if (isPreviewMode()) {
    fillPreviewData();
    return;
  }
  await loadStores();
  if (props.kind === 'veg') {
    // 果蔬打包：先拉来源（推导本次领用原料 id），再按 product_material 命中加载成品（doc#12）
    await Promise.all([loadSources('veg'), props.plotGroup ? loadPlots() : Promise.resolve()]);
    await loadVegProducts();
  } else {
    // dry/gift：全量加载目标成品（保留 productAttr 等过滤）
    await loadProducts(props.productType, props.belongType, props.belongTypes, props.productWorkshop, props.productAttr);
    if (props.kind === 'dry') {
      // 肉品打包（earGroup）来源限 belong_type=pork；其他产品打包用通用 dry 来源
      await loadSources(props.earGroup ? 'meat' : 'dry');
    }
  }
  await Promise.all([
    loadDemandMap(),
    // 卡片库存口径统一：成品 product_material 指向的原材料实时库存（与后端校验/扣减一致）
    loadMaterialStock()
  ]);
  // autoSelectFirst 可能由本轮产品/需求数据触发；等待 watcher 落定后再刷新一次当前产品的
  // 门店需求，确保刷新按钮的 loading 覆盖最后一笔可见数据请求。
  await nextTick();
  if (form.value.productId) {
    await loadStoreDemand(form.value.productId);
  }
}

function reload(): Promise<void> {
  // onMounted、keep-alive 激活、提交后刷新和手动刷新共用同一个 single-flight，
  // 避免较慢的旧请求在刷新按钮结束后覆盖新数据。
  if (refreshInFlight) return refreshInFlight;
  refreshing.value = true;
  const task = performReload().finally(() => {
    if (refreshInFlight === task) {
      refreshInFlight = undefined;
      refreshing.value = false;
    }
  });
  refreshInFlight = task;
  return task;
}

async function handleRefresh() {
  await reload();
}

defineExpose({ reload });

onMounted(reload);

// keep-alive 缓存：切走再切回本 tab 时 onMounted 不重跑，靠 onActivated 兜底重拉，
// 使小程序领用猪肉 / 采摘果蔬后回到打包台能看到最新可打包来源与成品。
// reload() 只刷新选项列表、不动 form.value，半途输入（已选产品 + 已输入重量）不丢。
// 首次进入 onMounted 已 reload，firstActivate 跳过一次避免双拉（同 demand/index.vue）。
let firstActivate = true;
onActivated(() => {
  if (firstActivate) {
    firstActivate = false;
    return;
  }
  void reload();
});
</script>

<style scoped>
/* 收银系统风格：整页定高，中部产品卡片可滚动，右侧操作面板 + 底部需求门店条固定不滚 */
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
/* 果蔬成品按领用原料匹配为空时的回退轻提示 */
.veg-fallback-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--el-color-info-light-9);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  flex: 0 0 auto;
}
/* 中部：仅产品卡片区可滑动 */
.card-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}
/* row137：三处布局（SkuPackForm / pickup / cut）统一范式 ——
   右操作台是「头部固定 + 中部可滚动 + 底部按钮区常驻」的 flex column，撑满页面可用高度（stretch），
   内容超高时只在中部 .panel-scroll 内滚动，底部 .panel-actions 常驻在面板内，
   绝不被页面底部「门店需求」页脚横条遮挡，也不再有礼盒页那种下方大片留白。 */
.station-right {
  flex: 0 0 440px;
  width: 440px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  background: var(--el-bg-color);
  align-self: stretch;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* 紧凑版（无 wide，当前无调用方，保留兜底）宽度回 420px */
.station-right:not(.station-right--wide) {
  flex: 0 0 420px;
  width: 420px;
}
/* 头部标题行不随内容滚动 */
.panel-head {
  flex: 0 0 auto;
}
/* 中部：头部之下、按钮之上的可滚动区（内容超高在此内部滚动） */
.panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
/* 触屏放大：右台控件、标签、按钮整体加大方便手指操作 */
.station-right .panel-label {
  font-size: 15px;
}
.station-right .action-btn {
  height: 52px;
  font-size: 17px;
}
/* 124#3：发送位置按钮（发货月台/礼盒）加大，方便触屏点选 */
.send-dest-toggle :deep(.dest-btn) {
  min-width: 120px;
  height: 52px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 8px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.panel-head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
/* 触屏点击区（admin row147）：≥44px 高、加宽内边距，达到手指可点的最小热区 */
.refresh-btn {
  height: 44px;
  padding: 0 20px;
  font-size: 15px;
}
.pack-no {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
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
.panel-section {
  margin-bottom: 16px;
}
.panel-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
/* 重量段标签行：左标签 + 右秤状态条（无秤时就是一行纯标签，与其他段一致） */
.weight-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}
.weight-label-row > .panel-label {
  margin-bottom: 0;
}
/* row137：底部按钮区常驻在面板内（flex-shrink:0），中部滚动不影响它，按钮永远可见不被页脚遮挡 */
.panel-actions {
  flex: 0 0 auto;
  display: flex;
  /* row33 #1：两个按钮（确认并打印追溯码 / 确定）横向并排，不再纵向堆叠 */
  flex-direction: row;
  gap: 10px;
  padding-top: 20px;
}
/* 横排下用 gap 控距，去掉 Element 相邻 el-button 默认 margin-left（否则间距翻倍） */
.panel-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.action-btn {
  /* 等分行宽（仅一个按钮时占满整行，如其他/礼盒打包无「打印追溯码」按钮） */
  flex: 1;
  min-width: 0;
}
.demand-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  border-radius: 0 0 8px 8px;
}
.demand-label {
  flex: 0 0 auto;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 34px;
}
.demand-tags {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 0;
}
/* 门店需求 tag 放大（触屏点选 + 醒目，对齐原型底栏需求条） */
.demand-tags :deep(.el-tag) {
  height: 34px;
  padding: 0 16px;
  font-size: 15px;
  border-radius: 8px;
}
.demand-tags .text-gray-400 {
  font-size: 14px;
  line-height: 34px;
}

/* ===== 小屏 mini 模式（TSX-615 一体秤适配试点）：右台上移、间距收紧 ===== */
.pack-station--mini {
  height: calc(100vh - 60px);
}
/* 隐藏右台「操作」头，右台上移（#1）；页标题保留（Kevin：标题不能省略、不缩小） */
.pack-station--mini .panel-head {
  display: none;
}
.pack-station--mini .station-body {
  gap: 12px;
}
.pack-station--mini .panel-scroll {
  padding-top: 0;
}
.pack-station--mini .panel-section {
  margin-bottom: 8px;
}

/* ===== 小屏 dense 模式（一体秤 Android 浏览器：地址栏+标签栏挤占后可视高仅 ~600px）=====
   目标：功能一个不减（numpad 保留），整页零滚动。五处压缩：
   ① 右台「操作」头整行去掉，打包序号 + 刷新上提到页标题行（省 ~58px），右台内容顶到顶部
   ② 每段标签内联到控件左侧，不再各占一行（每段省 ~22px）
   ③ 段间距 / 内边距 / 按钮高度收紧
   ④ numpad 12 键由 3 列 ×4 行改 4 列 ×3 行 —— 少一行 ~52px，且键位反而变宽更好点
   ⑤ 页高用 dvh：Android Chrome 的 100vh 是「地址栏隐藏时」的高度，比实际可视区大，
      按 vh 算会把底部确认按钮裁掉（截图里两个蓝按钮被切一半就是这个）；不支持 dvh 的旧内核回落到上一条 vh 声明 */
/* 整页贴住可视区上沿（顶部零留白），高度按导航头 84px（navbar 50 + tagsview 34）扣 */
.pack-station--dense {
  padding: 0 8px 8px;
  height: calc(100vh - 84px);
  height: calc(100dvh - 84px);
}
/* 页标题在左列（模板里换了位置），右台才能顶到最上沿 */
.pack-station--dense .station-title {
  margin-bottom: 8px;
  padding-top: 6px;
}
.pack-station--dense .station-body {
  gap: 12px;
}
/* 右台顶到顶部：去掉原 20px 内边距留白，只留 6px 不贴边框 */
.pack-station--dense .station-right {
  position: relative;
  padding: 6px 12px 10px;
}
/* 刷新：缩小 + 绝对定位到右台右上角，不占行高，与首段标签（猪只耳号）同排 */
.pack-station--dense .panel-head {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
  margin-bottom: 0;
}
.pack-station--dense .refresh-btn {
  height: 26px;
  padding: 0 10px;
  font-size: 13px;
}
/* 段：标签与内容仍是上下两行（左右分栏省不下高度、还难看）——只收紧间距。
   例外是发送位置，选项少、横排更省一行（见下） */
.pack-station--dense .panel-section {
  margin-bottom: 8px;
}
.pack-station--dense .panel-label {
  font-size: 13px;
  line-height: 26px;
  margin-bottom: 2px;
}
.pack-station--dense .weight-label-row {
  margin-bottom: 2px;
}
/* 发送位置：标签与按钮横排，按钮回落到 36 高（选项只有 2 个，不需要大热区） */
.pack-station--dense .send-dest-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pack-station--dense .send-dest-toggle > .panel-label {
  flex: 0 0 auto;
  margin-bottom: 0;
}
.pack-station--dense .send-dest-toggle > *:not(.panel-label) {
  flex: 1 1 auto;
  min-width: 0;
}
.pack-station--dense .send-dest-toggle :deep(.dest-btn) {
  min-width: 90px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
}
/* numpad：4 列 ×3 行 */
.pack-station--dense :deep(.numpad-keys) {
  grid-template-columns: repeat(4, 1fr);
}
.pack-station--dense :deep(.numpad-display) {
  height: 40px;
  margin-bottom: 8px;
}
.pack-station--dense .station-right .action-btn {
  height: 46px;
  font-size: 16px;
}
.pack-station--dense .panel-actions {
  padding-top: 10px;
}
/* 左侧底部门店需求条同步收紧，把省下的高度让给产品卡片区 */
.pack-station--dense .demand-bar {
  padding: 8px 12px;
  gap: 10px;
}
.pack-station--dense .demand-label,
.pack-station--dense .demand-tags .text-gray-400 {
  font-size: 14px;
  line-height: 32px;
}
.pack-station--dense .demand-tags :deep(.el-tag) {
  height: 32px;
}
</style>
