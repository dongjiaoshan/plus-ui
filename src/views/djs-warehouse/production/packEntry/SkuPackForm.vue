<template>
  <div class="pack-station">
    <div class="station-title">{{ title }}</div>

    <div class="station-body">
      <!-- 左：产品卡片网格（可滚动）+ 底部固定需求门店 tags -->
      <div class="station-left">
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
            :large="wide"
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
                {{ sd.storeName }}({{ fmtCopies(sd.copies) }}{{ t('djs.warehouse.packEntry.copiesUnit') }})
              </el-tag>
            </template>
            <span v-else class="text-gray-400">{{ t('djs.warehouse.packEntry.noDemand') }}</span>
          </div>
        </div>
      </div>

      <!-- 右：操作 panel -->
      <div class="station-right" :class="{ 'station-right--wide': wide }">
        <div class="panel-head">
          <span class="panel-title">{{ t('djs.warehouse.packEntry.operation') }}</span>
          <!-- 124#5：肉品打包隐藏右上角「打包序号 NO.x」（hidePackNo=true）；其他打包页仍显示 -->
          <span v-if="!hidePackNo" class="pack-no">{{ t('djs.warehouse.packEntry.packNo') }} NO.{{ packNo }}</span>
        </div>

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
          <div class="panel-label">
            {{
              kind === 'gift'
                ? t('djs.warehouse.packEntry.packBoxCount')
                : shouldUnitByCopies
                  ? t('djs.warehouse.packEntry.packCopies')
                  : t('djs.warehouse.packEntry.productWeight')
            }}
          </div>
          <WeightNumpad
            v-if="kind === 'gift'"
            v-model="form.packBoxCount"
            :placeholder="t('djs.warehouse.packEntry.packBoxCount')"
            :unit="t('djs.warehouse.packEntry.box')"
            :precision="0"
          />
          <WeightNumpad
            v-else
            v-model="form.productWeight"
            :placeholder="shouldUnitByCopies ? t('djs.warehouse.packEntry.packCopies') : t('djs.warehouse.packEntry.weightPlaceholder')"
            :unit="selectedUnit"
            :precision="numpadPrecision"
          />
          <!-- 剩余可打包份数 = floor(剩余总量 / 该产品「其它产品打包计量规则」)；materialNum 为空/0 时不显示 -->
          <div v-if="kind !== 'gift' && remainingPackableCopies != null" class="remain-copies">
            {{ t('djs.warehouse.packEntry.remainingCopiesLabel') }}：{{ remainingPackableCopies }} {{ t('djs.warehouse.packEntry.copiesUnit') }}
          </div>
        </div>

        <!-- 发送位置 button-toggle（其他产品打包二选无礼盒；礼盒不显示） -->
        <!-- 124#3：发送位置按钮（发货月台/礼盒）加大，触屏易点（send-dest-toggle 放大 dest-btn） -->
        <div v-if="sendDests.length > 0" class="panel-section send-dest-toggle">
          <div class="panel-label">{{ t('djs.warehouse.packEntry.sendDest') }}</div>
          <DestToggle v-model="form.deliverDest" :options="sendDests" />
        </div>

        <div class="panel-actions">
          <el-button v-if="showPrintTrace" type="primary" size="large" class="action-btn" :loading="submitting" @click="handleSubmit(true)">
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
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElNotification } from 'element-plus';
import { InfoFilled, PriceTag } from '@element-plus/icons-vue';
import ProductCardGrid from './components/ProductCardGrid.vue';
import WeightNumpad from './components/WeightNumpad.vue';
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
    /** 目标产品 djs_product_workshop 过滤（如 3=门店打包间，肉品打包目标）；不传=不限，向后兼容 */
    productWorkshop?: number;
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
    autoSelectFirst: false
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

async function loadStoreDemand(productId: number | string | '') {
  if (!productId) {
    storeDemands.value = [];
    return;
  }
  demandLoading.value = true;
  try {
    const res = await listStoreDemand(productId);
    storeDemands.value = ((res as any).data ?? []) as StoreDemandCopiesVO[];
  } finally {
    demandLoading.value = false;
  }
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
  try {
    const res = await listStoreDemandBatch(ids);
    const grouped = ((res as any).data ?? {}) as Record<string, StoreDemandCopiesVO[]>;
    ids.forEach((id) => {
      const rows = grouped[String(id)] ?? [];
      map[String(id)] = fmtCopies(rows.reduce((sum, r) => sum + (Number(r.copies) || 0), 0));
    });
  } catch {
    ids.forEach((id) => {
      map[String(id)] = 0;
    });
  }
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

// 单地块自动选（doc#13）：plotToggleOptions 仅 1 项且尚未选时自动选中（含「无地块信息」单独成项的情况）
watch(
  plotToggleOptions,
  (opts) => {
    if (props.plotGroup && opts.length === 1 && !selectedPlotId.value) {
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
 */
const vegStockMap = computed<Record<string, number | null>>(() => {
  const m: Record<string, number | null> = {};
  if (props.kind !== 'veg') return m;
  // 先按原材料 id 聚合全部活动来源 inhouse 重量（source.productId = 原材料 id；已含后端打包扣减）
  const byMaterial: Record<string, number> = {};
  sources.value.forEach((s) => {
    if (s.productId == null) return;
    const k = String(s.productId);
    byMaterial[k] = (byMaterial[k] ?? 0) + (Number(s.productWeight) || 0);
  });
  // 成品 → 其 product_material 指向原材料的共享领用池（实时余量，无需再减已打包）
  products.value.forEach((p) => {
    if (p.productMaterial == null) return;
    const picked = byMaterial[String(p.productMaterial)];
    if (picked == null) return;
    m[String(p.id)] = Math.round(Math.max(0, picked) * 100) / 100;
  });
  return m;
});

// 肉品耳号：按来源 earNo 去重成 button-toggle；同一耳号可能跨多产品（如 DEMO0015 同属骨类/演示精瘦肉），
// 故选中目标产品后只列该产品的耳号，保证「选耳号 → 唯一确定来源 inhouse」。
const selectedEarNo = ref<number | string | ''>('');

const earToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.earGroup) return [];
  const matId = materialIdOf(form.value.productId);
  // admin row18：未选左侧产品（无 matId）时右侧不显示任何猪只耳号——两边都应空，选了产品才按其原材料列耳号。
  if (!matId) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  effectiveSources.value.forEach((s) => {
    if (!s.earNo) return;
    // 已选目标产品时，耳号只列该产品有效原材料的来源（成品→原材料 / 成品即原材料），避免来源歧义
    if (String(s.productId) !== matId) return;
    const key = String(s.earNo);
    if (!seen.has(key)) {
      seen.set(key, { value: s.earNo, label: s.earNo });
    }
  });
  return Array.from(seen.values());
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
    list = list.filter((s) => String(s.earNo) === String(selectedEarNo.value));
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
  const earSrc = effectiveSources.value.find((x) => String(x.earNo) === String(selectedEarNo.value) && (!matId || String(x.productId) === matId));
  form.value.sourceInhouseId = earSrc ? earSrc.id : '';
}

// 当前选中目标成品（份数判定 / 卡片展示 / 提交换算用）。
const selectedProduct = computed<ProductInfoVO | undefined>(() => products.value.find((p) => String(p.id) === String(form.value.productId)));

/**
 * 其他产品打包「按份数计量」开关（req A）：成品配了 materialNum（>0，「其它产品打包计量规则」，
 * 如鸡蛋一盒30个）时，右台改为按「份数」录入（整数 numpad，单位「份」），提交前再换算成 kg 落库。
 * 仅在「其他产品打包」业态生效：kind='dry' 且 showSource 且非肉品（earGroup=false）。
 * 肉品打包(earGroup)/果蔬(veg)/礼盒(gift) 均不触发，避免误伤其它计量口径。
 */
const shouldUnitByCopies = computed<boolean>(() => {
  if (!dryReqMode.value) return false;
  const measure = Number(selectedProduct.value?.materialNum);
  return Number.isFinite(measure) && measure > 0;
});

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
const dryWeightInGram = computed<boolean>(() =>
  props.kind === 'dry'
  && !shouldUnitByCopies.value
  && (wipStockUnitMap.value[String(form.value.productId)] || form.value.productUnit) === 'kg'
);
/** 有效「按克录入」标志：显式 weightInGram（肉品）或 其他产品 kg 重量模式（row29）。 */
const effWeightInGram = computed<boolean>(() => props.weightInGram || dryWeightInGram.value);

const selectedUnit = computed<string>(() => {
  if (props.kind === 'veg') return 'g';
  // 124#6 / row29：肉品打包 + 其他产品 kg 重量模式录入单位显「g」（克），提交前 ÷1000 换算成 kg 落库（见 packWeightKg）
  if (effWeightInGram.value) return 'g';
  if (shouldUnitByCopies.value) return t('djs.warehouse.packEntry.copiesUnit');
  // 肉品打包(earGroup) + 其他产品打包(dryReqMode) 均按「领用来源原材料」单位显示（排骨原料=kg），
  // 而非成品自身单位（成品「份」会把按重量录入的肉品错标成「份」）。
  if (sourceFilterActive.value) return wipStockUnitMap.value[String(form.value.productId)] || 'kg';
  return form.value.productUnit || 'kg';
});

/**
 * numpad 小数位：份数计量整数（0）；克(g)录入整数（124#6，肉品按克整数录入）；其余重量按 3 位小数。
 */
const numpadPrecision = computed<number>(() => (shouldUnitByCopies.value || effWeightInGram.value ? 0 : 3));

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
  const measure = Number(p.materialNum);
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
    // 其他产品按份数计量（req A）：录入的是「份数」，校验 ≤ 剩余可打包份数（remainingPackableCopies）。
    // remainingPackableCopies 为 null（未配料 / 库存缺失）时不前端拦截，交后端校验。
    if (shouldUnitByCopies.value) {
      const max = remainingPackableCopies.value;
      if (max != null && Number(form.value.productWeight) > max) {
        notifyMissing(t('djs.warehouse.packEntry.copiesExceed', { max }));
        return false;
      }
      // row53：份数不得超过所选门店剩余需求份数（demand-driven 上限，FE 拦）。
      // 组件打包（发送位置=礼盒，无门店）跳过；门店需求缺失时不前端拦截，交后端校验。
      if (!isGiftComponent && form.value.storeId) {
        const demand = visibleStoreDemands.value.find((sd) => String(sd.storeId) === String(form.value.storeId));
        const remainDemand = demand ? Number(demand.copies) : null;
        if (remainDemand != null && Number.isFinite(remainDemand) && Number(form.value.productWeight) > remainDemand) {
          notifyMissing(t('djs.warehouse.packEntry.demandCopiesExceed', { max: remainDemand }));
          return false;
        }
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
        notifyMissing(t('djs.warehouse.packEntry.vegWeightExceed', { remain: Number(remainKg) }));
        return false;
      }
    }
  }
  // 入库库位不再前端采集（service 默认取产品配置库位/首个可用库位兜底，FIX-WMS-PACK-CASHIER）
  return true;
}

function handleReset() {
  form.value = defaultForm();
  storeDemands.value = [];
  selectedPlotId.value = '';
  selectedEarNo.value = '';
}

/** printTrace=true：提交后弹出追溯码供「打印」展示（仅肉品/果蔬有此按钮）。 */
async function handleSubmit(printTrace: boolean) {
  if (!validate()) return;
  submitting.value = true;
  try {
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
          storeId: form.value.storeId || undefined,
          deliverDest: form.value.deliverDest,
          productSpec: form.value.productSpec,
          remark: form.value.remark
        };
        res = await submitVegPack(bo);
      } else {
        // 份数计量（req A）：录入「份数」，提交前换算成 kg = 份数 × materialNum，productUnit 强制 'kg' 落库；
        // 「份」仅是 UI 概念，后端零改。
        // 重量模式（其他产品无 materialNum，如腊肉）：录入的就是「每份重量」，按原料重量单位落库（与录入/扣减一致，
        // 不落成品计数单位「袋」）；点确定 = 打包一份，后端 resolveDemandDeductQty 计数单位+无计量→扣 1 份。
        const copies = Number(form.value.productWeight);
        const measure = Number(selectedProduct.value?.materialNum);
        // 124#6/row29：肉品打包 + 其他产品 kg 重量模式录入为 g → 提交前 ÷1000 换算成 kg（packWeightKg），单位强制 'kg' 落库；
        // 份数计量按 copies×materialNum；其余重量模式原样透传（录入本就是 kg）。
        const dryWeight = shouldUnitByCopies.value
          ? copies * measure
          : effWeightInGram.value
            ? (packWeightKg() as number)
            : (form.value.productWeight as number);
        const dryUnit = shouldUnitByCopies.value
          ? 'kg'
          : effWeightInGram.value
            ? 'kg'
            : sourceFilterActive.value
              ? wipStockUnitMap.value[String(form.value.productId)] || 'kg'
              : form.value.productUnit;
        const bo: DryPackBo = {
          sourceInhouseId: form.value.sourceInhouseId as number | string,
          productId: form.value.productId as number | string,
          productWeight: dryWeight,
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
        const earNoStr = selectedEarNo.value ? String(selectedEarNo.value) : undefined;
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
async function refreshAfterPack() {
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

/**
 * 全量重新拉取页面数据（来源 / 成品 / 门店需求 / 原材料库存）——与 onMounted 初始加载等价。
 * 供父页「刷新」按钮（row130#2）+ 提交成功后自动刷新（refreshAfterPack）调用。
 * row125/128/130#5「打包后需求量不减」根因是前端不刷新：后端 fulfillDirectDemandOnPack/deductDemandOnPack
 * 各打包路径均已扣 shipped_count（无需改后端），此处 reload 重拉最新 demandMap / loadStoreDemand 即呈现减后需求量。
 */
async function reload() {
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
  void loadDemandMap();
  // 卡片库存口径统一：成品 product_material 指向的原材料实时库存（与后端校验/扣减一致）
  void loadMaterialStock();
  // 当前已选产品时同步重拉其门店需求 chip（reload 后需求量随之刷新，衔接 row130#5）
  if (form.value.productId) void loadStoreDemand(form.value.productId);
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
.station-right {
  flex: 0 0 420px;
  width: 420px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  background: var(--el-bg-color);
  align-self: stretch;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
/* 宽版（肉品打包）：右操作台加宽，填充空白；其他打包页保持 420px */
.station-right--wide {
  flex: 0 0 520px;
  width: 520px;
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
/* 剩余可打包份数提示（录重 numpad 下方角标） */
.remain-copies {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.panel-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 20px;
}
.action-btn {
  width: 100%;
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
</style>
