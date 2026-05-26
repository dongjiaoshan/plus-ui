/**
 * 养殖看板配色常量（BRD-DASH-001）。
 *
 * **国内畜牧惯例反直觉**（doc/06 BRD-DASH-001 + 原型 page 63 已固化）：
 *
 *   - 红色 = 当月好（如分娩数高 / 死亡数低）
 *   - 绿色 = 当月差（如分娩数低 / 死亡数高）
 *   - 黑色 = 持平
 *
 * 不是国际惯例（国际惯例红=坏 / 绿=好），**禁止把"绿好红坏"硬编码到组件里**。
 *
 * be 已根据 KPI 类型（正向 / 反向）判定 trend，fe 拿到 trend ∈ {better, worse, flat}
 * 直接映射颜色即可，**不要**自己根据 diff 正负判断。
 */

export const COMPARISON_COLOR = {
  better: '#c0392b', // 红 — 当月好
  worse: '#2ea36c', // 绿 — 当月差
  flat: '#333' // 黑 — 持平
} as const;

export type TrendCode = keyof typeof COMPARISON_COLOR;

/** 取 trend 对应颜色，未知值落回 flat */
export function trendColor(trend?: string | null): string {
  if (trend === 'better') return COMPARISON_COLOR.better;
  if (trend === 'worse') return COMPARISON_COLOR.worse;
  return COMPARISON_COLOR.flat;
}

/** 7 项 KPI label（与 MonthlyComparisonVO 字段对齐） */
export const KPI_LABELS: Record<string, string> = {
  introduceCount: '引种数',
  bornCount: '产仔数',
  weanedCount: '断奶数',
  deathCount: '死亡数',
  cullingCount: '淘汰数',
  marketingCount: '出栏数',
  marketingWeight: '出栏重量(kg)'
};

/** 5 类 pig_type label */
export const PIG_TYPE_LABELS: Record<string, string> = {
  sow: '母猪',
  boar: '公猪',
  piglet: '仔猪',
  fattening: '育肥猪',
  reserve: '后备猪'
};

/** sow lifecycle label（仅 dashboard 用，全集走 djs_pig_lifecycle 字典） */
export const LIFECYCLE_LABELS: Record<string, string> = {
  PZ: '已配种',
  PH: '怀孕',
  FM: '分娩',
  DN: '断奶',
  KH: '空怀',
  HB: '后备',
  FQ: '查情',
  LC: '哺乳'
};

/** 5 分钟轮询周期（毫秒） */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
