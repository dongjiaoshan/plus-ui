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
            :items="products"
            :loading="productLoading"
            :demand-map="demandMap"
            :stock-map="stockMap"
            :show-stock="showStock"
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
                class="mr-2 mb-1 cursor-pointer"
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
      <div class="station-right">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InfoFilled, PriceTag } from '@element-plus/icons-vue';
import ProductCardGrid from './components/ProductCardGrid.vue';
import WeightNumpad from './components/WeightNumpad.vue';
import DestToggle from './components/DestToggle.vue';
import { usePackEntryOptions } from './useOptions';
import { listMaterialStock, listStoreDemand, submitDryPack, submitGiftPack, submitVegPack } from '@/api/djs-warehouse/packEntry';
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
    showEar: undefined
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
  loadProducts,
  loadVegProductsByMaterial,
  loadStores,
  loadSources,
  loadPlots
} = usePackEntryOptions();

const submitting = ref(false);

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
  deliverDest: undefined,
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
  const materialIds = Array.from(
    new Set(sources.value.map((s) => s.productId).filter((id): id is number => id != null).map((id) => String(id)))
  );
  const count = await loadVegProductsByMaterial(materialIds);
  // 推导原料为空（领用来源无 productId）或命中为空 → 回退提示。
  // 注意：materialIds 非空但命中 0（现网 product_material 多未配的常见场景）后端返【空】而非全部，
  // 此时必须再拉一次全部果蔬成品，否则卡片空白与「已展示全部」提示自相矛盾。
  if (materialIds.length === 0 || count === 0) {
    vegMaterialFallback.value = true;
    if (materialIds.length > 0 && count === 0) {
      await loadVegProductsByMaterial([]);
    }
  } else {
    vegMaterialFallback.value = false;
  }
}

function onProductChange(item: ProductInfoVO) {
  // 选卡片回填默认单位/规格，方便录入
  if (item.productUnit) form.value.productUnit = item.productUnit;
  if (item.productSpec && !form.value.productSpec) form.value.productSpec = item.productSpec;
}

// 果蔬地块：按来源 plotId 分组成 button-toggle；选地块后来源下拉只显示该地块来源
const selectedPlotId = ref<number | string | ''>('');

/** 外购无地块来源（plotId==null）的「无地块信息」选项哨兵 value（doc#13）；选中时提交不带 plotId。 */
const NO_PLOT_SENTINEL = '__no_plot__';

const plotToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.plotGroup) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  let hasNoPlot = false;
  sources.value.forEach((s) => {
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

// 肉品耳号：按来源 earNo 去重成 button-toggle；选耳号后来源只显示该耳号来源
const selectedEarNo = ref<number | string | ''>('');

const earToggleOptions = computed<{ value: number | string; label: string }[]>(() => {
  if (!props.earGroup) return [];
  const seen = new Map<string, { value: number | string; label: string }>();
  sources.value.forEach((s) => {
    if (!s.earNo) return;
    const key = String(s.earNo);
    if (!seen.has(key)) {
      seen.set(key, { value: s.earNo, label: s.earNo });
    }
  });
  return Array.from(seen.values());
});

const displaySources = computed(() => {
  let list = sources.value;
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
  sources.value.find((s) => String(s.id) === String(form.value.sourceInhouseId))
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

function onPlotChange() {
  const src = sources.value.find((x) => String(x.id) === String(form.value.sourceInhouseId));
  if (!src) return;
  // 「无地块信息」哨兵：已选来源须是无地块来源，否则清空等重选
  const mismatch =
    selectedPlotId.value === NO_PLOT_SENTINEL ? src.plotId != null : String(src.plotId) !== String(selectedPlotId.value);
  if (mismatch) {
    form.value.sourceInhouseId = '';
  }
}

// 肉品打包来源区已隐藏（showSource=false）：只按猪只耳号溯源（门店做溯源码）。
// 选耳号后自动取该耳号下首条来源 inhouse 作打包来源（扣减 + 追溯链路绑定该耳号）；无来源则清空。
function onEarChange() {
  const earSrc = sources.value.find((x) => String(x.earNo) === String(selectedEarNo.value));
  form.value.sourceInhouseId = earSrc ? earSrc.id : '';
}

const selectedUnit = computed<string>(() => {
  if (props.kind === 'veg') return 'kg';
  return form.value.productUnit || 'kg';
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
    // 来源区隐藏时（showSource=false）不再前端强制选来源，提交链路待后端按目标产品/耳号自动匹配
    if (props.showSource && !form.value.sourceInhouseId) {
      ElMessage.warning(t('djs.warehouse.packEntry.sourceRequired'));
      return false;
    }
    if (!form.value.productWeight || form.value.productWeight <= 0) {
      ElMessage.warning(t('djs.warehouse.packEntry.productWeightRequired'));
      return false;
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
      const bo: VegPackBo = {
        sourceInhouseId: form.value.sourceInhouseId as number | string,
        productId: form.value.productId as number | string,
        productWeight: form.value.productWeight as number,
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
        await ElMessageBox.alert(traceCode, t('djs.warehouse.packEntry.traceCodeTitle'), {
          confirmButtonText: t('djs.warehouse.packEntry.print'),
          callback: () => printTraceCode(traceCode)
        });
      } else {
        ElMessage.warning(t('djs.warehouse.packEntry.noTraceCode'));
      }
    }
    handleReset();
    void loadDemandMap();
    // 打包消耗原材料后刷新卡片库存（保持与扣减后真实库存一致）
    void loadMaterialStock();
  } finally {
    submitting.value = false;
  }
}

/** 打开浏览器打印窗口展示追溯码（功能对齐：最小实现，不接专用标签机）。 */
function printTraceCode(code: string) {
  const w = window.open('', '_blank', 'width=420,height=320');
  if (!w) return;
  w.document.write(
    `<html><head><title>${t('djs.warehouse.packEntry.traceCodeTitle')}</title></head>` +
      `<body style="font-family:sans-serif;text-align:center;padding:40px"><h3>${t('djs.warehouse.packEntry.traceCodeTitle')}</h3>` +
      `<div style="font-size:28px;letter-spacing:2px;margin:24px 0">${code}</div></body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
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
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.demand-label {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 24px;
}
.demand-tags {
  flex: 1;
  min-width: 0;
}
</style>
