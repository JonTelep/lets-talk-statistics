import Link from 'next/link';
import { BarChart3, TrendingUp, Users, DollarSign, Briefcase, Building2, ArrowRight, Vote } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock trades by members of Congress under STOCK Act disclosures.',
    href: '/congress',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    stats: '435+ Members • Real-time Trades • Performance Tracking',
  },
  {
    name: 'Immigration',
    description: 'Legal immigration, deportations, and border encounter statistics.',
    href: '/immigration',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    stats: 'DHS Data • Historical Trends • Country Breakdown',
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue, and deficit tracking by agency.',
    href: '/budget',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    stats: 'USASpending.gov • Agency Breakdown • Historical Data',
  },
  {
    name: 'Employment',
    description: 'Unemployment rates, job growth, and labor force statistics.',
    href: '/employment',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    stats: 'BLS Data • State Rankings • Monthly Updates',
  },
  {
    name: 'National Debt',
    description: 'Federal debt tracking, who holds our debt, and historical growth.',
    href: '/debt',
    icon: Building2,
    color: 'from-red-500 to-rose-600',
    stats: 'Treasury Data • Real-time • Debt Holders',
  },
  {
    name: 'Election Funding',
    description: 'How the two-party system is rigged against third parties. The data speaks for itself.',
    href: '/elections',
    icon: Vote,
    color: 'from-purple-600 to-indigo-700',
    stats: 'FEC Data • Public Funding • Ballot Access',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <BarChart3 className="h-16 w-16 text-primary-200" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Let's Talk Statistics
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
              Government data, clearly presented. No spin, no agenda — just the numbers.
            </p>
            <p className="text-primary-200 max-w-2xl mx-auto">
              Explore congressional trading, immigration, federal spending,
              employment, national debt, and elections — all from official government sources.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore the Data</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose a category to dive into the statistics. All data comes from official 
              U.S. government sources and is updated regularly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className={`bg-gradient-to-r ${category.color} p-6`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {category.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <p className="text-sm text-gray-500">{category.stats}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Philosophy</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data First</h3>
              <p className="text-gray-600">
                We present the raw numbers from official government sources. No cherry-picking, no selective framing.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unbiased</h3>
              <p className="text-gray-600">
                No editorializing. We show what the data says and let you draw your own conclusions.
              </p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-gray-600">
                Every statistic links back to its source. You can verify everything we present.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Statistics */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding Per Capita
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Throughout this site, you'll see "per capita" rates — a crucial concept for 
                fair comparisons between areas with different population sizes.
              </p>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="font-mono text-gray-700 mb-4">
                  Per Capita Rate = (Count ÷ Population) × 100,000
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Example:</strong> California may have more total crimes than Wyoming, 
                  but per capita rates reveal which state has a higher rate relative to its population.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Why It Matters</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏙️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">City A</p>
                    <p className="text-sm text-gray-600">10,000 incidents • 10M people</p>
                    <p className="text-sm font-medium text-blue-600">= 100 per 100,000</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏘️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Town B</p>
                    <p className="text-sm text-gray-600">500 incidents • 100K people</p>
                    <p className="text-sm font-medium text-red-600">= 500 per 100,000</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 pt-4 border-t">
                  Town B has fewer total incidents but a <strong>5x higher rate</strong> per capita.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Pick a category above and start exploring the data. All statistics are free to access 
            and downloadable for your own analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/debt"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-primary-50"
            >
              Explore National Debt
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-3 text-base font-medium text-white hover:bg-primary-700"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>
          Data sourced from FBI, DHS, Treasury, BLS, OMB, and other official U.S. government agencies.
          <br />
          Built by <a href="https://telep.io" className="text-primary-400 hover:text-primary-300">Telep IO</a> — 
          Making data accessible to everyone.
        </p>
      </section>
    </div>
  );
}
