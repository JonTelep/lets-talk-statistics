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

function HealthcarePageContent() {
  const { data: healthcareData, loading, error, refetch } = useHealthcareSummary();
  
  const totalSpending = healthcareData?.totalSpending;
  const providerCount = healthcareData?.providerCount;
  const avgSpending = healthcareData?.avgSpendingPerProvider;
  const year = healthcareData?.year;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Healthcare Spending</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">Healthcare Data</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Track U.S. healthcare spending through Medicaid provider payments, hospital utilization, and state-by-state healthcare patterns.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Source:</strong> U.S. Department of Health &amp; Human Services via Medicaid.gov Open Data.
            {healthcareData && <span className="ml-1 text-green-400"> Fetched: {new Date(healthcareData.fetchedAt).toLocaleString()}</span>}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-medium text-foreground">
            {year ? `${year}` : 'Healthcare'} Overview
          </h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-surface-500" />}
        </div>

        {error ? (
          <ErrorState message="Failed to load healthcare data" onRetry={refetch} className="mb-8" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    Total Spending
                  </div>
                  <p className="text-2xl font-semibold text-green-400">
                    {totalSpending !== null && totalSpending !== undefined ? formatHealthcareNumber(totalSpending) : '—'}
                  </p>
                  <p className="text-xs text-surface-600">Medicaid payments</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Providers
                  </div>
                  <p className="text-2xl font-semibold text-blue-400">
                    {providerCount ? providerCount.toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-surface-600">Healthcare facilities</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    Avg per Provider
                  </div>
                  <p className="text-2xl font-semibold text-purple-400">
                    {avgSpending !== null && avgSpending !== undefined ? formatHealthcareNumber(avgSpending) : '—'}
                  </p>
                  <p className="text-xs text-surface-600">Average spending</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    Data Status
                  </div>
                  {healthcareData ? (
                    <>
                      <p className="text-2xl font-semibold text-foreground">{year}</p>
                      <p className="text-xs text-green-400">✓ Live from Medicaid.gov</p>
                    </>
                  ) : (
                    <p className="text-2xl font-semibold text-surface-600">—</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts */}
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : healthcareData && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Spending Trends */}
            <div className="card p-6">
              <h3 className="text-base font-medium text-foreground mb-4">Healthcare Spending Trends</h3>
              {healthcareData.trends && healthcareData.trends.length > 0 ? (
                <LazyLineChart data={healthcareData.trends} height={280} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <LazyCartesianGrid {...chartGridStyle} />
                  <LazyXAxis dataKey="year" {...chartAxisStyle} />
                  <LazyYAxis {...chartAxisStyle} tickFormatter={(v) => formatHealthcareNumber(v)} />
                  <LazyTooltip 
                    contentStyle={chartTooltipStyle} 
                    formatter={(value: any, name: any) => [formatHealthcareNumber(Number(value)), name === 'totalSpending' ? 'Total Spending' : String(name)]}
                  />
                  <LazyLine 
                    type="monotone" 
                    dataKey="totalSpending" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LazyLineChart>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-surface-500">
                  <p>Trend data not available</p>
                </div>
              )}
            </div>

            {/* Provider Types Breakdown */}
            <div className="card p-6">
              <h3 className="text-base font-medium text-foreground mb-4">Provider Type Distribution</h3>
              {healthcareData.byProviderType && healthcareData.byProviderType.length > 0 ? (
                <LazyPieChart height={280}>
                  <LazyPie 
                    data={healthcareData.byProviderType.slice(0, 5).map(type => ({
                      name: type.providerType.length > 15 ? type.providerType.substring(0, 15) + '...' : type.providerType,
                      fullName: type.providerType,
                      value: type.totalSpending,
                      count: type.count
                    }))} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={2} 
                    dataKey="value" 
                    label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {healthcareData.byProviderType.slice(0, 5).map((_, idx) => (
                      <LazyCell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </LazyPie>
                  <LazyTooltip 
                    contentStyle={chartTooltipStyle} 
                    formatter={(value: any, name: any, props: any) => [
                      formatHealthcareNumber(Number(value)), 
                      props?.payload?.fullName || String(name)
                    ]}
                  />
                </LazyPieChart>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-surface-500">
                  <p>Provider type data not available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* State-by-state breakdown */}
        {loading ? (
          <div className="card mb-8">
            <div className="px-6 py-4 border-b border-border">
              <Skeleton className="h-5 w-56" />
            </div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        ) : healthcareData?.byState && healthcareData.byState.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-surface-500" />
              Top States by Healthcare Spending
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Total Spending</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Providers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Avg per Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {healthcareData.byState.map((state, idx) => (
                    <tr key={state.state} className={idx % 2 === 0 ? 'bg-surface-900/50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        <span className="inline-flex items-center gap-2">
                          {state.stateName}
                          <span className="text-xs text-surface-500 font-mono">({state.state})</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-green-400 font-mono">
                        {formatHealthcareNumber(state.totalSpending)}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-300">
                        {state.providerCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                        {formatHealthcareNumber(state.avgSpendingPerProvider)}
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-400 font-mono">
                        {formatPercentage(state.medicaidUtilization)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Providers */}
        {loading ? (
          <div className="card mb-8">
            <div className="px-6 py-4 border-b border-border">
              <Skeleton className="h-5 w-48" />
            </div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        ) : healthcareData?.topProviders && healthcareData.topProviders.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-surface-500" />
              Top Healthcare Providers by Spending
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Medicaid Payments</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Total Costs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {healthcareData.topProviders.slice(0, 10).map((provider, idx) => (
                    <tr key={`${provider.providerName}-${provider.state}`} className={idx % 2 === 0 ? 'bg-surface-900/50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground max-w-xs">
                        <div className="truncate" title={provider.providerName}>
                          {provider.providerName}
                        </div>
                        {provider.category && (
                          <div className="text-xs text-surface-500">{provider.category}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-300 font-mono">
                        {provider.state}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-400 font-mono">
                        {formatHealthcareNumber(provider.totalMedicaidPayments)}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                        {formatHealthcareNumber(provider.totalCosts)}
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-400 font-mono">
                        {formatPercentage(provider.medicaidUtilizationRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Sources & Download */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">About This Data</h3>
            <div className="space-y-3 text-sm text-surface-300">
              <p>Healthcare spending data comes from the U.S. Department of Health & Human Services via Medicaid.gov Open Data portal.</p>
              <p>This includes Disproportionate Share Hospital (DSH) payments, provider utilization rates, and state-level healthcare spending patterns.</p>
              <p className="text-xs text-surface-500">
                <strong>Coverage:</strong> All 50 states + DC, updated annually<br />
                <strong>Time period:</strong> 2016-present<br />
                <strong>Provider types:</strong> Hospitals, clinics, long-term care facilities
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Download Raw Data</h3>
            <div className="space-y-3">
              <DownloadRawData 
                endpoints={[{ 
                  label: 'Healthcare Data', 
                  url: `${API_URL}/healthcare/`, 
                  filename: 'healthcare_data.json' 
                }]}
              />
              <p className="text-xs text-surface-500">
                JSON format includes provider details, spending breakdowns, and metadata. 
                Perfect for researchers and policy analysts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthcarePage() {
  return (
    <ErrorBoundary>
      <HealthcarePageContent />
    </ErrorBoundary>
  );
}