/**
 * 毛菜间出库「同产品合并」口径（V6 row108）。
 *
 * <p>甲方原文：同一个产品属于不同地块时，已选清单只按产品编号累计成一条、打印也按一个产品打一行。
 * 库存是按「产品 × 地块」分篮存的（{@code t_warehouse_location_stock} 一篮一行），
 * 所以一个产品在候选列表里天然会出现多行。</p>
 *
 * <p><b>合并只发生在展示与打印层。</b>提交仍按库存行逐条走（{@code items[].stockId}）——
 * 后端扣的是具体那个篮的库存，合并成一条它就不知道该从哪个篮扣、也扣不出正确的地块流水。</p>
 */

import type { VegOutPrintRow } from './printSheet';

/** 参与合并所需的最小字段。 */
export interface MergeableProduct {
  /** 产品业务编号（t_warehouse_product_info.product_id） */
  productCode?: string | null;
  productName?: string;
  productSpec?: string;
  productUnit?: string;
}

/**
 * 合并键 = 产品编号 + 单位。
 *
 * <p>编号缺失（老数据没填产品编码）时回落「产品名 + 规格」，<b>不能回落成空串</b>——
 * 否则所有没编号的产品会被并成一条，红薯的量加进空心菜里。</p>
 *
 * <p>带上单位是防串味：单位来自产品主数据，同编号本就同单位，但万一主数据被改过，
 * 「3 袋 + 2kg = 5」这种加法必须加不出来。</p>
 */
export function productMergeKey(p: MergeableProduct): string {
  const unit = (p.productUnit ?? '').trim().toLowerCase();
  const code = String(p.productCode ?? '').trim();
  const id = code ? `code:${code}` : `name:${p.productName ?? ''}|${p.productSpec ?? ''}`;
  return `${id}|${unit}`;
}

/**
 * 组内单价：各行一致时返回该单价，不一致返回 undefined（打印单价列留白）。
 *
 * <p>不返回加权均价：均价四舍五入后「单价 × 数量 ≠ 总金额」，而这张三联单是财务凭证，
 * 印一个对不上的数比留白更糟。总金额一律取各行真实小计之和。</p>
 */
export function uniformUnitPrice(prices: number[]): number | undefined {
  if (!prices.length) return undefined;
  const first = prices[0];
  return prices.every((p) => p === first) ? first : undefined;
}

/** 待合并的打印行：比打印行多一个产品编号（合并键），金额按各自真实小计给。 */
export type MergeablePrintRow = VegOutPrintRow & { productCode?: string | null };

/**
 * 把同一产品的多行合并成一行打印行（顺序按各产品首次出现）。
 *
 * <p>数量相加；金额取各行真实小计之和（行自带 `amount` 优先，否则按 量 × 单价 算）；
 * 单价仅在组内一致时保留。</p>
 */
export function mergeVegOutPrintRows(rows: MergeablePrintRow[]): VegOutPrintRow[] {
  const groups = new Map<string, { row: VegOutPrintRow; prices: number[] }>();
  rows.forEach((r) => {
    const key = productMergeKey(r);
    const qty = Number(r.quantity) || 0;
    const price = Number(r.unitPrice) || 0;
    const amount = r.amount !== undefined && r.amount !== null ? Number(r.amount) || 0 : qty * price;
    const hit = groups.get(key);
    if (hit) {
      hit.row.quantity += qty;
      hit.row.amount = (hit.row.amount ?? 0) + amount;
      hit.prices.push(price);
      return;
    }
    groups.set(key, {
      row: {
        productName: r.productName,
        productSpec: r.productSpec,
        productUnit: r.productUnit,
        quantity: qty,
        unitPrice: price,
        amount
      },
      prices: [price]
    });
  });
  return [...groups.values()].map(({ row, prices }) => ({ ...row, unitPrice: uniformUnitPrice(prices) }));
}
