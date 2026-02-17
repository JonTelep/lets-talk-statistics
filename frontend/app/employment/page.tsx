'use client';

import { Briefcase, TrendingUp, TrendingDown, Users, Building2, AlertTriangle, RefreshCw, Minus } from 'lucide-react';
import {
  LazyLineChart, LazyLine, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyBarChart, LazyBar,
} from '@/components/charts';
import { chartTooltipStyle, chartAxisStyle, chartGridStyle } from '@/components/charts/theme';
import { useUnemploymentHistory, calculateEmploymentStats, formatMonthlyData } from '@/services/hooks/useEmploymentData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

const stateData = [
  { state: 'North Dakota', rate: 2.0, rank: 1 },
  { state: 'South Dakota', rate: 2.1, rank: 2 },
  { state: 'Nebraska', rate: 2.5, rank: 3 },
  { state: 'Vermont', rate: 2.6, rank: 4 },
  { state: 'New Hampshire', rate: 2.7, rank: 5 },
  { state: '...', rate: null, rank: null },
  { state: 'Nevada', rate: 5.7, rank: 46 },
  { state: 'California', rate: 5.4, rank: 47 },
  { state: 'District of Columbia', rate: 5.6, rank: 48 },
];

const sectorJobs = [
  { sector: 'Healthcare', jobs: 62000, fullName: 'Healthcare & Social Assistance' },
  { sector: 'Government', jobs: 33000, fullName: 'Government' },
  { sector: 'Leisure', jobs: 43000, fullName: 'Leisure & Hospitality' },
  { sector: 'Professional', jobs: 28000, fullName: 'Professional & Business Services' },
  { sector: 'Retail', jobs: 43000, fullName: 'Retail Trade' },
  { sector: 'Construction', jobs: 8000, fullName: 'Construction' },
];

const demographics = [
  { group: 'Adult Men (20+)', rate: 3.8 },
  { group: 'Adult Women (20+)', rate: 3.7 },
  { group: 'Teenagers (16-19)', rate: 12.1 },
  { group: 'White', rate: 3.6 },
  { group: 'Black or African American', rate: 6.1 },
  { group: 'Asian', rate: 3.7 },
  { group: 'Hispanic or Latino', rate: 4.9 },
];

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'up') return <TrendingUp className="h-4 w-4 text-red-400" />;
  if (direction === 'down') return <TrendingDown className="h-4 w-4 text-green-400" />;
  return <Minus className="h-4 w-4 text-surface-600" />;
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}

function EmploymentPageContent() {
  const { data: unemploymentData, loading, error, refetch } = useUnemploymentHistory(2);
  const stats = unemploymentData ? calculateEmploymentStats(unemploymentData.data) : null;
  const monthlyData = unemploymentData ? formatMonthlyData(unemploymentData.data) : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Employment Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">Labor Statistics</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Comprehensive employment data from Bureau of Labor Statistics. Real-time unemployment rates, 
            job growth analysis, and demographic breakdowns.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Source:</strong> BLS Employment Situation Report. Seasonally adjusted.
            {stats && <span className="ml-1">Last: {stats.period}.</span>}
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : error ? (
            <div className="col-span-4 card p-6 text-center">
              <ErrorStateCompact message="Failed to load employment data" onRetry={refetch} />
            </div>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Users className="h-4 w-4" />Unemployment</div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-foreground">{stats?.unemploymentRate}%</p>
                  {stats && <TrendIcon direction={stats.trendDirection} />}
                </div>
                <p className="text-xs text-green-400 mt-1">✓ Live from BLS</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Building2 className="h-4 w-4" />Labor Force</div>
                <p className="text-2xl font-semibold text-foreground">{stats?.laborForceMillions || '—'}M</p>
                <p className="text-xs text-surface-600">Civilian labor force</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Briefcase className="h-4 w-4" />Employed</div>
                <p className="text-2xl font-semibold text-green-400">{stats?.employedMillions || '—'}M</p>
                <p className="text-xs text-surface-600">Currently working</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Users className="h-4 w-4" />Unemployed</div>
                <p className="text-2xl font-semibold text-red-400">{stats?.unemployedMillions || '—'}M</p>
                <p className="text-xs text-surface-600">Seeking work</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-6">
          <h2 className="text-base font-medium text-foreground mb-4">Unemployment Rate Trend</h2>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : error ? (
            <ErrorStateCompact message="Failed to load chart" onRetry={refetch} />
          ) : monthlyData.length > 0 ? (
            <LazyLineChart data={[...monthlyData].reverse()} height={300} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <LazyCartesianGrid {...chartGridStyle} />
              <LazyXAxis dataKey="month" {...chartAxisStyle} interval="preserveStartEnd" tickFormatter={(v) => { const p = v.split(' '); return p[0].substring(0, 3) + ' ' + p[1]?.substring(2); }} />
              <LazyYAxis {...chartAxisStyle} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(v) => `${v}%`} />
              <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`${v}%`, 'Unemployment Rate']} />
              <LazyLine type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#3b82f6' }} />
            </LazyLineChart>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Monthly Table */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border"><h2 className="text-base font-medium text-foreground">Monthly Unemployment Rate</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 12 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : error ? (
                      <ErrorStateTableRow colSpan={3} message="Failed to load data" onRetry={refetch} />
                    ) : monthlyData.length > 0 ? (
                      monthlyData.map((row, idx) => {
                        const prev = monthlyData[idx + 1]?.rate;
                        const change = prev ? (row.rate - prev).toFixed(1) : null;
                        const changeNum = change ? parseFloat(change) : 0;
                        return (
                          <tr key={idx} className="hover:bg-surface-800/50">
                            <td className="px-6 py-4 text-sm text-foreground">{row.month}</td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className={`font-mono ${row.rate > 5 ? 'text-red-400' : row.rate < 4 ? 'text-green-400' : 'text-foreground'}`}>{row.rate}%</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              {change !== null && <span className={changeNum > 0 ? 'text-red-400' : changeNum < 0 ? 'text-green-400' : 'text-surface-600'}>{changeNum > 0 ? '+' : ''}{change}%</span>}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-surface-600">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jobs by Sector */}
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b border-border"><h2 className="text-base font-medium text-foreground">Jobs Added by Sector</h2></div>
              <div className="p-6">
                <LazyBarChart data={sectorJobs.map(s => ({ name: s.sector, fullName: s.fullName, jobs: s.jobs }))} height={250} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <LazyCartesianGrid {...chartGridStyle} />
                  <LazyXAxis type="number" {...chartAxisStyle} tickFormatter={(v) => `+${(v / 1000).toFixed(0)}k`} />
                  <LazyYAxis dataKey="name" type="category" {...chartAxisStyle} width={80} />
                  <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any, n: any, p: any) => [`+${v.toLocaleString()} jobs`, p.payload.fullName]} />
                  <LazyBar dataKey="jobs" fill="#34d399" radius={[0, 4, 4, 0]} />
                </LazyBarChart>
                <p className="text-xs text-surface-600 mt-4">* Sector data is illustrative</p>
              </div>
            </div>
          </div>

          <div>
            {/* By State */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border"><h2 className="text-base font-medium text-foreground">By State</h2></div>
              <div className="divide-y divide-border">
                <div className="px-6 py-2 bg-surface-800"><p className="text-xs text-surface-600 uppercase">Lowest</p></div>
                {stateData.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center"><span className="text-sm text-surface-600 w-6">#{s.rank}</span><span className="text-sm text-surface-300">{s.state}</span></div>
                    {s.rate && <span className="text-sm font-mono text-green-400">{s.rate}%</span>}
                  </div>
                ))}
                <div className="px-6 py-2 bg-surface-800"><p className="text-xs text-surface-600 uppercase">Highest</p></div>
                {stateData.slice(6).map((s, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center"><span className="text-sm text-surface-600 w-6">#{s.rank}</span><span className="text-sm text-surface-300">{s.state}</span></div>
                    {s.rate && <span className="text-sm font-mono text-red-400">{s.rate}%</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="mt-6 card">
              <div className="px-6 py-4 border-b border-border"><h2 className="text-base font-medium text-foreground">By Demographics</h2></div>
              <div className="p-6 space-y-3">
                {demographics.map((d, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">{d.group}</span>
                    <span className={`text-sm font-mono ${d.rate > 5 ? 'text-red-400' : 'text-surface-300'}`}>{d.rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium text-foreground mb-3">Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>• <a href="https://www.bls.gov/cps/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">BLS Current Population Survey</a></li>
                <li>• BLS Employment Situation Report</li>
                <li>• Series: LNS14000000</li>
              </ul>
            </div>

            <div className="mt-6">
              <DownloadRawData endpoints={[
                { label: 'Unemployment History (2yr)', url: `${API_URL}/employment/unemployment?years=2`, filename: 'unemployment_history.json' },
                { label: 'Latest Rate', url: `${API_URL}/employment/unemployment/latest`, filename: 'unemployment_latest.json' },
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmploymentPage() {
  return <ErrorBoundary><EmploymentPageContent /></ErrorBoundary>;
}
