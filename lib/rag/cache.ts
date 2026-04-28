type CacheEntry<T> = { value: T; expiresAt: number };

export class TTLCache<T> {
  private map = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs: number, maxEntries: number) {
    this.ttlMs = Math.max(0, ttlMs);
    this.maxEntries = Math.max(1, maxEntries);
  }

  get(key: string): T | null {
    const v = this.map.get(key);
    if (!v) return null;
    if (this.ttlMs > 0 && Date.now() > v.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return v.value;
  }

  set(key: string, value: T) {
    if (this.map.size >= this.maxEntries) {
      const first = this.map.keys().next().value;
      if (first) this.map.delete(first);
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

