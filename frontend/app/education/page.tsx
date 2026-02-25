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

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

function EducationPageContent() {
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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Education Statistics</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">Education Data</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Track U.S. education metrics including enrollment, federal spending, graduation rates, and post-graduation outcomes across higher education institutions.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Source:</strong> U.S. Department of Education College Scorecard API and federal budget data.
            {educationData && <span className="ml-1 text-green-400"> Data current as of {new Date().toLocaleDateString()}</span>}
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="h-6 w-6 text-accent" />
                  <span className="text-xs font-mono text-surface-600 uppercase">Enrollment</span>
                </div>
                <div className="data-value">{formatEnrollmentNumber(summary?.total_higher_ed_enrollment)}</div>
                <div className="data-label">Higher Ed Students</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  <span className="text-xs font-mono text-surface-600 uppercase">Federal Spending</span>
                </div>
                <div className="data-value">{formatEducationNumber(summary?.federal_education_spending)}</div>
                <div className="data-label">Annual Budget</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                  <span className="text-xs font-mono text-surface-600 uppercase">Completion Rate</span>
                </div>
                <div className="data-value">{formatCompletionRate(summary?.average_completion_rate)}</div>
                <div className="data-label">Average Graduate Rate</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                  <span className="text-xs font-mono text-surface-600 uppercase">Graduate Earnings</span>
                </div>
                <div className="data-value">{formatEducationNumber(summary?.median_graduate_earnings)}</div>
                <div className="data-label">10 Years Post-Grad</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Federal Education Spending */}
          <div className="card p-6">
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Federal Education Spending</h3>
            {loading ? <ChartSkeleton height={280} /> : spending?.by_program ? (
              <LazyPieChart height={250}>
                <LazyPie 
                  data={Object.entries(spending.by_program).map(([name, value]) => ({ name, value }))} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={100} 
                  paddingAngle={2} 
                  dataKey="value"
                >
                  {Object.keys(spending.by_program).map((_, idx) => (
                    <LazyCell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </LazyPie>
                <LazyTooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value: any, name: any) => [formatEducationNumber(value), name]} 
                />
              </LazyPieChart>
            ) : <div className="h-[280px] flex items-center justify-center text-surface-600">No spending data available</div>}
          </div>

          {/* Top States by Enrollment */}
          <div className="card p-6">
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Top States by Higher Ed Enrollment</h3>
            {loading ? <ChartSkeleton height={280} /> : enrollment?.enrollment_by_state ? (
              <LazyBarChart 
                data={enrollment.enrollment_by_state.slice(0, 8)} 
                height={280} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <LazyCartesianGrid {...gridStyle} />
                <LazyXAxis type="number" {...axisStyle} />
                <LazyYAxis dataKey="state" type="category" {...axisStyle} width={50} />
                <LazyTooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value: any) => [formatEnrollmentNumber(value), 'Students']} 
                />
                <LazyBar dataKey="enrollment" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </LazyBarChart>
            ) : <div className="h-[280px] flex items-center justify-center text-surface-600">No enrollment data available</div>}
          </div>
        </div>

        {/* Spending Trends */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Federal Education Spending Trends</h3>
            {loading ? <ChartSkeleton height={300} /> : spending?.trends ? (
              <LazyLineChart 
                data={spending.trends} 
                height={300}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <LazyCartesianGrid {...gridStyle} />
                <LazyXAxis dataKey="year" {...axisStyle} />
                <LazyYAxis {...axisStyle} />
                <LazyTooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value: any) => [formatEducationNumber(value), 'Federal Spending']} 
                />
                <LazyLine 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LazyLineChart>
            ) : <div className="h-[300px] flex items-center justify-center text-surface-600">No trends data available</div>}
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing States */}
          <div className="card">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Top Performing States</h2>
              <p className="text-sm text-surface-600 mt-1">By graduation rate and post-graduation earnings</p>
            </div>
            <div className="overflow-x-auto">
              {loading ? <TableSkeleton rows={8} columns={4} /> : outcomes?.top_performing_states ? (
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">State</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Grad Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Earnings</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Schools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {outcomes.top_performing_states.slice(0, 8).map((state, idx) => (
                      <tr key={state.state} className="hover:bg-surface-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold mr-3">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{state.state}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                          {formatCompletionRate(state.avg_completion_rate)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-mono text-green-400">
                          {formatEducationNumber(state.avg_median_earnings)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-surface-400">
                          {state.institution_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-surface-600">No performance data available</div>
              )}
            </div>
          </div>

          {/* Highest Earning Programs */}
          <div className="card">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Highest Earning Programs</h2>
              <p className="text-sm text-surface-600 mt-1">10 years post-graduation median earnings</p>
            </div>
            <div className="overflow-x-auto">
              {loading ? <TableSkeleton rows={8} columns={3} /> : outcomes?.highest_earning_programs ? (
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Institution</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">State</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {outcomes.highest_earning_programs.slice(0, 8).map((program, idx) => (
                      <tr key={`${program.name}-${idx}`} className="hover:bg-surface-800/50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }} title={program.name}>
                            {program.name.length > 40 ? program.name.substring(0, 40) + '...' : program.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-400">{program.state}</td>
                        <td className="px-4 py-3 text-right text-sm font-mono text-green-400">
                          {formatEducationNumber(program.median_earnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-surface-600">No earnings data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info and Sources */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                About This Data
              </h3>
              <div className="prose prose-sm text-surface-400 space-y-3">
                <p>
                  Education data is sourced from the U.S. Department of Education's College Scorecard, which provides 
                  comprehensive information on higher education institutions including enrollment, costs, graduation rates, 
                  and post-graduation earnings.
                </p>
                <p>
                  Federal spending data represents Department of Education budget allocations across major programs 
                  including Title I (K-12), IDEA (special education), Pell Grants (higher education), and Head Start (early childhood).
                </p>
                <p>
                  <strong>Coverage:</strong> Higher education data is comprehensive. K-12 data is limited to federal programs 
                  and does not include state and local education funding, which represents the majority of K-12 spending.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-medium mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-400" />
              Data Sources
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <a href="https://collegescorecard.ed.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">College Scorecard</a>
                  <p className="text-xs text-surface-600">collegescorecard.ed.gov</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <a href="https://www2.ed.gov/about/overview/budget/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Department of Education Budget</a>
                  <p className="text-xs text-surface-600">ed.gov/budget</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <a href="https://nces.ed.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">National Center for Education Statistics</a>
                  <p className="text-xs text-surface-600">nces.ed.gov</p>
                </div>
              </div>
            </div>

            <DownloadRawData endpoints={[
              { label: 'Education Overview', url: `${API_URL}/education/`, filename: 'education_overview.json' },
              { label: 'Enrollment Data', url: `${API_URL}/education/enrollment`, filename: 'education_enrollment.json' },
              { label: 'Spending Data', url: `${API_URL}/education/spending`, filename: 'education_spending.json' },
              { label: 'Outcomes Data', url: `${API_URL}/education/outcomes`, filename: 'education_outcomes.json' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  return <ErrorBoundary><EducationPageContent /></ErrorBoundary>;
}