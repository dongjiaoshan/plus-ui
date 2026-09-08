import { describe, expect, it, vi } from 'vitest';

// formatPlotLabel 依赖 i18n 实例取「三期」文案；单测只关心分支，i18n 直接 mock 成回显 key。
vi.mock('@/lang/index', () => ({
  default: { global: { t: (key: string) => (key === 'plotTag.thirdPhase' ? '三期' : key) } }
}));

const { formatPlotLabel, toThirdPhaseParam } = await import('./plotTag');

describe('「地块」列展示口径（库存查询 / 入出库记录 / 毛菜间出库明细共用）', () => {
  it('三期标识优先于真实地块名 —— 三期不是地块，只做文案显示', () => {
    expect(formatPlotLabel({ thirdPhase: 1, plotName: 'A1东9号' })).toBe('三期');
    // 后端 third_phase 走 JSON 可能是字符串
    expect(formatPlotLabel({ thirdPhase: '1' })).toBe('三期');
  });

  it('非三期显示地块名称，不是地块编码', () => {
    expect(formatPlotLabel({ thirdPhase: 0, plotName: 'A1东9号' })).toBe('A1东9号');
  });

  it('既无三期标识也无地块名 → 占位符（猪肉 / 干货 / 蛋类行）', () => {
    expect(formatPlotLabel({})).toBe('-');
    expect(formatPlotLabel({ thirdPhase: 0, plotName: '   ' })).toBe('-');
    expect(formatPlotLabel({ plotName: null })).toBe('-');
  });
});

describe('「三期」筛选入参', () => {
  it('仅看三期传 1，其余不传', () => {
    expect(toThirdPhaseParam(1)).toBe(1);
    expect(toThirdPhaseParam('1')).toBe(1);
    expect(toThirdPhaseParam('')).toBeUndefined();
    expect(toThirdPhaseParam(undefined)).toBeUndefined();
  });
});
