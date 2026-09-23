/**
 * 「日期窗口五档状态」共享契约（果蔬上市计划 + 采摘计划两页共用）。
 *
 * 对齐后端 org.dromara.djs.plant.common.{util.DateWindowStatusCalculator, domain.vo.DateWindowStatusStatVo}：
 * 同一套判定（30 天 / 15 天分界）、同一套状态码，只是两页中文说法不同
 * （上市：待上市/即将上市/上市中/即将下市/已下架；采摘：未到采摘期/临近采摘期/采摘期内/临近采摘末期/已过采摘期）。
 * 中文各自走 i18n 的 `marketPlan.status.*` / `pickPlan.status.*`，这里只管码与顺序。
 */

/** 五档状态码（后端现算，不落库、不是字典）。 */
export type DateWindowStatusCode = 'pending' | 'upcoming' | 'on_sale' | 'ending' | 'off_shelf';

/**
 * 顶部统计版块 / 状态下拉的档位顺序 —— 甲方点名的顺序：
 * 即将上市(临近采摘期) → 待上市(未到采摘期) → 上市中(采摘期内) → 即将下市(临近采摘末期) → 已下架(已过采摘期)。
 *
 * 两页共用一份，甲方再调顺序时只改这里。
 */
export const DATE_WINDOW_STATUS_ORDER: DateWindowStatusCode[] = ['upcoming', 'pending', 'on_sale', 'ending', 'off_shelf'];

/**
 * 五档计数（统计的是**全量**，不是当前页；「状态」筛选条件本身不参与统计，
 * 否则选中一档后另外四档必然为 0）。
 *
 * 开始日期为空的行（没排明细）状态为空，五档都不计入，所以五个数之和可能小于列表总行数。
 */
export interface DateWindowStatusStatVO {
  pending?: number;
  upcoming?: number;
  onSale?: number;
  ending?: number;
  offShelf?: number;
}

/** 状态码 → VO 字段名（后端字段是驼峰，状态码是下划线）。 */
const STAT_FIELD: Record<DateWindowStatusCode, keyof DateWindowStatusStatVO> = {
  pending: 'pending',
  upcoming: 'upcoming',
  on_sale: 'onSale',
  ending: 'ending',
  off_shelf: 'offShelf'
};

/**
 * 取某一档的计数；stat 未加载完 / 加载失败时返回 undefined，由页面显 `-`。
 *
 * @param stat 后端返回的五档计数（可空）
 * @param code 状态码
 */
export function dateWindowStatCount(stat: DateWindowStatusStatVO | null | undefined, code: DateWindowStatusCode): number | undefined {
  return stat ? stat[STAT_FIELD[code]] : undefined;
}

/**
 * 状态下拉的可选项 —— 甲方原话「数据通过列表里的状态进行去重加载」：只给**当前结果集里真有数据**的档。
 *
 * <p>去重的基准是 {@link DateWindowStatusStatVO}，而它统计时**忽略状态条件本身**：所以选中「上市中」之后
 * 下拉里仍然列得出其余几档，用户能直接改选，不会一选就把自己锁死在一档里。</p>
 *
 * <p>计数还没回来（首屏 / 请求失败）时给全五项 —— 空下拉会让用户以为筛选坏了，比多给几档更糟。</p>
 *
 * @param stat  五档计数（可空）
 * @param label 状态码 → 中文（两页各自的 i18n）
 */
export function dateWindowStatusOptions(
  stat: DateWindowStatusStatVO | null | undefined,
  label: (code: DateWindowStatusCode) => string
): Array<{ label: string; value: DateWindowStatusCode }> {
  const codes = stat ? DATE_WINDOW_STATUS_ORDER.filter((c) => (dateWindowStatCount(stat, c) ?? 0) > 0) : DATE_WINDOW_STATUS_ORDER;
  const usable = codes.length ? codes : DATE_WINDOW_STATUS_ORDER;
  return usable.map((code) => ({ label: label(code), value: code }));
}
