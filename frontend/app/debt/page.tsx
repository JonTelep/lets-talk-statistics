'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useDebtHistory, calculateDebtStats, DebtDataPoint } from '@/services/hooks/useDebtData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, HeroCounterSkeleton } from '@/components/ui/Skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Static data that doesn't come from the API (would need additional endpoints)
const debtHolders = [
  { holder: 'Federal Reserve', amount: 5.02, percent: 13.9 },
  { holder: 'Foreign Governments', amount: 7.94, percent: 21.9 },
  { holder: 'Mutual Funds', amount: 3.28, percent: 9.1 },
  { holder: 'State & Local Governments', amount: 1.45, percent: 4.0 },
  { holder: 'Private Pensions', amount: 0.97, percent: 2.7 },
  { holder: 'Other (Banks, Insurance, etc.)', amount: 17.56, percent: 48.4 },
];

const topForeignHolders = [
  { country: 'Japan', amount: 1.08, percent: 13.6 },
  { country: 'China', amount: 0.77, percent: 9.7 },
  { country: 'United Kingdom', amount: 0.72, percent: 9.1 },
  { country: 'Luxembourg', amount: 0.39, percent: 4.9 },
  { country: 'Canada', amount: 0.35, percent: 4.4 },
  { country: 'Belgium', amount: 0.33, percent: 4.2 },
];

const milestones = [
  { amount: '$1 Trillion', year: '1982', daysTo: '-' },
  { amount: '$5 Trillion', year: '1996', daysTo: '5,110 days' },
  { amount: '$10 Trillion', year: '2008', daysTo: '4,380 days' },
  { amount: '$20 Trillion', year: '2017', daysTo: '3,285 days' },
  { amount: '$30 Trillion', year: '2022', daysTo: '1,825 days' },
  { amount: '$35 Trillion', year: '2024', daysTo: '730 days' },
];

// Colors for pie chart
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6'];

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

// Table row skeleton for historical debt table
function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}

// Convert API data to yearly format for the table
function aggregateByYear(data: DebtDataPoint[]): Array<{ year: string; debt: number; gdpRatio: number }> {
  const yearlyData: Map<string, { total: number; count: number }> = new Map();
  
  // Group by year and average
  data.forEach((point) => {
    const year = point.date.substring(0, 4);
    const existing = yearlyData.get(year) || { total: 0, count: 0 };
    existing.total += point.total_debt;
    existing.count += 1;
    yearlyData.set(year, existing);
  });
  
  // Convert to array and calculate averages
  const result = Array.from(yearlyData.entries())
    .map(([year, { total, count }]) => {
      const avgDebt = total / count;
      // Rough GDP estimate based on year (simplified)
      const gdpEstimate = 28_000_000_000_000 * (1 + (parseInt(year) - 2024) * 0.025);
      return {
        year,
        debt: avgDebt / 1_000_000_000_000, // Convert to trillions
        gdpRatio: (avgDebt / gdpEstimate) * 100,
      };
    })
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 10);
  
  return result;
}

function DebtPageContent() {
  // Fetch 3 years of data (1095 days)
  const { data: debtData, loading, error, refetch } = useDebtHistory(1095);
  
  const stats = debtData ? calculateDebtStats(debtData.data) : null;
  const historicalDebt = debtData ? aggregateByYear(debtData.data) : [];
  
  // Estimated daily interest (rough calculation based on average interest rate)
  const interestDaily = stats ? (parseFloat(stats.totalDebtTrillions) * 0.03 / 365).toFixed(1) : '3.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-10 w-10" />
            <h1 className="text-4xl font-bold">National Debt</h1>
          </div>
          <p className="text-xl text-red-100 max-w-3xl">
            Track the U.S. national debt in real-time. See who holds our debt, how fast it's growing, 
            and how it compares to GDP. All data from the U.S. Treasury Department.
          </p>
        </div>
      </div>

      {/* Live Counter Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <HeroCounterSkeleton />
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ErrorStateCompact 
              message="Failed to load live data" 
              onRetry={refetch} 
            />
          </div>
        ) : stats ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">U.S. National Debt</p>
            <p className="text-5xl md:text-6xl font-bold text-red-600 font-mono">
              ${stats.totalDebtTrillions} Trillion
            </p>
            <p className="text-sm text-gray-500 mt-2">As of {stats.lastUpdated}</p>
            <div className="mt-4 flex justify-center gap-8 text-sm">
              <div>
                <span className="text-red-500 font-medium">+${stats.dailyIncreaseBillions}B</span>
                <span className="text-gray-500"> per day (avg)</span>
              </div>
              <div>
                <span className="text-red-500 font-medium">${interestDaily}B</span>
                <span className="text-gray-500"> daily interest (est)</span>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">
              ✓ Live data from U.S. Treasury Fiscal Data API
            </p>
          </div>
        ) : null}
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> U.S. Treasury Department - Bureau of the Fiscal Service. 
            "Total Public Debt Outstanding" includes both debt held by the public and intragovernmental holdings.
            {debtData && (
              <span className="ml-1 text-green-700">
                Last fetched: {new Date(debtData.fetched_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Per Person Stats */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="h-4 w-4" />
                  Debt Per Citizen
                </div>
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.debtPerCitizen.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-gray-500">Every man, woman, child</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Debt Per Taxpayer
                </div>
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.debtPerTaxpayer.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-gray-500">Per tax-filing household</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Debt-to-GDP Ratio
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.gdpRatio || '---'}%
                </p>
                <p className="text-xs text-gray-500">Debt exceeds annual GDP</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  Interest Paid (FY24)
                </div>
                <p className="text-2xl font-bold text-red-600">$1.13T</p>
                <p className="text-xs text-gray-500">Just to service the debt</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Debt Growth Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debt Growth Over Time</h2>
          {loading ? (
            <ChartSkeleton height={350} />
          ) : error ? (
            <ErrorStateCompact message="Failed to load chart data" onRetry={refetch} />
          ) : historicalDebt.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={[...historicalDebt].reverse()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}T`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}T`, 'Total Debt']}
                />
                <Line
                  type="monotone"
                  dataKey="debt"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#dc2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available for chart
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Historical Data */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Historical National Debt</h2>
                <Link href="/debt/historical" className="text-sm text-primary-600 hover:text-primary-700">
                  Full history →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Debt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debt/GDP</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Growth</th>
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
                      </>
                    ) : error ? (
                      <ErrorStateTableRow 
                        colSpan={4} 
                        message="Failed to load historical data" 
                        onRetry={refetch} 
                      />
                    ) : historicalDebt.length > 0 ? (
                      historicalDebt.map((row, idx) => {
                        const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                        const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                              ${row.debt.toFixed(2)}T
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-gray-500">
                              {row.gdpRatio.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              {idx < historicalDebt.length - 1 && parseFloat(growth) !== 0 && (
                                <span className={parseFloat(growth) > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Debt Milestones</h2>
                <p className="text-sm text-gray-500">How long it took to add each trillion</p>
              </div>
              <div className="p-6">
                <div className="relative">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center mb-4 last:mb-0">
                      <div className="w-28 text-right pr-4">
                        <p className="text-sm font-bold text-gray-900">{milestone.amount}</p>
                        <p className="text-xs text-gray-500">{milestone.year}</p>
                      </div>
                      <div className="w-4 h-4 bg-red-500 rounded-full border-4 border-red-200 z-10" />
                      <div className="ml-4 text-sm text-gray-600">
                        {milestone.daysTo !== '-' && <span>+{milestone.daysTo}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Who Holds the Debt */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Who Holds Our Debt?</h2>
              </div>
              <div className="p-6">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={debtHolders.map(h => ({ name: h.holder, value: h.amount }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {debtHolders.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value}T`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend as list */}
                <div className="mt-4 space-y-2">
                  {debtHolders.map((holder, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                        />
                        <span className="text-gray-700">{holder.holder}</span>
                      </div>
                      <span className="text-gray-900 font-medium">${holder.amount}T ({holder.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Foreign Holders */}
            <div className="mt-6 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Foreign Holders</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {topForeignHolders.map((country, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-300 w-6">#{idx + 1}</span>
                      <span className="text-sm text-gray-700">{country.country}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">${country.amount}T</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Treasury Fiscal Data API</a> (Live)</li>
                <li>• TreasuryDirect.gov</li>
                <li>• Bureau of the Fiscal Service</li>
                <li>• Treasury International Capital (TIC)</li>
              </ul>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Debt History (3 years)',
                    url: `${API_URL}/api/v1/debt/?days=1095`,
                    filename: 'debt_history.json'
                  },
                  {
                    label: 'Latest Debt Figure',
                    url: `${API_URL}/api/v1/debt/latest`,
                    filename: 'debt_latest.json'
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

export default function DebtPage() {
  return (
    <ErrorBoundary>
      <DebtPageContent />
    </ErrorBoundary>
  );
}
