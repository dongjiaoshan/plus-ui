/**
 * 出入库「方式」下拉白名单（djs_flow_type 是出入合并字典，按 value 过滤，不动字典 seed）。
 *
 * 入库记录页 / 出库记录页 / 出入库月汇总的两个下钻弹窗共用同一份，
 * 新增入库/出库方式只需改这里一处。
 */

/**
 * 入库方式下拉可选值。
 *
 * ⚠️ 新增入库方式必须同步进这个白名单，否则「入库记录」页和「入库汇总」都筛不出来。
 * pack_in（打包入库）是「出库到发货月台」语义，后端展示口径已排除，下拉同步不提供。
 */
export const FLOW_TYPE_IN_VALUES: readonly string[] = [
  // 退回入库按来源拆分（FIX-WMS-FLOWDICT-001，旧 return_in 已停写，保留兼容历史流水筛选）
  'return_in',
  'store_return_in',
  'prod_return_in',
  'pick_return_in',
  'cut_out_in',
  'veg_stock_in',
  'slaughter_burn',
  'bar_in_stock',
  'check_in',
  'supplier_in',
  'purchase_in',
  'veg_receive_in',
  'veg_purchase_in',
  // 三期作物入库（V6 row88）
  'third_phase_in',
  'receive_in',
  'return_goods_in',
  'other'
];

/**
 * 出库方式下拉可选值。
 *
 * loss / ship_out / pack_consume（生产发货与领用后损耗）后端展示口径已排除，下拉同步不提供。
 */
export const FLOW_TYPE_OUT_VALUES: readonly string[] = [
  'pick_out',
  // 领用按来源拆分 + 盘点异常出库（FIX-WMS-FLOWDICT-001）
  'dept_pick_out',
  'prod_pick_out',
  'feed_out',
  'cut_out',
  'check_out',
  'check_abnormal_out',
  'backstage_out',
  'other'
];
