import { TrendingUp, TrendingDown, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Extended historical data
const historicalData = [
  { year: 'FY 2024', legalImmigration: 1016000, removals: 142580, encounters: 2475669, ratio: 7.1 },
  { year: 'FY 2023', legalImmigration: 1100000, removals: 142580, encounters: 2045838, ratio: 7.7 },
  { year: 'FY 2022', legalImmigration: 1080000, removals: 72177, encounters: 2378944, ratio: 15.0 },
  { year: 'FY 2021', legalImmigration: 740000, removals: 59011, encounters: 1734686, ratio: 12.5 },
  { year: 'FY 2020', legalImmigration: 707362, removals: 185884, encounters: 458088, ratio: 3.8 },
  { year: 'FY 2019', legalImmigration: 1031765, removals: 267258, encounters: 977509, ratio: 3.9 },
  { year: 'FY 2018', legalImmigration: 1096611, removals: 256085, encounters: 521090, ratio: 4.3 },
  { year: 'FY 2017', legalImmigration: 1127167, removals: 226119, encounters: 415517, ratio: 5.0 },
  { year: 'FY 2016', legalImmigration: 1183505, removals: 240255, encounters: 553378, ratio: 4.9 },
  { year: 'FY 2015', legalImmigration: 1051031, removals: 235413, encounters: 444859, ratio: 4.5 },
  { year: 'FY 2014', legalImmigration: 1016518, removals: 315943, encounters: 569237, ratio: 3.2 },
  { year: 'FY 2013', legalImmigration: 990553, removals: 368644, encounters: 474313, ratio: 2.7 },
  { year: 'FY 2012', legalImmigration: 1031631, removals: 409849, encounters: 486651, ratio: 2.5 },
  { year: 'FY 2011', legalImmigration: 1062040, removals: 391953, encounters: 463382, ratio: 2.7 },
  { year: 'FY 2010', legalImmigration: 1042625, removals: 381738, encounters: 516992, ratio: 2.7 },
];

const maxLegal = Math.max(...historicalData.map(d => d.legalImmigration));
const maxRemovals = Math.max(...historicalData.map(d => d.removals));
const maxEncounters = Math.max(...historicalData.map(d => d.encounters));

export default function ImmigrationTrendsPage() {
  // Calculate decade changes
  const current = historicalData[0];
  const decade = historicalData[historicalData.length - 1];
  const legalChange = ((current.legalImmigration - decade.legalImmigration) / decade.legalImmigration * 100).toFixed(1);
  const removalChange = ((current.removals - decade.removals) / decade.removals * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-emerald-200 mb-2">
            <Link href="/immigration" className="hover:text-white">Immigration</Link>
            <span>/</span>
            <span>Trends</span>
          </div>
          <h1 className="text-3xl font-bold">Immigration Trends</h1>
          <p className="text-emerald-100 mt-2">15 years of immigration data (FY 2010 - FY 2024)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Legal Immigration Change (2010→2024)</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${parseFloat(legalChange) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(legalChange) > 0 ? '+' : ''}{legalChange}%
              </span>
              {parseFloat(legalChange) > 0 ? 
                <TrendingUp className="h-5 w-5 text-green-500" /> : 
                <TrendingDown className="h-5 w-5 text-red-500" />
              }
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Deportations Change (2010→2024)</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${parseFloat(removalChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(removalChange) > 0 ? '+' : ''}{removalChange}%
              </span>
              {parseFloat(removalChange) > 0 ? 
                <TrendingUp className="h-5 w-5 text-red-500" /> : 
                <TrendingDown className="h-5 w-5 text-green-500" />
              }
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Ratio (Legal:Deportation)</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{current.ratio}:1</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">For every deportation, {current.ratio} people admitted legally</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Legal Immigration Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Legal Immigration (Lawful Permanent Residents)</h2>
          <div className="space-y-3">
            {historicalData.map((row, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-600">{row.year}</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(row.legalImmigration / maxLegal) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{(row.legalImmigration / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Removals Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Deportations (Removals)</h2>
          <div className="space-y-3">
            {historicalData.map((row, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-600">{row.year}</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(row.removals / maxRemovals) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{(row.removals / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Border Encounters Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Border Encounters (CBP)</h2>
          <div className="space-y-3">
            {historicalData.map((row, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-600">{row.year}</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="bg-amber-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(row.encounters / maxEncounters) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{(row.encounters / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratio Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Immigration-to-Deportation Ratio Over Time</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Legal Immigration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deportations</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Encounters</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historicalData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.year}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{row.legalImmigration.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{row.removals.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-amber-600">{row.encounters.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">{row.ratio}:1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Context Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Important Context</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>FY 2020-2021:</strong> COVID-19 significantly impacted immigration processing and enforcement</li>
            <li>• <strong>FY 2021-2024:</strong> Record border encounters, but many processed through alternative pathways</li>
            <li>• <strong>Encounters ≠ Entries:</strong> Many encounters result in expulsions, returns, or asylum processing</li>
            <li>• <strong>Ratio interpretation:</strong> Higher ratio means more legal admissions per deportation</li>
          </ul>
        </div>

        {/* Data Source */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Data: DHS Immigration Statistics, CBP Operational Statistics, ICE ERO Annual Reports
        </p>
      </div>
    </div>
  );
}
