import { describe, expect, it } from 'vitest';
import { normalizeReturnQuantity, returnInputPrecision } from './quantity';

describe('row298 非 KG 退回量', () => {
  it('一位按需显示，整数不强制补零，步进仍由组件保持 1', () => {
    expect(returnInputPrecision('份')).toBeUndefined();
    expect(normalizeReturnQuantity(1, '份')).toBe(1);
    expect(normalizeReturnQuantity(1.25, '份')).toBe(1.2);
    expect(normalizeReturnQuantity(0.35, '罐')).toBe(0.3);
  });
  it('公斤 / KG 保留三位', () => {
    expect(returnInputPrecision('公斤')).toBe(3);
    expect(returnInputPrecision('KG')).toBe(3);
    expect(normalizeReturnQuantity(1.234, 'kg')).toBe(1.234);
  });
  it('到店剩余额度封顶，旧两位额度向下到可录的一位', () => {
    expect(normalizeReturnQuantity(5, '份', 1.25)).toBe(1.2);
    expect(normalizeReturnQuantity(5, '罐', 0)).toBe(0);
    expect(normalizeReturnQuantity(undefined, '份')).toBeUndefined();
  });
});
