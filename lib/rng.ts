// Deterministic pseudo-random helpers.
// Everything here is seeded so server and client render identical data
// (no hydration mismatch) while still looking "organic".

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a stable numeric seed.
export function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rand(seed: string) {
  const r = mulberry32(seedFrom(seed));
  return {
    next: r,
    // float in [min, max]
    range: (min: number, max: number) => min + r() * (max - min),
    // integer in [min, max]
    int: (min: number, max: number) => Math.floor(min + r() * (max - min + 1)),
    pick: <T>(arr: T[]): T => arr[Math.floor(r() * arr.length)],
  };
}

/**
 * Generate a smooth-ish trending series.
 * start -> grows by `growth` per step with `noise` jitter, seeded.
 */
export function trendSeries(
  seed: string,
  points: number,
  opts: { start: number; growth?: number; noise?: number; min?: number } = {
    start: 100,
  }
): number[] {
  const r = mulberry32(seedFrom(seed));
  const { start, growth = 0.04, noise = 0.06, min = 0 } = opts;
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const drift = 1 + growth + (r() - 0.5) * 2 * noise;
    v = Math.max(min, v * drift);
    out.push(Math.round(v));
  }
  return out;
}

/** Split a total into `n` weighted parts, seeded, summing to `total`. */
export function splitTotal(seed: string, total: number, n: number): number[] {
  const r = mulberry32(seedFrom(seed));
  const weights = Array.from({ length: n }, () => 0.4 + r());
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((w) => Math.round((w / sum) * total));
  // fix rounding drift on the last element
  const drift = total - parts.reduce((a, b) => a + b, 0);
  parts[parts.length - 1] += drift;
  return parts;
}
