import { describe, expect, it } from 'vitest';
import { formatLossQuantityByUnit, formatOrderQuantity, formatQtyByUnit, WHITE_BAR_DEMAND_UNIT } from './weight';

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

describe('库存数量展示口径（入库/出库记录 · 盘点明细 · 采购记录）', () => {
  it('KG 恒补零到三位小数', () => {
    expect(formatQtyByUnit('150.000', 'kg')).toBe('150.000');
    expect(formatQtyByUnit(0.7, 'KG')).toBe('0.700');
    expect(formatQtyByUnit('7560', '公斤')).toBe('7560.000');
  });

  it('非 KG 去掉无意义尾零，整数不显小数点', () => {
    expect(formatQtyByUnit('80.000', '罐')).toBe('80');
    expect(formatQtyByUnit('120.000', '袋')).toBe('120');
    expect(formatQtyByUnit('7555.000', '枚')).toBe('7555');
    expect(formatQtyByUnit('90.000', '瓶')).toBe('90');
  });

  it('吨 / 斤 / 升 等连续量单位的小数如实保留，不能取整抹掉', () => {
    expect(formatQtyByUnit(2.5, '吨')).toBe('2.5');
    expect(formatQtyByUnit('12.500', '斤')).toBe('12.5');
    expect(formatQtyByUnit(0.4, '升')).toBe('0.4');
  });

  it('负差异量保留符号', () => {
    expect(formatQtyByUnit(-5, '枚')).toBe('-5');
    expect(formatQtyByUnit(-5, 'kg')).toBe('-5.000');
    expect(formatQtyByUnit(-0.4, '袋')).toBe('-0.4');
  });

  it('单位缺失按非 KG 处理，同样只去尾零不取整', () => {
    expect(formatQtyByUnit(0.7, '')).toBe('0.7');
    expect(formatQtyByUnit(0.7, null)).toBe('0.7');
  });

  it('空值返回空串交给调用方兜占位符', () => {
    expect(formatQtyByUnit(null, 'kg')).toBe('');
    expect(formatQtyByUnit(undefined, '袋')).toBe('');
    expect(formatQtyByUnit('', '袋')).toBe('');
    expect(formatQtyByUnit('abc', '袋')).toBe('');
  });
});
