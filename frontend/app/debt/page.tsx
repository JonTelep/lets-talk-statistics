import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';

// Note: In production, this would come from the API
const mockStats = {
  totalDebt: 36.22,        // trillions
  debtPerCitizen: 108156,
  debtPerTaxpayer: 176874,
  gdpRatio: 123.4,
  dailyIncrease: 6.85,     // billions
  interestDaily: 3.1,      // billions
  lastUpdated: 'January 26, 2026',
};

const historicalDebt = [
  { year: '2026', debt: 36.22, gdpRatio: 123.4 },
  { year: '2025', debt: 34.50, gdpRatio: 121.8 },
  { year: '2024', debt: 33.10, gdpRatio: 120.5 },
  { year: '2023', debt: 31.42, gdpRatio: 118.7 },
  { year: '2022', debt: 30.93, gdpRatio: 120.2 },
  { year: '2021', debt: 28.43, gdpRatio: 126.4 },
  { year: '2020', debt: 26.95, gdpRatio: 128.1 },
  { year: '2019', debt: 22.72, gdpRatio: 106.1 },
  { year: '2010', debt: 13.56, gdpRatio: 91.2 },
  { year: '2000', debt: 5.67, gdpRatio: 55.5 },
];

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

export default function DebtPage() {
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
          <p className="text-sm text-gray-500 mb-2">U.S. National Debt</p>
          <p className="text-5xl md:text-6xl font-bold text-red-600 font-mono">
            ${mockStats.totalDebt.toFixed(2)} Trillion
          </p>
          <p className="text-sm text-gray-500 mt-2">As of {mockStats.lastUpdated}</p>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div>
              <span className="text-red-500 font-medium">+${mockStats.dailyIncrease}B</span>
              <span className="text-gray-500"> per day</span>
            </div>
            <div>
              <span className="text-red-500 font-medium">${mockStats.interestDaily}B</span>
              <span className="text-gray-500"> daily interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> U.S. Treasury Department - Bureau of the Fiscal Service. 
            "Total Public Debt Outstanding" includes both debt held by the public and intragovernmental holdings.
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
            <p className="text-2xl font-bold text-red-600">${mockStats.debtPerCitizen.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Every man, woman, child</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Debt Per Taxpayer
            </div>
            <p className="text-2xl font-bold text-red-600">${mockStats.debtPerTaxpayer.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Per tax-filing household</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Debt-to-GDP Ratio
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.gdpRatio}%</p>
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
                    {historicalDebt.map((row, idx) => {
                      const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                      const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-red-600">${row.debt}T</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-500">{row.gdpRatio}%</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {idx < historicalDebt.length - 1 && (
                              <span className="text-red-600">+{growth}%</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
                <li>• TreasuryDirect.gov</li>
                <li>• Bureau of the Fiscal Service</li>
                <li>• Treasury International Capital (TIC)</li>
                <li>• Federal Reserve Economic Data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
