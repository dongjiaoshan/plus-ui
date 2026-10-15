/** 果蔬入库 / 出库工作台的纯逻辑（V6 row282 / row283），抽出来单测。 */

/** 窄卡按容器分列，每页最多五行，超出的卡片横向翻页。 */
export const CARD_COLUMNS = 5;
export const CARD_ROWS = 5;
export const CARD_WIDTH = 240;
/** 卡片可收窄到的下限：差十几像素就能多排一列时收窄卡片，不留整列空白。 */
export const CARD_MIN_WIDTH = 224;
/** 卡片间距（与 .veg-pager-page 的 gap 一致）。 */
export const CARD_GAP = 12;
/** 卡片尚未渲染时估算行数用的卡高；渲染后以实测卡高为准。 */
export const CARD_HEIGHT = 98;

/**
 * 每页列数按容器宽度、行数按卡片区可用高度（实测卡高 + 间距）计算，最多 5 列 × 5 行。
 * 可用高度由调用方扣掉卡片区上方位置与下方地块 / 库存区预留，短屏自动减行。
 */
export function cardPageLayout(width: number, availableHeight: number, rowHeight = CARD_HEIGHT + CARD_GAP): { columns: number; rows: number } {
  return {
    columns: Math.max(1, Math.min(CARD_COLUMNS, Math.floor((width + CARD_GAP) / (CARD_MIN_WIDTH + CARD_GAP)))),
    rows: Math.max(1, Math.min(CARD_ROWS, Math.floor((availableHeight + CARD_GAP) / rowHeight)))
  };
}

export function chunkPages<T>(items: readonly T[], size = CARD_COLUMNS * CARD_ROWS): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

/** 绩效百分比快捷项（原型）；「自定义」另行输入 1-99 的整数。 */
export const PERF_PRESETS = [100, 80, 60, 50, 30, 20] as const;

/** 自定义绩效百分比：只收大于 0、小于 100 的整数，其余返回 null。 */
export function toCustomPercent(raw: string | number | null | undefined): number | null {
  const text = String(raw ?? '').trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value > 0 && value < 100 ? value : null;
}

export interface ProductChoice {
  productId: string;
  selectable?: boolean;
}

/** 可选产品 = 作物当前产品配置（已移出配置的产品只展示剩余、不可选），与小程序采摘录入一致。 */
export function selectableProducts<T extends ProductChoice>(products: readonly T[] | undefined): T[] {
  return (products ?? []).filter((p) => p.selectable !== false);
}

/** 默认产品：可选产品的第一个（只有一个时即默认选中，多个时默认其中一个）。 */
export function defaultProductId(products: readonly ProductChoice[] | undefined): string {
  const first = selectableProducts(products)[0];
  return first ? String(first.productId) : '';
}

export function toKg(value: string | number | null | undefined): string {
  const n = Number(value);
  return `${Number.isFinite(n) ? n.toFixed(3) : '0.000'} kg`;
}

/** 重量 > 0 且最多三位小数才能提交。 */
export function isValidWeight(value: number | undefined): value is number {
  return value != null && Number.isFinite(value) && value > 0 && Number(value.toFixed(3)) === value;
}
