/**
 * admin「门店退回操作」第三列的计量口径（STR-RETURN-OPS-001）。
 *
 * 这份是 mp `pages/warehouse/dispatch/return/confirm/metric.ts` 的 admin 等价物 —— **必须逐条对齐**：
 * 同一张退回单在 admin 抽屉处理和在小程序处理，写进 `t_store_return` 的
 * `received_qty` / `received_weight` 必须是同一个数（验收 §3 第 5 条）。
 *
 * D-0149 / row302：仓库确认按原材料单位录入和显示；门店退回量仍按产品单位显示。
 * 原材料 kg 保留三位，非 kg 新录入最多一位（D-0145）；受限KG上限为默认原材料量的120%（D-0151），其他分组KG实称不封顶（D-0152）。
 *
 * 输入值已经是原材料量，提交和历史回显不再乘除计量规则；数据库与库存记账语义不变。
 */

/** 该行参与计量判定所需的字段（= {@link StoreReturnOpsItemVO} / 候选项的子集）。 */
export interface ReturnMetricInput {
  /** 产品单位，门店退回量的单位 */
  productUnit?: string | null;
  /** 仓库确认单位；缺省回落产品单位 */
  materialUnit?: string | null;
  /** 退回量（按产品单位），折算后用作默认值与原有上限 */
  returnQuantity?: number | string | null;
  /** 门店申报重量(kg)，退回量缺失时的 kg 行兜底默认值 */
  returnWeight?: number | string | null;
  /** 计量规则：一件该产品折算多少原材料；缺省按 1 */
  materialNum?: number | string | null;
  /** 后端给出的原材料数量上限；为 null 时按退回量及计量规则推导 */
  maxConfirmQty?: number | string | null;
  /** 其他分组KG确认按实际称重，不使用退回量折算上限；由后端确认策略判定 */
  unlimitedConfirmWeight?: boolean;
  /** 是否配在字典「退回产品清单」里，不再决定录入精度 */
  inReturnList?: boolean;
  /** 后端判定的「能否做单位换算」；false → 锁行（瞎猜会把 3 只记成 3 kg 进库存） */
  canConvert?: boolean;
}

/** 单位是否按重量计（kg / KG / 公斤）。与后端 `isKgUnit` 同口径，两边必须一致。 */
export function isKgUnit(unit?: string | null): boolean {
  const s = (unit || '').trim().toLowerCase();
  return s === 'kg' || s === '公斤';
}

/** 仓库确认单位。后端未下发原材料单位时保留产品单位兜底。 */
function confirmUnit(it: ReturnMetricInput): string {
  return it.materialUnit?.trim() || it.productUnit?.trim() || '';
}

/** 该行是否按原材料重量录入。 */
export function metricIsKg(it: ReturnMetricInput): boolean {
  return isKgUnit(confirmUnit(it));
}

/** 第三列标题：kg 行「仓库称重重量」/ 非 kg 行「仓库确认量」。 */
export function metricIsWeightLabel(it: ReturnMetricInput): boolean {
  return metricIsKg(it);
}

/** 输入框后缀与仓库确认量同为原材料单位。 */
export function metricSuffix(it: ReturnMetricInput): string {
  return metricIsKg(it) ? 'kg' : confirmUnit(it);
}

/** D-0145：非 kg 最多一位小数，kg 保留三位。清单归属不再影响精度。 */
export function decimalsFor(it: ReturnMetricInput): number {
  return metricIsKg(it) ? KG_DECIMALS : 1;
}

/** kg 口径的小数位（D-0017：kg 可录三位小数）。 */
export const KG_DECIMALS = 3;

/** 数值归一：字符串 → number，无效返 null（不当 0 用）。 */
export function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * KG 称重允许在原默认量上增加20%，按三位精度向下取上限，避免舍入后超过20%。
 * 非 KG 数量仍使用原材料数量上限。
 */
export function maxQty(it: ReturnMetricInput): number | null {
  if (metricIsKg(it)) {
    if (it.unlimitedConfirmWeight === true) return null;
    const base = originalConfirmQuantity(it);
    if (base === null || base <= 0) return null;
    const serverCap = toNum(it.maxConfirmQty);
    if (serverCap !== null && serverCap > 0) return serverCap;
    return Math.floor((Math.round(base * 1000) * 12) / 10) / 1000;
  }
  if (isKgUnit(it.productUnit)) return null;
  const n = toNum(it.returnQuantity);
  if (n === null || n <= 0) return null;
  const serverCap = toNum(it.maxConfirmQty);
  if (serverCap !== null && serverCap > 0) return serverCap;
  return materialQuantity(it, n);
}

/** 将门店退回量折算为原材料量，仅用于默认值与上限，不用于确认提交。 */
function materialQuantity(it: ReturnMetricInput, qty: number): number {
  const ratio = toNum(it.materialNum);
  const factor = isKgUnit(it.productUnit) ? 1 : ratio !== null && ratio > 0 ? ratio : 1;
  // 退回量和计量规则均为 DECIMAL(12,3)，先按千分整数相乘再 HALF_UP。
  // 直接 toFixed 会把 0.1 × 0.145 的半位误舍为 0.014，与后端 0.015 不同。
  const quantityMillis = Math.round(qty * 1000);
  const factorMillis = Math.round(factor * 1000);
  return Math.round((quantityMillis * factorMillis) / 1000) / 1000;
}

/** 原默认原材料量；KG 退回量透传，其他产品按计量比例折算。 */
function originalConfirmQuantity(it: ReturnMetricInput): number | null {
  const qty = toNum(it.returnQuantity);
  if (qty !== null && qty > 0) return materialQuantity(it, qty);
  return toNum(it.returnWeight);
}

/** 待处理预填原默认量，允许的20%称重余量不参与预填。 */
export function defaultConfirmInput(it: ReturnMetricInput): string {
  const base = metricIsKg(it) ? originalConfirmQuantity(it) : (maxQty(it) ?? originalConfirmQuantity(it));
  return base !== null ? String(base) : '';
}

/**
 * 仓库输入已经是原材料量，直接提交；保留三位以对齐 DECIMAL(12,3)。
 */
export function toConfirmWeight(_it: ReturnMetricInput, input: string | number | undefined | null): number {
  const qty = toNum(input) ?? 0;
  return Number(qty.toFixed(KG_DECIMALS));
}

/**
 * 历史确认量本来就是原材料量，原数回显，完整保留最多三位并去尾零。
 */
export function fromConfirmWeight(_it: ReturnMetricInput, stored: number | string | null | undefined): string {
  const n = toNum(stored);
  if (n === null) return '';
  return String(Number(n.toFixed(KG_DECIMALS)));
}

/**
 * 该行能不能做单位换算；后端已算好 `canConvert` 时直接用它，避免两边判据漂移。
 *
 * 需要换算（原材料单位与退回单位不同）却没配 `material_num` 时返 false ——
 * 调用方据此锁住该行并提示去产品档案补「计量规则」，而不是静默记一个错数。
 */
export function canConvert(it: ReturnMetricInput): boolean {
  if (it.canConvert !== undefined) return it.canConvert;
  if (metricIsKg(it) && it.unlimitedConfirmWeight === true) return true;
  if (isKgUnit(it.productUnit)) return true;
  const mUnit = (it.materialUnit || '').trim();
  const pUnit = (it.productUnit || '').trim();
  if (!mUnit || mUnit.toLowerCase() === pUnit.toLowerCase()) return true;
  const ratio = toNum(it.materialNum);
  return ratio !== null && ratio > 0;
}

/**
 * 录入归一：按口径截位并封到上限。
 *
 * ⚠️ 不能用 `replace(/\D/g,'')` —— 那是**抹掉小数点**不是截断：0.35→035=35、1.5→15，
 * 静默放大 10~100 倍，而这个值直连入库。
 *
 * @returns `{ text, capped }`；`capped=true` 表示撞了上限、调用方该给个 toast。
 */
export function normalizeInput(it: ReturnMetricInput, raw: string): { text: string; capped: boolean } {
  const s = String(raw ?? '');
  const [intText, ...fracParts] = s.replace(/[^\d.]/g, '').split('.');
  const fraction = fracParts.join('');
  const cap = maxQty(it);
  const rawValue = Number(`${intText}.${fraction}`);
  // 截位前识别全收：历史两位退回量折算后可能有三位，不能先截成一位再比较。
  if (cap !== null && rawValue >= cap) {
    return { text: String(cap), capped: rawValue > cap };
  }
  const decimals = decimalsFor(it);
  let text = intText;
  if (decimals > 0 && s.includes('.')) {
    // 保留用户正在输入的「1.」这种中间态，否则小数点一敲就被抹掉、永远录不进小数
    text = `${intText}.${fraction.slice(0, decimals)}`;
  }
  return { text, capped: false };
}

/** 截到一位小数（不四舍五入，避免超过退回量）。 */
function floorOneDecimal(n: number): number {
  return Math.floor(Math.max(0, n) * 10 + 1e-8) / 10;
}

/**
 * 数字框确认量归一（D-0145）：kg 行原样（数字框按三位控制）；非 kg 新录入截到一位。
 * 达到或超过折算后的上限时完整保留上限，以支持历史退回量全收。
 */
export function normalizeConfirmQty(it: ReturnMetricInput, value: number | undefined | null): number | undefined {
  if (value === null || value === undefined || !Number.isFinite(value)) return undefined;
  const cap = maxQty(it);
  if (cap !== null && value >= cap) return cap;
  if (metricIsKg(it)) return value;
  return floorOneDecimal(value);
}

/**
 * 入库库位下拉的默认值：后端随行下发的 `defaultLocationId` 优先，不在选项里时回落首个选项。
 *
 * 产品换了（新增弹框里）后端还没给过判据时，也走「首个选项」而不是空 —— 让下拉永远有值可提交。
 */
export function defaultLocationOf(defaultLocationId?: string | null, options?: Array<{ id: string }> | null): string {
  const list = options ?? [];
  if (defaultLocationId && list.some((o) => String(o.id) === String(defaultLocationId))) {
    return String(defaultLocationId);
  }
  return list.length ? String(list[0].id) : '';
}
