// Education data types for lets-talk-statistics frontend

// Education API response interfaces
export interface EducationResponse {
  success: boolean;
  data: any;
  metadata: {
    sources: string[];
    last_updated: string;
    coverage?: string;
    [key: string]: any;
  };
}

// Enrollment data structures
export interface EnrollmentData {
  total_enrollment: number;
  total_institutions: number;
  enrollment_by_state: StateEnrollment[];
  tuition_averages: {
    in_state: number;
    out_of_state: number;
  };
  largest_institutions: Institution[];
}

export interface StateEnrollment {
  state: string;
  enrollment: number;
}

export interface Institution {
  name: string;
  state: string;
  in_state: number;
  out_of_state: number;
  enrollment: number;
}

// Spending data structures
export interface SpendingData {
  federal_spending: {
    total: number;
    k12: number;
    higher_ed: number;
    other: number;
  };
  by_program: {
    [programName: string]: number;
  };
  trends: SpendingTrend[];
}

export interface SpendingTrend {
  year: number;
  spending: number;
}

// Outcomes data structures
export interface OutcomesData {
  average_completion_rate: number;
  median_earnings: number;
  top_performing_states: StatePerformance[];
  highest_completion_rates: InstitutionPerformance[];
  highest_earning_programs: InstitutionEarnings[];
  total_institutions_analyzed: number;
}

export interface StatePerformance {
  state: string;
  avg_completion_rate: number;
  avg_median_earnings: number;
  institution_count: number;
}

export interface InstitutionPerformance {
  name: string;
  state: string;
  completion_rate: number;
}

export interface InstitutionEarnings {
  name: string;
  state: string;
  median_earnings: number;
  completion_rate?: number;
}

// Combined overview data
export interface EducationOverview {
  enrollment: EnrollmentData;
  spending: SpendingData;
  outcomes: OutcomesData;
  summary: {
    total_higher_ed_enrollment: number;
    federal_education_spending: number;
    average_completion_rate: number;
    median_graduate_earnings: number;
  };
}

// Utility functions
export function formatEducationNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

export function formatEnrollmentNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toLocaleString();
  }
}

export function formatCompletionRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return 'N/A';
  }
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatTuition(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  return `$${amount.toLocaleString()}`;
}