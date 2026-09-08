import { describe, expect, it, vi } from 'vitest';

// formatDeliverDestLabel 依赖 i18n 取文案；单测只关心「值 → key」的映射，i18n 直接 mock 成回显 key。
vi.mock('@/lang/index', () => ({
  default: { global: { t: (key: string) => key } }
}));

const { formatDeliverDestLabel } = await import('./deliverDest');

describe('「出库去向」列展示口径（生产记录下钻 / 门店需求产品明细共用）', () => {
  it('三个已知去向各走各自的 i18n key', () => {
    expect(formatDeliverDestLabel('platform')).toBe('djs.warehouse.production.dest.platform');
    expect(formatDeliverDestLabel('gift')).toBe('djs.warehouse.production.dest.gift');
    // D-0048：仓库自用出库也计进到店量，明细必须列出来并标清去向
    expect(formatDeliverDestLabel('warehouse_out')).toBe('djs.warehouse.production.dest.warehouseOut');
  });

  it('白条 / 猪肉产出该列为 NULL → 占位符', () => {
    expect(formatDeliverDestLabel(null)).toBe('-');
    expect(formatDeliverDestLabel(undefined)).toBe('-');
    expect(formatDeliverDestLabel('')).toBe('-');
  });

  it('未知值不抛、不回显裸英文码', () => {
    expect(formatDeliverDestLabel('some_new_dest')).toBe('-');
  });
});
