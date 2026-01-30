'use client';

import { Users, TrendingUp, TrendingDown, ArrowRight, ArrowLeft, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  useImmigrationSummary,
  useImmigrationHistorical,
  useImmigrationCategories,
  useImmigrationCountries,
} from '@/services/hooks/useImmigrationData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ImmigrationPage() {
  // Fetch all immigration data
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useImmigrationSummary();
  const { data: historicalData, loading: historicalLoading } = useImmigrationHistorical();
  const { data: categoriesData, loading: categoriesLoading } = useImmigrationCategories();
  const { data: countriesData, loading: countriesLoading } = useImmigrationCountries(10);

  // Derived values from summary
  const summary = summaryData?.summary;
  const fiscalYear = summaryData?.fiscal_year;
  const ratio = summary?.admission_to_removal_ratio || '—';
  const netMigration = summary?.net_legal_migration || 0;

  // Loading state for main content
  const isLoading = summaryLoading || historicalLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Immigration Statistics</h1>
          </div>
          <p className="text-xl text-emerald-100 max-w-3xl">
            Comprehensive data on legal immigration, deportations, and border encounters 
            from official U.S. government sources. Understanding the full picture of 
            who&apos;s coming in and who&apos;s going out.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Sources:</strong> Department of Homeland Security (DHS) Immigration Statistics, 
            Customs and Border Protection (CBP), and Immigration and Customs Enforcement (ICE). 
            Data reflects fiscal years. &quot;Encounters&quot; includes apprehensions and inadmissibles at borders.
            {summaryData && (
              <span className="ml-1 text-green-700">
                Fetched: {new Date(summaryData.fetched_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Key Metrics {fiscalYear ? `(FY ${fiscalYear})` : ''}
          {summaryLoading && <RefreshCw className="inline ml-2 h-5 w-5 animate-spin text-emerald-600" />}
        </h2>
        
        {summaryError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Failed to load summary data</p>
            <button onClick={refetchSummary} className="text-sm text-red-600 hover:underline mt-1">
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  Legal Admissions
                </div>
                {summaryLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.legal_admissions?.toLocaleString() || '—'}
                  </p>
                )}
                <p className="text-xs text-gray-500">Lawful Permanent Residents</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <ArrowLeft className="h-4 w-4 text-red-500" />
                  Deportations
                </div>
                {summaryLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.removals?.toLocaleString() || '—'}
                  </p>
                )}
                <p className="text-xs text-gray-500">Removals by ICE ERO</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Border Encounters
                </div>
                {summaryLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.border_encounters?.toLocaleString() || '—'}
                  </p>
                )}
                <p className="text-xs text-gray-500">CBP Southwest Border</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Data Year
                </div>
                {summaryLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-16"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">FY {fiscalYear || '—'}</p>
                )}
                <p className="text-xs text-green-600">✓ Live from API</p>
              </div>
            </div>

            {/* Ratio Highlight */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Immigration to Deportation Ratio</h3>
                  <p className="text-sm text-gray-600">
                    For every 1 person deported, approximately {ratio.replace(':1', '')} people are legally admitted
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-8">
                  <div className="text-center">
                    {summaryLoading ? (
                      <div className="h-9 bg-gray-200 animate-pulse rounded w-16 mx-auto"></div>
                    ) : (
                      <p className="text-3xl font-bold text-blue-600">{ratio}</p>
                    )}
                    <p className="text-xs text-gray-500">Ratio</p>
                  </div>
                  <div className="text-center">
                    {summaryLoading ? (
                      <div className="h-9 bg-gray-200 animate-pulse rounded w-24 mx-auto"></div>
                    ) : (
                      <p className="text-3xl font-bold text-green-600">
                        +{netMigration.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Net Legal Migration</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Historical Data */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Historical Data (by Fiscal Year)</h2>
                <Link href="/immigration/trends" className="text-sm text-primary-600 hover:text-primary-700">
                  View trends →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Legal Immigration</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Removals</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Border Encounters</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historicalLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          <RefreshCw className="h-5 w-5 animate-spin inline mr-2" />
                          Loading historical data...
                        </td>
                      </tr>
                    ) : historicalData?.data && historicalData.data.length > 0 ? (
                      historicalData.data.map((row, idx) => {
                        const rowRatio = (row.legal_admissions / row.removals).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">FY {row.fiscal_year}</td>
                            <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                              {row.legal_admissions.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-red-600">
                              {row.removals.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-amber-600">
                              {row.border_encounters.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-right font-medium">{rowRatio}:1</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No historical data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {historicalData && (
                <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 border-t">
                  Source: {historicalData.source}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Legal Immigration by Category
                  {categoriesData && ` (FY ${categoriesData.fiscal_year})`}
                </h2>
              </div>
              <div className="p-6">
                {categoriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
                  <div className="space-y-4">
                    {categoriesData.categories.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{cat.category}</span>
                          <span className="text-gray-500">
                            {cat.count.toLocaleString()} ({cat.percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No category data available</p>
                )}
              </div>
              {categoriesData && (
                <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 border-t">
                  Total: {categoriesData.total.toLocaleString()} | Source: {categoriesData.source}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Top Source Countries */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Source Countries
                  {countriesData && ` (FY ${countriesData.fiscal_year})`}
                </h2>
              </div>
              {countriesLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex justify-between animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : countriesData?.countries && countriesData.countries.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {countriesData.countries.map((country, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-300 mr-3">#{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {country.admissions.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{country.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">No country data available</div>
              )}
              {countriesData && (
                <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 border-t">
                  Source: {countriesData.source}
                </div>
              )}
            </div>

            {/* Definitions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Definitions</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900">Lawful Permanent Resident (LPR)</dt>
                  <dd className="text-gray-600">
                    Also known as a &quot;Green Card&quot; holder. Authorized to live and work permanently in the U.S.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Removal (Deportation)</dt>
                  <dd className="text-gray-600">
                    Formal removal from the U.S. based on immigration law violations.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Encounter</dt>
                  <dd className="text-gray-600">
                    Apprehension or contact by CBP at borders. Not all encounters result in admission or removal.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • <a href="https://ohss.dhs.gov/topics/immigration/yearbook" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    DHS Immigration Statistics Yearbook
                  </a>
                </li>
                <li>
                  • <a href="https://www.cbp.gov/newsroom/stats" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    CBP Monthly Operational Update
                  </a>
                </li>
                <li>• ICE ERO Annual Report</li>
                <li>• USCIS Immigration Data</li>
              </ul>
              <p className="mt-3 text-xs text-green-600">✓ Data fetched from live API</p>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Immigration Summary',
                    url: `${API_URL}/api/v1/immigration/summary`,
                    filename: 'immigration_summary.json'
                  },
                  {
                    label: 'Historical Data',
                    url: `${API_URL}/api/v1/immigration/historical`,
                    filename: 'immigration_historical.json'
                  },
                  {
                    label: 'By Category',
                    url: `${API_URL}/api/v1/immigration/categories`,
                    filename: 'immigration_categories.json'
                  },
                  {
                    label: 'Top Countries',
                    url: `${API_URL}/api/v1/immigration/countries`,
                    filename: 'immigration_countries.json'
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
