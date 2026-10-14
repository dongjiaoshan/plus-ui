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
    expect(maxQty(cowpea)).toBe(0.36);
    expect(defaultConfirmInput(pork)).toBe('1');
    expect(maxQty(pork)).toBe(1.2);
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

  it('原料单位缺省回落产品单位，产品kg同样允许原值加20%', () => {
    const kg = { productUnit: '公斤', returnQuantity: 2, returnWeight: 2 };
    expect(metricIsKg(kg)).toBe(true);
    expect(metricSuffix(kg)).toBe('kg');
    expect(maxQty(kg)).toBe(2.4);
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

  it('KG输入最多增加20%，不能把退1份0.3kg变成可确认5kg', () => {
    expect(normalizeInput(cowpea, '5')).toEqual({ text: '0.36', capped: true });
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
    expect(normalizeConfirmQty(cowpea, 5)).toBe(0.36);
    expect(normalizeConfirmQty(cowpea, undefined)).toBeUndefined();
  });
});

describe('row304 KG确认20%容差', () => {
  it('半位折算与后端HALF_UP一致，两端原值和120%上限不受浮点误差影响', () => {
    for (const [ratio, base, cap] of [
      [0.145, 0.015, 0.018],
      [0.135, 0.014, 0.016],
      [0.125, 0.013, 0.015]
    ]) {
      const row = { productUnit: '份', materialUnit: 'kg', returnQuantity: 0.1, materialNum: ratio };
      expect(defaultConfirmInput(row)).toBe(String(base));
      expect(maxQty(row)).toBe(cap);
      expect(defaultConfirmInput({ ...row, maxConfirmQty: cap })).toBe(String(base));
      expect(normalizeInput(row, String(cap))).toEqual({ text: String(cap), capped: false });
    }
  });

  const eggplant = { productUnit: '份', materialUnit: 'kg', returnQuantity: 0.5, materialNum: 0.5 };

  it('截图原值0.25仍作默认，0.30允许，0.301和更大值夹回0.30', () => {
    expect(defaultConfirmInput(eggplant)).toBe('0.25');
    expect(maxQty(eggplant)).toBe(0.3);
    expect(normalizeInput(eggplant, '0.30')).toEqual({ text: '0.3', capped: false });
    expect(normalizeInput(eggplant, '0.301')).toEqual({ text: '0.3', capped: true });
    expect(toConfirmWeight(eggplant, '0.3')).toBe(0.3);
    expect(defaultConfirmInput({ ...eggplant, maxConfirmQty: 0.3 })).toBe('0.25');
  });

  it('直接公斤及缺退回量的门店申报重量使用相同基数和容差', () => {
    const direct = { productUnit: '公斤', returnQuantity: 0.25, returnWeight: 0.25 };
    expect(defaultConfirmInput(direct)).toBe('0.25');
    expect(maxQty(direct)).toBe(0.3);
    expect(maxQty({ productUnit: 'kg', returnWeight: 0.25 })).toBe(0.3);
    expect(defaultConfirmInput({ productUnit: 'kg', returnWeight: 0.25 })).toBe('0.25');
  });

  it('微量上限向下取三位，不把0.0036四舍五入到超20%的0.004', () => {
    const tiny = { productUnit: 'kg', returnQuantity: 0.003 };
    expect(maxQty(tiny)).toBe(0.003);
    expect(normalizeInput(tiny, '0.004')).toEqual({ text: '0.003', capped: true });
    expect(maxQty({ productUnit: 'kg', returnQuantity: 0.234 })).toBe(0.28);
    expect(maxQty({ productUnit: 'kg', returnQuantity: 0.29 })).toBe(0.348);
    expect(maxQty({ productUnit: 'kg', returnQuantity: 10000000.04 })).toBe(12000000.048);
  });

  it('非KG数量不增加20%，历史实收超过现行上限也仍按原数回显', () => {
    const count = { productUnit: '盒', materialUnit: '份', returnQuantity: 1, materialNum: 3 };
    expect(maxQty(count)).toBe(3);
    expect(defaultConfirmInput(count)).toBe('3');
    expect(normalizeInput(count, '3.1')).toEqual({ text: '3', capped: true });
    expect(fromConfirmWeight(eggplant, 0.5)).toBe('0.5');
  });
});
