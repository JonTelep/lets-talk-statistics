'use client';

import { useState, useEffect } from 'react';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface UnemploymentDataPoint {
  year: number;
  month: number;
  rate: number;
}

interface UnemploymentResponse {
  source: string;
  series: string;
  fetched_at: string;
  data: UnemploymentDataPoint[];
}

interface LatestUnemploymentResponse {
  year: number;
  month: number;
  rate: number;
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

async function fetchUnemployment(years: number): Promise<UnemploymentResponse> {
  const response = await fetch(`${API_BASE_URL}/employment/unemployment?years=${years}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch unemployment data: ${response.status}`);
  }
  return response.json();
}

async function fetchLatestUnemployment(): Promise<LatestUnemploymentResponse> {
  const response = await fetch(`${API_BASE_URL}/employment/unemployment/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest unemployment: ${response.status}`);
  }
  return response.json();
}

/**
 * Hook to fetch historical unemployment data
 */
export function useUnemploymentHistory(years: number = 5): UseDataResult<UnemploymentResponse> {
  return useAsyncData(() => fetchUnemployment(years), [years]);
}

/**
 * Hook to fetch the latest unemployment rate
 */
export function useLatestUnemployment(): UseDataResult<LatestUnemploymentResponse> {
  return useAsyncData(() => fetchLatestUnemployment());
}

/**
 * Format month number to month name
 */
export function formatMonth(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month - 1] || '';
}

/**
 * Format year and month to readable string
 */
export function formatPeriod(year: number, month: number): string {
  return `${formatMonth(month)} ${year}`;
}

/**
 * Calculate employment statistics from unemployment data
 */
export function calculateEmploymentStats(data: UnemploymentDataPoint[]) {
  if (!data || data.length === 0) return null;
  
  // Sort by date descending
  const sorted = [...data].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  const latest = sorted[0];
  const previous = sorted[1];
  
  // US labor force estimates (approximate, would need separate API)
  const LABOR_FORCE_MILLIONS = 167.3;
  const unemploymentRate = latest.rate;
  const unemployedMillions = (LABOR_FORCE_MILLIONS * unemploymentRate) / 100;
  const employedMillions = LABOR_FORCE_MILLIONS - unemployedMillions;
  
  // Calculate trend
  const trend = previous ? latest.rate - previous.rate : 0;
  
  return {
    unemploymentRate: latest.rate,
    period: formatPeriod(latest.year, latest.month),
    laborForceMillions: LABOR_FORCE_MILLIONS,
    employedMillions: employedMillions.toFixed(1),
    unemployedMillions: unemployedMillions.toFixed(1),
    trend: trend.toFixed(1),
    trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat',
  };
}

/**
 * Convert API data to monthly format for display
 */
export function formatMonthlyData(data: UnemploymentDataPoint[]): Array<{
  month: string;
  rate: number;
  year: number;
  monthNum: number;
}> {
  return [...data]
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    })
    .slice(0, 12)
    .map((point) => ({
      month: formatPeriod(point.year, point.month),
      rate: point.rate,
      year: point.year,
      monthNum: point.month,
    }));
}

export type { UnemploymentDataPoint, UnemploymentResponse, LatestUnemploymentResponse };
