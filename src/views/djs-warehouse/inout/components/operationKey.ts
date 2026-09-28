/** Keep the request ID after transport failures, including refresh; discard only on acknowledged success. */
export function operationKey(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, namespace: string) {
  const key = `warehouse-inout:${namespace}`;
  return {
    forPayload(payload: unknown): string {
      const fingerprint = JSON.stringify(payload);
      let pending: Record<string, string> = {};
      try {
        const cached: unknown = JSON.parse(storage.getItem(key) || '{}');
        if (cached && typeof cached === 'object' && !Array.isArray(cached)) {
          pending = Object.fromEntries(Object.entries(cached).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
        }
      } catch {
        // A malformed cache must never manufacture a successful receipt.
      }
      if (!pending[fingerprint]) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        pending[fingerprint] = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
        storage.setItem(key, JSON.stringify(pending));
      }
      return pending[fingerprint];
    },
    acknowledge(payload: unknown) {
      const pending: Record<string, string> = JSON.parse(storage.getItem(key) || '{}');
      delete pending[JSON.stringify(payload)];
      if (Object.keys(pending).length) storage.setItem(key, JSON.stringify(pending));
      else storage.removeItem(key);
    }
  };
}
