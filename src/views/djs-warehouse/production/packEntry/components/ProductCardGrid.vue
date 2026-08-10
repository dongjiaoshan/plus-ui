<template>
  <div
    v-loading="loading"
    class="card-grid"
    :class="{ 'card-grid--large': large, 'card-grid--compact': compact, 'card-grid--dense': dense, 'card-grid--empty': items.length === 0 }"
  >
    <template v-if="items.length > 0">
      <div
        v-for="item in items"
        :key="String(item.id)"
        class="prod-card"
        :class="{
          active: String(modelValue) === String(item.id),
          'prod-card--large': large,
          'prod-card--compact': compact,
          'prod-card--dense': dense
        }"
        @click="select(item.id)"
      >
        <div class="prod-thumb">
          <el-image v-if="imageOf(item)" :src="imageOf(item)" fit="cover" class="thumb-img">
            <template #error>
              <div class="thumb-fallback">
                <el-icon><Goods /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="thumb-fallback">
            <el-icon><Goods /></el-icon>
          </div>
        </div>
        <div class="prod-meta">
          <div class="prod-name">{{ item.productName }}</div>
          <div v-if="item.productSpec" class="prod-row">{{ t('djs.warehouse.packEntry.specLabel') }}：{{ item.productSpec }}</div>
          <!-- 流程性问题 row9：需求量单位取产品自身单位（productUnit），非固定「份」；缺省回退「份」 -->
          <div v-if="demandOf(item) != null" class="prod-row">
            {{ t('djs.warehouse.packEntry.demandLabel') }}：{{ demandOf(item) }} {{ item.productUnit || t('djs.warehouse.packEntry.copiesUnit') }}
          </div>
          <div v-if="showStock && hasStockEntry(item)" class="prod-row">
            {{ t('djs.warehouse.packEntry.materialStockLabel') }}：{{ stockDisplay(item) }}
          </div>
        </div>
      </div>
    </template>
    <el-empty v-else :description="t('djs.warehouse.packEntry.noProduct')" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Goods } from '@element-plus/icons-vue';
import type { ProductInfoVO } from '@/api/djs-warehouse/product/types';
import { formatKgToG } from '@/utils/weight';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    /** 当前选中产品 id（v-model） */
    modelValue: number | string | '';
    /** 产品卡片列表 */
    items: ProductInfoVO[];
    /** 加载中 */
    loading?: boolean;
    /** productId → 需求份数（聚合各门店未发货需求） */
    demandMap?: Record<string, number>;
    /**
     * 成品雪花 id 字符串 → 原材料实时库存（成品 product_material 指向的原材料 location_stock 合计，口径同后端校验/扣减）。
     * value=null 表示成品未配 product_material（展示 '—'，不参与校验）；key 不在 map 中=不显示库存行。
     */
    stockMap?: Record<string, number | null>;
    /** 是否显示「原材料库存」行（其他产品打包原型无此行） */
    showStock?: boolean;
    /** 大卡片版（肉品打包：卡片+缩略图放大，填充空白）；缺省紧凑版 */
    large?: boolean;
    /** 超紧凑版（小屏 mini：卡片+缩略图更小、文字更小、一排放更多）；缺省 false */
    compact?: boolean;
    /**
     * 一体秤小屏版（dense）：缩略图和三行数据（规格 / 需求量 / 领用剩余重量）全保留，只把卡片
     * 从 large 版收回常规尺寸 —— 秤屏一排放 4 个，放不下的滚动（Kevin 2026-08-10：宁可滚，
     * 不要为了一屏塞完把卡片压到又小又密）。缺省 false，其他打包页零影响。
     */
    dense?: boolean;
    /**
     * 「领用剩余重量」单位强制覆盖（果蔬打包传 'kg'）：系统权威量纲=kg，
     * stockMap 的数值是 kg；果蔬成品 product_unit 可能是「份」，若按产品单位渲染会出现
     * 「kg 值贴份单位」错位（row12 点1）。传此 prop → 库存行固定显该单位，不用产品 product_unit。
     */
    stockUnit?: string;
    /**
     * 成品 id → 「领用剩余重量」单位（per-product，优先于 stockUnit/productUnit）。
     * 其他产品打包：库存值是「原料」领用余量（如土鸡蛋 200 枚），须按原料单位「枚」展示，
     * 而非成品自身单位（鸡蛋10个装的「份」）——否则 200 枚被渲染成「200 份」（200 枚≠200 份）。
     */
    stockUnitMap?: Record<string, string>;
    /**
     * 「领用剩余重量」按克(g)展示（肉品打包 124#6）：stockMap 数值是 kg，用 formatKgToG（×1000 + ' g'）
     * 渲染为克，忽略 stockUnitMap/stockUnit。缺省 false，其他打包页仍按 kg/原料单位展示，零影响。
     */
    weightInGram?: boolean;
  }>(),
  {
    loading: false,
    demandMap: () => ({}),
    stockMap: () => ({}),
    showStock: true,
    large: false,
    compact: false,
    dense: false,
    stockUnit: undefined,
    stockUnitMap: () => ({}),
    weightInGram: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | string): void;
  (e: 'change', item: ProductInfoVO): void;
}>();

function imageOf(item: ProductInfoVO): string {
  return item.imageUrl || item.productThumb || item.productImg || '';
}

function demandOf(item: ProductInfoVO): number | undefined {
  const v = props.demandMap[String(item.id)];
  return v == null ? undefined : v;
}

/** 该成品是否有库存条目（含未配料的 null 占位）：在 stockMap 里就显示库存行。 */
function hasStockEntry(item: ProductInfoVO): boolean {
  return String(item.id) in props.stockMap;
}

/**
 * 库存展示文案：已配显「数值 + 单位」；未配（null 占位）显 '—'。
 * 单位优先用 stockUnit（果蔬打包传 'kg'，量纲对齐 row12 点1），否则回退产品 product_unit / 'kg'。
 */
function stockDisplay(item: ProductInfoVO): string {
  const v = props.stockMap[String(item.id)];
  if (v == null) return '—';
  // 124#6：肉品打包按克(g)展示（stockMap 值为 kg，×1000 转克）；formatKgToG 内部 Number 强转防 BigDecimal 字符串坑
  if (props.weightInGram) return formatKgToG(v);
  // 单位优先级：per-product stockUnitMap（其他产品打包按原料单位）> stockUnit（果蔬固定 kg）> 产品自身单位
  const unit = props.stockUnitMap[String(item.id)] || props.stockUnit || item.productUnit || 'kg';
  // row28/row29：重量单位(kg)产品「领用剩余重量」一律按克(g)展示（与肉品/果蔬录入单位 g 统一，stockMap 值为 kg）；
  // 枚/份等计数单位原样显示（如鸡蛋 985 枚不转）。
  if (unit === 'kg') return formatKgToG(v);
  return `${v} ${unit}`;
}

function select(id: number | string) {
  const item = props.items.find((p) => String(p.id) === String(id));
  emit('update:modelValue', id);
  if (item) emit('change', item);
}
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  min-height: 120px;
}
/* 空态（row129）：无产品时空态卡片在可用区域内水平垂直居中，而非停在左上角 */
.card-grid--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 240px;
}
/* 大卡片版（肉品打包）：一排约 2 个 + 卡更大，填充空白 */
.card-grid--large {
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 16px;
}
.prod-card {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: var(--el-bg-color);
}
.prod-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.prod-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}
.prod-thumb {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
}
.thumb-img {
  width: 56px;
  height: 56px;
  border-radius: 6px;
}
.thumb-fallback {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
  font-size: 24px;
}
.prod-meta {
  flex: 1;
  min-width: 0;
}
.prod-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.prod-row {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

/* ===== 大卡片版（肉品打包，large）：缩略图 + 内边距 + 文字放大 ===== */
.prod-card--large {
  gap: 18px;
  padding: 18px 20px;
}
.prod-card--large .prod-thumb,
.prod-card--large .thumb-img,
.prod-card--large .thumb-fallback {
  flex-basis: 120px;
  width: 120px;
  height: 120px;
}
.prod-card--large .thumb-fallback {
  font-size: 40px;
}
.prod-card--large .prod-name {
  font-size: 18px;
  margin-bottom: 8px;
}
.prod-card--large .prod-row {
  font-size: 14px;
  line-height: 1.9;
}

/* ===== 一体秤小屏版（dense）：卡片从 large 收回常规尺寸，秤屏一排 4 个 =====
   缩略图和三行数据全保留（Kevin 2026-08-10 定：宁可滚动，不要为了一屏塞完把卡片压到又小又密）。
   245px 下限：卡片再窄，「领用剩余重量：42500 g」(~156px) 就放不下要折行 —— 实测秤屏排 4 列(191px)时
   46 张卡的数据行全部折行、卡片反而从 104 长到 143，一屏可见数量和 3 列一样都是 12 个，纯亏。
   所以下限按「数据行不折行」反推：156 + 内边距24 + 缩略图56 + 间隙10 = 246px，秤屏落 3 列。 */
.card-grid--dense {
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 12px;
  align-content: start;
}
.prod-card--dense {
  gap: 10px;
  padding: 10px 12px;
}
/* 76px 而不是常规 56px：卡片高度由右边文字栏（名称 + 三行数据 ≈ 82px）决定，
   缩略图放大到 76 仍矮于文字栏，**一点高度都不多占**，白拿一张更看得清的图 */
.prod-card--dense .prod-thumb,
.prod-card--dense .thumb-img,
.prod-card--dense .thumb-fallback {
  flex-basis: 76px;
  width: 76px;
  height: 76px;
}
.prod-card--dense .thumb-fallback {
  font-size: 30px;
}
/* 名称两行截断而不是一行省略号：这批成品只有末尾规格不同（…五花肉250g/份 vs …500g/份），
   一行省略号正好把唯一区分点吃掉，整屏卡片看起来全一样 */
.prod-card--dense .prod-name {
  font-size: 14px;
  margin-bottom: 4px;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.prod-card--dense .prod-row {
  font-size: 12px;
  line-height: 1.6;
}

/* ===== 紧凑版（小屏 mini）：比大卡片小、一排放更多，仍保持可读与设计感 ===== */
.card-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}
.prod-card--compact {
  gap: 10px;
  padding: 12px;
}
.prod-card--compact .prod-thumb,
.prod-card--compact .thumb-img,
.prod-card--compact .thumb-fallback {
  flex-basis: 52px;
  width: 52px;
  height: 52px;
}
.prod-card--compact .thumb-fallback {
  font-size: 22px;
}
.prod-card--compact .prod-name {
  font-size: 14px;
  margin-bottom: 4px;
}
.prod-card--compact .prod-row {
  font-size: 12px;
  line-height: 1.6;
}
</style>
