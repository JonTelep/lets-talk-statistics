'use client';

import { useState, useEffect } from 'react';
import { 
  EducationResponse,
  EducationOverview,
  EnrollmentData,
  SpendingData,
  OutcomesData,
  formatEducationNumber,
  formatEnrollmentNumber,
  formatCompletionRate,
  formatTuition
} from '../../types/education';

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
  }, [...deps, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { data, loading, error, refetch };
}

// Education Overview Hook
export function useEducationOverview(): UseDataResult<EducationOverview> {
  return useAsyncData(async () => {
    const response = await fetch(`${API_BASE_URL}/education/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch education overview: ${response.statusText}`);
    }
    const result: EducationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Education API returned unsuccessful response');
    }
    
    return result.data as EducationOverview;
  });
}

// Enrollment Data Hook
export function useEducationEnrollment(years: number = 5): UseDataResult<EnrollmentData> {
  return useAsyncData(async () => {
    const response = await fetch(`${API_BASE_URL}/education/enrollment?years=${years}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch enrollment data: ${response.statusText}`);
    }
    const result: EducationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Enrollment API returned unsuccessful response');
    }
    
    return result.data as EnrollmentData;
  }, [years]);
}

// Spending Data Hook
export function useEducationSpending(): UseDataResult<SpendingData> {
  return useAsyncData(async () => {
    const response = await fetch(`${API_BASE_URL}/education/spending`);
    if (!response.ok) {
      throw new Error(`Failed to fetch spending data: ${response.statusText}`);
    }
    const result: EducationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Spending API returned unsuccessful response');
    }
    
    return result.data as SpendingData;
  });
}

// Outcomes Data Hook
export function useEducationOutcomes(): UseDataResult<OutcomesData> {
  return useAsyncData(async () => {
    const response = await fetch(`${API_BASE_URL}/education/outcomes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch outcomes data: ${response.statusText}`);
    }
    const result: EducationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Outcomes API returned unsuccessful response');
    }
    
    return result.data as OutcomesData;
  });
}

// Raw Data Hook (for debugging/admin)
export function useEducationRaw(endpoint: 'overview' | 'enrollment' | 'spending' | 'outcomes' = 'overview'): UseDataResult<any> {
  return useAsyncData(async () => {
    const endpointMap = {
      'overview': '/education/',
      'enrollment': '/education/enrollment',
      'spending': '/education/spending',
      'outcomes': '/education/outcomes'
    };
    
    const response = await fetch(`${API_BASE_URL}${endpointMap[endpoint]}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch raw ${endpoint} data: ${response.statusText}`);
    }
    return response.json();
  }, [endpoint]);
}

// Export utility functions
export { 
  formatEducationNumber,
  formatEnrollmentNumber, 
  formatCompletionRate,
  formatTuition 
};