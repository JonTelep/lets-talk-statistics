/**
 * Performance monitoring hook for tracking API response times,
 * cache hits, and user interaction metrics
 */

'use client';

import { useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface CacheMetric {
  endpoint: string;
  hit: boolean;
  responseTime: number;
  timestamp: number;
}

// In-memory storage for metrics (could be replaced with analytics service)
const performanceMetrics: PerformanceMetric[] = [];
const cacheMetrics: CacheMetric[] = [];

export function usePerformanceMonitoring() {
  const activeMetrics = useRef<Map<string, PerformanceMetric>>(new Map());

  /**
   * Start timing a performance metric
   */
  const startTiming = useCallback((name: string, metadata?: Record<string, any>) => {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };
    
    activeMetrics.current.set(name, metric);
    
    // Return a function to end timing
    return () => {
      const activeMetric = activeMetrics.current.get(name);
      if (activeMetric) {
        activeMetric.endTime = performance.now();
        activeMetric.duration = activeMetric.endTime - activeMetric.startTime;
        performanceMetrics.push(activeMetric);
        activeMetrics.current.delete(name);
        
        // Log slow operations (> 2 seconds)
        if (activeMetric.duration > 2000) {
          console.warn(`Slow operation detected: ${name} took ${activeMetric.duration.toFixed(2)}ms`);
        }
      }
    };
  }, []);

  /**
   * Record a cache hit/miss metric
   */
  const recordCacheMetric = useCallback((endpoint: string, hit: boolean, responseTime: number) => {
    const metric: CacheMetric = {
      endpoint,
      hit,
      responseTime,
      timestamp: Date.now(),
    };
    
    cacheMetrics.push(metric);
    
    // Keep only last 100 cache metrics to avoid memory bloat
    if (cacheMetrics.length > 100) {
      cacheMetrics.splice(0, cacheMetrics.length - 100);
    }
  }, []);

  /**
   * Get performance statistics
   */
  const getPerformanceStats = useCallback(() => {
    const now = Date.now();
    const recent = performanceMetrics.filter(m => now - (m.startTime + (performance.timeOrigin || 0)) < 300000); // Last 5 minutes
    
    if (recent.length === 0) {
      return {
        totalOperations: 0,
        averageTime: 0,
        slowOperations: 0,
        cacheHitRate: 0,
      };
    }

    const durations = recent.map(m => m.duration || 0);
    const averageTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    const slowOperations = recent.filter(m => (m.duration || 0) > 2000).length;
    
    // Cache statistics
    const recentCacheMetrics = cacheMetrics.filter(m => now - m.timestamp < 300000);
    const cacheHitRate = recentCacheMetrics.length > 0 
      ? recentCacheMetrics.filter(m => m.hit).length / recentCacheMetrics.length
      : 0;

    return {
      totalOperations: recent.length,
      averageTime: Math.round(averageTime),
      slowOperations,
      cacheHitRate: Math.round(cacheHitRate * 100),
    };
  }, []);

  /**
   * Enhanced fetch wrapper with performance monitoring
   */
  const monitoredFetch = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const endTiming = startTiming(`fetch-${url}`, { url, method: options.method || 'GET' });
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const responseTime = performance.now() - startTime;
      
      // Check if response came from cache
      const fromCache = response.headers.get('x-cache') === 'HIT' || 
                       response.headers.get('age') !== null;
      
      recordCacheMetric(url, fromCache, responseTime);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      endTiming();
      
      return data;
    } catch (error) {
      endTiming();
      throw error;
    }
  }, [startTiming, recordCacheMetric]);

  /**
   * Mark Core Web Vitals and user interactions
   */
  const markInteraction = useCallback((action: string, target?: string) => {
    const metric: PerformanceMetric = {
      name: `interaction-${action}`,
      startTime: performance.now(),
      endTime: performance.now(),
      duration: 0,
      metadata: { action, target, timestamp: Date.now() },
    };
    
    performanceMetrics.push(metric);
  }, []);

  /**
   * Log performance report to console (useful for debugging)
   */
  const logPerformanceReport = useCallback(() => {
    const stats = getPerformanceStats();
    console.group('🚀 Performance Report');
    console.log(`Total operations (last 5min): ${stats.totalOperations}`);
    console.log(`Average response time: ${stats.averageTime}ms`);
    console.log(`Slow operations (>2s): ${stats.slowOperations}`);
    console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
    
    // Show slowest operations
    const slowest = performanceMetrics
      .filter(m => m.duration && m.duration > 1000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);
    
    if (slowest.length > 0) {
      console.log('Slowest operations:');
      slowest.forEach(m => {
        console.log(`  ${m.name}: ${m.duration?.toFixed(2)}ms`);
      });
    }
    
    console.groupEnd();
  }, [getPerformanceStats]);

  return {
    startTiming,
    recordCacheMetric,
    getPerformanceStats,
    monitoredFetch,
    markInteraction,
    logPerformanceReport,
  };
}