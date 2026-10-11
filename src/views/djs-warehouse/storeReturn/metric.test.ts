import { describe, expect, it } from 'vitest';
import { decimalsFor, fromConfirmWeight, normalizeConfirmQty, normalizeInput, toConfirmWeight } from './metric';

describe('仓库确认抽屉：D-0145 非 kg 最多一位', () => {
  it('非 kg 无论是否在退回清单都是一位，kg 三位', () => {
    expect(decimalsFor({ productUnit: '份', inReturnList: true })).toBe(1);
    expect(decimalsFor({ productUnit: '罐', inReturnList: false })).toBe(1);
    expect(decimalsFor({ productUnit: 'kg' })).toBe(3);
  });

  it('数字框确认量截到一位并封到退回量，整数保持整数', () => {
    const can = { productUnit: '罐', returnQuantity: 1.2 };
    expect(normalizeConfirmQty(can, 1)).toBe(1);
    expect(normalizeConfirmQty(can, 1.19)).toBe(1.1);
    expect(normalizeConfirmQty(can, 5)).toBe(1.2);
    expect(normalizeConfirmQty({ productUnit: 'kg', returnQuantity: 2 }, 1.234)).toBe(1.234);
    expect(normalizeConfirmQty(can, undefined)).toBeUndefined();
  });

  it('历史两位小数的退回量按原数全收，低于退回量的新录入仍截到一位', () => {
    const portion = { productUnit: '份', returnQuantity: 1.25 };
    expect(normalizeConfirmQty(portion, 1.25)).toBe(1.25);
    expect(normalizeConfirmQty(portion, 9)).toBe(1.25);
    expect(normalizeConfirmQty(portion, 1.24)).toBe(1.2);
    const tiny = { productUnit: '罐', returnQuantity: 0.05 };
    expect(normalizeConfirmQty(tiny, 0.05)).toBe(0.05);
    expect(normalizeConfirmQty(tiny, 1)).toBe(0.05);
  });

  it('文本录入撞上限时取退回量本身，未撞上限截到一位', () => {
    expect(normalizeInput({ productUnit: '份', returnQuantity: 1.25 }, '2')).toEqual({ text: '1.25', capped: true });
    expect(normalizeInput({ productUnit: '罐', returnQuantity: 0.05 }, '1')).toEqual({ text: '0.05', capped: true });
    expect(normalizeInput({ productUnit: '份', returnQuantity: 9 }, '1.257').text).toBe('1.2');
  });

  it('已处理行按实际确认量回显：两位小数不被舍成一位，整数与一位不补零', () => {
    expect(fromConfirmWeight({ productUnit: '罐' }, 1.25)).toBe('1.25');
    expect(fromConfirmWeight({ productUnit: '罐' }, '0.050')).toBe('0.05');
    expect(fromConfirmWeight({ productUnit: '罐' }, '1.200')).toBe('1.2');
    expect(fromConfirmWeight({ productUnit: '罐' }, 2)).toBe('2');
    expect(fromConfirmWeight({ productUnit: '份', materialUnit: '枚', materialNum: 30 }, 37.5)).toBe('1.25');
  });

  it('1.5 份按 0.25 换算 0.375 kg，回显仍是 1.5 份', () => {
    const portion = { productUnit: '份', materialUnit: 'kg', materialNum: 0.25 };
    expect(toConfirmWeight(portion, 1.5)).toBe(0.375);
    expect(fromConfirmWeight(portion, 0.375)).toBe('1.5');
  });
});
