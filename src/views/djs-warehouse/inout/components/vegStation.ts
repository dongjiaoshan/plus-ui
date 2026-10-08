/** 果蔬入库 / 出库工作台的纯逻辑（V6 row282 / row283），抽出来单测。 */

/** 卡片列表一页 3 列 × 2 行；超过一页向右滑动翻页（甲方：信息显示三列，过多时左右滑动）。 */
export const CARD_COLUMNS = 3;
export const CARD_ROWS = 2;

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
