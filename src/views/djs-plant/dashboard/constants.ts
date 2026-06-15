/**
 * 种植看板配色 / 常量（PLT-DASH-001 富图看板版）。
 *
 * 对照原型 doc/origin/prototype/admin/.../种植管理/种植看板/06edfbc1-...png：
 *  - 实时种植物统计：bar 蓝 + line 青绿（双轴）
 *  - 种植计划甘特：绿 / 橙（绿=进行中或已完成 / 橙=待开始或延期）
 *  - 采摘周期甘特：黄
 */

/** 5 分钟自动轮询周期（毫秒）。 */
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/** 实时种植物统计双轴配色。 */
export const CROP_STAT_COLOR = {
  bar: '#5b8ff9', // 种植地块数（bar）
  line: '#2ca58d' // 预计产量 kg（line）
} as const;

/** 甘特条配色（种植段 / 采摘段）。 */
export const GANTT_COLOR = {
  /** 种植段进行中 / 已完成（绿）。 */
  plantOngoing: '#52c41a',
  /** 种植段待开始 / 延期（橙）。 */
  plantPending: '#f0a020',
  /** 采摘段（黄）。 */
  pick: '#fadb14'
} as const;

/**
 * 把 kg 换算成"万斤"（1 kg = 2 斤，万斤 = kg × 2 / 10000）。
 *
 * @param kg 产量 kg（可空）
 * @returns 万斤，保留 2 位小数的 number
 */
export function kgToWanJin(kg?: number | null): number {
  const v = Number(kg ?? 0);
  return +((v * 2) / 10000).toFixed(2);
}

/**
 * 到期天数展示文案（负=已过期，null=无证书）。
 *
 * @param days 到期天数（可空）
 * @returns 展示字符串
 */
export function certDaysText(days?: number | null): string {
  if (days == null) return '-';
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  return `${days} 天`;
}
