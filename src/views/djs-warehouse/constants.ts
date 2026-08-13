/**
 * 仓库域跨页共享常量。
 */

/**
 * 毛菜鲜品库（甲方口径「毛菜保鲜室」）库位编码。后端常量同名 `LOCATION_CODE_FRESH_VEG`。
 */
export const VEG_FRESH_LOCATION_CODE = 'L0006';

/**
 * 毛菜鲜品库库位 id（Flyway 种子固定 id，各环境一致）。
 *
 * 值 9301000000000006 已超 JS Number 安全整数（9007199254740991），**必须以字符串传递**，
 * 否则 JSON 序列化会丢精度导致后端查不到库位。
 */
export const VEG_FRESH_LOCATION_ID = '9301000000000006';

/**
 * `djs_stock_out_dest` 里由代码自动回填的内部流转去向 —— 出库录入下拉一律隐藏。
 *
 * 这 8 个值（发货月台 / 部门领用 ×2 / 白条分割 / 生产领用 / 盘点计损 / 冻库转存 / 饲料）
 * 由各业务出库路径在后端写流水时自动落值，不是给操作员手选的；漏过滤会让下拉里混进
 * 一堆用户无法理解、选了还会串账的条目。
 *
 * 历史流水翻译成中文仍需要这些值，所以只在「录入」下拉隐藏，查询筛选 / 列表 dict-tag 不过滤。
 */
export const HIDDEN_OUT_DEST = new Set([
  'ship_dock',
  'dept',
  'dept_pick',
  'bar_cut',
  'prod_pick',
  'check_loss',
  'frozen_store',
  'feed'
]);

/** 过滤出可手选的出库去向（剔除 {@link HIDDEN_OUT_DEST} 内部流转值）。 */
export function filterManualOutDest(options: DictDataOption[] | undefined | null): DictDataOption[] {
  return (options ?? []).filter((d) => !HIDDEN_OUT_DEST.has(String(d.value)));
}
