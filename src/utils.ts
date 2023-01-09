export interface Insert {
  <TKey, TValue>(map: Map<TKey, TValue>, key: TKey, value: TValue): TValue;
  // eslint-disable-next-line @typescript-eslint/ban-types
  <TKey extends object, TValue>(
    map: WeakMap<TKey, TValue>,
    key: TKey,
    value: TValue
  ): TValue;
}

/** Map.set but returns the value. */
export const insert: Insert = <TKey, TValue>(
  map: Map<TKey, TValue> | WeakMap<any, TValue>,
  key: TKey,
  value: TValue
): TValue => (map.set(key, value), value);
