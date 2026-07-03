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
