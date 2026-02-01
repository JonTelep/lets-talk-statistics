'use client';

import { Vote, AlertTriangle, DollarSign, Users, Tv, FileText, TrendingUp, Scale, XCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useCandidates, formatCurrency, getPartyColor } from '@/services/hooks/useElectionsData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

// Chart skeleton component
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Data based on FEC, CPD, and state election board records
const fundingComparison = {
  majorPartyGrant: 123_500_000,
  thirdPartyThreshold: 5,
  thirdPartyFundingTiming: 'AFTER the election (retroactive)',
  majorPartyFundingTiming: 'BEFORE the election (upfront)',
};

const debateRequirements = {
  pollingThreshold: 15,
  ballotAccessStates: 'Enough states for 270 electoral votes',
  organizerHistory: 'Founded by former Democratic and Republican party chairs',
};

const ballotAccessExamples = [
  { state: 'California', signatures: 219_403, deadline: 'August', majorPartyAuto: true },
  { state: 'Texas', signatures: 113_151, deadline: 'May', majorPartyAuto: true },
  { state: 'Florida', signatures: 145_040, deadline: 'July', majorPartyAuto: true },
  { state: 'New York', signatures: 45_000, deadline: 'August', majorPartyAuto: true },
  { state: 'North Carolina', signatures: 83_001, deadline: 'June', majorPartyAuto: true },
  { state: 'Pennsylvania', signatures: 5_000, deadline: 'August', majorPartyAuto: true },
  { state: 'Ohio', signatures: 44_000, deadline: 'August', majorPartyAuto: true },
  { state: 'Georgia', signatures: 59_112, deadline: 'July', majorPartyAuto: true },
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
  {
    title: 'Public Funding Catch-22',
    icon: DollarSign,
    description: 'Major parties receive $123.5 million BEFORE the election. Third parties must get 5% of the vote first, then receive partial funding AFTER.',
    impact: 'Third parties must run an underfunded campaign to prove they deserve funding for the NEXT election.',
    status: 'broken',
  },
  {
    title: 'Debate Access Barrier',
    icon: Tv,
    description: 'The Commission on Presidential Debates requires 15% polling to participate. Without debate exposure, reaching 15% is nearly impossible.',
    impact: 'A self-reinforcing cycle: no debates → no visibility → no polling → no debates.',
    status: 'broken',
  },
  {
    title: 'Ballot Access Burden',
    icon: FileText,
    description: 'Republicans and Democrats have automatic ballot access. Third parties must collect hundreds of thousands of signatures across 50 states.',
    impact: 'Third parties spend millions just to appear on ballots, money major parties can spend on actual campaigning.',
    status: 'broken',
  },
  {
    title: 'Media Coverage Gap',
    icon: TrendingUp,
    description: 'Media coverage follows polling and fundraising. Without initial coverage, third parties cannot build the momentum needed for coverage.',
    impact: 'Another self-reinforcing cycle that keeps third parties invisible.',
    status: 'broken',
  },
];

const foundingFathersQuotes = [
  {
    name: 'George Washington',
    title: 'Farewell Address, 1796',
    quote: 'The alternate domination of one faction over another, sharpened by the spirit of revenge, natural to party dissension, which in different ages and countries has perpetrated the most horrid enormities, is itself a frightful despotism.',
    source: 'Yale Avalon Project',
    sourceUrl: 'https://avalon.law.yale.edu/18th_century/washing.asp',
  },
  {
    name: 'John Adams',
    title: 'Letter to Jonathan Jackson, 1780',
    quote: 'There is nothing which I dread so much as a division of the republic into two great parties, each arranged under its leader, and concerting measures in opposition to each other. This, in my humble apprehension, is to be dreaded as the greatest political evil under our Constitution.',
    source: 'The Works of John Adams, Vol. 9',
    sourceUrl: 'https://founders.archives.gov/',
  },
  {
    name: 'Thomas Jefferson',
    title: 'First Inaugural Address, 1801',
    quote: 'Let us, then, fellow-citizens, unite with one heart and one mind. Let us restore to social intercourse that harmony and affection without which liberty and even life itself are but dreary things... We are all Republicans, we are all Federalists.',
    source: 'Yale Avalon Project',
    sourceUrl: 'https://avalon.law.yale.edu/19th_century/jefinau1.asp',
  },
];

function ElectionsPageContent() {
  const totalSignatures = ballotAccessExamples.reduce((sum, s) => sum + s.signatures, 0);
  
  // Fetch live FEC candidate data
  const { data: candidatesData, loading: candidatesLoading, error: candidatesError, refetch } = useCandidates();
  
  // Get top fundraisers (presidential candidates)
  const topFundraisers = candidatesData?.data
    ?.filter(c => c.office === 'P') // Presidential candidates
    ?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Election Funding</h1>
          </div>
          <p className="text-xl text-purple-100 max-w-3xl mb-6">
            The American two-party system isn&apos;t a natural phenomenon — it&apos;s engineered through 
            laws, rules, and barriers that make third-party success nearly impossible.
          </p>
          <div className="bg-purple-900/50 border border-purple-400/30 rounded-lg p-4 max-w-3xl">
            <p className="text-purple-100 font-medium">
              <span className="text-yellow-300">⚠️ Editorial Note:</span> This page departs from our usual &quot;just the data&quot; approach. 
              The structural barriers against third parties are so severe that presenting them without context 
              would be misleading. The data speaks for itself — the system is rigged.
            </p>
          </div>
        </div>
      </div>

      {/* Live Campaign Finance Data */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 -mt-16 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Live Campaign Finance Data
              {candidatesData && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({candidatesData.cycle} Cycle)
                </span>
              )}
            </h2>
            {candidatesLoading && <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />}
          </div>

          {candidatesError ? (
            <ErrorStateCompact message="Failed to load FEC data" onRetry={refetch} />
          ) : candidatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : topFundraisers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Raised</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topFundraisers.map((candidate, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPartyColor(candidate.party)}`}>
                            {candidate.party || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {formatCurrency(candidate.receipts)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCurrency(candidate.disbursements)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Source: {candidatesData?.source}</span>
                <span className="text-green-600">✓ Live from FEC API</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No presidential candidate data available for this cycle</p>
          )}
        </div>
      </div>

      {/* Founding Fathers Warning */}
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">The Founders Warned Us</h2>
            <p className="text-gray-600 mt-2">
              The men who built this nation foresaw the dangers of faction and party division.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {foundingFathersQuotes.map((founder, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{founder.name}</h3>
                  <p className="text-sm text-amber-700">{founder.title}</p>
                </div>
                <blockquote className="text-gray-700 italic text-sm leading-relaxed mb-4">
                  &quot;{founder.quote}&quot;
                </blockquote>
                <a 
                  href={founder.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Source: {founder.source}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Core Problem - Systemic Barriers */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Systemic Barriers to Third Parties
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {systemicBarriers.map((barrier, idx) => {
            const Icon = barrier.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">{barrier.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{barrier.description}</p>
                <p className="text-red-700 text-sm font-medium">{barrier.impact}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Party Advantage */}
      <div className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Scale className="h-6 w-6 text-purple-600" />
            The Two-Party Advantage
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Major Parties */}
            <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-lg p-6 border-2 border-green-500">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Democrats & Republicans</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>${(fundingComparison.majorPartyGrant / 1_000_000).toFixed(1)}M</strong> public funding upfront</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Automatic</strong> ballot access in all 50 states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Guaranteed</strong> debate invitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Billions</strong> in Super PAC support</span>
                </li>
              </ul>
            </div>
            
            {/* Third Parties */}
            <div className="bg-white rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Everyone Else</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>$0</strong> until you get 5% in the previous election</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>Must collect signatures</strong> in each state (often 100K+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>15% polling</strong> required for debates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>Minimal</strong> media coverage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ballot Access */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Ballot Access: The Hidden Tax
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">
              Major parties have <strong>automatic ballot access</strong>. Third parties must collect signatures.
            </p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Signatures</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Major Party?</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ballotAccessExamples.map((state, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{state.state}</td>
                  <td className="px-6 py-4 text-right text-red-600 font-medium">{state.signatures.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{state.deadline}</td>
                  <td className="px-6 py-4 text-center text-green-600">Automatic ✓</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 font-bold">Just these 8 states</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">{totalSignatures.toLocaleString()}</td>
                <td colSpan={2} className="px-6 py-4 text-right text-gray-500 text-sm">
                  + 42 more states
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-600" />
            Third Party History
          </h2>

          {/* Third Party Vote Share Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Third Party Vote Share Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={thirdPartyHistory.map(h => ({
                  year: h.year.toString(),
                  percent: h.percent,
                  candidate: h.candidate,
                  party: h.party,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 20]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}%`,
                    `${props.payload.candidate} (${props.payload.party})`
                  ]}
                />
                <Bar 
                  dataKey="percent" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ross Perot (1992) remains the most successful third-party candidate in modern history
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vote %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Public Funding</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {thirdPartyHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{row.year}</td>
                    <td className="px-6 py-4">{row.candidate}</td>
                    <td className="px-6 py-4 text-gray-500">{row.party}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={row.percent >= 5 ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {row.percent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{row.funding}</td>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <a href="https://www.fec.gov/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Federal Election Commission (FEC)</a> - Campaign finance data (Live API)</li>
              <li>• <strong>Commission on Presidential Debates</strong> - Debate qualification criteria</li>
              <li>• <strong>State Election Boards</strong> - Ballot access requirements</li>
              <li>• <strong>Ballot Access News</strong> - Signature requirements and deadlines</li>
            </ul>
            {candidatesData && (
              <p className="mt-4 text-xs text-green-600">
                ✓ Campaign finance data fetched: {new Date(candidatesData.fetched_at).toLocaleString()}
              </p>
            )}
          </div>
          
          <DownloadRawData
            endpoints={[
              {
                label: 'Campaign Finance Data',
                url: `${API_URL}/api/v1/elections/candidates`,
                filename: 'election_candidates.json'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default function ElectionsPage() {
  return (
    <ErrorBoundary>
      <ElectionsPageContent />
    </ErrorBoundary>
  );
}
