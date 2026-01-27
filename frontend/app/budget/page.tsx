import { DollarSign, TrendingUp, TrendingDown, PieChart, AlertTriangle, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';

// Note: In production, this would come from the API
const mockStats = {
  totalSpending: 6.13,  // trillions
  totalRevenue: 4.44,   // trillions
  deficit: 1.69,        // trillions
  gdpPercent: 22.4,
  fiscalYear: 'FY 2024',
};

const topAgencies = [
  { name: 'Social Security Administration', spending: 1.46, percent: 23.8, change: '+5.2%' },
  { name: 'Department of Health & Human Services', spending: 1.73, percent: 28.2, change: '+8.1%' },
  { name: 'Department of Defense', spending: 0.87, percent: 14.2, change: '+3.4%' },
  { name: 'Department of Treasury (Interest)', spending: 0.66, percent: 10.8, change: '+37.8%' },
  { name: 'Department of Veterans Affairs', spending: 0.31, percent: 5.1, change: '+6.2%' },
  { name: 'Department of Agriculture', spending: 0.23, percent: 3.8, change: '-2.1%' },
];

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

export default function BudgetPage() {
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
            <strong>Data Source:</strong> USASpending.gov, Treasury Department Monthly Statements, 
            and Office of Management and Budget (OMB). Figures are in trillions of USD.
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{mockStats.fiscalYear} Overview</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Spending
            </div>
            <p className="text-2xl font-bold text-gray-900">${mockStats.totalSpending}T</p>
            <p className="text-xs text-gray-500">{mockStats.gdpPercent}% of GDP</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Revenue
            </div>
            <p className="text-2xl font-bold text-gray-900">${mockStats.totalRevenue}T</p>
            <p className="text-xs text-gray-500">Taxes & fees collected</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Budget Deficit
            </div>
            <p className="text-2xl font-bold text-red-600">-${mockStats.deficit}T</p>
            <p className="text-xs text-gray-500">Spending exceeds revenue</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              Daily Spending
            </div>
            <p className="text-2xl font-bold text-gray-900">${(mockStats.totalSpending * 1000 / 365).toFixed(1)}B</p>
            <p className="text-xs text-gray-500">Average per day</p>
          </div>
        </div>

        {/* Spending vs Revenue Visual */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending vs Revenue</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">Spending: ${mockStats.totalSpending}T</p>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div className="bg-red-500 h-8 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">Revenue: ${mockStats.totalRevenue}T</p>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div className="bg-green-500 h-8 rounded-full" style={{ width: `${(mockStats.totalRevenue / mockStats.totalSpending) * 100}%` }} />
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            The government spends <span className="font-bold text-red-600">${mockStats.deficit}T more</span> than it collects
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Agencies */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Spending by Agency</h2>
                <Link href="/budget/agencies" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spending</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">YoY Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topAgencies.map((agency, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{agency.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">${agency.spending}T</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-500">{agency.percent}%</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={agency.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}>
                            {agency.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Deficit */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Historical Budget Deficit</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {historicalDeficit.map((row, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="w-20 text-sm font-medium text-gray-700">{row.year}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-red-500 h-4 rounded-full"
                            style={{ width: `${(row.deficit / 3.5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-20 text-sm text-right font-medium text-red-600">-${row.deficit}T</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">Note: FY 2020-2021 deficits include COVID-19 emergency spending</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Sources</h2>
              </div>
              <div className="p-6 space-y-4">
                {revenueCategories.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-gray-500">${cat.amount}T</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{cat.percent}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Categories */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Categories</h3>
              <div className="space-y-3">
                {spendingCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${cat.color} mr-2`} />
                      <span className="text-sm text-gray-700">{cat.category}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">${cat.amount}T</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• USASpending.gov</li>
                <li>• Treasury Monthly Statement</li>
                <li>• Office of Management & Budget</li>
                <li>• Congressional Budget Office</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
