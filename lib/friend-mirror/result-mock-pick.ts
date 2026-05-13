/** Deterministic pick for mock AI copy (stable per seed + salt). */
export function pickSeeded<T>(
  items: readonly T[],
  seed: string,
  salt: string,
): T {
  if (!items.length) {
    throw new Error("pickSeeded: empty items");
  }
  const s = `${seed}\0${salt}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return items[Math.abs(h) % items.length] as T;
}
