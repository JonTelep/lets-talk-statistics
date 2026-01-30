'use client';

import { Briefcase, TrendingUp, TrendingDown, Users, Building2, AlertTriangle, MapPin, RefreshCw, Minus } from 'lucide-react';
import Link from 'next/link';
import { 
  useUnemploymentHistory, 
  calculateEmploymentStats, 
  formatMonthlyData,
  formatPeriod 
} from '@/services/hooks/useEmploymentData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';

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

export default function EmploymentPage() {
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
          {/* Unemployment Rate - LIVE */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              Unemployment Rate
            </div>
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : error ? (
              <div>
                <p className="text-red-500 text-sm">Failed to load</p>
                <button onClick={refetch} className="text-xs text-blue-600 hover:underline">Retry</button>
              </div>
            ) : stats ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.unemploymentRate}%</p>
                  <TrendIcon direction={stats.trendDirection} />
                </div>
                <p className="text-xs text-green-600 mt-1">✓ Live from BLS</p>
              </>
            ) : null}
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
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          <RefreshCw className="h-5 w-5 animate-spin inline mr-2" />
                          Loading data from BLS...
                        </td>
                      </tr>
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
                <div className="space-y-4">
                  {sectorJobs.map((sector, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{sector.sector}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">+{sector.jobs.toLocaleString()}</span>
                        <span className="text-xs text-green-600 w-12 text-right">{sector.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
