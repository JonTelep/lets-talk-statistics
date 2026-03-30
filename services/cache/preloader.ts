// Data preloader to warm cache for better user experience
// Preloads common datasets in the background when the app initializes

import { preloadData } from './dataCache';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

/**
 * Common endpoints that should be preloaded for better UX
 */
const CRITICAL_ENDPOINTS = [
  // Health check and basic metadata (fast, always useful)
  { url: `${API_BASE_URL}/health`, ttl: 2 * 60 * 1000 }, // 2 minutes
  
  // Quick stats (used on homepage and multiple pages)
  { url: `${API_BASE_URL}/quick-stats`, ttl: 10 * 60 * 1000 }, // 10 minutes
  
  // Latest data points (frequently requested)
  { url: `${API_BASE_URL}/debt/latest`, ttl: 30 * 60 * 1000 }, // 30 minutes
  { url: `${API_BASE_URL}/employment/unemployment/latest`, ttl: 24 * 60 * 60 * 1000 }, // 24 hours
  
  // Small datasets that load quickly
  { url: `${API_BASE_URL}/healthcare/summary`, ttl: 30 * 60 * 1000 }, // 30 minutes
  { url: `${API_BASE_URL}/education/summary`, ttl: 30 * 60 * 1000 }, // 30 minutes
];

/**
 * Heavy datasets to preload on idle (not critical for initial page load)
 */
const SECONDARY_ENDPOINTS = [
  // Full datasets (preload when browser is idle)
  { url: `${API_BASE_URL}/debt/`, ttl: 30 * 60 * 1000 }, // 30 minutes
  { url: `${API_BASE_URL}/employment/unemployment/`, ttl: 60 * 60 * 1000 }, // 1 hour
  { url: `${API_BASE_URL}/healthcare/`, ttl: 60 * 60 * 1000 }, // 1 hour
];

/**
 * Preload critical data immediately on app initialization
 */
export function preloadCriticalData() {
  if (typeof window === 'undefined') {
    return; // Don't run on server-side
  }

  try {
    preloadData(CRITICAL_ENDPOINTS);
    console.log(`[DataPreloader] Warming cache for ${CRITICAL_ENDPOINTS.length} critical endpoints`);
  } catch (error) {
    console.warn('[DataPreloader] Failed to preload critical data:', error);
  }
}

/**
 * Preload secondary data when browser is idle
 */
export function preloadSecondaryData() {
  if (typeof window === 'undefined') {
    return; // Don't run on server-side
  }

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (window.requestIdleCallback || ((cb) => setTimeout(cb, 1000))) as typeof requestIdleCallback;
  
  schedulePreload(() => {
    try {
      preloadData(SECONDARY_ENDPOINTS);
      console.log(`[DataPreloader] Background warming cache for ${SECONDARY_ENDPOINTS.length} secondary endpoints`);
    } catch (error) {
      console.warn('[DataPreloader] Failed to preload secondary data:', error);
    }
  });
}

/**
 * Preload data specific to a page the user is about to navigate to
 */
export function preloadPageData(page: string) {
  const pageEndpoints: Record<string, Array<{ url: string; ttl: number }>> = {
    healthcare: [
      { url: `${API_BASE_URL}/healthcare/`, ttl: 30 * 60 * 1000 },
      { url: `${API_BASE_URL}/healthcare/summary`, ttl: 30 * 60 * 1000 },
    ],
    education: [
      { url: `${API_BASE_URL}/education/`, ttl: 30 * 60 * 1000 },
      { url: `${API_BASE_URL}/education/summary`, ttl: 30 * 60 * 1000 },
    ],
    employment: [
      { url: `${API_BASE_URL}/employment/unemployment/`, ttl: 60 * 60 * 1000 },
      { url: `${API_BASE_URL}/employment/unemployment/latest`, ttl: 24 * 60 * 60 * 1000 },
    ],
    debt: [
      { url: `${API_BASE_URL}/debt/`, ttl: 30 * 60 * 1000 },
      { url: `${API_BASE_URL}/debt/latest`, ttl: 30 * 60 * 1000 },
    ],
    congress: [
      { url: `${API_BASE_URL}/congress/politicians/top`, ttl: 60 * 60 * 1000 },
      { url: `${API_BASE_URL}/congress/trades/summary/daily?days=30`, ttl: 30 * 60 * 1000 },
    ],
  };

  const endpoints = pageEndpoints[page];
  if (endpoints) {
    preloadData(endpoints);
    console.log(`[DataPreloader] Preloading data for ${page} page`);
  }
}

/**
 * Initialize all preloading strategies
 */
export function initializeDataPreloading() {
  // Preload critical data immediately
  preloadCriticalData();
  
  // Schedule secondary data preloading
  preloadSecondaryData();
  
  // Set up navigation preloading (if using router events)
  if (typeof window !== 'undefined') {
    // Listen for hover events on navigation links to preload page data
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.includes(window.location.origin)) {
        const path = new URL(link.href).pathname;
        const page = path.split('/')[1]; // Extract page name from path
        
        if (page && page !== window.location.pathname.split('/')[1]) {
          // Debounce preloading to avoid excessive requests
          const timeoutId = (link as any).__preloadTimeout;
          if (timeoutId) clearTimeout(timeoutId);
          
          (link as any).__preloadTimeout = setTimeout(() => {
            preloadPageData(page);
          }, 100);
        }
      }
    });
  }
}

/**
 * Get preloader statistics
 */
export function getPreloaderStats() {
  if (typeof window === 'undefined') {
    return null;
  }

  const { dataCache } = require('./dataCache');
  return {
    cache: dataCache.getStats(),
    endpoints: {
      critical: CRITICAL_ENDPOINTS.length,
      secondary: SECONDARY_ENDPOINTS.length,
    },
  };
}