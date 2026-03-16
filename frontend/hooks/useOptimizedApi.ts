/**
 * Optimized API hook with intelligent caching, retry logic,
 * and performance monitoring
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

interface ApiOptions {
  cacheTTL?: number; // Cache time-to-live in milliseconds
  retries?: number;
  retryDelay?: number;
  useETag?: boolean;
  backgroundRefresh?: boolean;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: number | null;
  cacheHit: boolean;
}

// Global cache store
const apiCache = new Map<string, CacheEntry<any>>();

// Default options
const defaultOptions: Required<ApiOptions> = {
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  retries: 3,
  retryDelay: 1000,
  useETag: true,
  backgroundRefresh: true,
};

export function useOptimizedApi<T>(
  url: string | null,
  options: ApiOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
    cacheHit: false,
  });

  const { monitoredFetch, recordCacheMetric } = usePerformanceMonitoring();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((fetchUrl: string) => {
    // Include relevant options in cache key
    return `${fetchUrl}_${opts.cacheTTL}_${opts.useETag}`;
  }, [opts.cacheTTL, opts.useETag]);

  const fetchData = useCallback(async (
    fetchUrl: string,
    isBackgroundRefresh = false
  ): Promise<T> => {
    const cacheKey = getCacheKey(fetchUrl);
    const cached = apiCache.get(cacheKey);
    const now = Date.now();

    // Check if cache is valid
    if (cached && (now - cached.timestamp) < opts.cacheTTL) {
      recordCacheMetric(fetchUrl, true, 0);
      if (!isBackgroundRefresh) {
        setState(prev => ({ 
          ...prev, 
          data: cached.data, 
          loading: false, 
          error: null,
          cacheHit: true 
        }));
      }
      return cached.data;
    }

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const fetchWithRetry = async (attempt = 1): Promise<Response> => {
      try {
        const headers: HeadersInit = {
          'Accept': 'application/json',
        };

        // Add conditional headers for cache validation
        if (opts.useETag && cached) {
          if (cached.etag) headers['If-None-Match'] = cached.etag;
          if (cached.lastModified) headers['If-Modified-Since'] = cached.lastModified;
        }

        const response = await monitoredFetch<Response>(fetchUrl, {
          headers,
          signal: abortControllerRef.current?.signal,
        });

        // Handle 304 Not Modified
        if (response.status === 304 && cached) {
          // Update timestamp but keep existing data
          apiCache.set(cacheKey, { ...cached, timestamp: now });
          recordCacheMetric(fetchUrl, true, 0);
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        if (attempt < opts.retries && !(error as Error).name?.includes('Abort')) {
          await new Promise(resolve => setTimeout(resolve, opts.retryDelay * attempt));
          return fetchWithRetry(attempt + 1);
        }
        throw error;
      }
    };

    const response = await fetchWithRetry();
    const data = await response.json();

    // Update cache with new data and metadata
    const etag = response.headers.get('ETag') || undefined;
    const lastModified = response.headers.get('Last-Modified') || undefined;
    
    apiCache.set(cacheKey, {
      data,
      timestamp: now,
      etag,
      lastModified,
    });

    recordCacheMetric(fetchUrl, false, now);

    if (!isBackgroundRefresh) {
      setState(prev => ({ 
        ...prev, 
        data, 
        loading: false, 
        error: null,
        lastFetch: now,
        cacheHit: false 
      }));
    }

    return data;
  }, [getCacheKey, opts, monitoredFetch, recordCacheMetric]);

  // Main fetch function
  const refetch = useCallback(async (force = false) => {
    if (!url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (force) {
        // Clear cache for forced refetch
        apiCache.delete(getCacheKey(url));
      }

      await fetchData(url);
    } catch (error) {
      if ((error as Error).name?.includes('Abort')) return; // Ignore aborted requests

      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [url, fetchData, getCacheKey]);

  // Background refresh effect
  useEffect(() => {
    if (!url || !opts.backgroundRefresh) return;

    const cacheKey = getCacheKey(url);
    const cached = apiCache.get(cacheKey);
    
    if (!cached) return;

    const age = Date.now() - cached.timestamp;
    const refreshThreshold = opts.cacheTTL * 0.8; // Refresh at 80% of TTL

    if (age > refreshThreshold) {
      // Background refresh without affecting loading state
      fetchData(url, true).catch(console.error);
    }
  }, [url, opts.backgroundRefresh, opts.cacheTTL, fetchData, getCacheKey]);

  // Initial fetch effect
  useEffect(() => {
    if (url) {
      refetch();
    }

    return () => {
      // Cleanup: abort ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, refetch]);

  // Cache management utilities
  const clearCache = useCallback(() => {
    if (url) {
      apiCache.delete(getCacheKey(url));
    }
  }, [url, getCacheKey]);

  const getCacheInfo = useCallback(() => {
    if (!url) return null;
    
    const cached = apiCache.get(getCacheKey(url));
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    const remainingTTL = Math.max(0, opts.cacheTTL - age);

    return {
      age,
      remainingTTL,
      isExpired: age > opts.cacheTTL,
      hasETag: !!cached.etag,
      hasLastModified: !!cached.lastModified,
    };
  }, [url, getCacheKey, opts.cacheTTL]);

  return {
    ...state,
    refetch,
    clearCache,
    getCacheInfo,
  };
}

/**
 * Hook for prefetching data (useful for hover states, route preloading)
 */
export function usePrefetch() {
  const { monitoredFetch } = usePerformanceMonitoring();

  const prefetch = useCallback(async (url: string, options: ApiOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const cacheKey = `${url}_${opts.cacheTTL}_${opts.useETag}`;
    const cached = apiCache.get(cacheKey);
    const now = Date.now();

    // Don't prefetch if already cached and fresh
    if (cached && (now - cached.timestamp) < opts.cacheTTL) {
      return;
    }

    try {
      const response = await monitoredFetch<Response>(url);
      const data = await response.json();

      apiCache.set(cacheKey, {
        data,
        timestamp: now,
        etag: response.headers.get('ETag') || undefined,
        lastModified: response.headers.get('Last-Modified') || undefined,
      });
    } catch (error) {
      // Silently fail prefetch attempts
      console.debug('Prefetch failed:', url, error);
    }
  }, [monitoredFetch]);

  return { prefetch };
}

/**
 * Global cache management utilities
 */
export const cacheManager = {
  clear: () => {
    apiCache.clear();
  },
  size: () => apiCache.size,
  keys: () => Array.from(apiCache.keys()),
  getStats: () => {
    const now = Date.now();
    const entries = Array.from(apiCache.values());
    const expired = entries.filter(entry => now - entry.timestamp > 5 * 60 * 1000).length;
    
    return {
      total: entries.length,
      expired,
      fresh: entries.length - expired,
      memoryUsage: JSON.stringify(Array.from(apiCache)).length, // Rough estimate
    };
  },
  cleanup: () => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [key, entry] of apiCache) {
      if (now - entry.timestamp > maxAge) {
        apiCache.delete(key);
      }
    }
  },
};