/**
 * 出入库统计（V6-R167）两个 Tab 共用的搜索默认值与哨兵值。
 */

import { shiftMonthYmd, todayYmd } from '@/utils/date';

/**
 * 供应商下拉里「无供应商」那一项的值。
 *
 * 甲方「供应商为空的统计到一起」要求空供应商是一个能被单独筛出来的统计桶，
 * 而空桶用供应商 ID 表达不了（没有 ID）。选中它时前端改传 `noSupplier=true`，
 * 这个哨兵值只在页面内部流转，不会发给后端；供应商 ID 都是数字串，撞不上它。
 */
export const NO_SUPPLIER_VALUE = '__none__';

/**
 * 默认日期区间：**上月同日 → 今天**（甲方「默认近一个月」）。
 *
 * 一律走 utils/date 的本地时区口径，不用 toISOString —— 东八区凌晨会退成昨天。
 */
export const defaultDateRange = (): [string, string] => [shiftMonthYmd(-1), todayYmd()];
