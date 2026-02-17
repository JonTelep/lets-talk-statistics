'use client';

import { useState, useEffect } from 'react';
import {
  housingApi,
  HousingDashboardResponse,
  HousingCompareResponse,
  HousingSyncStatusResponse,
} from '@/services/api/client';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useAsyncData<T>(fetchFn: () => Promise<T>, deps: unknown[] = []): UseDataResult<T> {
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
  }, [refetchTrigger, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => setRefetchTrigger((t) => t + 1);

  return { data, loading, error, refetch };
}

/**
 * Hook to fetch housing dashboard (headline indicators)
 */
export function useHousingDashboard(): UseDataResult<HousingDashboardResponse> {
  return useAsyncData(() => housingApi.getDashboard());
}

/**
 * Hook to fetch multi-series comparison data
 */
export function useHousingCompare(
  seriesIds: string[],
  startDate?: string,
  endDate?: string,
): UseDataResult<HousingCompareResponse> {
  return useAsyncData(
    () => housingApi.getCompare(seriesIds.join(','), startDate, endDate),
    [seriesIds.join(','), startDate, endDate],
  );
}

/**
 * Hook to fetch sync status
 */
export function useHousingSyncStatus(): UseDataResult<HousingSyncStatusResponse> {
  return useAsyncData(() => housingApi.getSyncStatus());
}
