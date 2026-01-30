'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useDebtHistory, calculateDebtStats, DebtDataPoint } from '@/services/hooks/useDebtData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';

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

export default function DebtPage() {
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
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-3 text-gray-600">Loading live data from Treasury...</span>
            </div>
          ) : error ? (
            <div className="py-4">
              <p className="text-red-600 mb-2">Failed to load live data</p>
              <button 
                onClick={refetch}
                className="text-sm text-primary-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : stats ? (
            <>
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
            </>
          ) : null}
        </div>
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
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          <RefreshCw className="h-5 w-5 animate-spin inline mr-2" />
                          Loading historical data...
                        </td>
                      </tr>
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
              <div className="p-6 space-y-4">
                {debtHolders.map((holder, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{holder.holder}</span>
                      <span className="text-gray-900 font-medium">${holder.amount}T</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${holder.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
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
