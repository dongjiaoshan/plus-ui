import { describe, expect, it } from 'vitest';
import { mergeVegOutPrintRows, uniformUnitPrice } from './mergeByProduct';

/**
 * V6 row225 回归护栏：出库明细按 产品+耳号+地块 合并之后，后端对「组内单价不一致」的行下发 `null`。
 * 打印单必须把这种「单价未知」原样传到 `priceText`（留白），任何一处 `|| 0` 都会把它压成一个
 * 合法单价 0，于是三联单印出「单价 0.00 / 总金额 54.00」——一张自相矛盾的财务凭证。
 */
describe('mergeVegOutPrintRows：单价未知不能被压成 0', () => {
  it('组内单价未知 → 合并后仍是 undefined（打印留白）', () => {
    const merged = mergeVegOutPrintRows([
      { productCode: 'Y1', productName: '五花肉', quantity: 2, unitPrice: undefined, amount: 24 },
      { productCode: 'Y1', productName: '五花肉', quantity: 2, unitPrice: undefined, amount: 30 }
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].unitPrice).toBeUndefined();
    // 金额仍是各行真实小计之和，不受单价未知影响
    expect(merged[0].amount).toBe(54);
    expect(merged[0].quantity).toBe(4);
  });

  it('组内单价一致 → 保留该单价', () => {
    const merged = mergeVegOutPrintRows([
      { productCode: 'Y2', productName: '苕尖', quantity: 1, unitPrice: 5, amount: 5 },
      { productCode: 'Y2', productName: '苕尖', quantity: 1, unitPrice: 5, amount: 5 }
    ]);
    expect(merged[0].unitPrice).toBe(5);
  });

  it('组内单价不一致 → undefined', () => {
    const merged = mergeVegOutPrintRows([
      { productCode: 'Y3', productName: '空心菜', quantity: 1, unitPrice: 12, amount: 12 },
      { productCode: 'Y3', productName: '空心菜', quantity: 1, unitPrice: 15, amount: 15 }
    ]);
    expect(merged[0].unitPrice).toBeUndefined();
  });

  it('单价真的是 0 与单价未知必须分得开', () => {
    expect(uniformUnitPrice([0, 0])).toBe(0);
    expect(uniformUnitPrice([undefined])).toBeUndefined();
    expect(uniformUnitPrice([0, undefined])).toBeUndefined();
    expect(uniformUnitPrice([])).toBeUndefined();
  });
});
