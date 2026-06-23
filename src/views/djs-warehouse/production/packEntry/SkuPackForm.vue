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
            :stock-map="earGroup ? meatStockMap : (kind === 'veg' ? vegStockMap : stockMap)"
            :stock-unit="kind === 'veg' ? 'kg' : undefined"
            :done-set="doneSet"
            :show-stock="showStock"
            :large="wide"
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
                {{ sd.storeName }}({{ Math.round(Number(sd.copies) || 0) }}{{ t('djs.warehouse.packEntry.copiesUnit') }})
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
          <span class="pack-no">{{ t('djs.warehouse.packEntry.packNo') }} NO.{{ packNo }}</span>
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

        <!-- 重量 numpad（普通打包）/ 盒数 numpad（礼盒） -->
        <div class="panel-section">
          <div class="panel-label">{{ kind === 'gift' ? t('djs.warehouse.packEntry.packBoxCount') : t('djs.warehouse.packEntry.productWeight') }}</div>
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
            :placeholder="t('djs.warehouse.packEntry.weightPlaceholder')"
            :unit="selectedUnit"
            :precision="3"
          />
          <!-- 剩余可打包份数 = floor(剩余总量 / 该产品「其它产品打包计量规则」)；materialNum 为空/0 时不显示 -->
          <div v-if="kind !== 'gift' && remainingPackableCopies != null" class="remain-copies">
            {{ t('djs.warehouse.packEntry.remainingCopiesLabel') }}：{{ remainingPackableCopies }} {{ t('djs.warehouse.packEntry.copiesUnit') }}
          </div>
        </div>

        <!-- 发送位置 button-toggle（其他产品打包二选无礼盒；礼盒不显示） -->
        <div v-if="sendDests.length > 0" class="panel-section">
          <div class="panel-label">{{ kind === 'veg' || kind === 'dry' ? t('djs.warehouse.packEntry.sendDest') : t('djs.warehouse.packEntry.sendType') }}</div>
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
import { ElMessage } from 'element-plus';
import { InfoFilled, PriceTag } from '@element-plus/icons-vue';
import ProductCardGrid from './components/ProductCardGrid.vue';
import WeightNumpad from './components/WeightNumpad.vue';
import DestToggle from './components/DestToggle.vue';
import TraceLabelDialog from '@/views/djs-store/trace/components/TraceLabelDialog.vue';
import { traceTypeFromCode } from '@/views/djs-store/trace/components/traceType';
import { parseTime } from '@/utils/ruoyi';
import { usePackEntryOptions } from './useOptions';
import { listMaterialStock, listPackedCount, listPackedWeight, listStoreDemand, submitDryPack, submitGiftPack, submitVegPack } from '@/api/djs-warehouse/packEntry';
import type { DeliverDest, DryPackBo, GiftPackBo, PackSourceVO, StoreDemandCopiesVO, VegPackBo } from '@/api/djs-warehouse/packEntry';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';

/**
 * SKU 打包共享操作台（A5）——对齐原型左卡片网格 + 右 numpad panel form factor。
 *
 * 三业态共用：
 *   kind='dry'  肉品打包 / 其他产品打包（来源过程产品 → 目标 SKU + 单位 kg/个）
 *   kind='veg'  果蔬打包（地块来源蔬菜 → 目标蔬菜 SKU，单位固定 kg）
 *   kind='gift' 礼盒打包（仅选礼盒 SKU + 盒数，service 自动按组件清单扣减）
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
    /** 目标产品 productType 过滤：dry/veg=1 产品；gift=3 礼盒 */
    productType: number;
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
    /** 是否显示「猪只耳号」回显 chip（其他产品打包隐藏；缺省随业态：dry 显示） */
    showEar?: boolean;
    /** 宽版布局（肉品打包：产品卡片放大 + 右操作台加宽，填充空白）；缺省紧凑版，其他打包页零影响 */
    wide?: boolean;
  }>(),
  {
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
    showEar: undefined,
    wide: false
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
const sendDests = computed(() =>
  (props.sendDestKinds ?? []).map((v) => ({ value: v as number | string, label: t(SEND_DEST_LABEL_KEY[v]) }))
);

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

async function loadDemandMap() {
  const ids = products.value.map((p) => p.id);
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await listStoreDemand(id);
        const rows = ((res as any).data ?? []) as StoreDemandCopiesVO[];
        const total = rows.reduce((sum, r) => sum + (Number(r.copies) || 0), 0);
        return [String(id), total] as const;
      } catch {
        return [String(id), 0] as const;
      }
    })
  );
  const map: Record<string, number> = {};
  entries.forEach(([k, v]) => {
    map[k] = v;
  });
  demandMap.value = map;
}

// 卡片网格「今天已打包份数」（每条 product_production = 一份）：productId → 今天已打包份数。
const packedMap = ref<Record<string, number>>({});

async function loadPackedCount() {
  const ids = products.value.map((p) => p.id);
  if (ids.length === 0) {
    packedMap.value = {};
    return;
  }
  try {
    const res = await listPackedCount(ids);
    packedMap.value = ((res as any).data ?? {}) as Record<string, number>;
  } catch {
    packedMap.value = {};
  }
}

// 果蔬「领用剩余重量」口径用：成品雪花 id 字符串 → 已打包总重 kg（number，Number() 强转防 BigDecimal 字符串拼接坑）。
const packedWeightMap = ref<Record<string, number>>({});

async function loadPackedWeight() {
  // 仅果蔬打包需要（「领用剩余重量」= 领用总重 − 已打包总重）；其余业态不拉。
  if (props.kind !== 'veg') {
    packedWeightMap.value = {};
    return;
  }
  const ids = products.value.map((p) => p.id);
  if (ids.length === 0) {
    packedWeightMap.value = {};
    return;
  }
  try {
    const res = await listPackedWeight(ids);
    const remote = ((res as any).data ?? {}) as Record<string, string>;
    const map: Record<string, number> = {};
    Object.keys(remote).forEach((k) => {
      map[k] = Number(remote[k]) || 0;
    });
    packedWeightMap.value = map;
  } catch {
    packedWeightMap.value = {};
  }
}

// 「打包完成」集合：门店需求 > 0 且 今天已打包份数 ≥ 需求份数 → 卡片标完成、禁选（避免超量打包）。
const doneSet = computed<Set<string>>(() => {
  const s = new Set<string>();
  products.value.forEach((p) => {
    const key = String(p.id);
    const demand = demandMap.value[key] ?? 0;
    const packed = packedMap.value[key] ?? 0;
    if (demand > 0 && packed >= demand) s.add(key);
  });
  return s;
});

function isProductDone(id: number | string): boolean {
  return doneSet.value.has(String(id));
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
    new Set(effectiveSources.value.map((s) => s.productId).filter((id): id is number => id != null).map((id) => String(id)))
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

// 「按今天领用来源过滤成品」生效场景：① 肉品打包(earGroup) ② 其他产品打包(kind='dry' 且 showSource，egg/dry_good/other)。
// 两者来源都是「今天已领用原料 inhouse」(meat/dry source)；果蔬(veg)走 loadVegProducts 自带过滤、礼盒(gift)无来源，均不在此列。
const sourceFilterActive = computed(() => props.earGroup || (props.kind === 'dry' && props.showSource));

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
  sourceFilterActive.value
    ? products.value.filter((p) => requisitionedProductIds.value.has(effectiveMaterialId(p)))
    : products.value
);

// 肉品打包「原材料库存」= 领用待打包库存（doc/14 §5）：成品经有效原材料 id 聚合来源 inhouse 的 productWeight。
// 同一原材料的多个成品卡共享同一池（一料多品）。
const meatStockMap = computed<Record<string, number | null>>(() => {
  const m: Record<string, number | null> = {};
  if (!props.earGroup) return m;
  const byMaterial: Record<string, number> = {};
  effectiveSources.value.forEach((s) => {
    if (s.productId == null) return;
    const k = String(s.productId);
    byMaterial[k] = (byMaterial[k] ?? 0) + (Number(s.productWeight) || 0);
  });
  products.value.forEach((p) => {
    const w = byMaterial[effectiveMaterialId(p)];
    if (w == null) return;
    m[String(p.id)] = Math.round(w * 100) / 100;
  });
  return m;
});

/**
 * 果蔬打包「领用剩余重量」= 领用总重 − 该成品已打包总重（钳 ≥ 0）。
 * 领用总重：成品经 product_material 二跳反查原材料，聚合该原材料全部活动来源 inhouse(sources) 的 productWeight。
 * **同一原材料的多个成品卡共享同一领用池**；已打包总重按成品自身维度从 packedWeightMap 扣减。
 * 取 `sources`（全部活动 inhouse，不限日期）。成品未配 product_material → 不入 map（卡片显 '—'）。
 * 数值全程 Number() 强转（防 BigDecimal 序列化字符串拼接坑）。
 */
const vegStockMap = computed<Record<string, number | null>>(() => {
  const m: Record<string, number | null> = {};
  if (props.kind !== 'veg') return m;
  // 先按原材料 id 聚合全部活动来源 inhouse 重量（source.productId = 原材料 id）
  const byMaterial: Record<string, number> = {};
  sources.value.forEach((s) => {
    if (s.productId == null) return;
    const k = String(s.productId);
    byMaterial[k] = (byMaterial[k] ?? 0) + (Number(s.productWeight) || 0);
  });
  // 成品 → 其 product_material 指向原材料的共享领用池 − 该成品已打包总重（钳 ≥ 0）
  products.value.forEach((p) => {
    if (p.productMaterial == null) return;
    const picked = byMaterial[String(p.productMaterial)];
    if (picked == null) return;
    const packed = packedWeightMap.value[String(p.id)] ?? 0;
    const remain = Math.max(0, picked - packed);
    m[String(p.id)] = Math.round(remain * 100) / 100;
  });
  return m;
});

// 肉品耳号：按来源 earNo 去重成 button-toggle；同一耳号可能跨多产品（如 DEMO0015 同属骨类/演示精瘦肉），
// 故选中目标产品后只列该产品的耳号，保证「选耳号 → 唯一确定来源 inhouse」。
const selectedEarNo = ref<number | string | ''>('');

const earToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.earGroup) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  const matId = materialIdOf(form.value.productId);
  effectiveSources.value.forEach((s) => {
    if (!s.earNo) return;
    // 已选目标产品时，耳号只列该产品有效原材料的来源（成品→原材料 / 成品即原材料），避免来源歧义
    if (matId && String(s.productId) !== matId) return;
    const key = String(s.earNo);
    if (!seen.has(key)) {
      seen.set(key, { value: s.earNo, label: s.earNo });
    }
  });
  return Array.from(seen.values());
});

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
    const matchPlot =
      selectedPlotId.value === NO_PLOT_SENTINEL ? x.plotId == null : String(x.plotId) === String(selectedPlotId.value);
    return matchMat && matchPlot;
  });
  form.value.sourceInhouseId = src ? src.id : '';
}

// 地块/目标产品变化 → 重解析来源（覆盖单地块自动选中 watch 不触发 @change、以及换产品换原材料）。
watch(
  [selectedPlotId, () => form.value.productId],
  () => {
    if (props.plotGroup) onPlotChange();
  }
);

// 肉品打包来源区已隐藏（showSource=false）：只按猪只耳号溯源（门店做溯源码）。
// 选耳号后按「目标成品的有效原材料 + 耳号」唯一确定来源 inhouse（扣减 + 追溯绑该耳号）；
// 成品→原材料(N:1) 或 成品即原材料，按有效原材料 id 匹配来源；无匹配则清空。
function onEarChange() {
  const matId = materialIdOf(form.value.productId);
  const earSrc = effectiveSources.value.find(
    (x) =>
      String(x.earNo) === String(selectedEarNo.value) &&
      (!matId || String(x.productId) === matId)
  );
  form.value.sourceInhouseId = earSrc ? earSrc.id : '';
}

// 产品重量单位展示（row12 点2/点3，Kevin 2026-06-22 拍板量纲对齐到 kg）：
// 果蔬(veg)产品称重录入单位显「g」（操作员按克称重），但系统权威量纲=kg —— 提交/校验前
// 统一把 g 输入 ÷1000 换算成 kg（见 vegWeightKg / validate / handleSubmit），落库 kg；
// 「领用剩余重量」「门店需求」「日损耗」等展示量统一 kg，不与录入 g 混用。
// 其余业态按当前选中产品的 product_unit 显示（onProductChange 选卡片时已回填 form.productUnit）。
const selectedUnit = computed<string>(() => (props.kind === 'veg' ? 'g' : form.value.productUnit || 'kg'));

/**
 * 果蔬录入量 g → 系统权威量纲 kg（÷1000）。其余业态 numpad 录入本就是 kg，原样透传。
 * 提交（VegPackBo.productWeight）+ 前端超量校验 + 追溯标签重量均用此 kg 值，避免 g/kg 混用差 1000 倍。
 */
function packWeightKg(): number | undefined {
  const raw = Number(form.value.productWeight);
  if (!Number.isFinite(raw) || raw <= 0) return undefined;
  return props.kind === 'veg' ? raw / 1000 : raw;
}

// 当前选中目标成品（卡片/角标份数展示用）。
const selectedProduct = computed<ProductInfoVO | undefined>(() =>
  products.value.find((p) => String(p.id) === String(form.value.productId))
);

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
  const stockSource = props.earGroup ? meatStockMap.value : props.kind === 'veg' ? vegStockMap.value : stockMap.value;
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

function validate(): boolean {
  if (!form.value.productId) {
    ElMessage.warning(t('djs.warehouse.packEntry.targetProductRequired'));
    return false;
  }
  if (props.kind === 'gift') {
    if (!form.value.packBoxCount || form.value.packBoxCount < 1) {
      ElMessage.warning(t('djs.warehouse.packEntry.packBoxCountRequired'));
      return false;
    }
  } else {
    // 来源区隐藏时（showSource=false）不再前端强制选来源，提交链路待后端按目标产品/耳号自动匹配；
    // 果蔬（plotGroup）来源由「选地块」自动解析，须有解析结果（否则该地块无可打包原料）。
    if ((props.showSource || props.plotGroup) && !form.value.sourceInhouseId) {
      ElMessage.warning(t('djs.warehouse.packEntry.sourceRequired'));
      return false;
    }
    if (!form.value.productWeight || form.value.productWeight <= 0) {
      ElMessage.warning(t('djs.warehouse.packEntry.productWeightRequired'));
      return false;
    }
    // 果蔬：按重量超量校验（量纲对齐 row12 点3）——录入 g 换算成 kg 后，与领用剩余重量（vegStockMap，kg）比对，
    // 超出领用剩余即拦截（与后端 requireInhouseEnough 同口径，避免提交才被后端拒）。
    if (props.kind === 'veg') {
      const packKg = packWeightKg();
      if (packKg == null) {
        ElMessage.warning(t('djs.warehouse.packEntry.productWeightRequired'));
        return false;
      }
      const remainKg = vegStockMap.value[String(form.value.productId)];
      // remainKg 为 null/undefined（成品未配 product_material）→ 不前端拦截，交后端校验
      if (remainKg != null && packKg > Number(remainKg)) {
        ElMessage.warning(t('djs.warehouse.packEntry.vegWeightExceed', { remain: Number(remainKg) }));
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
    if (props.kind === 'gift') {
      // 入库库位不再前端采集（locationId 省略；service 默认取产品配置库位/首个可用库位兜底）
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
      const bo: DryPackBo = {
        sourceInhouseId: form.value.sourceInhouseId as number | string,
        productId: form.value.productId as number | string,
        productWeight: form.value.productWeight as number,
        productUnit: form.value.productUnit,
        storeId: form.value.storeId || undefined,
        deliverDest: form.value.deliverDest,
        productSpec: form.value.productSpec,
        remark: form.value.remark
      };
      res = await submitDryPack(bo);
    }
    packNo.value += 1;
    ElMessage.success(t('djs.warehouse.packEntry.submitSuccess'));
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
  await Promise.all([loadDemandMap(), loadMaterialStock(), loadPackedCount(), loadPackedWeight()]);
  // 恢复产品选中：仍在卡片列表 且 未打包完成 → 保持；否则清空（打包完成或料已不在）
  const stillThere = products.value.some((p) => String(p.id) === keepProductId);
  if (keepProductId && stillThere && !isProductDone(keepProductId)) {
    form.value.productId = keepProductId;
    // 单地块/单耳号由各自 watch 自动选中并解析来源；多选等工人重选
  } else {
    form.value.productId = '';
    storeDemands.value = [];
  }
}

onMounted(async () => {
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
  // 各成品今天已打包份数（≥ 需求 → 卡片标「打包完成」、禁选）
  void loadPackedCount();
  // 果蔬「领用剩余重量」= 领用总重 − 已打包总重，需各成品已打包总重
  void loadPackedWeight();
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
