'use client';

import { Heart, TrendingUp, TrendingDown, AlertTriangle, Calendar, Building2, RefreshCw, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import {
  LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyPieChart, LazyPie, LazyCell, LazyLineChart, LazyLine, LazyResponsiveContainer
} from '@/components/charts';
import { chartTooltipStyle, chartAxisStyle, chartGridStyle, PIE_COLORS } from '@/components/charts/theme';
import { useHealthcareSummary, formatHealthcareNumber, formatPercentage } from '@/services/hooks/useHealthcareData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

export default function HealthcarePageContent() {
  const { data: healthcareData, loading, error, refetch } = useHealthcareSummary();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Data Unavailable" message={error?.toString() || 'Unknown error'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-red-500" />
            <p className="text-xs font-mono text-surface-600 uppercase tracking-wider">Healthcare Statistics</p>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-4">
            US Healthcare Data
          </h1>
          <p className="text-lg text-surface-500 max-w-3xl mb-8 leading-relaxed">
            Comprehensive healthcare spending, coverage, and outcomes data from CMS, CDC, and other federal health agencies.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : healthcareData ? (
              <>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-xs text-surface-600 font-mono">TOTAL SPENDING</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    ${formatHealthcareNumber(healthcareData.total_spending_billions)}B
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    {formatPercentage(healthcareData.gdp_percentage)}% of GDP
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-surface-600 font-mono">INSURED</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatPercentage(healthcareData.insured_percentage)}%
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    {formatHealthcareNumber(healthcareData.insured_count_millions)}M people
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    <span className="text-xs text-surface-600 font-mono">MEDICARE</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatHealthcareNumber(healthcareData.medicare_enrollees_millions)}M
                  </div>
                  <div className="text-xs text-surface-500 mt-1">Enrollees</div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-xs text-surface-600 font-mono">MEDICAID</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatHealthcareNumber(healthcareData.medicaid_enrollees_millions)}M
                  </div>
                  <div className="text-xs text-surface-500 mt-1">Enrollees</div>
                </div>
              </>
            ) : null}
          </div>

          {/* Data source note */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-surface-600" />
              <span className="text-sm text-surface-500">
                Last updated: {healthcareData?.last_updated || 'Loading...'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {healthcareData && (
                <DownloadRawData
                  endpoint="/api/v1/healthcare/summary"
                  filename="healthcare_summary.json"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}