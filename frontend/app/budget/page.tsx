'use client';

import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, AlertTriangle, Calendar, Building2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LazyBarChart,
  LazyBar,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyResponsiveContainer,
  LazyPieChart,
  LazyPie,
  LazyCell,
  LazyLegend,
} from '@/components/charts';
import { useBudgetSummary, formatBudgetNumber } from '@/services/hooks/useBudgetData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

// Colors for pie chart
const PIE_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

// Static data for categories (Treasury MTS data structure is complex, these are representative)
const spendingCategories = [
  { category: 'Mandatory (Entitlements)', amount: 4.09, percent: 66.7, color: 'bg-blue-500' },
  { category: 'Discretionary', amount: 1.81, percent: 29.5, color: 'bg-green-500' },
  { category: 'Net Interest', amount: 0.66, percent: 10.8, color: 'bg-red-500' },
];

const revenueCategories = [
  { category: 'Individual Income Tax', amount: 2.18, percent: 49.1 },
  { category: 'Payroll Tax', amount: 1.48, percent: 33.3 },
  { category: 'Corporate Income Tax', amount: 0.42, percent: 9.5 },
  { category: 'Excise & Other', amount: 0.36, percent: 8.1 },
];

const historicalDeficit = [
  { year: 'FY 2024', deficit: 1.69 },
  { year: 'FY 2023', deficit: 1.70 },
  { year: 'FY 2022', deficit: 1.38 },
  { year: 'FY 2021', deficit: 2.77 },
  { year: 'FY 2020', deficit: 3.13 },
  { year: 'FY 2019', deficit: 0.98 },
];

function BudgetPageContent() {
  // Fetch live budget data
  const { data: budgetData, loading, error, refetch } = useBudgetSummary();
  
  // Use live data if available, otherwise show placeholders
  const totalSpending = budgetData ? budgetData.totalOutlays / 1_000_000 : null; // Convert to trillions
  const totalRevenue = budgetData ? budgetData.totalReceipts / 1_000_000 : null;
  const deficit = budgetData ? budgetData.deficit / 1_000_000 : null;
  const fiscalYear = budgetData?.fiscalYear;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Federal Budget</h1>
          </div>
          <p className="text-xl text-green-100 max-w-3xl">
            Track how the U.S. government spends taxpayer money. Explore spending by agency, 
            revenue sources, and the budget deficit. All data from official Treasury and OMB reports.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> U.S. Treasury Monthly Statement via Fiscal Data API.
            {budgetData && (
              <span className="ml-1 text-green-700">
                Fetched: {new Date(budgetData.fetchedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {fiscalYear ? `FY ${fiscalYear}` : 'Federal Budget'} Overview
          </h2>
          {loading && <RefreshCw className="h-5 w-5 animate-spin text-green-600" />}
        </div>

        {error ? (
          <ErrorState 
            message="Failed to load budget data from Treasury API" 
            onRetry={refetch}
            className="mb-8"
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Total Spending
                  </div>
                  {totalSpending !== null ? (
                    <p className="text-3xl font-bold text-red-600">${totalSpending.toFixed(2)}T</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-400">—</p>
                  )}
                  <p className="text-xs text-gray-500">Federal outlays</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Total Revenue
                  </div>
                  {totalRevenue !== null ? (
                    <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}T</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-400">—</p>
                  )}
                  <p className="text-xs text-gray-500">Federal receipts</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Budget Deficit
                  </div>
                  {deficit !== null ? (
                    <p className="text-3xl font-bold text-amber-600">${Math.abs(deficit).toFixed(2)}T</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-400">—</p>
                  )}
                  <p className="text-xs text-gray-500">Spending - Revenue</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Data Status
                  </div>
                  {budgetData ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900">FY {fiscalYear}</p>
                      <p className="text-xs text-green-600">✓ Live from Treasury API</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">—</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Historical Deficit Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Budget Deficit</h3>
            <LazyBarChart
              data={[...historicalDeficit].reverse()}
              height={280}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <LazyCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <LazyXAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => value.replace('FY ', "'")}
              />
              <LazyYAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${value}T`}
              />
              <LazyTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}T`, 'Deficit']}
              />
              <LazyBar 
                dataKey="deficit" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </LazyBarChart>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Higher bars = larger deficit
            </p>
          </div>

          {/* Spending Categories Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Federal Spending Breakdown</h3>
            <LazyPieChart height={280}>
              <LazyPie
                data={spendingCategories.map(cat => ({
                  name: cat.category.split(' ')[0], // Short name
                  fullName: cat.category,
                  value: cat.amount
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {spendingCategories.map((_, idx) => (
                  <LazyCell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </LazyPie>
              <LazyTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: any, props: any) => [
                  `$${Number(value)}T`,
                  props?.payload?.fullName || name
                ]}
              />
            </LazyPieChart>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {spendingCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                  />
                  <span className="text-gray-600">{cat.category.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Breakdown by Classification (from API) */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <Skeleton className="h-5 w-56" />
            </div>
            <TableSkeleton rows={5} columns={3} />
          </div>
        ) : budgetData?.byClassification && budgetData.byClassification.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Spending by Classification (Live Data)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classification</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outlays</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgetData.byClassification.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.classification}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        {formatBudgetNumber(item.outlays)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {formatBudgetNumber(item.receipts)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">Source: {budgetData.source}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Spending Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  Spending by Category
                </h2>
                <p className="text-xs text-gray-500 mt-1">Representative breakdown (detailed API data requires processing)</p>
              </div>
              <div className="p-6 space-y-4">
                {spendingCategories.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-gray-500">${cat.amount}T ({cat.percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${cat.color} h-3 rounded-full`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Deficit */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Historical Deficit</h2>
                <Link href="/budget/historical" className="text-sm text-green-600 hover:text-green-700">
                  Full history →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscal Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deficit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historicalDeficit.map((row, idx) => {
                      const prevDeficit = historicalDeficit[idx + 1]?.deficit;
                      const change = prevDeficit ? ((row.deficit - prevDeficit) / prevDeficit * 100).toFixed(1) : null;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                            ${row.deficit.toFixed(2)}T
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            {change && (
                              <span className={parseFloat(change) < 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(change) > 0 ? '+' : ''}{change}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Revenue Categories */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Sources</h2>
              </div>
              <div className="p-6 space-y-4">
                {revenueCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{cat.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">${cat.amount}T</span>
                      <span className="text-xs text-gray-500 ml-2">({cat.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Facts */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Facts</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Interest payments are the fastest-growing expense (+37.8% YoY)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Mandatory spending (Social Security, Medicare) is ~67% of budget</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Individual income tax provides ~49% of federal revenue</span>
                </li>
              </ul>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    Treasury Fiscal Data API
                  </a> (Live)
                </li>
                <li>• USASpending.gov</li>
                <li>• Office of Management and Budget (OMB)</li>
                <li>• Congressional Budget Office (CBO)</li>
              </ul>
              {budgetData && (
                <p className="mt-3 text-xs text-green-600">✓ Live data from Treasury API</p>
              )}
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Budget Summary (Current FY)',
                    url: `${API_URL}/budget/`,
                    filename: 'budget_summary.json'
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

export default function BudgetPage() {
  return (
    <ErrorBoundary>
      <BudgetPageContent />
    </ErrorBoundary>
  );
}
