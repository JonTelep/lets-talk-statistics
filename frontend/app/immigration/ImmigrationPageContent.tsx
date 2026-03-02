'use client';

import { Users, ArrowRight, ArrowLeft, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LazyLineChart, LazyLine, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip, LazyLegend,
} from '@/components/charts';
import {
  useImmigrationSummary,
  useImmigrationHistorical,
  useImmigrationCategories,
  useImmigrationCountries,
} from '@/services/hooks/useImmigrationData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import { GovernmentDataStructuredData } from '@/components/seo/StructuredData';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

export default function ImmigrationPageContent() {
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useImmigrationSummary();
  const { data: historicalData, loading: historicalLoading } = useImmigrationHistorical();
  const { data: categoriesData, loading: categoriesLoading } = useImmigrationCategories();
  const { data: countriesData, loading: countriesLoading } = useImmigrationCountries(10);
  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();

  const summary = summaryData?.summary;

  const formatLargeNumber = (num: number | undefined) => {
    if (!num) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (num: number | undefined) => {
    return num ? `${num.toFixed(1)}%` : '—';
  };

  return (
    <>
      <GovernmentDataStructuredData
        title="US Immigration Statistics Dashboard"
        description="Comprehensive immigration data including visa admissions, deportations, asylum cases, and historical immigration trends"
        url="https://letstalkstatistics.com/immigration"
        dataSource="US Department of Homeland Security"
      />
      
      <div className="min-h-screen">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Immigration Statistics</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">Immigration Data</h1>
            <p className="text-lg text-surface-500 max-w-2xl">
              Track U.S. immigration trends including legal admissions, deportations, asylum applications, and historical patterns.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="/immigration/trends" 
                className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                View Detailed Trends <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-mono text-surface-400 hover:text-primary underline"
              >
                About Data Sources
              </Link>
              <DownloadRawData endpoints={[{
                label: "Immigration Summary",
                url: "/api/v1/immigration/summary",
                filename: "immigration_summary.json"
              }]} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {summaryLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : summaryError ? (
                <div className="col-span-full">
                  <ErrorStateCompact 
                    message="Immigration Data Unavailable" 
                    onRetry={refetchSummary} 
                  />
                </div>
              ) : (
                <>
                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatLargeNumber(summary?.legal_admissions)}</p>
                        <p className="text-sm text-surface-500">Legal Admissions (Annual)</p>
                      </div>
                      <Users className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatLargeNumber(summary?.removals)}</p>
                        <p className="text-sm text-surface-500">Removals (Annual)</p>
                      </div>
                      <ArrowLeft className="h-8 w-8 text-red-600" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatLargeNumber(summary?.border_encounters)}</p>
                        <p className="text-sm text-surface-500">Border Encounters</p>
                      </div>
                      <Users className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{summary?.admission_to_removal_ratio || '—'}</p>
                        <p className="text-sm text-surface-500">Admission to Removal Ratio</p>
                      </div>
                      <ArrowRight className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Historical Trends Chart */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Historical Immigration Trends</h2>
              </div>

              <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                {historicalLoading ? (
                  <ChartSkeleton height={400} />
                ) : (
                  <ErrorBoundary>
                    <div className="h-96">
                      <LazyLineChart 
                        width="100%" 
                        height={360} 
                        data={historicalData?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <LazyCartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                        <LazyXAxis 
                          dataKey="year"
                          {...axisStyle}
                        />
                        <LazyYAxis 
                          tickFormatter={(value) => formatLargeNumber(value)}
                          {...axisStyle}
                        />
                        <LazyTooltip 
                          {...tooltipStyle}
                          formatter={(value: any, name: any) => [
                            formatLargeNumber(Number(value) || 0),
                            String(name).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          ]}
                          labelFormatter={(year) => `Year: ${year}`}
                        />
                        <LazyLegend />
                        <LazyLine 
                          type="monotone" 
                          dataKey="legal_permanent_residents" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Legal Permanent Residents"
                          dot={{ r: 3 }}
                        />
                        <LazyLine 
                          type="monotone" 
                          dataKey="temporary_admissions" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Temporary Admissions"
                          dot={{ r: 3 }}
                        />
                        <LazyLine 
                          type="monotone" 
                          dataKey="refugees_asylees" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Refugees & Asylees"
                          dot={{ r: 3 }}
                        />
                      </LazyLineChart>
                    </div>
                  </ErrorBoundary>
                )}
              </div>
            </div>

            {/* Categories and Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Immigration Categories */}
              <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-4">Top Immigration Categories</h3>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoriesData?.categories?.slice(0, 8).map((category: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-foreground">{category.name}</span>
                        <span className="text-sm font-mono text-surface-500">{formatLargeNumber(category.count)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Countries */}
              <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-4">Top Countries of Origin</h3>
                {countriesLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {countriesData?.countries?.slice(0, 8).map((country: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-foreground">{country.name}</span>
                        <span className="text-sm font-mono text-surface-500">{formatLargeNumber(country.admissions)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* More Immigration Pages */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-8">Explore More Immigration Data</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/immigration/trends"
                  className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <h3 className="text-lg font-medium text-foreground mb-2">Historical Trends</h3>
                  <p className="text-sm text-surface-500 mb-4">
                    Deep dive into immigration patterns over the past decades
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    View Trends <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Data Sources & Notes</p>
                  <p className="text-sm text-surface-600 mb-3">
                    Immigration statistics are compiled from U.S. Citizenship and Immigration Services (USCIS), 
                    Immigration and Customs Enforcement (ICE), and Customs and Border Protection (CBP). 
                    Data includes legal admissions, removals, asylum cases, and naturalization statistics.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-surface-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: {summaryData?.fetched_at || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Source: DHS</span>
                    </div>
                    <button 
                      onClick={refetchSummary} 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}