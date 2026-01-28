'use client';

import { Vote, AlertTriangle, DollarSign, Users, Tv, FileText, TrendingUp, Scale, XCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Data based on FEC, CPD, and state election board records
const fundingComparison = {
  majorPartyGrant: 123_500_000,  // 2024 general election grant
  thirdPartyThreshold: 5,        // Percent needed for ANY funding
  thirdPartyFundingTiming: 'AFTER the election (retroactive)',
  majorPartyFundingTiming: 'BEFORE the election (upfront)',
};

const debateRequirements = {
  pollingThreshold: 15,  // CPD requirement
  ballotAccessStates: 'Enough states for 270 electoral votes',
  organizerHistory: 'Founded by former Democratic and Republican party chairs',
};

// Approximate ballot access signature requirements by state (varies by year)
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

// Historical third party performance
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

// The systemic barriers
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

// Founding Fathers quotes with verified sources
const foundingFathersQuotes = [
  {
    name: 'George Washington',
    title: 'Farewell Address, 1796',
    quote: 'The alternate domination of one faction over another, sharpened by the spirit of revenge, natural to party dissension, which in different ages and countries has perpetrated the most horrid enormities, is itself a frightful despotism.',
    source: 'Yale Avalon Project - Washington\'s Farewell Address',
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
    source: 'Yale Avalon Project - Jefferson\'s First Inaugural',
    sourceUrl: 'https://avalon.law.yale.edu/19th_century/jefinau1.asp',
  },
];

export default function ElectionsPage() {
  const totalSignatures = ballotAccessExamples.reduce((sum, s) => sum + s.signatures, 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Editorial Stance */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Election Funding</h1>
          </div>
          <p className="text-xl text-purple-100 max-w-3xl mb-6">
            The American two-party system isn't a natural phenomenon — it's engineered through 
            laws, rules, and barriers that make third-party success nearly impossible.
          </p>
          <div className="bg-purple-900/50 border border-purple-400/30 rounded-lg p-4 max-w-3xl">
            <p className="text-purple-100 font-medium">
              <span className="text-yellow-300">⚠️ Editorial Note:</span> This page departs from our usual "just the data" approach. 
              The structural barriers against third parties are so severe that presenting them without context 
              would be misleading. The data speaks for itself — the system is rigged.
            </p>
          </div>
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
                  "{founder.quote}"
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
          
          <div className="mt-8 text-center">
            <p className="text-gray-700 max-w-3xl mx-auto">
              <strong>They predicted exactly where we are today.</strong> Washington warned of "frightful despotism" 
              arising from party rivalry. Adams called two-party division "the greatest political evil." 
              Jefferson pleaded for unity over faction. We didn't listen.
            </p>
          </div>
        </div>
      </div>

      {/* The Core Problem */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 -mt-8 relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                  <span><strong>${(fundingComparison.majorPartyGrant / 1_000_000).toFixed(1)}M</strong> public funding upfront (before election)</span>
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
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Constant</strong> media coverage</span>
                </li>
              </ul>
            </div>
            
            {/* Third Parties */}
            <div className="bg-gray-100 rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Everyone Else</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>$0</strong> public funding until achieving 5% (then retroactive)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Must collect <strong>700,000+</strong> signatures across states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Need <strong>15% polling</strong> for debate access (impossible without debates)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>Minimal</strong> donor support (corporate money goes to winners)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span><strong>Sporadic</strong> media coverage, often dismissive</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Systemic Barriers */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          The Four Barriers That Kill Third Parties
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {systemicBarriers.map((barrier, idx) => {
            const Icon = barrier.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{barrier.title}</h3>
                </div>
                <p className="text-gray-600 mb-3">{barrier.description}</p>
                <p className="text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg">
                  <strong>Impact:</strong> {barrier.impact}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Funding Deep Dive */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            The Public Funding Scam
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It's Supposed to Work</h3>
              <p className="text-gray-600 mb-4">
                The Presidential Election Campaign Fund, funded by the $3 tax checkoff, was created to 
                "level the playing field" and reduce candidates' dependence on large donors.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">How It Actually Works</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-900">Major Party Nominee (D or R)</p>
                  <p className="text-blue-700">Receives <strong>${(fundingComparison.majorPartyGrant / 1_000_000).toFixed(1)} million</strong> immediately after nomination</p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-medium text-amber-900">Third Party Candidate</p>
                  <p className="text-amber-700">Must get <strong>5% of the popular vote</strong> first</p>
                  <p className="text-amber-700">Then receives <strong>partial</strong> funding <strong>after</strong> the election</p>
                  <p className="text-amber-700 text-sm mt-2">Translation: Run an underfunded campaign to earn funding for next time</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The Numbers Don't Lie</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Party Type</th>
                      <th className="text-right py-2">Funding</th>
                      <th className="text-right py-2">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Major Party (D/R)</td>
                      <td className="text-right font-bold text-green-600">$123.5M</td>
                      <td className="text-right">Before</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Third Party (5-25%)</td>
                      <td className="text-right font-bold text-amber-600">Partial</td>
                      <td className="text-right">After</td>
                    </tr>
                    <tr>
                      <td className="py-3">Third Party (&lt;5%)</td>
                      <td className="text-right font-bold text-red-600">$0</td>
                      <td className="text-right">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Think about it:</strong> To prove you deserve funding, you must first run a campaign 
                  without funding against opponents who have $123.5 million. Only Ross Perot (a billionaire) 
                  ever crossed the 5% threshold in modern times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debate Access */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Tv className="h-6 w-6 text-purple-600" />
          The Debate Exclusion
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission on Presidential Debates</h3>
              <p className="text-gray-600 mb-4">
                The CPD was founded in 1987 by <strong>Paul G. Kirk Jr.</strong> (then-Chairman of the Democratic 
                National Committee) and <strong>Frank J. Fahrenkopf Jr.</strong> (then-Chairman of the Republican 
                National Committee). Its stated goal is to "ensure debates are held every four years."
              </p>
              <p className="text-gray-600 mb-4">
                In practice, its 15% polling threshold ensures that only Democrats and Republicans can participate.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-purple-900 mb-2">The Catch-22</h4>
                <div className="flex items-center gap-4 text-sm text-purple-800">
                  <div className="text-center">
                    <p className="font-medium">No Debates</p>
                    <p>↓</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No Visibility</p>
                    <p>↓</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No Polling</p>
                    <p>↓</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No Debates</p>
                    <p>↺</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CPD Requirements</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">Constitutionally eligible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">On ballot in enough states for 270 EVs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-sm"><strong>15% in 5 national polls</strong></span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  Since 1992, only <strong>Ross Perot</strong> has qualified under these rules 
                  (he was polling at 39% before dropping out temporarily).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ballot Access */}
      <div className="bg-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Ballot Access: The Hidden Tax
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">
                Major parties have <strong>automatic ballot access</strong>. Third parties must collect signatures 
                in each state, often with different rules, deadlines, and requirements.
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Signatures Required</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Major Party?</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ballotAccessExamples.map((state, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{state.state}</td>
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
                    + 42 more states with similar requirements
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <strong>The real cost:</strong> At roughly $1-3 per signature (hiring petition gatherers, legal fees, 
              state challenges), ballot access alone can cost a third party <strong>$5-15 million</strong> — money 
              that Democrats and Republicans spend on ads, staff, and outreach instead.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Users className="h-6 w-6 text-gray-600" />
          Third Party History: A Graveyard
        </h2>
        
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
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            <strong>The pattern is clear:</strong> In 30+ years, only one candidate (Ross Perot, a billionaire 
            who self-funded) ever crossed the 5% threshold. The system doesn't just discourage third parties — 
            it makes their success mathematically implausible.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-purple-700 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">This Needs to Change</h2>
          <p className="text-xl text-purple-100 mb-8">
            A healthy democracy requires competition. When two private organizations control ballot access, 
            debate participation, and public funding, that's not democracy — it's a duopoly.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-purple-800/50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Reform Public Funding</h3>
              <p className="text-purple-200 text-sm">
                Provide proportional funding to ALL candidates who meet basic viability thresholds, 
                not just the previous election's winners.
              </p>
            </div>
            <div className="bg-purple-800/50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Open the Debates</h3>
              <p className="text-purple-200 text-sm">
                Lower the polling threshold or replace it with ballot access requirements. 
                If you're on enough ballots to win, you should be in the debates.
              </p>
            </div>
            <div className="bg-purple-800/50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Simplify Ballot Access</h3>
              <p className="text-purple-200 text-sm">
                Create uniform federal standards for presidential ballot access. 
                One set of rules, one deadline, equal treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• <strong>Federal Election Commission (FEC)</strong> - Public funding amounts, contribution limits</li>
            <li>• <strong>Commission on Presidential Debates</strong> - Debate qualification criteria</li>
            <li>• <strong>State Election Boards</strong> - Ballot access requirements (vary by state and year)</li>
            <li>• <strong>Dave Leip's Atlas of U.S. Presidential Elections</strong> - Historical third party results</li>
            <li>• <strong>Ballot Access News</strong> - Signature requirements and deadlines</li>
          </ul>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Ballot access requirements change each election cycle. The figures shown are 
              representative of typical requirements. Check your state's election board for current rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
