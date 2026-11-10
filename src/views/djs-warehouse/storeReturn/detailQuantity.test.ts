import { describe, expect, it } from 'vitest';
import { formatDetailQuantity } from './detailQuantity';

describe('V7-R93 return details fixed unit precision', () => {
  it.each(['kg', 'KG', ' Kg ', '公斤'])('pads raw KG quantities and zero for unit %s', (unit) => {
    expect(formatDetailQuantity(2, unit)).toBe('2.000');
    expect(formatDetailQuantity('0.003', unit)).toBe('0.003');
    expect(formatDetailQuantity(0, unit)).toBe('0.000');
  });

  it('uses one decimal for non-KG and rounds display without truncating historical input', () => {
    const record = { returnQuantity: '1.15', receivedQty: '0.701', productUnit: '份', materialUnit: 'KG' };
    expect(formatDetailQuantity(record.returnQuantity, record.productUnit)).toBe('1.2');
    expect(formatDetailQuantity(record.receivedQty, record.materialUnit)).toBe('0.701');
    expect(record).toEqual({ returnQuantity: '1.15', receivedQty: '0.701', productUnit: '份', materialUnit: 'KG' });
    expect(formatDetailQuantity(2, '袋')).toBe('2.0');
    expect(formatDetailQuantity(0, '袋')).toBe('0.0');
  });

  it.each([null, undefined, '', ' ', 'invalid', Number.NaN, Number.POSITIVE_INFINITY])('leaves unavailable quantity as a dash: %s', (value) => {
    expect(formatDetailQuantity(value, 'kg')).toBe('—');
  });

  it('keeps signs and avoids grouping or negative zero in the fixed decimal display', () => {
    expect(formatDetailQuantity('-2.25', '袋')).toBe('-2.3');
    expect(formatDetailQuantity(1234.5, 'kg')).toBe('1234.500');
    expect(formatDetailQuantity(-0, '袋')).toBe('0.0');
  });
});
