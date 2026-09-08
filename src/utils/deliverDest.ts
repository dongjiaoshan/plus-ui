/**
 * 产出记录「出库去向」（{@code product_production.deliver_dest}）列展示统一工具。
 *
 * 生产记录下钻与门店需求「产品明细」两处都要显示这一列，文案必须完全一致 ——
 * 甲方对账时同一条产出在两个页面显示成两种去向，只会当成两条记录重报一次。
 * 文案本身仍走 i18n（`djs.warehouse.production.dest.*`），本文件只收口「值 → key」的映射。
 */
import i18n from '@/lang/index';

/** 后端 {@code deliver_dest} 取值。白条 / 猪肉产出该列为 NULL。 */
export type DeliverDestValue = 'platform' | 'gift' | 'warehouse_out';

/** 「出库去向」列空值占位（与其余列一致）。 */
const EMPTY_TEXT = '-';

const LABEL_KEY: Record<DeliverDestValue, string> = {
  platform: 'djs.warehouse.production.dest.platform',
  gift: 'djs.warehouse.production.dest.gift',
  // 后台出库产出行（矿山 / 厨房等直接来仓库拿走）：不进发货月台，去向单独标出来
  warehouse_out: 'djs.warehouse.production.dest.warehouseOut'
};

/**
 * 「出库去向」列文案：已知去向 → 字典文案；空 / 未知值 → 占位符。
 * @example formatDeliverDestLabel('warehouse_out') // '后台出库'
 * @example formatDeliverDestLabel(null)            // '-'
 */
export function formatDeliverDestLabel(dest: string | null | undefined): string {
  const key = LABEL_KEY[dest as DeliverDestValue];
  return key ? i18n.global.t(key) : EMPTY_TEXT;
}
