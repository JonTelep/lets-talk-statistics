'use client';

import { Vote, AlertTriangle, DollarSign, Users, Tv, FileText, TrendingUp, Scale, XCircle, CheckCircle, RefreshCw } from 'lucide-react';
import {
  LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
} from '@/components/charts';
import { chartTooltipStyle, chartAxisStyle, chartGridStyle } from '@/components/charts/theme';
import { useCandidates, formatCurrency, getPartyColor } from '@/services/hooks/useElectionsData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

const fundingComparison = { majorPartyGrant: 123_500_000 };

const ballotAccessExamples = [
  { state: 'California', signatures: 219_403, deadline: 'August' },
  { state: 'Texas', signatures: 113_151, deadline: 'May' },
  { state: 'Florida', signatures: 145_040, deadline: 'July' },
  { state: 'New York', signatures: 45_000, deadline: 'August' },
  { state: 'North Carolina', signatures: 83_001, deadline: 'June' },
  { state: 'Pennsylvania', signatures: 5_000, deadline: 'August' },
  { state: 'Ohio', signatures: 44_000, deadline: 'August' },
  { state: 'Georgia', signatures: 59_112, deadline: 'July' },
];

const thirdPartyHistory = [
  { year: 2024, candidate: 'Robert F. Kennedy Jr.', party: 'Independent', percent: 1.0, funding: 'None' },
  { year: 2020, candidate: 'Jo Jorgensen', party: 'Libertarian', percent: 1.2, funding: 'None' },
  { year: 2016, candidate: 'Gary Johnson', party: 'Libertarian', percent: 3.3, funding: 'None' },
  { year: 2016, candidate: 'Jill Stein', party: 'Green', percent: 1.1, funding: 'None' },
  { year: 2012, candidate: 'Gary Johnson', party: 'Libertarian', percent: 1.0, funding: 'None' },
  { year: 2000, candidate: 'Ralph Nader', party: 'Green', percent: 2.7, funding: 'None' },
  { year: 1996, candidate: 'Ross Perot', party: 'Reform', percent: 8.4, funding: '$29M (retroactive)' },
  { year: 1992, candidate: 'Ross Perot', party: 'Independent', percent: 18.9, funding: 'None (self-funded)' },
];

const systemicBarriers = [
  { title: 'Public Funding Catch-22', icon: DollarSign, description: 'Major parties receive $123.5M BEFORE the election. Third parties must get 5% first, then receive partial funding AFTER.' },
  { title: 'Debate Access Barrier', icon: Tv, description: 'CPD requires 15% polling. Without debate exposure, reaching 15% is nearly impossible.' },
  { title: 'Ballot Access Burden', icon: FileText, description: 'Major parties have automatic ballot access. Third parties must collect hundreds of thousands of signatures.' },
  { title: 'Media Coverage Gap', icon: TrendingUp, description: 'Coverage follows polling and fundraising. Without initial coverage, third parties cannot build momentum.' },
];

const foundingFathersQuotes = [
  { name: 'George Washington', title: 'Farewell Address, 1796', quote: 'The alternate domination of one faction over another…is itself a frightful despotism.', source: 'Yale Avalon Project', sourceUrl: 'https://avalon.law.yale.edu/18th_century/washing.asp' },
  { name: 'John Adams', title: 'Letter, 1780', quote: 'There is nothing which I dread so much as a division of the republic into two great parties…', source: 'Works of John Adams', sourceUrl: 'https://founders.archives.gov/' },
  { name: 'Thomas Jefferson', title: 'First Inaugural, 1801', quote: 'Let us…unite with one heart and one mind…We are all Republicans, we are all Federalists.', source: 'Yale Avalon Project', sourceUrl: 'https://avalon.law.yale.edu/19th_century/jefinau1.asp' },
];

function ElectionsPageContent() {
  const totalSignatures = ballotAccessExamples.reduce((sum, s) => sum + s.signatures, 0);
  const { data: candidatesData, loading: candidatesLoading, error: candidatesError, refetch } = useCandidates();
  const topFundraisers = candidatesData?.data?.filter(c => c.office === 'P')?.slice(0, 10) || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Election Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4">Election Funding</h1>
          <p className="text-lg text-surface-500 max-w-3xl mb-6">
            The American two-party system isn&apos;t natural — it&apos;s engineered through laws, rules, and barriers.
          </p>
          <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 max-w-3xl">
            <p className="text-sm text-surface-400">
              <span className="text-amber-400">⚠ Editorial Note:</span> This page departs from our usual approach. 
              The structural barriers are so severe that presenting them without context would be misleading.
            </p>
          </div>
        </div>
      </div>

      {/* Live Campaign Finance */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-surface-500" />
              Live Campaign Finance
              {candidatesData && <span className="text-sm font-normal text-surface-600 ml-2">({candidatesData.cycle} Cycle)</span>}
            </h2>
            {candidatesLoading && <RefreshCw className="h-4 w-4 animate-spin text-surface-500" />}
          </div>

          {candidatesError ? (
            <ErrorStateCompact message="Failed to load FEC data" onRetry={refetch} />
          ) : candidatesLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                  <Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : topFundraisers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Party</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Raised</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topFundraisers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-surface-800/50">
                      <td className="px-4 py-3 text-sm text-white">{c.name}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getPartyColor(c.party)}`}>{c.party || 'N/A'}</span></td>
                      <td className="px-4 py-3 text-right font-mono text-green-400">{formatCurrency(c.receipts)}</td>
                      <td className="px-4 py-3 text-right font-mono text-surface-400">{formatCurrency(c.disbursements)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between text-xs text-surface-600">
                <span>Source: {candidatesData?.source}</span>
                <span className="text-green-400">✓ Live from FEC API</span>
              </div>
            </div>
          ) : (
            <p className="text-surface-600">No presidential candidate data available</p>
          )}
        </div>
      </div>

      {/* Founders Warned Us */}
      <div className="border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-white">The Founders Warned Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {foundingFathersQuotes.map((f, idx) => (
              <div key={idx} className="card p-6 border-l-2 border-amber-500/30">
                <h3 className="text-sm font-medium text-white">{f.name}</h3>
                <p className="text-xs text-surface-600 mb-3">{f.title}</p>
                <blockquote className="text-sm text-surface-400 italic leading-relaxed mb-3">&quot;{f.quote}&quot;</blockquote>
                <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">{f.source}</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Systemic Barriers */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-medium text-white mb-8">Systemic Barriers to Third Parties</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {systemicBarriers.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="card p-6 border-l-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-medium text-white">{b.title}</h3>
                </div>
                <p className="text-sm text-surface-400">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Party Advantage */}
      <div className="border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-medium text-white mb-8">The Two-Party Advantage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 border-l-2 border-green-500/30">
              <div className="flex items-center gap-2 mb-4"><CheckCircle className="h-5 w-5 text-green-400" /><h3 className="text-sm font-medium text-white">Democrats &amp; Republicans</h3></div>
              <ul className="space-y-2 text-sm text-surface-400">
                <li>✓ ${(fundingComparison.majorPartyGrant / 1_000_000).toFixed(1)}M public funding upfront</li>
                <li>✓ Automatic ballot access in all 50 states</li>
                <li>✓ Guaranteed debate invitations</li>
                <li>✓ Billions in Super PAC support</li>
              </ul>
            </div>
            <div className="card p-6 border-l-2 border-red-500/30">
              <div className="flex items-center gap-2 mb-4"><XCircle className="h-5 w-5 text-red-400" /><h3 className="text-sm font-medium text-white">Everyone Else</h3></div>
              <ul className="space-y-2 text-sm text-surface-400">
                <li>✗ $0 until you get 5% in previous election</li>
                <li>✗ Must collect signatures in each state</li>
                <li>✗ 15% polling required for debates</li>
                <li>✗ Minimal media coverage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ballot Access */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-medium text-white mb-8">Ballot Access: The Hidden Tax</h2>
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <p className="text-sm text-surface-500">Major parties have automatic access. Third parties must collect signatures.</p>
          </div>
          <table className="w-full">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">State</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Signatures</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-surface-500 uppercase">Major Party?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ballotAccessExamples.map((s, idx) => (
                <tr key={idx} className="hover:bg-surface-800/50">
                  <td className="px-6 py-4 text-sm text-white">{s.state}</td>
                  <td className="px-6 py-4 text-right font-mono text-red-400">{s.signatures.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-surface-500">{s.deadline}</td>
                  <td className="px-6 py-4 text-center text-green-400">Automatic ✓</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-800">
              <tr>
                <td className="px-6 py-4 font-medium text-white">Just these 8 states</td>
                <td className="px-6 py-4 text-right font-mono font-medium text-red-400">{totalSignatures.toLocaleString()}</td>
                <td colSpan={2} className="px-6 py-4 text-right text-surface-600">+ 42 more states</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Third Party History */}
      <div className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-medium text-white mb-8">Third Party History</h2>
          <div className="card p-6 mb-8">
            <h3 className="text-base font-medium text-white mb-4">Third Party Vote Share</h3>
            <LazyBarChart data={thirdPartyHistory.map(h => ({ year: h.year.toString(), percent: h.percent, candidate: h.candidate, party: h.party }))} height={300} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <LazyCartesianGrid {...chartGridStyle} />
              <LazyXAxis dataKey="year" {...chartAxisStyle} />
              <LazyYAxis {...chartAxisStyle} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
              <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any, n: any, p: any) => [`${v}%`, `${p.payload.candidate} (${p.payload.party})`]} />
              <LazyBar dataKey="percent" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </LazyBarChart>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Party</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Vote %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Public Funding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {thirdPartyHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-800/50">
                    <td className="px-6 py-4 text-sm text-white">{row.year}</td>
                    <td className="px-6 py-4 text-sm text-surface-300">{row.candidate}</td>
                    <td className="px-6 py-4 text-sm text-surface-500">{row.party}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono"><span className={row.percent >= 5 ? 'text-green-400' : 'text-red-400'}>{row.percent.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-sm text-right text-surface-500">{row.funding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-base font-medium text-white mb-4">Data Sources</h3>
            <ul className="text-sm text-surface-500 space-y-2">
              <li>• <a href="https://www.fec.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Federal Election Commission</a> (Live API)</li>
              <li>• Commission on Presidential Debates</li>
              <li>• State Election Boards</li>
              <li>• Ballot Access News</li>
            </ul>
          </div>
          <DownloadRawData endpoints={[{ label: 'Campaign Finance Data', url: `${API_URL}/elections/candidates`, filename: 'election_candidates.json' }]} />
        </div>
      </div>
    </div>
  );
}

export default function ElectionsPage() {
  return <ErrorBoundary><ElectionsPageContent /></ErrorBoundary>;
}
