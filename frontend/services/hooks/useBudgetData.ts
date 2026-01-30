'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Treasury MTS Table 5 record structure (simplified)
interface MTSRecord {
  record_date: string;
  record_fiscal_year: string;
  record_fiscal_quarter: string;
  record_calendar_month: string;
  classification_desc: string;
  current_month_gross_outly_amt: string;
  current_month_gross_rcpt_amt: string;
  current_fytd_gross_outly_amt: string;
  current_fytd_gross_rcpt_amt: string;
  prior_fytd_gross_outly_amt: string;
  prior_fytd_gross_rcpt_amt: string;
}

interface BudgetResponse {
  source: string;
  fiscal_year: number;
  fetched_at: string;
  data: MTSRecord[];
}

// Processed budget summary for display
interface BudgetSummary {
  fiscalYear: number;
  totalOutlays: number;
  totalReceipts: number;
  deficit: number;
  source: string;
  fetchedAt: string;
  byClassification: Array<{
    classification: string;
    outlays: number;
    receipts: number;
  }>;
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

async function fetchBudget(fiscalYear?: number): Promise<BudgetResponse> {
  const url = fiscalYear
    ? `${API_BASE_URL}/budget/?fiscal_year=${fiscalYear}`
    : `${API_BASE_URL}/budget/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch budget: ${response.status}`);
  }
  return response.json();
}

/**
 * Hook to fetch raw budget data from Treasury
 */
export function useBudgetRaw(fiscalYear?: number): UseDataResult<BudgetResponse> {
  return useAsyncData(() => fetchBudget(fiscalYear), [fiscalYear]);
}

/**
 * Process raw MTS data into a summary
 */
export function processBudgetData(response: BudgetResponse): BudgetSummary | null {
  if (!response?.data || response.data.length === 0) {
    return null;
  }

  // Get the most recent records (latest month)
  const sortedData = [...response.data].sort(
    (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
  );
  
  // Get records from the latest date
  const latestDate = sortedData[0]?.record_date;
  const latestRecords = sortedData.filter(r => r.record_date === latestDate);
  
  // Aggregate by classification
  const byClassification: Map<string, { outlays: number; receipts: number }> = new Map();
  let totalOutlays = 0;
  let totalReceipts = 0;
  
  for (const record of latestRecords) {
    const classification = record.classification_desc || 'Unknown';
    const outlays = parseFloat(record.current_fytd_gross_outly_amt) || 0;
    const receipts = parseFloat(record.current_fytd_gross_rcpt_amt) || 0;
    
    // Skip total rows to avoid double counting
    if (classification.toLowerCase().includes('total')) {
      // Use total row for overall totals
      if (classification.toLowerCase() === 'total') {
        totalOutlays = outlays;
        totalReceipts = receipts;
      }
      continue;
    }
    
    const existing = byClassification.get(classification) || { outlays: 0, receipts: 0 };
    byClassification.set(classification, {
      outlays: existing.outlays + outlays,
      receipts: existing.receipts + receipts,
    });
  }
  
  // If we didn't find a total row, sum everything
  if (totalOutlays === 0) {
    for (const { outlays } of byClassification.values()) {
      totalOutlays += outlays;
    }
  }
  if (totalReceipts === 0) {
    for (const { receipts } of byClassification.values()) {
      totalReceipts += receipts;
    }
  }
  
  return {
    fiscalYear: response.fiscal_year,
    totalOutlays: totalOutlays / 1_000_000, // Convert to millions
    totalReceipts: totalReceipts / 1_000_000,
    deficit: (totalOutlays - totalReceipts) / 1_000_000,
    source: response.source,
    fetchedAt: response.fetched_at,
    byClassification: Array.from(byClassification.entries())
      .map(([classification, { outlays, receipts }]) => ({
        classification,
        outlays: outlays / 1_000_000,
        receipts: receipts / 1_000_000,
      }))
      .sort((a, b) => b.outlays - a.outlays)
      .slice(0, 10), // Top 10
  };
}

/**
 * Hook that fetches and processes budget data
 */
export function useBudgetSummary(fiscalYear?: number): UseDataResult<BudgetSummary> {
  const { data: rawData, loading, error, refetch } = useBudgetRaw(fiscalYear);
  
  const processedData = rawData ? processBudgetData(rawData) : null;
  
  return { data: processedData, loading, error, refetch };
}

/**
 * Format large numbers for display
 */
export function formatBudgetNumber(millions: number): string {
  const trillions = millions / 1_000_000;
  if (Math.abs(trillions) >= 1) {
    return `$${trillions.toFixed(2)}T`;
  }
  const billions = millions / 1_000;
  if (Math.abs(billions) >= 1) {
    return `$${billions.toFixed(0)}B`;
  }
  return `$${millions.toFixed(0)}M`;
}

export type { BudgetResponse, BudgetSummary, MTSRecord };
