/**
 * API Client for Let's Talk Statistics backend
 * 
 * Base URL defaults to localhost:8000 in development,
 * can be overridden via NEXT_PUBLIC_API_URL environment variable.
 * The /api/v1 prefix is always appended automatically.
 */

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================================================
// IMMIGRATION API
// ============================================================================

export interface ImmigrationSummary {
  source: string;
  fetched_at: string;
  fiscal_year: number;
  summary: {
    legal_admissions: number;
    removals: number;
    border_encounters: number;
    admission_to_removal_ratio: string;
    net_legal_migration: number;
  };
  labels: {
    legal_admissions: string;
    removals: string;
    border_encounters: string;
  };
}

export interface ImmigrationHistorical {
  source: string;
  note: string;
  fetched_at: string;
  data: Array<{
    fiscal_year: number;
    legal_admissions: number;
    removals: number;
    border_encounters: number;
    source: string;
  }>;
  trends: {
    legal_admissions: { change: number; percent_change: number };
    removals: { change: number; percent_change: number };
    border_encounters: { change: number; percent_change: number };
  } | null;
  latest: {
    fiscal_year: number;
    legal_admissions: number;
    removals: number;
    border_encounters: number;
  } | null;
}

export interface ImmigrationCategory {
  source: string;
  fetched_at: string;
  fiscal_year: number;
  categories: Array<{
    category: string;
    count: number;
    percent: number;
  }>;
  total: number;
}

export interface SourceCountry {
  country: string;
  admissions: number;
  percentage: number;
}

export interface ImmigrationCountries {
  source: string;
  fetched_at: string;
  fiscal_year: number;
  countries: SourceCountry[];
  total_countries_in_data: number;
}

export const immigrationApi = {
  /**
   * Get immigration overview with summary, categories, and top countries
   */
  getOverview: () => apiFetch<{
    status: string;
    summary: ImmigrationSummary;
    categories: ImmigrationCategory;
    top_countries: ImmigrationCountries;
    data_sources: Array<{ name: string; url: string; coverage: string }>;
  }>('/immigration/'),

  /**
   * Get summary statistics for the latest available year
   */
  getSummary: () => apiFetch<ImmigrationSummary>('/immigration/summary'),

  /**
   * Get historical enforcement data
   */
  getHistorical: (startYear?: number, endYear?: number) =>
    apiFetch<ImmigrationHistorical>('/immigration/historical', {
      params: { start_year: startYear, end_year: endYear },
    }),

  /**
   * Get immigration breakdown by category
   */
  getCategories: () => apiFetch<ImmigrationCategory>('/immigration/categories'),

  /**
   * Get top source countries
   */
  getCountries: (limit?: number) =>
    apiFetch<ImmigrationCountries>('/immigration/countries', {
      params: { limit },
    }),
};

// ============================================================================
// DEBT API
// ============================================================================

export interface DebtData {
  source: string;
  fetched_at: string;
  data: Array<{
    date: string;
    total_debt: number;
  }>;
}

export const debtApi = {
  /**
   * Get national debt history
   */
  getDebt: (days?: number) =>
    apiFetch<DebtData>('/debt/', { params: { days } }),

  /**
   * Get latest debt figure
   */
  getLatest: () => apiFetch<{ date: string; total_debt: number }>('/debt/latest'),
};

// ============================================================================
// EMPLOYMENT API
// ============================================================================

export interface UnemploymentData {
  source: string;
  series: string;
  fetched_at: string;
  data: Array<{
    year: number;
    month: number;
    rate: number;
  }>;
}

export const employmentApi = {
  /**
   * Get unemployment rate history
   */
  getUnemployment: (years?: number) =>
    apiFetch<UnemploymentData>('/employment/unemployment', { params: { years } }),
};

// ============================================================================
// ELECTIONS API  
// ============================================================================

export interface CandidateTotals {
  source: string;
  cycle: number;
  fetched_at: string;
  data: Array<{
    name: string;
    party: string;
    office: string;
    state: string;
    receipts: number;
    disbursements: number;
  }>;
}

export interface PopulationData {
  source: string;
  year: number;
  fetched_at: string;
  data: Array<{
    state: string;
    population: number;
    fips: string;
  }>;
}

export const electionsApi = {
  /**
   * Get candidate fundraising totals
   */
  getCandidates: (cycle?: number) =>
    apiFetch<CandidateTotals>('/elections/candidates', { params: { cycle } }),

  /**
   * Get state populations
   */
  getPopulation: (year?: number) =>
    apiFetch<PopulationData>('/elections/population', { params: { year } }),
};

// ============================================================================
// BUDGET API
// ============================================================================

export interface BudgetData {
  source: string;
  fiscal_year: number;
  fetched_at: string;
  data: unknown[]; // Treasury MTS data structure
}

export const budgetApi = {
  /**
   * Get federal budget data
   */
  getBudget: (fiscalYear?: number) =>
    apiFetch<BudgetData>('/budget/', { params: { fiscal_year: fiscalYear } }),
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthApi = {
  check: () => apiFetch<{ status: string; version: string }>('/health'),
};
