<template>
  <div v-loading="loading" class="card-grid" :class="{ 'card-grid--large': large }">
    <template v-if="items.length > 0">
      <div
        v-for="item in items"
        :key="String(item.id)"
        class="prod-card"
        :class="{
          active: String(modelValue) === String(item.id),
          'prod-card--large': large,
          'prod-card--done': isDone(item)
        }"
        @click="select(item.id)"
      >
        <div v-if="isDone(item)" class="done-badge">{{ t('djs.warehouse.packEntry.packDone') }}</div>
        <div class="prod-thumb">
          <el-image v-if="imageOf(item)" :src="imageOf(item)" fit="cover" class="thumb-img">
            <template #error>
              <div class="thumb-fallback"><el-icon><Goods /></el-icon></div>
            </template>
          </el-image>
          <div v-else class="thumb-fallback"><el-icon><Goods /></el-icon></div>
        </div>
        <div class="prod-meta">
          <div class="prod-name">{{ item.productName }}</div>
          <div v-if="item.productSpec" class="prod-row">{{ t('djs.warehouse.packEntry.specLabel') }}：{{ item.productSpec }}</div>
          <div v-if="demandOf(item) != null" class="prod-row">{{ t('djs.warehouse.packEntry.demandLabel') }}：{{ demandOf(item) }} {{ t('djs.warehouse.packEntry.copiesUnit') }}</div>
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
    /** 「打包完成」成品 id 集合（今天已打包份数 ≥ 门店需求）：卡片标完成 + 禁选 */
    doneSet?: Set<string>;
  }>(),
  {
    loading: false,
    demandMap: () => ({}),
    stockMap: () => ({}),
    showStock: true,
    large: false,
    doneSet: () => new Set<string>()
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

/** 库存展示文案：已配显「数值 + 单位（产品单位，缺省 kg）」；未配（null 占位）显 '—'。 */
function stockDisplay(item: ProductInfoVO): string {
  const v = props.stockMap[String(item.id)];
  if (v == null) return '—';
  return `${v} ${item.productUnit || 'kg'}`;
}

/** 该成品是否已打包完成（今天已打包份数 ≥ 门店需求）→ 卡片置灰、禁选。 */
function isDone(item: ProductInfoVO): boolean {
  return props.doneSet.has(String(item.id));
}

function select(id: number | string) {
  // 打包完成的成品不可再选（避免超量打包）
  const item = props.items.find((p) => String(p.id) === String(id));
  if (item && isDone(item)) return;
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
/* 打包完成：置灰 + 禁选 + 右上角角标 */
.prod-card--done {
  cursor: not-allowed;
  opacity: 0.6;
  background: var(--el-fill-color-light);
}
.prod-card--done:hover {
  border-color: var(--el-border-color);
  box-shadow: none;
}
.done-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: var(--el-color-success);
  border-radius: 10px;
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
</style>
