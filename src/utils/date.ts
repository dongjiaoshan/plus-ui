/**
 * 业务日期口径：**一律按本机（中国）时区算，绝不过 UTC**。
 *
 * 项目只在中国用，后端容器与 JVM 都是 `Asia/Shanghai`，`LocalDate` 字段存的就是中国日历日。
 * 前端如果用 `new Date().toISOString().slice(0, 10)` 取「今天」，那是 **UTC 的今天**——
 * 东八区 00:00–08:00 打开页面会拿到**昨天**。农场早班（杀猪 / 摘菜 / 发货）正好落在这个时段，
 * 表单默认日期错一天，仓库就照错的那天备货。
 *
 * 所有「今天 / N 天后」的默认值与区间端点都走这里，不要再各页自己 `toISOString()`。
 */

/** Date → 本地 'YYYY-MM-DD'。 */
export const ymdOf = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** 今天（本地时区）'YYYY-MM-DD'。 */
export const todayYmd = (now: Date = new Date()): string => ymdOf(now);

/**
 * 今天 ± N 天（本地时区）'YYYY-MM-DD'。
 *
 * 交给 `setDate` 自己进位，跨月 / 跨年 / 闰年都不手算。
 */
export const shiftYmd = (offsetDays: number, now: Date = new Date()): string => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + offsetDays);
  return ymdOf(d);
};

/**
 * 今天 ± N 个月（本地时区）'YYYY-MM-DD'，**日号不够就压到当月最后一天**。
 *
 * `setMonth` 自己会溢出进位（3-31 减一个月 → 3-3，因为 2 月没有 31 号），
 * 而「近一个月」这种区间起点跳到区间内部会让统计少算一整段，所以这里显式压到月末。
 */
export const shiftMonthYmd = (offsetMonths: number, now: Date = new Date()): string => {
  const day = now.getDate();
  const first = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  // 目标月 0 号 = 上一个月最后一天 → 拿到目标月天数
  const daysInTarget = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  first.setDate(Math.min(day, daysInTarget));
  return ymdOf(first);
};
