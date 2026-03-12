'use client';

import { useState, useEffect } from 'react';
import { 
  immigrationApi, 
  ImmigrationSummary, 
  ImmigrationHistorical, 
  ImmigrationCategory, 
  ImmigrationCountries 
} from '@/services/api/client';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useAsyncData<T>(fetchFn: () => Promise<T>): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => setRefetchTrigger((t) => t + 1);

  return { data, loading, error, refetch };
}

/**
 * Hook to fetch immigration summary statistics
 */
export function useImmigrationSummary(): UseDataResult<ImmigrationSummary> {
  return useAsyncData(() => immigrationApi.getSummary());
}

/**
 * Hook to fetch historical enforcement data
 */
export function useImmigrationHistorical(
  startYear?: number,
  endYear?: number
): UseDataResult<ImmigrationHistorical> {
  return useAsyncData(() => immigrationApi.getHistorical(startYear, endYear));
}

/**
 * Hook to fetch immigration by category
 */
export function useImmigrationCategories(): UseDataResult<ImmigrationCategory> {
  return useAsyncData(() => immigrationApi.getCategories());
}

/**
 * Hook to fetch top source countries
 */
export function useImmigrationCountries(
  limit?: number
): UseDataResult<ImmigrationCountries> {
  return useAsyncData(() => immigrationApi.getCountries(limit));
}

/**
 * Hook to fetch complete immigration overview
 */
export function useImmigrationOverview(): UseDataResult<{
  status: string;
  summary: ImmigrationSummary;
  categories: ImmigrationCategory;
  top_countries: ImmigrationCountries;
  data_sources: Array<{ name: string; url: string; coverage: string }>;
}> {
  return useAsyncData(() => immigrationApi.getOverview());
}
