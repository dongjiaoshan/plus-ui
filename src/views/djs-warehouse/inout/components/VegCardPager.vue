<template>
  <div class="veg-pager">
    <div ref="track" class="veg-pager-track" @scroll="onScroll">
      <div v-for="(page, index) in pages" :key="index" class="veg-pager-page">
        <template v-for="item in page" :key="itemKey(item)">
          <slot :item="item" />
        </template>
      </div>
    </div>
    <div v-if="pages.length > 1" class="veg-pager-nav">
      <button type="button" class="veg-pager-arrow" :disabled="current === 0" :aria-label="prevLabel" @click="go(current - 1)">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <span class="veg-pager-index">{{ current + 1 }} / {{ pages.length }}</span>
      <button type="button" class="veg-pager-arrow" :disabled="current >= pages.length - 1" :aria-label="nextLabel" @click="go(current + 1)">
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
/** 卡片分页条：每页 3 列 × 2 行，页与页横向排列，触屏左右滑动、鼠标点箭头翻页。 */
import { computed, nextTick, ref, watch } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { CARD_COLUMNS, CARD_ROWS, chunkPages } from './vegStation';

const props = defineProps<{
  items: T[];
  itemKey: (item: T) => string;
  /** 当前选中项的 key：列表刷新后停在它所在的那一页，而不是跳回第一页。 */
  activeKey?: string;
  prevLabel: string;
  nextLabel: string;
}>();
defineSlots<{ default(props: { item: T }): unknown }>();

const track = ref<HTMLElement>();
const current = ref(0);
const pages = computed(() => chunkPages(props.items));

watch(
  () => [props.items, props.activeKey] as const,
  async () => {
    await nextTick();
    const index = props.activeKey ? props.items.findIndex((item) => props.itemKey(item) === props.activeKey) : -1;
    go(index >= 0 ? Math.floor(index / (CARD_COLUMNS * CARD_ROWS)) : current.value, false);
  }
);

function onScroll() {
  const el = track.value;
  if (!el || !el.clientWidth) return;
  current.value = Math.round(el.scrollLeft / el.clientWidth);
}

function go(index: number, smooth = true) {
  const el = track.value;
  const target = Math.min(Math.max(index, 0), Math.max(pages.value.length - 1, 0));
  current.value = target;
  if (el) el.scrollTo({ left: target * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
}
</script>

<style scoped lang="scss">
.veg-pager-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  padding: 0 0 10px;
}
.veg-pager-page {
  box-sizing: border-box;
  flex: 0 0 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-content: start;
  gap: 12px;
  padding: 3px 4px;
}
.veg-pager-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.veg-pager-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
