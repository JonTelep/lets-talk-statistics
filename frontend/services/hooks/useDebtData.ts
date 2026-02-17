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

// ============================================================================
// Deep Dive hooks
// ============================================================================

interface DebtHolder {
  name: string;
  amount_billions: number;
  percent: number;
}

interface HoldersResponse {
  holders: DebtHolder[];
  total_billions: number;
  as_of_date: string | null;
  source: string;
}

interface HoldersHistoryResponse {
  series: Record<string, Array<{ date: string; value: number }>>;
  units: string;
  source: string;
}

interface InterestAnnual {
  fiscal_year: number;
  total: number;
}

interface InterestMonthly {
  date: string;
  month: string;
  expense_type: string;
  amount: number;
}

interface InterestResponse {
  current_fy: number;
  annual: InterestAnnual[];
  monthly_current_fy: InterestMonthly[];
  source: string;
}

interface RateEntry {
  security_type: string;
  rate: number;
}

interface RatesResponse {
  rates: RateEntry[];
  as_of_date: string | null;
  source: string;
}

interface ForeignHolder {
  country: string;
  holdings_billions: number;
}

interface ForeignHoldersResponse {
  countries: ForeignHolder[];
  total_countries: number;
  source: string;
}

interface GdpRatioPoint {
  date: string;
  percent: number;
}

interface GdpRatioResponse {
  latest: { date: string | null; percent: number | null };
  history: GdpRatioPoint[];
  source: string;
}

export function useDebtHolders(): UseDataResult<HoldersResponse> {
  const { data, error, isLoading, mutate } = useSWR<HoldersResponse>(
    `${API_URL}/debt/holders`,
    fetcher
  );
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export function useDebtHoldersHistory(): UseDataResult<HoldersHistoryResponse> {
  const { data, error, isLoading, mutate } = useSWR<HoldersHistoryResponse>(
    `${API_URL}/debt/holders/history`,
    fetcher
  );
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export function useDebtInterest(fy?: number): UseDataResult<InterestResponse> {
  const url = fy ? `${API_URL}/debt/interest?fiscal_year=${fy}` : `${API_URL}/debt/interest`;
  const { data, error, isLoading, mutate } = useSWR<InterestResponse>(url, fetcher);
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export function useDebtRates(): UseDataResult<RatesResponse> {
  const { data, error, isLoading, mutate } = useSWR<RatesResponse>(
    `${API_URL}/debt/rates`,
    fetcher
  );
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export function useForeignHolders(): UseDataResult<ForeignHoldersResponse> {
  const { data, error, isLoading, mutate } = useSWR<ForeignHoldersResponse>(
    `${API_URL}/debt/foreign-holders`,
    fetcher
  );
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export function useDebtGdpRatio(): UseDataResult<GdpRatioResponse> {
  const { data, error, isLoading, mutate } = useSWR<GdpRatioResponse>(
    `${API_URL}/debt/gdp-ratio`,
    fetcher
  );
  return { data: data ?? null, loading: isLoading, error: error ?? null, refetch: () => mutate() };
}

export type {
  DebtDataPoint, DebtResponse, LatestDebtResponse,
  DebtHolder, HoldersResponse, HoldersHistoryResponse,
  InterestAnnual, InterestMonthly, InterestResponse,
  RateEntry, RatesResponse,
  ForeignHolder, ForeignHoldersResponse,
  GdpRatioPoint, GdpRatioResponse,
};
