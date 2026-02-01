'use client';

import { Briefcase, TrendingUp, TrendingDown, Users, Building2, AlertTriangle, RefreshCw, Minus } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { 
  useUnemploymentHistory, 
  calculateEmploymentStats, 
  formatMonthlyData,
} from '@/services/hooks/useEmploymentData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Static data that doesn't come from the unemployment API
// (would need additional BLS series for these)
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
  { sector: 'Healthcare & Social Assistance', jobs: 62000, change: '+3.2%' },
  { sector: 'Government', jobs: 33000, change: '+1.8%' },
  { sector: 'Leisure & Hospitality', jobs: 43000, change: '+2.1%' },
  { sector: 'Professional & Business Services', jobs: 28000, change: '+1.5%' },
  { sector: 'Retail Trade', jobs: 43000, change: '+2.3%' },
  { sector: 'Construction', jobs: 8000, change: '+0.9%' },
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
  if (direction === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (direction === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

// Chart skeleton component
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    </div>
  );
}

// Table row skeleton
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
  // Fetch 2 years of unemployment data
  const { data: unemploymentData, loading, error, refetch } = useUnemploymentHistory(2);
  
  const stats = unemploymentData ? calculateEmploymentStats(unemploymentData.data) : null;
  const monthlyData = unemploymentData ? formatMonthlyData(unemploymentData.data) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Employment Statistics</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Track U.S. employment, unemployment rates, and job growth from the Bureau of Labor Statistics. 
            See how the labor market is performing across states, sectors, and demographics.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> Bureau of Labor Statistics (BLS) Employment Situation Report. 
            Data is seasonally adjusted.
            {stats && <span className="ml-1">Last data: {stats.period}.</span>}
            {unemploymentData && (
              <span className="ml-1 text-green-700">
                Fetched: {new Date(unemploymentData.fetched_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : error ? (
            <div className="col-span-4 bg-white rounded-xl shadow-sm p-6 text-center">
              <ErrorStateCompact message="Failed to load employment data" onRetry={refetch} />
            </div>
          ) : (
            <>
              {/* Unemployment Rate - LIVE */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="h-4 w-4" />
                  Unemployment Rate
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats?.unemploymentRate}%</p>
                  {stats && <TrendIcon direction={stats.trendDirection} />}
                </div>
                <p className="text-xs text-green-600 mt-1">✓ Live from BLS</p>
              </div>
              
              {/* Labor Force - Calculated */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Building2 className="h-4 w-4" />
                  Labor Force
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.laborForceMillions || '---'}M
                </p>
                <p className="text-xs text-gray-500">Civilian labor force</p>
              </div>
              
              {/* Employed - Calculated */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Briefcase className="h-4 w-4" />
                  Employed
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.employedMillions || '---'}M
                </p>
                <p className="text-xs text-gray-500">Currently working</p>
              </div>
              
              {/* Unemployed - Calculated */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="h-4 w-4" />
                  Unemployed
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.unemployedMillions || '---'}M
                </p>
                <p className="text-xs text-gray-500">Seeking work</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Unemployment Rate Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Unemployment Rate Trend</h2>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : error ? (
            <ErrorStateCompact message="Failed to load chart data" onRetry={refetch} />
          ) : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[...monthlyData].reverse()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => {
                    // Shorten month names for readability
                    const parts = value.split(' ');
                    return parts[0].substring(0, 3) + ' ' + parts[1]?.substring(2);
                  }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Unemployment Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available for chart
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Monthly Unemployment Rate */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Monthly Unemployment Rate</h2>
                <Link href="/employment/historical" className="text-sm text-primary-600 hover:text-primary-700">
                  Full history →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : error ? (
                      <ErrorStateTableRow 
                        colSpan={3} 
                        message="Failed to load unemployment data" 
                        onRetry={refetch} 
                      />
                    ) : monthlyData.length > 0 ? (
                      monthlyData.map((row, idx) => {
                        const prevRate = monthlyData[idx + 1]?.rate;
                        const change = prevRate ? (row.rate - prevRate).toFixed(1) : null;
                        const changeNum = change ? parseFloat(change) : 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                            <td className="px-6 py-4 text-sm text-right">
                              <span className={`font-medium ${row.rate > 5 ? 'text-red-600' : row.rate < 4 ? 'text-green-600' : 'text-gray-900'}`}>
                                {row.rate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              {change !== null && (
                                <span className={changeNum > 0 ? 'text-red-600' : changeNum < 0 ? 'text-green-600' : 'text-gray-500'}>
                                  {changeNum > 0 ? '+' : ''}{change}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jobs by Sector - Static for now */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Jobs Added by Sector</h2>
                <p className="text-sm text-gray-500">Monthly job growth by industry</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={sectorJobs.map(s => ({ 
                      name: s.sector.split(' ')[0], // Short name
                      fullName: s.sector,
                      jobs: s.jobs 
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickFormatter={(value) => `+${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#6b7280" 
                      fontSize={11}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `+${value.toLocaleString()} jobs`,
                        props.payload.fullName
                      ]}
                    />
                    <Bar 
                      dataKey="jobs" 
                      fill="#22c55e" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-4">* Sector data is illustrative (would need additional BLS series)</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Unemployment by State - Static for now */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">By State</h2>
                <Link href="/employment/states" className="text-sm text-primary-600 hover:text-primary-700">
                  All states →
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-2 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase">Lowest Unemployment</p>
                </div>
                {stateData.slice(0, 5).map((state, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-300 w-6">#{state.rank}</span>
                      <span className="text-sm text-gray-700">{state.state}</span>
                    </div>
                    {state.rate && (
                      <span className="text-sm font-medium text-green-600">{state.rate}%</span>
                    )}
                  </div>
                ))}
                <div className="px-6 py-2 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase">Highest Unemployment</p>
                </div>
                {stateData.slice(6).map((state, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-300 w-6">#{state.rank}</span>
                      <span className="text-sm text-gray-700">{state.state}</span>
                    </div>
                    {state.rate && (
                      <span className="text-sm font-medium text-red-600">{state.rate}%</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="px-6 py-2 text-xs text-gray-400">* State data is illustrative</p>
            </div>

            {/* Demographics - Static for now */}
            <div className="mt-6 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">By Demographics</h2>
              </div>
              <div className="p-6 space-y-3">
                {demographics.map((demo, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{demo.group}</span>
                    <span className={`text-sm font-medium ${demo.rate > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {demo.rate}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="px-6 py-2 text-xs text-gray-400">* Demographic data is illustrative</p>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <a href="https://www.bls.gov/cps/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">BLS Current Population Survey</a> (Live)</li>
                <li>• BLS Employment Situation Report</li>
                <li>• BLS Local Area Unemployment Statistics</li>
                <li>• Series: LNS14000000</li>
              </ul>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Unemployment History (2 years)',
                    url: `${API_URL}/api/v1/employment/unemployment?years=2`,
                    filename: 'unemployment_history.json'
                  },
                  {
                    label: 'Latest Unemployment Rate',
                    url: `${API_URL}/api/v1/employment/unemployment/latest`,
                    filename: 'unemployment_latest.json'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmploymentPage() {
  return (
    <ErrorBoundary>
      <EmploymentPageContent />
    </ErrorBoundary>
  );
}
