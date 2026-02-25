'use client';

import { useState, useEffect } from 'react';
import { 
  HealthcareResponse, 
  HealthcareSummary, 
  DSHPaymentRecord,
  StateHealthcareData,
  ProviderTypeData,
  HealthcareTrendData,
  MedicaidProviderRecord
} from '../../types/healthcare';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

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

async function fetchHealthcare(year?: number): Promise<HealthcareResponse> {
  const url = year
    ? `${API_BASE_URL}/healthcare/?year=${year}`
    : `${API_BASE_URL}/healthcare/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch healthcare data: ${response.status}`);
  }
  return response.json();
}

/**
 * Hook to fetch raw healthcare data from Medicaid.gov
 */
export function useHealthcareRaw(year?: number): UseDataResult<HealthcareResponse> {
  return useAsyncData(() => fetchHealthcare(year), [year]);
}

/**
 * Process raw DSH data into a summary
 */
export function processHealthcareData(response: HealthcareResponse): HealthcareSummary | null {
  if (!response?.data || response.data.length === 0) {
    return null;
  }

  const data = response.data;
  
  // Calculate totals
  const totalSpending = data.reduce((sum, record) => sum + record.totalMedicaidPayments, 0);
  const providerCount = data.length;
  const avgSpendingPerProvider = totalSpending / providerCount;
  
  // Aggregate by state
  const stateMap = new Map<string, DSHPaymentRecord[]>();
  data.forEach(record => {
    if (!stateMap.has(record.state)) {
      stateMap.set(record.state, []);
    }
    stateMap.get(record.state)!.push(record);
  });
  
  const byState: StateHealthcareData[] = Array.from(stateMap.entries())
    .map(([state, records]) => {
      const stateSpending = records.reduce((sum, r) => sum + r.totalMedicaidPayments, 0);
      const avgUtilization = records.reduce((sum, r) => sum + r.medicaidUtilizationRate, 0) / records.length;
      
      return {
        state,
        stateName: getStateName(state),
        totalSpending: stateSpending,
        providerCount: records.length,
        avgSpendingPerProvider: stateSpending / records.length,
        medicaidUtilization: avgUtilization,
        year: Math.max(...records.map(r => r.year))
      };
    })
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 10); // Top 10 states
  
  // Aggregate by provider type (category)
  const typeMap = new Map<string, DSHPaymentRecord[]>();
  data.forEach(record => {
    const type = record.category || 'Unknown';
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(record);
  });
  
  const byProviderType: ProviderTypeData[] = Array.from(typeMap.entries())
    .map(([type, records]) => {
      const typeSpending = records.reduce((sum, r) => sum + r.totalMedicaidPayments, 0);
      
      return {
        providerType: type,
        count: records.length,
        totalSpending: typeSpending,
        avgSpending: typeSpending / records.length,
        percentage: (typeSpending / totalSpending) * 100
      };
    })
    .sort((a, b) => b.totalSpending - a.totalSpending);
  
  // Calculate trends by year
  const yearMap = new Map<number, DSHPaymentRecord[]>();
  data.forEach(record => {
    if (!yearMap.has(record.year)) {
      yearMap.set(record.year, []);
    }
    yearMap.get(record.year)!.push(record);
  });
  
  const trends: HealthcareTrendData[] = Array.from(yearMap.entries())
    .map(([year, records]) => {
      const yearSpending = records.reduce((sum, r) => sum + r.totalMedicaidPayments, 0);
      
      return {
        year,
        totalSpending: yearSpending,
        providerCount: records.length,
        avgSpending: yearSpending / records.length
      };
    })
    .sort((a, b) => a.year - b.year)
    .map((trend, index, trends) => ({
      ...trend,
      growthRate: index > 0 
        ? ((trend.totalSpending - trends[index - 1].totalSpending) / trends[index - 1].totalSpending) * 100 
        : undefined
    }));
  
  // Top providers
  const topProviders: MedicaidProviderRecord[] = data
    .sort((a, b) => b.totalMedicaidPayments - a.totalMedicaidPayments)
    .slice(0, 10)
    .map(record => ({
      providerName: record.hospitalName,
      medicareProviderNumber: record.medicareProviderNumber,
      providerId: record.medicaidProviderNumber,
      state: record.state,
      location: record.location,
      providerType: 'Hospital',
      category: record.category,
      totalMedicaidPayments: record.totalMedicaidPayments,
      totalCosts: record.totalCostOfCare,
      uncompensatedCare: record.uncompensatedCareCosts,
      medicaidUtilizationRate: record.medicaidUtilizationRate,
      lowIncomeUtilizationRate: record.lowIncomeUtilizationRate,
      reportingYear: record.year,
      notes: record.notes
    }));
  
  return {
    year: response.metadata?.year_range[1] || new Date().getFullYear() - 1,
    totalSpending: totalSpending / 1_000_000, // Convert to millions
    providerCount,
    avgSpendingPerProvider: avgSpendingPerProvider / 1_000_000,
    source: response.source,
    fetchedAt: response.fetched_at,
    byState: byState.map(state => ({
      ...state,
      totalSpending: state.totalSpending / 1_000_000,
      avgSpendingPerProvider: state.avgSpendingPerProvider / 1_000_000
    })),
    byProviderType: byProviderType.map(type => ({
      ...type,
      totalSpending: type.totalSpending / 1_000_000,
      avgSpending: type.avgSpending / 1_000_000
    })),
    trends: trends.map(trend => ({
      ...trend,
      totalSpending: trend.totalSpending / 1_000_000,
      avgSpending: trend.avgSpending / 1_000_000
    })),
    topProviders: topProviders.map(provider => ({
      ...provider,
      totalMedicaidPayments: provider.totalMedicaidPayments / 1_000_000,
      totalCosts: provider.totalCosts / 1_000_000,
      uncompensatedCare: provider.uncompensatedCare / 1_000_000
    }))
  };
}

/**
 * Hook that fetches and processes healthcare data
 */
export function useHealthcareSummary(year?: number): UseDataResult<HealthcareSummary> {
  const { data: rawData, loading, error, refetch } = useHealthcareRaw(year);
  
  const processedData = rawData ? processHealthcareData(rawData) : null;
  
  return { data: processedData, loading, error, refetch };
}

/**
 * Format healthcare spending numbers for display
 */
export function formatHealthcareNumber(millions: number): string {
  const billions = millions / 1_000;
  if (Math.abs(billions) >= 1) {
    return `$${billions.toFixed(1)}B`;
  }
  return `$${millions.toFixed(0)}M`;
}

/**
 * Format percentages for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get full state name from abbreviation
 */
function getStateName(abbreviation: string): string {
  const stateNames: { [key: string]: string } = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };
  return stateNames[abbreviation] || abbreviation;
}

export type { HealthcareResponse, HealthcareSummary, DSHPaymentRecord, StateHealthcareData, ProviderTypeData };