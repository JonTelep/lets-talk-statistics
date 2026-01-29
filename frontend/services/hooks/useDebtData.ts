'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

async function fetchDebt(days: number): Promise<DebtResponse> {
  const response = await fetch(`${API_BASE_URL}/debt/?days=${days}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch debt data: ${response.status}`);
  }
  return response.json();
}

async function fetchLatestDebt(): Promise<LatestDebtResponse> {
  const response = await fetch(`${API_BASE_URL}/debt/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest debt: ${response.status}`);
  }
  return response.json();
}

/**
 * Hook to fetch historical national debt data
 */
export function useDebtHistory(days: number = 365): UseDataResult<DebtResponse> {
  return useAsyncData(() => fetchDebt(days), [days]);
}

/**
 * Hook to fetch the latest debt figure
 */
export function useLatestDebt(): UseDataResult<LatestDebtResponse> {
  return useAsyncData(() => fetchLatestDebt());
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
