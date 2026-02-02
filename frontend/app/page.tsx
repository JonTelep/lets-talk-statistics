import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Briefcase, Building2, ArrowRight, Vote, BarChart3 } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock trades by members of Congress under STOCK Act disclosures.',
    href: '/congress',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    stats: '435+ Members • Real-time Trades • Performance Tracking',
  },
  {
    name: 'Immigration',
    description: 'Legal immigration, deportations, and border encounter statistics.',
    href: '/immigration',
    icon: Users,
    iconColor: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    stats: 'DHS Data • Historical Trends • Country Breakdown',
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue, and deficit tracking by agency.',
    href: '/budget',
    icon: DollarSign,
    iconColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    stats: 'USASpending.gov • Agency Breakdown • Historical Data',
  },
  {
    name: 'Employment',
    description: 'Unemployment rates, job growth, and labor force statistics.',
    href: '/employment',
    icon: Briefcase,
    iconColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-indigo-50',
    stats: 'BLS Data • State Rankings • Monthly Updates',
  },
  {
    name: 'National Debt',
    description: 'Federal debt tracking, who holds our debt, and historical growth.',
    href: '/debt',
    icon: Building2,
    iconColor: 'text-red-600',
    bgGradient: 'from-red-50 to-rose-50',
    stats: 'Treasury Data • Real-time • Debt Holders',
  },
  {
    name: 'Election Funding',
    description: 'How the two-party system is rigged against third parties. The data speaks for itself.',
    href: '/elections',
    icon: Vote,
    iconColor: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-purple-50',
    stats: 'FEC Data • Public Funding • Ballot Access',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-minimal-white via-minimal-gray-50 to-minimal-gray-100 relative overflow-hidden">
        <div className="container-width">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-minimal-purple-600 mb-8 shadow-minimal-lg">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-display-lg font-bold font-display gradient-text mb-8 tracking-tight">
              Let's Talk Statistics
            </h1>
            <p className="text-2xl text-minimal-gray-600 max-w-4xl mx-auto mb-6 text-balance">
              Government data, beautifully presented.
            </p>
            <p className="text-xl text-minimal-gray-500 max-w-3xl mx-auto mb-12">
              Explore congressional trading, immigration, federal spending, employment, 
              national debt, and elections — all from official government sources.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-minimal-white/60 backdrop-blur-glass rounded-full border border-minimal-gray-200 shadow-minimal">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-minimal-gray-700">Live data • Updated daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-padding bg-minimal-white">
        <div className="container-width">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-display-sm font-bold text-minimal-gray-900 mb-6">
              Explore the Data
            </h2>
            <p className="text-xl text-minimal-gray-600 max-w-3xl mx-auto text-balance">
              Choose a category to dive into the statistics. All data comes from official 
              U.S. government sources and is updated regularly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group block">
                  <div className="minimal-card p-8 h-full">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${category.bgGradient} mb-6 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-8 w-8 ${category.iconColor}`} />
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-minimal-gray-900 group-hover:text-primary-600 transition-colors">
                          {category.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-minimal-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-minimal-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    <div className="border-t border-minimal-gray-100 pt-4">
                      <p className="text-sm font-medium text-minimal-gray-500">
                        {category.stats}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding bg-minimal-gray-50">
        <div className="container-width">
          <div className="text-center mb-20">
            <h2 className="text-display-sm font-bold text-minimal-gray-900 mb-6">
              Our Philosophy
            </h2>
            <p className="text-xl text-minimal-gray-600 max-w-3xl mx-auto">
              We believe in the power of data to inform and enlighten.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 mb-6 group-hover:bg-blue-100 transition-colors">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-minimal-gray-900 mb-4">Data First</h3>
              <p className="text-minimal-gray-600 leading-relaxed">
                We present the raw numbers from official government sources. 
                No cherry-picking, no selective framing.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-green-50 mb-6 group-hover:bg-green-100 transition-colors">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold text-minimal-gray-900 mb-4">Unbiased</h3>
              <p className="text-minimal-gray-600 leading-relaxed">
                No editorializing. We show what the data says and let you 
                draw your own conclusions.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-50 mb-6 group-hover:bg-purple-100 transition-colors">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-minimal-gray-900 mb-4">Transparent</h3>
              <p className="text-minimal-gray-600 leading-relaxed">
                Every statistic links back to its source. You can verify 
                everything we present.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Statistics */}
      <section className="section-padding bg-minimal-white">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-display-sm font-bold text-minimal-gray-900 mb-8">
                Understanding Per Capita
              </h2>
              <p className="text-xl text-minimal-gray-600 mb-8 leading-relaxed">
                Throughout this site, you'll see "per capita" rates — a crucial concept for 
                fair comparisons between areas with different population sizes.
              </p>
              <div className="minimal-card p-8">
                <p className="font-mono text-lg text-minimal-gray-700 mb-6 font-feature-numeric">
                  Per Capita Rate = (Count ÷ Population) × 100,000
                </p>
                <p className="text-minimal-gray-600 leading-relaxed">
                  <strong>Example:</strong> California may have more total incidents than Wyoming, 
                  but per capita rates reveal which state has a higher rate relative to its population.
                </p>
              </div>
            </div>
            
            <div className="minimal-card p-10">
              <h3 className="text-2xl font-semibold text-minimal-gray-900 mb-8">Why It Matters</h3>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-minimal-gray-900 mb-1">City A</p>
                    <p className="text-minimal-gray-600 mb-2">10,000 incidents • 10M people</p>
                    <p className="font-mono font-semibold text-blue-600">= 100 per 100,000</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-minimal-gray-200"></div>
                
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏘️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-minimal-gray-900 mb-1">Town B</p>
                    <p className="text-minimal-gray-600 mb-2">500 incidents • 100K people</p>
                    <p className="font-mono font-semibold text-red-600">= 500 per 100,000</p>
                  </div>
                </div>
                
                <div className="bg-minimal-gray-50 rounded-xl p-6 border-l-4 border-amber-400">
                  <p className="font-medium text-minimal-gray-700">
                    Town B has fewer total incidents but a <strong>5x higher rate</strong> per capita.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary-600 to-minimal-purple-700">
        <div className="container-width">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-display-sm font-bold mb-6">
              Ready to Explore?
            </h2>
            <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto text-balance">
              Pick a category above and start exploring the data. All statistics are free to access 
              and downloadable for your own analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/debt"
                className="minimal-button-primary px-10 py-4 text-lg bg-white text-primary-600 hover:bg-minimal-gray-50"
              >
                Explore National Debt
              </Link>
              <Link
                href="/about"
                className="minimal-button-secondary px-10 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-minimal-gray-900 text-minimal-gray-400 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-2">
            Data sourced from FBI, DHS, Treasury, BLS, OMB, and other official U.S. government agencies.
          </p>
          <p>
            Built by <a href="https://telep.io" className="text-primary-400 hover:text-primary-300 transition-colors">Telep IO</a> — 
            Making data accessible to everyone.
          </p>
        </div>
      </section>
    </div>
  );
}
