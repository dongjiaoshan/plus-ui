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
