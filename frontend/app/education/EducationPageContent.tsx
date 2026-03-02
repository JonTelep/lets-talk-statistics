'use client';

import { GraduationCap, TrendingUp, TrendingDown, AlertTriangle, Calendar, Building2, RefreshCw, Users, DollarSign, BookOpen } from 'lucide-react';
import Link from 'next/link';
import {
  LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyPieChart, LazyPie, LazyCell, LazyLineChart, LazyLine, LazyResponsiveContainer
} from '@/components/charts';
import { PIE_COLORS } from '@/components/charts/theme';
import { useChartTheme } from '@/hooks/useChartTheme';
import { useEducationOverview, formatEducationNumber, formatEnrollmentNumber, formatCompletionRate, formatTuition } from '@/services/hooks/useEducationData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { GovernmentDataStructuredData } from '@/components/seo/StructuredData';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

export default function EducationPageContent() {
  const { data: educationData, loading, error, refetch } = useEducationOverview();
  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();
  
  const enrollment = educationData?.enrollment;
  const spending = educationData?.spending;
  const outcomes = educationData?.outcomes;
  const summary = educationData?.summary;

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState 
          title="Education Data Unavailable" 
          message="Unable to load education statistics. The Department of Education API may be temporarily unavailable." 
          onRetry={refetch} 
        />
      </div>
    );
  }

  return (
    <>
      <GovernmentDataStructuredData
        title="US Education Statistics Dashboard"
        description="Comprehensive education data including enrollment trends, federal spending, graduation rates, and post-graduation outcomes"
        url="https://letstalkstatistics.com/education"
        dataSource="US Department of Education"
      />
      
      <div className="min-h-screen">
        {/* Hero */}
        <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Education Statistics</p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">Education Data</h1>
            <p className="text-lg text-surface-500 max-w-2xl">
              Track U.S. education metrics including enrollment, federal spending, graduation rates, and post-graduation outcomes across higher education institutions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                href="/about" 
                className="text-sm font-mono text-surface-400 hover:text-primary underline"
              >
                About Data Sources
              </Link>
              <DownloadRawData endpoints={[{ label: 'Education Overview', url: `${API_URL}/education/overview`, filename: 'education_overview.json' }]} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {loading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatEnrollmentNumber(summary?.total_higher_ed_enrollment)}</p>
                        <p className="text-sm text-surface-500">Total Enrollment</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatEducationNumber(summary?.federal_education_spending)}</p>
                        <p className="text-sm text-surface-500">Federal Funding</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatCompletionRate(summary?.average_completion_rate)}</p>
                        <p className="text-sm text-surface-500">Graduation Rate</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatTuition(summary?.median_graduate_earnings)}</p>
                        <p className="text-sm text-surface-500">Graduate Earnings</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Enrollment Trends */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Enrollment Trends</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Total Enrollment by Year</h3>
                  {loading ? (
                    <ChartSkeleton height={280} />
                  ) : (
                    <ErrorBoundary>
                      <LazyResponsiveContainer width="100%" height={280}>
                        <LazyLineChart data={[]}>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                          <LazyXAxis dataKey="year" {...axisStyle} />
                          <LazyYAxis tickFormatter={(value) => formatEnrollmentNumber(value)} {...axisStyle} />
                          <LazyTooltip 
                            {...tooltipStyle}
                            formatter={(value: any) => [formatEnrollmentNumber(value), 'Enrollment']}
                          />
                          <LazyLine 
                            type="monotone" 
                            dataKey="enrollment" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          />
                        </LazyLineChart>
                      </LazyResponsiveContainer>
                    </ErrorBoundary>
                  )}
                </div>

                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Enrollment by Institution Type</h3>
                  {loading ? (
                    <ChartSkeleton height={280} />
                  ) : (
                    <ErrorBoundary>
                      <LazyResponsiveContainer width="100%" height={280}>
                        <LazyPieChart>
                          <LazyPie
                            data={[]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="enrollment"
                          >
                            {[].map((entry: any, index: number) => (
                              <LazyCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </LazyPie>
                          <LazyTooltip 
                            {...tooltipStyle}
                            formatter={(value: any) => [formatEnrollmentNumber(value), 'Enrollment']}
                          />
                        </LazyPieChart>
                      </LazyResponsiveContainer>
                    </ErrorBoundary>
                  )}
                </div>
              </div>
            </div>

            {/* Federal Spending */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Federal Education Spending</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Spending by Program</h3>
                  {loading ? (
                    <ChartSkeleton height={300} />
                  ) : (
                    <ErrorBoundary>
                      <LazyResponsiveContainer width="100%" height={300}>
                        <LazyBarChart data={[]} layout="horizontal">
                          <LazyCartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                          <LazyXAxis type="number" tickFormatter={(value) => formatEducationNumber(value)} {...axisStyle} />
                          <LazyYAxis type="category" dataKey="program" {...axisStyle} />
                          <LazyTooltip 
                            {...tooltipStyle}
                            formatter={(value: any) => [formatEducationNumber(value), 'Spending']}
                          />
                          <LazyBar dataKey="amount" fill="#3b82f6" />
                        </LazyBarChart>
                      </LazyResponsiveContainer>
                    </ErrorBoundary>
                  )}
                </div>

                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Spending Trends</h3>
                  {loading ? (
                    <ChartSkeleton height={300} />
                  ) : (
                    <ErrorBoundary>
                      <LazyResponsiveContainer width="100%" height={300}>
                        <LazyLineChart data={[]}>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                          <LazyXAxis dataKey="year" {...axisStyle} />
                          <LazyYAxis tickFormatter={(value) => formatEducationNumber(value)} {...axisStyle} />
                          <LazyTooltip 
                            {...tooltipStyle}
                            formatter={(value: any) => [formatEducationNumber(value), 'Federal Spending']}
                          />
                          <LazyLine 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#059669" 
                            strokeWidth={3}
                            dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                          />
                        </LazyLineChart>
                      </LazyResponsiveContainer>
                    </ErrorBoundary>
                  )}
                </div>
              </div>
            </div>

            {/* Educational Outcomes */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Educational Outcomes</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Graduation Rates by Field</h3>
                  {loading ? (
                    <TableSkeleton rows={8} />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="text-left border-b border-surface-200 dark:border-surface-800">
                            <th className="text-sm font-medium text-surface-700 dark:text-surface-300 pb-3">Field</th>
                            <th className="text-sm font-medium text-surface-700 dark:text-surface-300 pb-3">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[].map((field: any, index: number) => (
                            <tr key={index} className="border-b border-surface-100 dark:border-surface-800">
                              <td className="py-3 text-sm text-foreground">{field.field}</td>
                              <td className="py-3 text-sm font-mono text-foreground">{formatCompletionRate(field.rate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-4">Employment After Graduation</h3>
                  {loading ? (
                    <ChartSkeleton height={300} />
                  ) : (
                    <ErrorBoundary>
                      <LazyResponsiveContainer width="100%" height={300}>
                        <LazyBarChart data={[]}>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                          <LazyXAxis dataKey="field" {...axisStyle} />
                          <LazyYAxis tickFormatter={(value) => `${value}%`} {...axisStyle} />
                          <LazyTooltip 
                            {...tooltipStyle}
                            formatter={(value: any) => [`${value}%`, 'Employment Rate']}
                          />
                          <LazyBar dataKey="employment_rate" fill="#10b981" />
                        </LazyBarChart>
                      </LazyResponsiveContainer>
                    </ErrorBoundary>
                  )}
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Data Sources & Methodology</p>
                  <p className="text-sm text-surface-600 mb-3">
                    Education statistics are compiled from the U.S. Department of Education, National Center for Education Statistics (NCES), 
                    and Integrated Postsecondary Education Data System (IPEDS). Data includes public and private institutions receiving federal funding.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-surface-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated: Recent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>Source: US Dept. of Education</span>
                    </div>
                    <button 
                      onClick={refetch} 
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