'use client';

import useSWR from 'swr';
import { API_URL, fetcher } from '@/utils/swr';

interface DebtDataPoint {
  date: string;
  total_debt: number;
}

interface DebtResponse {
  source: string;
  fetched_at: string;
  data: DebtDataPoint[];
}

interface LatestDebtResponse {
  date: string;
  total_debt: number;
  formatted: string;
  source: string;
}

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch historical national debt data
 * Uses SWR for caching and stale-while-revalidate
 */
export function useDebtHistory(days: number = 365): UseDataResult<DebtResponse> {
  const { data, error, isLoading, mutate } = useSWR<DebtResponse>(
    `${API_URL}/debt/?days=${days}`,
    fetcher
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}

/**
 * Hook to fetch the latest debt figure
 * Uses SWR for caching and stale-while-revalidate
 */
export function useLatestDebt(): UseDataResult<LatestDebtResponse> {
  const { data, error, isLoading, mutate } = useSWR<LatestDebtResponse>(
    `${API_URL}/debt/latest`,
    fetcher
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}

/**
 * Calculate derived stats from debt data
 */
export function calculateDebtStats(data: DebtDataPoint[]) {
  if (!data || data.length === 0) return null;
  
  const latest = data[0];
  const totalDebtTrillions = latest.total_debt / 1_000_000_000_000;
  
  // US population estimate (2024)
  const US_POPULATION = 335_000_000;
  const US_TAXPAYERS = 150_000_000;
  
  const debtPerCitizen = Math.round(latest.total_debt / US_POPULATION);
  const debtPerTaxpayer = Math.round(latest.total_debt / US_TAXPAYERS);
  
  // Calculate daily increase if we have multiple data points
  let dailyIncrease = 0;
  if (data.length >= 2) {
    const recent = data[0].total_debt;
    const previous = data[Math.min(30, data.length - 1)].total_debt;
    const daysDiff = Math.min(30, data.length - 1);
    dailyIncrease = (recent - previous) / daysDiff / 1_000_000_000; // billions per day
  }
  
  // Estimated GDP ratio (using ~$28T GDP estimate)
  const gdpRatio = (latest.total_debt / 28_000_000_000_000) * 100;
  
  return {
    totalDebtTrillions: totalDebtTrillions.toFixed(2),
    totalDebtRaw: latest.total_debt,
    debtPerCitizen,
    debtPerTaxpayer,
    dailyIncreaseBillions: dailyIncrease.toFixed(2),
    gdpRatio: gdpRatio.toFixed(1),
    lastUpdated: latest.date,
  };
}

export type { DebtDataPoint, DebtResponse, LatestDebtResponse };
