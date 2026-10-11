<template>
  <div class="veg-pager">
    <div ref="track" class="veg-pager-track" @scroll="onScroll">
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="veg-pager-page"
        :style="{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, ${CARD_WIDTH}px))` }"
      >
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
/** 卡片分页条：按容器宽度分列、每页最多五行；支持触屏滑动与箭头翻页。 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { CARD_GAP, CARD_HEIGHT, CARD_WIDTH, cardPageLayout, chunkPages } from './vegStation';

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
/** 卡片区下方的预留：分页条与轨道底边距（38）+「地块信息」标题、一行地块 / 库存卡与页面底边距（170）。 */
const BELOW_PAGER = 208;
/** 分页页的上下内边距（.veg-pager-page padding 3px）。 */
const PAGE_PADDING = 6;

const layout = ref(cardPageLayout(CARD_WIDTH * 3 + CARD_GAP * 2, (CARD_HEIGHT + CARD_GAP) * 2));
const pageSize = computed(() => layout.value.columns * layout.value.rows);
const pages = computed(() => chunkPages(props.items, pageSize.value));
let observer: ResizeObserver | undefined;

/** 行数按实测卡高与卡片区到视口底部的剩余高度算，下方地块 / 库存区至少留一行在首屏。 */
function measure() {
  const el = track.value;
  if (!el) return;
  const cards = Array.from(el.querySelectorAll<HTMLElement>('.veg-pager-page > *'), (card) => card.offsetHeight);
  const cardHeight = Math.max(0, ...cards) || CARD_HEIGHT;
  // 用文档坐标：页面纵向滚动后再测量（点卡片、提交后刷新都会触发），行数不能跟着滚动位置变
  const top = el.getBoundingClientRect().top + window.scrollY;
  const available = window.innerHeight - top - BELOW_PAGER - PAGE_PADDING;
  layout.value = cardPageLayout(Math.max(0, el.clientWidth - 8), available, cardHeight + CARD_GAP);
}

onMounted(() => {
  measure();
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure);
    if (track.value) observer.observe(track.value);
  }
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener('resize', measure);
});

watch(
  () => [props.items, props.activeKey, pageSize.value] as const,
  async () => {
    await nextTick();
    measure();
    const index = props.activeKey ? props.items.findIndex((item) => props.itemKey(item) === props.activeKey) : -1;
    go(index >= 0 ? Math.floor(index / pageSize.value) : current.value, false);
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
