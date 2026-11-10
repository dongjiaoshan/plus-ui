import { isKgUnit, toNum } from './metric';

/** 只读退回详情：KG 三位、计数单位一位，不改变入库/换算/历史存储数量。 */
export function formatDetailQuantity(value: unknown, unit?: string | null): string {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) return '—';
  const n = toNum(value);
  if (n === null || !Number.isFinite(n)) return '—';
  const decimals = isKgUnit(unit) ? 3 : 1;
  const text = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n);
  return Number(text) === 0 ? text.replace(/^-/, '') : text;
}
