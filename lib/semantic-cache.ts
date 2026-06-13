
import { hfEmbed } from './huggingface';
import { MemoryEntry } from './hermes/types';
import { getHermes } from './hermes/hermes';

export interface SemanticCacheEntry {
  id: string;
  queryEmbedding: number[];
  queryText: string;
  cachedResult: any;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  freshnessScore: number; // 0-1, higher = fresher
  metadata: Record<string, any>;
}

export interface SemanticCacheMetrics {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageCacheLatencyMs: number;
  averageUncachedLatencyMs: number;
  latencyImprovementPercent: number;
  totalEntries: number;
}

export interface SemanticCacheConfig {
  similarityThreshold: number; // 0-1, minimum cosine similarity for cache hit
  maxEntries: number;
  entryTtlMs: number;
  freshnessDecayRate: number; // per day
  enableAutoInvalidation: boolean;
}

const DEFAULT_CONFIG: SemanticCacheConfig = {
  similarityThreshold: 0.85,
  maxEntries: 1000,
  entryTtlMs: 24 * 60 * 60 * 1000, // 24 hours
  freshnessDecayRate: 0.1,
  enableAutoInvalidation: true,
};

export class SemanticCache {
  private config: SemanticCacheConfig;
  private cache: Map<string, SemanticCacheEntry>;
  private metrics: SemanticCacheMetrics;
  private hermes: ReturnType<typeof getHermes>;

  constructor(config: Partial<SemanticCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
    this.metrics = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageCacheLatencyMs: 0,
      averageUncachedLatencyMs: 0,
      latencyImprovementPercent: 0,
      totalEntries: 0,
    };
    this.hermes = getHermes();
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i]! * b[i]!;
      normA += Math.pow(a[i]!, 2);
      normB += Math.pow(b[i]!, 2);
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate freshness score based on creation time
   */
  private calculateFreshnessScore(createdAt: string): number {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const ageMs = now - created;
    const ageDays = ageMs / (24 * 60 * 60 * 1000);
    const decay = Math.exp(-this.config.freshnessDecayRate * ageDays);
    return Math.max(0, Math.min(1, decay));
  }

  /**
   * Find a cache entry that matches the query semantically
   */
  async findSimilar(queryText: string): Promise<SemanticCacheEntry | null> {
    const queryEmbedding = await hfEmbed(queryText);
    let bestMatch: SemanticCacheEntry | null = null;
    let bestSimilarity = 0;

    for (const entry of this.cache.values()) {
      const similarity = this.calculateCosineSimilarity(queryEmbedding, entry.queryEmbedding);
      const freshness = this.calculateFreshnessScore(entry.createdAt);
      const combinedScore = similarity * freshness;

      if (combinedScore > this.config.similarityThreshold && combinedScore > bestSimilarity) {
        bestSimilarity = combinedScore;
        bestMatch = entry;
      }
    }

    return bestMatch;
  }

  /**
   * Store a new entry in the semantic cache
   */
  async store(queryText: string, cachedResult: any, metadata: Record<string, any> = {}): Promise<SemanticCacheEntry> {
    const queryEmbedding = await hfEmbed(queryText);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const entry: SemanticCacheEntry = {
      id,
      queryEmbedding,
      queryText,
      cachedResult,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      freshnessScore: 1,
      metadata,
    };

    // Store in cache
    this.cache.set(id, entry);

    // Evict old entries if cache is full
    if (this.cache.size > this.config.maxEntries) {
      this.evictOldEntries();
    }

    // Update metrics
    this.metrics.totalEntries = this.cache.size;

    // Also store in Hermes for persistence
    await this.hermes.storeMemory({
      content: JSON.stringify({ queryText, cachedResult, metadata }),
      category: 'semantic-cache',
      tier: 'short-term',
      leadId: metadata.leadId,
      sessionId: metadata.sessionId,
      agentId: metadata.agentId,
      keywords: queryText.toLowerCase().split(/\s+/),
      importance: 8,
      metadata: metadata || {},
    });

    return entry;
  }

  /**
   * Retrieve from cache with metrics tracking
   */
  async retrieveWithMetrics<T>(
    queryText: string,
    fetchFn: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<{ result: T; fromCache: boolean; latencyMs: number }> {
    const startTime = Date.now();
    this.metrics.totalQueries++;

    // Try cache first
    const cachedEntry = await this.findSimilar(queryText);
    if (cachedEntry) {
      // Update cache entry
      cachedEntry.lastAccessed = new Date().toISOString();
      cachedEntry.accessCount++;
      cachedEntry.freshnessScore = this.calculateFreshnessScore(cachedEntry.createdAt);
      this.cache.set(cachedEntry.id, cachedEntry);

      // Update metrics
      this.metrics.cacheHits++;
      this.metrics.hitRate = this.metrics.cacheHits / this.metrics.totalQueries;
      const latency = Date.now() - startTime;
      this.metrics.averageCacheLatencyMs = 
        (this.metrics.averageCacheLatencyMs * (this.metrics.cacheHits - 1) + latency) / this.metrics.cacheHits;

      // Calculate latency improvement
      if (this.metrics.averageUncachedLatencyMs > 0) {
        this.metrics.latencyImprovementPercent = 
          ((this.metrics.averageUncachedLatencyMs - this.metrics.averageCacheLatencyMs) / this.metrics.averageUncachedLatencyMs) * 100;
      }

      return {
        result: cachedEntry.cachedResult as T,
        fromCache: true,
        latencyMs: latency,
      };
    }

    // Cache miss - fetch from source
    this.metrics.cacheMisses++;
    const result = await fetchFn();
    const uncachedLatency = Date.now() - startTime;

    // Update metrics
    this.metrics.hitRate = this.metrics.cacheHits / this.metrics.totalQueries;
    this.metrics.averageUncachedLatencyMs =
      (this.metrics.averageUncachedLatencyMs * (this.metrics.cacheMisses - 1) + uncachedLatency) / this.metrics.cacheMisses;

    // Calculate latency improvement
    if (this.metrics.averageCacheLatencyMs > 0) {
      this.metrics.latencyImprovementPercent =
        ((this.metrics.averageUncachedLatencyMs - this.metrics.averageCacheLatencyMs) / this.metrics.averageUncachedLatencyMs) * 100;
    }

    // Store in cache for future
    await this.store(queryText, result, metadata);

    return {
      result,
      fromCache: false,
      latencyMs: uncachedLatency,
    };
  }

  /**
   * Evict oldest/lowest access count entries
   */
  private evictOldEntries(): void {
    const entries = Array.from(this.cache.values());
    entries.sort((a, b) => {
      const aScore = a.freshnessScore * (a.accessCount + 1);
      const bScore = b.freshnessScore * (b.accessCount + 1);
      return aScore - bScore;
    });

    const toEvict = entries.slice(0, Math.ceil(this.config.maxEntries * 0.1));
    for (const entry of toEvict) {
      this.cache.delete(entry.id);
    }
  }

  /**
   * Invalidate stale entries
   */
  invalidateStaleEntries(): number {
    let invalidated = 0;
    const now = Date.now();

    for (const [id, entry] of this.cache) {
      const ageMs = now - new Date(entry.createdAt).getTime();
      if (ageMs > this.config.entryTtlMs) {
        this.cache.delete(id);
        invalidated++;
      }
    }

    this.metrics.totalEntries = this.cache.size;
    return invalidated;
  }

  /**
   * Get current cache metrics
   */
  getMetrics(): SemanticCacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics.totalEntries = 0;
  }
}

// Singleton instance
let semanticCacheInstance: SemanticCache | null = null;

export function getSemanticCache(): SemanticCache {
  if (!semanticCacheInstance) {
    semanticCacheInstance = new SemanticCache();
  }
  return semanticCacheInstance;
}
