import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Note: In production, this would come from the API
const mockStats = {
  totalTrades: 12847,
  totalVolume: '$2.4B',
  avgReturn: '+12.3%',
  tradersCount: 435,
  lastUpdated: '2025-01-26',
};

const recentTrades = [
  { politician: 'Nancy Pelosi', party: 'D', state: 'CA', stock: 'NVDA', type: 'Buy', amount: '$1M - $5M', date: '2025-01-20', return: '+15.2%' },
  { politician: 'Dan Crenshaw', party: 'R', state: 'TX', stock: 'MSFT', type: 'Sell', amount: '$100K - $250K', date: '2025-01-18', return: '+8.4%' },
  { politician: 'Josh Gottheimer', party: 'D', state: 'NJ', stock: 'AAPL', type: 'Buy', amount: '$50K - $100K', date: '2025-01-15', return: '+3.1%' },
  { politician: 'Marjorie Taylor Greene', party: 'R', state: 'GA', stock: 'TSLA', type: 'Buy', amount: '$15K - $50K', date: '2025-01-14', return: '-2.8%' },
  { politician: 'Tommy Tuberville', party: 'R', state: 'AL', stock: 'AMD', type: 'Buy', amount: '$250K - $500K', date: '2025-01-12', return: '+22.1%' },
];

const topPerformers = [
  { name: 'Nancy Pelosi', party: 'D', chamber: 'House', avgReturn: '+65.4%', trades: 142 },
  { name: 'Brian Mast', party: 'R', chamber: 'House', avgReturn: '+48.2%', trades: 87 },
  { name: 'Austin Scott', party: 'R', chamber: 'House', avgReturn: '+42.1%', trades: 63 },
  { name: 'Josh Gottheimer', party: 'D', chamber: 'House', avgReturn: '+38.7%', trades: 156 },
  { name: 'Mark Green', party: 'R', chamber: 'House', avgReturn: '+35.2%', trades: 94 },
];

export default function CongressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Congressional Stock Trading</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Track stock trades made by members of Congress. Under the STOCK Act, 
            members must disclose trades within 45 days. Explore who's trading what, 
            and how their portfolios perform.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> All data comes from official Congressional financial disclosures 
            required by the STOCK Act. Trades are self-reported by members and may have a reporting delay 
            of up to 45 days. This is informational data only — not financial advice.
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Trades
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalTrades.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Total Volume
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalVolume}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Avg Return
            </div>
            <p className="text-2xl font-bold text-green-600">{mockStats.avgReturn}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              Active Traders
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.tradersCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Last Updated
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockStats.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Trades</h2>
                <Link href="/congress/trades" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Politician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentTrades.map((trade, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                              trade.party === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {trade.party}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{trade.politician}</div>
                              <div className="text-xs text-gray-500">{trade.state}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            trade.return.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.return}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                <Link href="/congress/politicians" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {topPerformers.map((person, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-300 mr-3">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.party} · {person.chamber} · {person.trades} trades</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{person.avgReturn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources Card */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Senate Financial Disclosures (efdsearch.senate.gov)</li>
                <li>• House Financial Disclosures (disclosures-clerk.house.gov)</li>
                <li>• STOCK Act of 2012 Required Disclosures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
