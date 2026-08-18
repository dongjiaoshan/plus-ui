import { ref, computed, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';

/** 缩放上下限：1 = 铺满容器，8 = 能看清最窄的长廊条 */
const MIN_SCALE = 1;
const MAX_SCALE = 8;
/** 滚轮一格的缩放系数 */
const WHEEL_STEP = 1.15;
/** 按钮 / 键盘一次的缩放系数 */
const BUTTON_STEP = 1.4;

export interface PanZoomOptions {
  /** 缩放变化时回调（用于同步标签字号等） */
  onScaleChange?: (scale: number) => void;
}

/**
 * 地图平移缩放。
 *
 * 用 CSS transform 作用在包裹 SVG 的图层上，SVG 是矢量所以放大不失真；
 * 不引第三方地图库（Leaflet / Konva 是为真实地理坐标和数千图元设计的，
 * 这里只有 35 个多边形，杀鸡用牛刀且违反「不引未澄清的新依赖」）。
 *
 * 交互：滚轮以光标为锚点缩放 / 按住拖拽平移 / 双击复位。
 */
export function usePanZoom(containerRef: Ref<HTMLElement | undefined>, options: PanZoomOptions = {}) {
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);

  const dragging = ref(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;

  const transform = computed(() => `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`);

  /**
   * 把平移量夹在合法区间，防止把地图拖出视口再也找不回来。
   *
   * 内容在 scale=1 时正好铺满容器，放大 s 倍后尺寸是 (W*s, H*s)，
   * 因此左上角最多平移到 0，右下角最多平移到 W*(1-s) —— s=1 时区间退化为 [0,0]，
   * 即未放大时锁死居中。
   */
  function clampTranslate() {
    const el = containerRef.value;
    if (!el) return;
    const minX = el.clientWidth * (1 - scale.value);
    const minY = el.clientHeight * (1 - scale.value);
    translateX.value = Math.min(0, Math.max(minX, translateX.value));
    translateY.value = Math.min(0, Math.max(minY, translateY.value));
  }

  /**
   * 以容器内某点为锚点缩放：该点在缩放前后停在同一屏幕位置。
   *
   * 内容坐标 p = (screen - translate) / scale，缩放后要求 screen 不变，
   * 于是 translate' = screen - p * scale'。
   */
  function zoomAt(nextScale: number, anchorX: number, anchorY: number) {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    if (clamped === scale.value) return;
    const ratio = clamped / scale.value;
    translateX.value = anchorX - (anchorX - translateX.value) * ratio;
    translateY.value = anchorY - (anchorY - translateY.value) * ratio;
    scale.value = clamped;
    clampTranslate();
    options.onScaleChange?.(clamped);
  }

  /** 以容器中心为锚点缩放（缩放按钮 / 滑块用） */
  function zoomToCenter(nextScale: number) {
    const el = containerRef.value;
    if (!el) return;
    zoomAt(nextScale, el.clientWidth / 2, el.clientHeight / 2);
  }

  const zoomIn = () => zoomToCenter(scale.value * BUTTON_STEP);
  const zoomOut = () => zoomToCenter(scale.value / BUTTON_STEP);

  function reset() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    options.onScaleChange?.(1);
  }

  useEventListener(containerRef, 'wheel', (e: WheelEvent) => {
    // 不 preventDefault 的话缩放地图会同时把整个 admin 页面滚走
    e.preventDefault();
    const el = containerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const factor = e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
    zoomAt(scale.value * factor, e.clientX - rect.left, e.clientY - rect.top);
  });

  useEventListener(containerRef, 'pointerdown', (e: PointerEvent) => {
    // 只响应左键；右键留给浏览器菜单
    if (e.button !== 0) return;
    dragging.value = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOriginX = translateX.value;
    dragOriginY = translateY.value;
  });

  // 拖拽中的 move/up 挂 window 而不是容器，且**不用 setPointerCapture**：
  // 指针捕获会把后续 click 事件的目标改成容器，区块 polygon 的 @click 就再也不触发了
  // （表现：地图能拖能缩放，但点区块没反应）。挂 window 还能让指针拖出容器后继续跟手。
  useEventListener(window, 'pointermove', (e: PointerEvent) => {
    if (!dragging.value) return;
    translateX.value = dragOriginX + (e.clientX - dragStartX);
    translateY.value = dragOriginY + (e.clientY - dragStartY);
    clampTranslate();
  });

  const endDrag = () => {
    dragging.value = false;
  };
  useEventListener(window, 'pointerup', endDrag);
  useEventListener(window, 'pointercancel', endDrag);

  /** 本次按下到抬起是否发生了拖拽位移——用于区分"拖地图"和"点区块" */
  function movedSinceDown(e: { clientX: number; clientY: number }) {
    return Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4;
  }

  useEventListener(containerRef, 'dblclick', reset);

  return {
    scale,
    transform,
    dragging,
    movedSinceDown,
    zoomIn,
    zoomOut,
    zoomToCenter,
    reset,
    MIN_SCALE,
    MAX_SCALE
  };
}
