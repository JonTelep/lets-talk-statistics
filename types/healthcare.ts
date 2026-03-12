// Healthcare data types for lets-talk-statistics frontend

// Healthcare filters for data requests
export interface HealthcareFilters {
  state?: string;
  year?: number;
  category?: string;
  limit?: number;
  offset?: number;
}

// DSH Payment Record structure from Medicaid.gov data
export interface DSHPaymentRecord {
  year: number;
  state: string;
  category: string;
  hospitalName: string;
  notes?: string;
  dshLimit100: number;
  dshLimit175: number;
  medicaidUtilizationRate: number;
  lowIncomeUtilizationRate: number;
  totalMedicaidPayments: number;
  totalCostOfCare: number;
  uncompensatedCareCosts: number;
  totalDshPayments: number;
  medicaidProviderNumber?: string;
  medicareProviderNumber?: string;
  totalHospitalCost: number;
  location?: string;
}

// Processed provider record for display
export interface MedicaidProviderRecord {
  providerName: string;
  medicareProviderNumber?: string;
  providerId?: string;
  state: string;
  location?: string;
  providerType: string;
  category?: string;
  totalMedicaidPayments: number;
  totalCosts: number;
  uncompensatedCare: number;
  medicaidUtilizationRate: number;
  lowIncomeUtilizationRate: number;
  reportingYear: number;
  notes?: string;
}

// State-level healthcare summary
export interface StateHealthcareData {
  state: string;
  stateName: string;
  totalSpending: number;
  providerCount: number;
  avgSpendingPerProvider: number;
  medicaidUtilization: number;
  year: number;
}

// Provider type aggregation
export interface ProviderTypeData {
  providerType: string;
  count: number;
  totalSpending: number;
  avgSpending: number;
  percentage: number;
}

// Healthcare trend data
export interface HealthcareTrendData {
  year: number;
  totalSpending: number;
  providerCount: number;
  avgSpending: number;
  growthRate?: number;
}

// Overview dashboard data
export interface HealthcareOverviewData {
  totalSpending: number;
  providerCount: number;
  stateData: StateHealthcareData[];
  providerTypes: ProviderTypeData[];
  trends: HealthcareTrendData[];
  topProviders: MedicaidProviderRecord[];
}

// Data source metadata
export interface HealthcareDataSource {
  name: string;
  description: string;
  url: string;
  downloadUrl?: string;
  lastUpdated: string;
  dataType: 'dsh' | 'drug_utilization' | 'provider_spending' | 'managed_care';
  coverage: {
    states: string[];
    years: number[];
    recordCount: number;
  };
}

// Error handling
export class HealthcareDataError extends Error {
  public readonly source: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    source: string = 'unknown',
    statusCode?: number
  ) {
    super(message);
    this.name = 'HealthcareDataError';
    this.source = source;
    this.statusCode = statusCode;
  }
}

// API Response types
export interface HealthcareResponse {
  source: string;
  data_type: string;
  fetched_at: string;
  data: DSHPaymentRecord[];
  metadata: {
    year_range: [number, number];
    record_count: number;
    states_covered: string[];
  };
}

export interface HealthcareSummary {
  year: number;
  totalSpending: number;
  providerCount: number;
  avgSpendingPerProvider: number;
  source: string;
  fetchedAt: string;
  byState: StateHealthcareData[];
  byProviderType: ProviderTypeData[];
  trends: HealthcareTrendData[];
  topProviders: MedicaidProviderRecord[];
}