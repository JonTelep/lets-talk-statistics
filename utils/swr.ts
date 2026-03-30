/**
 * SWR configuration for data fetching with stale-while-revalidate
 * 
 * This provides:
 * - Instant cached responses on subsequent visits
 * - Background revalidation for fresh data
 * - Automatic retries on error
 * - Deduplication of concurrent requests
 */

import { SWRConfiguration } from 'swr';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

/**
 * Default fetcher for SWR
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};

/**
 * SWR global configuration
 * 
 * Cache strategy:
 * - dedupingInterval: 60s - don't refetch within 60s even if component remounts
 * - revalidateOnFocus: false - don't refetch when tab gains focus (data doesn't change often)
 * - revalidateIfStale: true - revalidate in background if cached data is stale
 * - errorRetryCount: 3 - retry failed requests up to 3 times
 */
export const swrConfig: SWRConfiguration = {
  fetcher,
  dedupingInterval: 60000, // 60 seconds
  revalidateOnFocus: false, // Government data doesn't change frequently
  revalidateIfStale: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000, // 5 seconds between retries
  // Keep previous data while revalidating
  keepPreviousData: true,
};
