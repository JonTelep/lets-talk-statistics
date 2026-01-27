import { Users, TrendingUp, TrendingDown, ArrowRight, ArrowLeft, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';

// Note: In production, this would come from the API
const mockStats = {
  legalAdmissions: 1_016_000,
  deportations: 142_580,
  encounters: 2_475_669,
  visaOverstays: 853_955,
  lastUpdated: 'FY 2024',
};

const yearlyData = [
  { year: 'FY 2024', legalImmigration: 1016000, removals: 142580, encounters: 2475669 },
  { year: 'FY 2023', legalImmigration: 1100000, removals: 142580, encounters: 2045838 },
  { year: 'FY 2022', legalImmigration: 1080000, removals: 72177, encounters: 2378944 },
  { year: 'FY 2021', legalImmigration: 740000, removals: 59011, encounters: 1734686 },
  { year: 'FY 2020', legalImmigration: 707362, removals: 185884, encounters: 458088 },
  { year: 'FY 2019', legalImmigration: 1031765, removals: 267258, encounters: 977509 },
];

const categoryBreakdown = [
  { category: 'Family-Based', count: 556472, percent: 54.8 },
  { category: 'Employment-Based', count: 204467, percent: 20.1 },
  { category: 'Refugees & Asylees', count: 154987, percent: 15.3 },
  { category: 'Diversity Lottery', count: 54872, percent: 5.4 },
  { category: 'Other', count: 45202, percent: 4.4 },
];

const topCountries = [
  { country: 'Mexico', legal: 129451, percentage: 12.7 },
  { country: 'India', legal: 104584, percentage: 10.3 },
  { country: 'China', legal: 75867, percentage: 7.5 },
  { country: 'Philippines', legal: 54329, percentage: 5.3 },
  { country: 'Cuba', legal: 52785, percentage: 5.2 },
  { country: 'Dominican Republic', legal: 50934, percentage: 5.0 },
];

export default function ImmigrationPage() {
  const netMigration = mockStats.legalAdmissions - mockStats.deportations;
  const ratio = (mockStats.legalAdmissions / mockStats.deportations).toFixed(1);

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
            who's coming in and who's going out.
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
            Data reflects fiscal years. "Encounters" includes apprehensions and inadmissibles at borders.
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics ({mockStats.lastUpdated})</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <ArrowRight className="h-4 w-4 text-green-500" />
              Legal Admissions
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.legalAdmissions.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Lawful Permanent Residents</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <ArrowLeft className="h-4 w-4 text-red-500" />
              Deportations
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.deportations.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Removals by ICE ERO</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Border Encounters
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.encounters.toLocaleString()}</p>
            <p className="text-xs text-gray-500">CBP Southwest Border</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              Visa Overstays
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.visaOverstays.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Estimated annual</p>
          </div>
        </div>

        {/* Ratio Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Immigration to Deportation Ratio</h3>
              <p className="text-sm text-gray-600">For every 1 person deported, approximately {ratio} people are legally admitted</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{ratio}:1</p>
                <p className="text-xs text-gray-500">Ratio</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">+{netMigration.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Net Legal Migration</p>
              </div>
            </div>
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
                    {yearlyData.map((row, idx) => {
                      const rowRatio = (row.legalImmigration / row.removals).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.year}</td>
                          <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">{row.legalImmigration.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-red-600">{row.removals.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right text-amber-600">{row.encounters.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium">{rowRatio}:1</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Legal Immigration by Category</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {categoryBreakdown.map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.category}</span>
                        <span className="text-gray-500">{cat.count.toLocaleString()} ({cat.percent}%)</span>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Top Source Countries */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Source Countries</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {topCountries.map((country, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-300 mr-3">#{idx + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{country.legal.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{country.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Definitions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Definitions</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900">Lawful Permanent Resident (LPR)</dt>
                  <dd className="text-gray-600">Also known as a "Green Card" holder. Authorized to live and work permanently in the U.S.</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Removal (Deportation)</dt>
                  <dd className="text-gray-600">Formal removal from the U.S. based on immigration law violations.</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Encounter</dt>
                  <dd className="text-gray-600">Apprehension or contact by CBP at borders. Not all encounters result in admission or removal.</dd>
                </div>
              </dl>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• DHS Immigration Statistics Yearbook</li>
                <li>• CBP Monthly Operational Update</li>
                <li>• ICE ERO Annual Report</li>
                <li>• USCIS Immigration Data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
