/**
 * 「地块」列展示统一工具（甲方 row92「三期」标识）。
 *
 * 「三期」不是真实地块：系统里没有对应的地块行，库存行 / 出入库流水行只带一个 `third_phase` 标记 +
 * 展示文案，`plot_id` 保持原值不动（果蔬月台待入库量按「产品→作物 + 库存行 plot_id」定位毛菜处理行，
 * 造一条假地块会让这个定位落空、污染月台账）。
 *
 * 库存查询 / 入库记录 / 出库记录三页的「地块」列与「三期」筛选共用本文件，保证三处文案与取值口径完全一致。
 */
import i18n from '@/lang/index';

/** 「地块」列取值所需的行字段（库存行 / 出入库流水行共用） */
export interface PlotTagRow {
  /** 三期标识（后端 third_phase）：1 = 三期 */
  thirdPhase?: number | string | null;
  /** 真实地块名（无则为空） */
  plotName?: string | null;
}

/** 三期标识值（后端 third_phase = 1 / 筛选入参 thirdPhase = 1）。 */
export const THIRD_PHASE_FLAG = 1;

/** 「地块」列空值占位。 */
const EMPTY_TEXT = '-';

/**
 * 「地块」列文案：三期标识优先 → 真实地块名 → 占位符。
 * @example formatPlotLabel({ thirdPhase: 1, plotName: 'A3 地块' }) // '三期'
 * @example formatPlotLabel({ plotName: 'A3 地块' })               // 'A3 地块'
 * @example formatPlotLabel({})                                    // '-'
 */
export function formatPlotLabel(row: PlotTagRow): string {
  if (Number(row.thirdPhase) === THIRD_PHASE_FLAG) return i18n.global.t('plotTag.thirdPhase');
  const name = typeof row.plotName === 'string' ? row.plotName.trim() : '';
  return name !== '' ? name : EMPTY_TEXT;
}

/**
 * 「三期」筛选下拉选项（全部 / 仅看三期）。
 * 在 computed 里调用，语言切换时随 searchSchema 一起重算。
 */
export function thirdPhaseFilterOptions(): Array<{ label: string; value: string | number }> {
  return [
    { label: i18n.global.t('plotTag.filter.all'), value: '' },
    { label: i18n.global.t('plotTag.filter.only'), value: THIRD_PHASE_FLAG }
  ];
}

/** 筛选下拉选中值 → 后端 `thirdPhase` 入参：仅看三期传 1，全部 / 未选不传。 */
export function toThirdPhaseParam(value: unknown): number | undefined {
  return Number(value) === THIRD_PHASE_FLAG ? THIRD_PHASE_FLAG : undefined;
}
