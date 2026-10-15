/** D-0145：非 KG 按需一位，不指定 precision 避免整数被补成 1.0。 */
export function returnInputPrecision(unit?: string): number | undefined {
  const normalized = (unit ?? '').trim().toLowerCase();
  return normalized === 'kg' || normalized === '公斤' ? 3 : undefined;
}

/** 非 KG 截到一位，并保留原有到店额度；KG 由 input-number 三位精度控制。 */
export function normalizeReturnQuantity(value: number | undefined, unit?: string, max?: number): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  if (returnInputPrecision(unit) === 3) return value;
  const quantity = Math.floor(Math.max(0, value) * 10 + 1e-8) / 10;
  if (max === undefined) return quantity;
  return Math.min(quantity, Math.floor(Math.max(0, max) * 10 + 1e-8) / 10);
}
