import { describe, expect, it } from 'vitest';
import { operationKey } from './operationKey';

function memory() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    }
  };
}

describe('intake request identity', () => {
  const payload = { inhouseId: '9223372036854775801', productId: '9223372036854775802', weight: '12.345', destination: 'outbound', outDest: 'test' };
  it('reuses the request after response loss, input changes and a page reload', () => {
    const storage = memory();
    const requests = operationKey(storage, 'user:cut');
    const original = requests.forPayload(payload);
    expect(original).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
    expect(requests.forPayload({ ...payload, weight: '15.000' })).not.toBe(original);
    expect(operationKey(storage, 'user:cut').forPayload(payload)).toBe(original);
  });
  it('allows a second intentional identical weighing only after an acknowledged success', () => {
    const requests = operationKey(memory(), 'user:cut');
    const first = requests.forPayload(payload);
    requests.acknowledge(payload);
    expect(requests.forPayload(payload)).not.toBe(first);
  });
  it('keeps another unresolved operation and isolates accounts and workstations', () => {
    const storage = memory();
    const requests = operationKey(storage, 'user:cut');
    const first = requests.forPayload(payload);
    const secondPayload = { ...payload, weight: '13.000' };
    const second = requests.forPayload(secondPayload);
    requests.acknowledge(payload);
    expect(requests.forPayload(secondPayload)).toBe(second);
    expect(operationKey(storage, 'other:cut').forPayload(payload)).not.toBe(first);
    expect(operationKey(storage, 'user:burn').forPayload(payload)).not.toBe(first);
  });
  it.each(['null', '[]', 'broken', '{"unused":10}'])('handles malformed local cache %s', (cached) => {
    const storage = memory();
    storage.setItem('warehouse-inout:user:cut', cached);
    expect(operationKey(storage, 'user:cut').forPayload(payload)).toHaveLength(36);
  });
});
