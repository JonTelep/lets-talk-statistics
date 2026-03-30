import { TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

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
  const current = historicalData[0];
  const decade = historicalData[historicalData.length - 1];
  const legalChange = ((current.legalImmigration - decade.legalImmigration) / decade.legalImmigration * 100).toFixed(1);
  const removalChange = ((current.removals - decade.removals) / decade.removals * 100).toFixed(1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-surface-600 text-sm mb-4">
            <Link href="/immigration" className="hover:text-surface-300 transition-colors">Immigration</Link>
            <span>/</span>
            <span className="text-surface-400">Trends</span>
          </div>
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">15-Year Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Immigration Trends</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            15 years of immigration data (FY 2010 – FY 2024)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-2">Legal Immigration Change (2010→2024)</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${parseFloat(legalChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(legalChange) > 0 ? '+' : ''}{legalChange}%
              </span>
              {parseFloat(legalChange) > 0 ?
                <TrendingUp className="h-5 w-5 text-green-400" /> :
                <TrendingDown className="h-5 w-5 text-red-400" />
              }
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-2">Deportations Change (2010→2024)</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${parseFloat(removalChange) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(removalChange) > 0 ? '+' : ''}{removalChange}%
              </span>
              {parseFloat(removalChange) > 0 ?
                <TrendingUp className="h-5 w-5 text-red-400" /> :
                <TrendingDown className="h-5 w-5 text-green-400" />
              }
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-2">Current Ratio (Legal:Deportation)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400 font-mono">{current.ratio}:1</span>
            </div>
            <p className="text-xs text-surface-600 mt-1">For every deportation, {current.ratio} people admitted legally</p>
          </div>
        </div>
      </div>

      {/* Bar Charts */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 space-y-6">
        {[
          { title: 'Legal Immigration (Lawful Permanent Residents)', data: historicalData, key: 'legalImmigration' as const, max: maxLegal, color: 'bg-green-400', format: (v: number) => `${(v / 1000000).toFixed(2)}M` },
          { title: 'Deportations (Removals)', data: historicalData, key: 'removals' as const, max: maxRemovals, color: 'bg-red-400', format: (v: number) => `${(v / 1000).toFixed(0)}K` },
          { title: 'Border Encounters (CBP)', data: historicalData, key: 'encounters' as const, max: maxEncounters, color: 'bg-amber-400', format: (v: number) => `${(v / 1000000).toFixed(2)}M` },
        ].map((chart) => (
          <div key={chart.title} className="card p-6">
            <h2 className="text-base font-medium mb-6" style={{ color: 'var(--text-primary)' }}>{chart.title}</h2>
            <div className="space-y-3">
              {chart.data.map((row, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-mono text-surface-500 text-right">{row.year.replace('FY ', "'")}</span>
                  <div className="flex-1">
                    <div className="w-full bg-surface-800 rounded-full h-5 relative">
                      <div
                        className={`${chart.color} h-5 rounded-full flex items-center justify-end pr-2`}
                        style={{ width: `${(row[chart.key] / chart.max) * 100}%` }}
                      >
                        <span className="text-xs font-mono font-medium text-surface-950">{chart.format(row[chart.key])}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Full Data Table */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Immigration-to-Deportation Ratio Over Time</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Legal Immigration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Deportations</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Encounters</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historicalData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-800/50">
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.year}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-green-400">{row.legalImmigration.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-red-400">{row.removals.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-amber-400">{row.encounters.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-bold text-surface-300">{row.ratio}:1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="card p-6 border-blue-500/20">
          <h3 className="text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Important Context</h3>
          <ul className="text-sm text-surface-500 space-y-1">
            <li>• <strong className="text-surface-300">FY 2020-2021:</strong> COVID-19 significantly impacted immigration processing and enforcement</li>
            <li>• <strong className="text-surface-300">FY 2021-2024:</strong> Record border encounters, but many processed through alternative pathways</li>
            <li>• <strong className="text-surface-300">Encounters ≠ Entries:</strong> Many encounters result in expulsions, returns, or asylum processing</li>
            <li>• <strong className="text-surface-300">Ratio interpretation:</strong> Higher ratio means more legal admissions per deportation</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-surface-600 text-center">
          Data: DHS Immigration Statistics, CBP Operational Statistics, ICE ERO Annual Reports
        </p>
      </div>
    </div>
  );
}
