import type { PigVO } from '@/api/djs-breed/pig/types';

const TO_FATTEN_STATES = new Set(['HB', 'DN', 'LC', 'KH', 'FQ']);

/** D-0150：两处种母猪列表共用安全状态规则；未断奶仔猪由后端实时校验。 */
export function canToFatten(row: Pick<PigVO, 'pigType' | 'currentStatus'>): boolean {
  return row.pigType === 'sow' && TO_FATTEN_STATES.has(row.currentStatus ?? '');
}
