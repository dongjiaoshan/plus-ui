import { describe, expect, it } from 'vitest';
import { formatLossQuantityByUnit, formatOrderQuantity, WHITE_BAR_DEMAND_UNIT } from './weight';

describe('需求数量展示口径', () => {
  it('白条订单保持用户下单的原始数量，不做半片换算或 kg 补零', () => {
    expect(formatOrderQuantity(1, 'kg', true)).toBe('1');
    expect(formatOrderQuantity('1.500', 'kg', true)).toBe('1.5');
  });

  it('非白条仍按原单位格式化', () => {
    expect(formatOrderQuantity('1.001', 'kg', false)).toBe('1.001');
    expect(formatOrderQuantity(3, '盒', false)).toBe('3');
  });

  it('白条订单单位固定为头', () => {
    expect(WHITE_BAR_DEMAND_UNIT).toBe('头');
  });
});

describe('损耗数量展示口径', () => {
  it('KG 恒保留三位小数', () => {
    expect(formatLossQuantityByUnit('1.001', 'KG')).toBe('1.001');
    expect(formatLossQuantityByUnit(1, '公斤')).toBe('1.000');
  });

  it('非 KG 按整数展示', () => {
    expect(formatLossQuantityByUnit('3.000', '盒')).toBe('3');
    expect(formatLossQuantityByUnit(1.6, '份')).toBe('2');
  });

  // 燎毛损耗等流水不带 product_unit，本质是 kg 重量：按 kg 展示，不能取整成 0
  it('单位缺失按 KG 展示', () => {
    expect(formatLossQuantityByUnit(0.2, null)).toBe('0.200');
    expect(formatLossQuantityByUnit(0.7, undefined)).toBe('0.700');
    expect(formatLossQuantityByUnit(12.5, '')).toBe('12.500');
  });
});
