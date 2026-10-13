import { describe, expect, it } from 'vitest';
import {
  canConvert,
  decimalsFor,
  defaultConfirmInput,
  fromConfirmWeight,
  maxQty,
  metricIsKg,
  metricSuffix,
  normalizeInput,
  normalizeConfirmQty,
  toConfirmWeight
} from './metric';

const cowpea = { productUnit: '份', materialUnit: 'KG', returnQuantity: 1, returnWeight: 0, materialNum: 0.3 };
const pork = { productUnit: '份', materialUnit: 'kg', returnQuantity: 1, returnWeight: 0, materialNum: 1 };
const countedMaterial = { productUnit: '盒', materialUnit: '份', returnQuantity: 2, materialNum: 3 };

describe('row302 仓库确认按原材料单位', () => {
  it('300g豇豆退1份，默认确认0.3kg；1kg肥肉默认确认1kg', () => {
    expect(metricIsKg(cowpea)).toBe(true);
    expect(metricSuffix(cowpea)).toBe('kg');
    expect(defaultConfirmInput(cowpea)).toBe('0.3');
    expect(maxQty(cowpea)).toBe(0.3);
    expect(defaultConfirmInput(pork)).toBe('1');
    expect(maxQty(pork)).toBe(1);
  });

  it('原材料份和产品盒分开，默认和上限折成6份', () => {
    expect(metricIsKg(countedMaterial)).toBe(false);
    expect(metricSuffix(countedMaterial)).toBe('份');
    expect(defaultConfirmInput(countedMaterial)).toBe('6');
    expect(maxQty(countedMaterial)).toBe(6);
    expect(maxQty({ ...countedMaterial, maxConfirmQty: 5.5 })).toBe(5.5);
  });

  it('输入0.28kg直接入库0.28kg，回显原数，避免再次乘0.3或除0.3', () => {
    expect(toConfirmWeight(cowpea, '0.28')).toBe(0.28);
    expect(fromConfirmWeight(cowpea, '0.280')).toBe('0.28');
    expect(toConfirmWeight(countedMaterial, 5.2)).toBe(5.2);
    expect(fromConfirmWeight(countedMaterial, 5.2)).toBe('5.2');
  });

  it('退1盒折30枚，历史确认37.5枚也直接显示37.5枚，不除计量规则', () => {
    const eggs = { productUnit: '盒', materialUnit: '枚', materialNum: 30, returnQuantity: 1 };
    expect(defaultConfirmInput(eggs)).toBe('30');
    expect(metricSuffix(eggs)).toBe('枚');
    expect(toConfirmWeight(eggs, '30')).toBe(30);
    expect(fromConfirmWeight(eggs, 37.5)).toBe('37.5');
  });

  it('原料单位缺省回落产品单位，产品kg的原有重量上限仍由后端处理', () => {
    const kg = { productUnit: '公斤', returnQuantity: 2, returnWeight: 2 };
    expect(metricIsKg(kg)).toBe(true);
    expect(metricSuffix(kg)).toBe('kg');
    expect(maxQty(kg)).toBeNull();
    expect(defaultConfirmInput(kg)).toBe('2');
    expect(metricSuffix({ productUnit: '份', materialUnit: '  ' })).toBe('份');
    expect(maxQty({ productUnit: '份', returnQuantity: 0 })).toBeNull();
    expect(defaultConfirmInput({ productUnit: '份', returnWeight: 2 })).toBe('2');
  });

  it('KG精度由原料单位决定，非KG新录入最多一位，不依赖清单归属', () => {
    expect(decimalsFor({ ...cowpea, inReturnList: false })).toBe(3);
    expect(decimalsFor({ ...countedMaterial, inReturnList: true })).toBe(1);
    expect(decimalsFor({ ...countedMaterial, inReturnList: false })).toBe(1);
    expect(normalizeInput(cowpea, '0.2857')).toEqual({ text: '0.285', capped: false });
    expect(normalizeInput(countedMaterial, '1.257')).toEqual({ text: '1.2', capped: false });
    expect(normalizeInput(countedMaterial, '1.')).toEqual({ text: '1.', capped: false });
  });

  it('KG输入保留原有等值上限，不能把退1份0.3kg变成可确认5kg', () => {
    expect(normalizeInput(cowpea, '5')).toEqual({ text: '0.3', capped: true });
    expect(normalizeInput(countedMaterial, '9')).toEqual({ text: '6', capped: true });
  });

  it('历史两位退回量折算后的三位原料上限可全收，低于上限的新输入仍截一位', () => {
    const historical = { productUnit: '盒', materialUnit: '份', returnQuantity: 1.25, materialNum: 0.1 };
    expect(defaultConfirmInput(historical)).toBe('0.125');
    expect(normalizeInput(historical, '0.125')).toEqual({ text: '0.125', capped: false });
    expect(normalizeInput(historical, '.125')).toEqual({ text: '0.125', capped: false });
    expect(normalizeInput(historical, '1')).toEqual({ text: '0.125', capped: true });
    expect(normalizeInput(historical, '0.124')).toEqual({ text: '0.1', capped: false });
    expect(toConfirmWeight(historical, '0.125')).toBe(0.125);
    expect(fromConfirmWeight(historical, 0.125)).toBe('0.125');
    expect(normalizeInput({ productUnit: '罐', returnQuantity: 0.05 }, '0.05')).toEqual({ text: '0.05', capped: false });
  });

  it('丢弃空量仍传0，历史回显保留3位，空/无效历史值不伪装成0', () => {
    expect(toConfirmWeight(cowpea, '')).toBe(0);
    expect(toConfirmWeight(cowpea, undefined)).toBe(0);
    expect(fromConfirmWeight(countedMaterial, '0.005')).toBe('0.005');
    expect(fromConfirmWeight(cowpea, null)).toBe('');
    expect(fromConfirmWeight(cowpea, undefined)).toBe('');
    expect(fromConfirmWeight(cowpea, 'invalid')).toBe('');
  });

  it('缺计量规则的跨单位产品继续锁行，配置完整及同单位产品可用', () => {
    expect(canConvert({ productUnit: '只', materialUnit: 'Kg' })).toBe(false);
    expect(canConvert({ productUnit: '只', materialUnit: 'Kg', materialNum: 0 })).toBe(false);
    expect(canConvert({ productUnit: '只', materialUnit: 'Kg', materialNum: 2.5 })).toBe(true);
    expect(canConvert({ productUnit: '罐', materialUnit: '罐' })).toBe(true);
    expect(canConvert({ productUnit: 'kg' })).toBe(true);
  });
});

describe('admin 数字输入框保留一位精度及历史全收', () => {
  it('数字输入先按原材料上限夹回，再处理新输入精度', () => {
    const historical = { productUnit: '盒', materialUnit: '份', returnQuantity: 1.25, materialNum: 0.1 };
    expect(normalizeConfirmQty(historical, 0.125)).toBe(0.125);
    expect(normalizeConfirmQty(historical, 5)).toBe(0.125);
    expect(normalizeConfirmQty(historical, 0.124)).toBe(0.1);
    expect(normalizeConfirmQty(cowpea, 0.28)).toBe(0.28);
    expect(normalizeConfirmQty(cowpea, 5)).toBe(0.3);
    expect(normalizeConfirmQty(cowpea, undefined)).toBeUndefined();
  });
});
