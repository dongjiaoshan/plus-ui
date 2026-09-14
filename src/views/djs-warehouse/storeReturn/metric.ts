/**
 * admin「门店退回操作」第三列的计量口径（STR-RETURN-OPS-001）。
 *
 * 这份是 mp `pages/warehouse/dispatch/return/confirm/metric.ts` 的 admin 等价物 —— **必须逐条对齐**：
 * 同一张退回单在 admin 抽屉处理和在小程序处理，写进 `t_store_return` 的
 * `received_qty` / `received_weight` 必须是同一个数（验收 §3 第 5 条）。
 *
 * 口径一句话：**按退回单位（产品单位）分流**。
 *   - 退回单位 = kg → 仓库过秤，录重量，标题「仓库称重重量」，三位小数（D-0017）；
 *   - 退回单位 ≠ kg → 仓库不过秤，按退回单位确认件数，标题「仓库确认量」，默认 = 退回量，
 *     清单内产品两位小数、清单外整数（D-0054 的 fallback）。
 *
 * 界面上录的是**退回单位**的量，提交给后端的 `receivedQty` / `receivedWeight` 仍是**原材料量**
 * —— 后端 `inboundReturnBasket` 按原材料记库存，换算放在 {@link toConfirmWeight} 这一层做。
 */

/** 该行参与计量判定所需的字段（= {@link StoreReturnOpsItemVO} / 候选项的子集）。 */
export interface ReturnMetricInput {
  /** 退回单位（产品单位），判据本身 */
  productUnit?: string | null;
  /** 原材料单位；只用来判「这一行到底要不要换算」，不是分流判据 */
  materialUnit?: string | null;
  /** 退回量（按退回单位），非 kg 行的默认值与上限 */
  returnQuantity?: number | string | null;
  /** 门店申报重量(kg)，退回量缺失时的 kg 行兜底默认值 */
  returnWeight?: number | string | null;
  /** 计量规则：一件该产品折算多少原材料；缺省按 1 */
  materialNum?: number | string | null;
  /** 是否配在字典「退回产品清单」里，决定非 kg 行的小数位 */
  inReturnList?: boolean;
  /** 后端判定的「能否做单位换算」；false → 锁行（瞎猜会把 3 只记成 3 kg 进库存） */
  canConvert?: boolean;
}

/** 单位是否按重量计（kg / KG / 公斤）。与后端 `isKgUnit` 同口径，两边必须一致。 */
export function isKgUnit(unit?: string | null): boolean {
  const s = (unit || '').trim().toLowerCase();
  return s === 'kg' || s === '公斤';
}

/** 该行是否走「过秤录 kg」口径 —— 判据是**退回单位**，不是原材料单位。 */
export function metricIsKg(it: ReturnMetricInput): boolean {
  return isKgUnit(it.productUnit);
}

/** 第三列标题：kg 行「仓库称重重量」/ 非 kg 行「仓库确认量」。 */
export function metricIsWeightLabel(it: ReturnMetricInput): boolean {
  return metricIsKg(it);
}

/** 输入框后缀：kg 行显 kg，非 kg 行显退回单位（甲方「单位和退回单位一致」）。 */
export function metricSuffix(it: ReturnMetricInput): string {
  return metricIsKg(it) ? 'kg' : (it.productUnit || '');
}

/** 非 kg 口径允许几位小数（D-0054 的 fallback）：清单内 2 位、清单外 0 位（整数）。 */
export function decimalsFor(it: ReturnMetricInput): number {
  return it.inReturnList === true ? 2 : 0;
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
 * 非 kg 口径的可录上限 = 退回量本身（按退回单位）。
 * kg 口径 / 缺值 → null（不封顶，由后端重量分支的规则兜）。
 */
export function maxQty(it: ReturnMetricInput): number | null {
  if (metricIsKg(it)) return null;
  const n = toNum(it.returnQuantity);
  return n !== null && n > 0 ? n : null;
}

/** 待处理行的默认值：非 kg → 退回量；kg → 退回量（缺省回落门店申报重量）。 */
export function defaultConfirmInput(it: ReturnMetricInput): string {
  const cap = maxQty(it);
  if (cap !== null) return String(cap);
  const qty = toNum(it.returnQuantity);
  if (qty !== null) return String(qty);
  const weight = toNum(it.returnWeight);
  return weight !== null ? String(weight) : '';
}

/**
 * 界面上录的是**退回单位**的量，提交给后端的 `receivedQty` / `receivedWeight` 是**原材料量**。
 *
 * 2 份 × material_num 0.250 = 0.500 kg 入库；1 份 30 枚礼盒 × 30 = 30 枚。
 * kg 行 material_num 恒 1（退回单位就是原材料单位），乘完等于原值。
 * 结果保留 3 位（后端列是 DECIMAL(12,3)，不裁会被 MySQL 静默四舍五入）。
 */
export function toConfirmWeight(it: ReturnMetricInput, input: string | number | undefined | null): number {
  const qty = toNum(input) ?? 0;
  if (metricIsKg(it)) return qty;
  const ratio = toNum(it.materialNum);
  const factor = ratio !== null && ratio > 0 ? ratio : 1;
  return Number((qty * factor).toFixed(3));
}

/**
 * {@link toConfirmWeight} 的**逆运算** —— 把库里存的原材料量换算回退回单位，用于**已处理行的回显**。
 *
 * 漏掉这一半会把「门店退 1 份、仓库收 30 枚」显示成「仓库确认量 30 份」
 * （标题/后缀已按退回单位走，数却还是原材料量），比原来的「仓库接收量 30 枚」更错。
 */
export function fromConfirmWeight(it: ReturnMetricInput, stored: number | string | null | undefined): string {
  const n = toNum(stored);
  if (n === null) return '';
  if (metricIsKg(it)) return String(n);
  const ratio = toNum(it.materialNum);
  const factor = ratio !== null && ratio > 0 ? ratio : 1;
  // 回显位数跟录入位数同口径，免得「录 2 份」回来变成「2.00 份」
  return String(Number((n / factor).toFixed(decimalsFor(it))));
}

/**
 * 该行能不能做单位换算；后端已算好 `canConvert` 时直接用它，避免两边判据漂移。
 *
 * 需要换算（原材料单位与退回单位不同）却没配 `material_num` 时返 false ——
 * 调用方据此锁住该行并提示去产品档案补「计量规则」，而不是静默记一个错数。
 */
export function canConvert(it: ReturnMetricInput): boolean {
  if (it.canConvert !== undefined) return it.canConvert;
  if (metricIsKg(it)) return true;
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
  if (metricIsKg(it)) {
    // kg：只允许数字与一个小数点，最多三位
    const cleaned = s.replace(/[^\d.]/g, '');
    const [i, ...rest] = cleaned.split('.');
    const text = rest.length ? `${i}.${rest.join('').slice(0, KG_DECIMALS)}` : i;
    return { text, capped: false };
  }
  const [rawInt, rawFrac = ''] = s.split('.');
  const intText = rawInt.replace(/\D/g, '');
  const decimals = decimalsFor(it);
  let text = intText;
  if (decimals > 0 && s.includes('.')) {
    // 保留用户正在输入的「1.」这种中间态，否则小数点一敲就被抹掉、永远录不进小数
    text = `${intText}.${rawFrac.replace(/\D/g, '').slice(0, decimals)}`;
  }
  const cap = maxQty(it);
  if (cap !== null && intText !== '' && Number(text) > cap) {
    return { text: String(cap), capped: true };
  }
  return { text, capped: false };
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
