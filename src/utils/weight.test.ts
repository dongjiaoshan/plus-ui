import { describe, expect, it } from 'vitest';
import { formatLossQuantityByUnit, formatOrderQuantity, formatStockQtyByUnit, WHITE_BAR_DEMAND_UNIT } from './weight';

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

describe('库存数量展示口径', () => {
  it('KG 恒补零到三位小数', () => {
    expect(formatStockQtyByUnit('150.000', 'kg')).toBe('150.000');
    expect(formatStockQtyByUnit(0.7, 'KG')).toBe('0.700');
    expect(formatStockQtyByUnit('7560', '公斤')).toBe('7560.000');
  });

  it('非 KG 计数单位取整，不显示小数', () => {
    expect(formatStockQtyByUnit('80.000', '罐')).toBe('80');
    expect(formatStockQtyByUnit('120.000', '袋')).toBe('120');
    expect(formatStockQtyByUnit('7555.000', '枚')).toBe('7555');
    expect(formatStockQtyByUnit(1.6, '桶')).toBe('2');
  });

  it('负差异量保留符号', () => {
    expect(formatStockQtyByUnit(-5, '枚')).toBe('-5');
    expect(formatStockQtyByUnit(-5, 'kg')).toBe('-5.000');
  });

  it('空值返回空串交给调用方兜占位符', () => {
    expect(formatStockQtyByUnit(null, 'kg')).toBe('');
    expect(formatStockQtyByUnit(undefined, '袋')).toBe('');
    expect(formatStockQtyByUnit('', '袋')).toBe('');
    expect(formatStockQtyByUnit('abc', '袋')).toBe('');
  });
});
