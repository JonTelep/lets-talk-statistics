import { Briefcase, TrendingUp, TrendingDown, Users, Building2, AlertTriangle, MapPin } from 'lucide-react';
import Link from 'next/link';

// Note: In production, this would come from the API
const mockStats = {
  unemploymentRate: 4.1,
  laborForce: 167.3,  // millions
  employed: 160.5,    // millions
  unemployed: 6.8,    // millions
  jobsAdded: 256000,
  lastUpdated: 'December 2024',
};

const historicalRate = [
  { month: 'Dec 2024', rate: 4.1, jobs: 256000 },
  { month: 'Nov 2024', rate: 4.2, jobs: 212000 },
  { month: 'Oct 2024', rate: 4.1, jobs: 12000 },
  { month: 'Sep 2024', rate: 4.1, jobs: 223000 },
  { month: 'Aug 2024', rate: 4.2, jobs: 159000 },
  { month: 'Jul 2024', rate: 4.3, jobs: 114000 },
  { month: 'Jun 2024', rate: 4.1, jobs: 179000 },
  { month: 'May 2024', rate: 4.0, jobs: 272000 },
];

const stateData = [
  { state: 'North Dakota', rate: 2.0, rank: 1 },
  { state: 'South Dakota', rate: 2.1, rank: 2 },
  { state: 'Nebraska', rate: 2.5, rank: 3 },
  { state: 'Vermont', rate: 2.6, rank: 4 },
  { state: 'New Hampshire', rate: 2.7, rank: 5 },
  { state: '...', rate: null, rank: null },
  { state: 'Nevada', rate: 5.7, rank: 46 },
  { state: 'California', rate: 5.4, rank: 47 },
  { state: 'District of Columbia', rate: 5.6, rank: 48 },
];

const sectorJobs = [
  { sector: 'Healthcare & Social Assistance', jobs: 62000, change: '+3.2%' },
  { sector: 'Government', jobs: 33000, change: '+1.8%' },
  { sector: 'Leisure & Hospitality', jobs: 43000, change: '+2.1%' },
  { sector: 'Professional & Business Services', jobs: 28000, change: '+1.5%' },
  { sector: 'Retail Trade', jobs: 43000, change: '+2.3%' },
  { sector: 'Construction', jobs: 8000, change: '+0.9%' },
];

const demographics = [
  { group: 'Adult Men (20+)', rate: 3.8 },
  { group: 'Adult Women (20+)', rate: 3.7 },
  { group: 'Teenagers (16-19)', rate: 12.1 },
  { group: 'White', rate: 3.6 },
  { group: 'Black or African American', rate: 6.1 },
  { group: 'Asian', rate: 3.7 },
  { group: 'Hispanic or Latino', rate: 4.9 },
];

export default function EmploymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Employment Statistics</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Track U.S. employment, unemployment rates, and job growth from the Bureau of Labor Statistics. 
            See how the labor market is performing across states, sectors, and demographics.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> Bureau of Labor Statistics (BLS) Employment Situation Report. 
            Data is seasonally adjusted. Last updated: {mockStats.lastUpdated}.
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Employment Snapshot</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Unemployment Rate
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.unemploymentRate}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4 text-green-500" />
              Employed
            </div>
            <p className="text-2xl font-bold text-green-600">{mockStats.employed}M</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4 text-red-500" />
              Unemployed
            </div>
            <p className="text-2xl font-bold text-red-600">{mockStats.unemployed}M</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4 text-gray-500" />
              Labor Force
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.laborForce}M</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Jobs Added (Monthly)
            </div>
            <p className="text-2xl font-bold text-green-600">+{mockStats.jobsAdded.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Historical Data */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Monthly Employment Data</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unemployment Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jobs Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historicalRate.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className="font-medium">{row.rate}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={row.jobs > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {row.jobs > 0 ? '+' : ''}{row.jobs.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jobs by Sector */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Job Growth by Sector (Monthly)</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {sectorJobs.map((sector, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-700">{sector.sector}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600 font-medium">+{sector.jobs.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 w-12 text-right">{sector.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* State Rankings */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">State Rankings</h2>
                <Link href="/employment/states" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {stateData.map((state, idx) => (
                  state.rank ? (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-300 w-8">#{state.rank}</span>
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{state.state}</span>
                      </div>
                      <span className={`text-sm font-medium ${state.rate! < 3 ? 'text-green-600' : state.rate! > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {state.rate}%
                      </span>
                    </div>
                  ) : (
                    <div key={idx} className="px-6 py-2 text-center text-gray-400 text-sm">...</div>
                  )
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unemployment by Demographics</h3>
              <div className="space-y-3">
                {demographics.map((demo, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{demo.group}</span>
                    <span className={`text-sm font-medium ${demo.rate < 4 ? 'text-green-600' : demo.rate > 6 ? 'text-red-600' : 'text-gray-900'}`}>
                      {demo.rate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Definitions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Definitions</h3>
              <dl className="text-sm space-y-3">
                <div>
                  <dt className="font-medium text-gray-900">Unemployment Rate</dt>
                  <dd className="text-gray-600">% of labor force that is jobless and actively seeking work.</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Labor Force</dt>
                  <dd className="text-gray-600">All people 16+ who are employed or actively looking for work.</dd>
                </div>
              </dl>
            </div>

            {/* Data Sources */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Bureau of Labor Statistics (BLS)</li>
                <li>• Current Population Survey</li>
                <li>• Current Employment Statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
