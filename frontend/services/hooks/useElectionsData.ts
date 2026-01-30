'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Candidate {
  name: string;
  party: string;
  office: string;
  state: string;
  receipts: number;
  disbursements: number;
}

interface CandidateTotalsResponse {
  source: string;
  cycle: number;
  fetched_at: string;
  data: Candidate[];
}

interface StatePopulation {
  state: string;
  population: number;
  fips: string;
}

interface PopulationResponse {
  source: string;
  year: number;
  fetched_at: string;
  data: StatePopulation[];
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

async function fetchCandidates(cycle?: number): Promise<CandidateTotalsResponse> {
  const url = cycle 
    ? `${API_BASE_URL}/elections/candidates?cycle=${cycle}`
    : `${API_BASE_URL}/elections/candidates`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.status}`);
  }
  return response.json();
}

async function fetchPopulation(year?: number): Promise<PopulationResponse> {
  const url = year
    ? `${API_BASE_URL}/elections/population?year=${year}`
    : `${API_BASE_URL}/elections/population`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch population: ${response.status}`);
  }
  return response.json();
}

/**
 * Hook to fetch candidate fundraising data from FEC
 */
export function useCandidates(cycle?: number): UseDataResult<CandidateTotalsResponse> {
  return useAsyncData(() => fetchCandidates(cycle), [cycle]);
}

/**
 * Hook to fetch state population data
 */
export function usePopulation(year?: number): UseDataResult<PopulationResponse> {
  return useAsyncData(() => fetchPopulation(year), [year]);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Get party color class
 */
export function getPartyColor(party: string): string {
  switch (party?.toUpperCase()) {
    case 'DEM':
    case 'DEMOCRAT':
    case 'DEMOCRATIC':
      return 'bg-blue-100 text-blue-700';
    case 'REP':
    case 'REPUBLICAN':
      return 'bg-red-100 text-red-700';
    case 'LIB':
    case 'LIBERTARIAN':
      return 'bg-yellow-100 text-yellow-700';
    case 'GRE':
    case 'GREEN':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export type { Candidate, CandidateTotalsResponse, StatePopulation, PopulationResponse };
