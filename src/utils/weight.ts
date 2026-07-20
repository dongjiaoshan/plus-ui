/**
 * 重量单位格式化统一工具。
 *
 * 后端 BigDecimal 序列化为字符串，前端一律用 Number 强转后格式化，
 * 避免 JS 字符串相加拼出 "100.0001.000" 假值（见 memory: BigDecimal 序列化成字符串）。
 *
 * 空值（null / undefined / '' / NaN）统一返回 '—'（em dash），与仓库列表现有约定对齐。
 *
 * 单位口径：
 * - 白条（white_bar）业务按 kg 展示，不转克。
 * - 其他物料（饲料 / 果蔬 / 物资等）按克（g）展示。
 */

/** 内部：把入参归一成有效 number；无效返回 null。 */
function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * kg 数值 → 克（g）。
 * @example formatKgToG(1.234) // '1234 g'
 * @returns `${Math.round(n * 1000)} g`，无效值返回 '—'。
 */
export function formatKgToG(value: number | string | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return `${Math.round(n * 1000)} g`;
}

/**
 * kg 数值 → 保留两位小数的 kg 文本。
 * @example formatKg(1.2) // '1.20 kg'
 * @returns `${n.toFixed(2)} kg`，无效值返回 '—'。
 */
export function formatKg(value: number | string | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return `${n.toFixed(2)} kg`;
}

/**
 * 数值 → 保留三位小数的纯数字文本（不带单位）。用于「重量列另有独立单位列」的表格：
 * 后端 BigDecimal 序列化可能丢尾零（0.700→"0.7"），统一 toFixed(3) 保证 3 位小数展示。
 * @example formatNum3(0.701) // '0.701'   formatNum3(0.7) // '0.700'
 * @returns `${n.toFixed(3)}`，无效值返回 ''（表格留空）。
 */
export function formatNum3(value: number | string | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return '';
  return n.toFixed(3);
}

/** 单位是否为公斤口径（kg / KG / 公斤）。 */
export function isKgUnit(unit: string | null | undefined): boolean {
  if (!unit) return false;
  return unit === '公斤' || unit.toLowerCase() === 'kg';
}

/**
 * 按计量单位分流的数量格式化（不带单位文本）：
 * - kg / 公斤 → 恒 3 位小数补零（1g 精度，同 formatNum3：0.7 → '0.700'）；
 * - 非 kg（份 / 盒 / 瓶 / 枚 / 吨等计数单位）→ 去尾零，至多 3 位小数（985 → '985'，不显 985.000）。
 * @returns 格式化文本；无效值（null / undefined / '' / NaN）返回 ''，由调用方决定空值占位符。
 */
export function formatQtyByUnit(value: number | string | null | undefined, unit: string | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return '';
  if (isKgUnit(unit)) return n.toFixed(3);
  return n.toLocaleString('en-US', { maximumFractionDigits: 3, useGrouping: false });
}

/**
 * 按业务归属类型选择单位口径。
 * @param belongType 业务归属类型；'white_bar'（白条）→ 保留 kg，其余 → 转克。
 * @example formatWeightByBelong(1.2, 'white_bar') // '1.20 kg'
 * @example formatWeightByBelong(1.2, 'vegetable') // '1200 g'
 */
export function formatWeightByBelong(
  value: number | string | null | undefined,
  belongType: string | null | undefined
): string {
  return belongType === 'white_bar' ? formatKg(value) : formatKgToG(value);
}
