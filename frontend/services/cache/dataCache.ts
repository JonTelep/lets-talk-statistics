// Simple in-memory cache for API responses with TTL
// Improves performance by avoiding redundant API calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const activeEntries = entries.filter(entry => now - entry.timestamp <= entry.ttl);
    
    return {
      totalEntries: this.cache.size,
      activeEntries: activeEntries.length,
      expiredEntries: this.cache.size - activeEntries.length,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    return removedCount;
  }
}

// Export singleton instance
export const dataCache = new DataCache();

/**
 * Enhanced fetch function with caching
 */
export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit,
  ttl?: number
): Promise<T> {
  // Create cache key from URL and important options
  const cacheKey = url + (options?.method || 'GET');
  
  // Try to get from cache first
  const cached = dataCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as T;
  
  // Store in cache
  dataCache.set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Cache-aware data fetching hook
 * This can replace direct fetch calls in data hooks
 */
export function useCachedData<T>(
  url: string | null,
  options?: RequestInit,
  ttl?: number
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => void;
} {
  // Implementation would use useEffect similar to existing hooks
  // but with cache integration
  throw new Error('useCachedData hook implementation would go here');
}

/**
 * Utility to warm up cache with common data
 */
export function preloadData(endpoints: Array<{ url: string; ttl?: number }>) {
  endpoints.forEach(({ url, ttl }) => {
    // Fire and forget cache warming
    cachedFetch(url, undefined, ttl).catch(() => {
      // Silently fail cache warming
    });
  });
}