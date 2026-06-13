<template>
  <div v-loading="loading" class="card-grid">
    <template v-if="items.length > 0">
      <div
        v-for="item in items"
        :key="String(item.id)"
        class="prod-card"
        :class="{ active: String(modelValue) === String(item.id) }"
        @click="select(item.id)"
      >
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
          <div v-if="demandOf(item) != null" class="prod-row">{{ t('djs.warehouse.packEntry.demandLabel') }}：{{ demandOf(item) }}</div>
          <div v-if="showStock && stockOf(item) != null" class="prod-row">
            {{ t('djs.warehouse.packEntry.materialStockLabel') }}：{{ stockOf(item) }}
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
    /** productId → 原材料库存（来源过程产品剩余量聚合） */
    stockMap?: Record<string, number>;
    /** 是否显示「原材料库存」行（其他产品打包原型无此行） */
    showStock?: boolean;
  }>(),
  {
    loading: false,
    demandMap: () => ({}),
    stockMap: () => ({}),
    showStock: true
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

function stockOf(item: ProductInfoVO): number | undefined {
  const v = props.stockMap[String(item.id)];
  return v == null ? undefined : v;
}

function select(id: number | string) {
  emit('update:modelValue', id);
  const item = props.items.find((p) => String(p.id) === String(id));
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
.prod-card {
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
</style>
