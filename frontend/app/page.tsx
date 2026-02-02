import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Briefcase, Building2, ArrowRight, Vote, Clock, MapPin } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    kicker: 'Capitol Hill',
    description: 'How lawmakers\' stock trades reveal conflicts of interest in real-time.',
    href: '/congress',
    icon: TrendingUp,
    color: 'text-editorial-blue-600',
    borderColor: 'border-editorial-blue-600',
    stats: '435 Members Tracked',
    updated: '2 hours ago',
  },
  {
    name: 'Immigration Crisis',
    kicker: 'Border Data',
    description: 'The numbers behind America\'s immigration system and border security.',
    href: '/immigration',
    icon: Users,
    color: 'text-editorial-green-600',
    borderColor: 'border-editorial-green-600',
    stats: 'DHS Official Data',
    updated: 'Daily updates',
  },
  {
    name: 'Federal Spending',
    kicker: 'Your Tax Dollars',
    description: 'Where every dollar of government spending actually goes, by agency.',
    href: '/budget',
    icon: DollarSign,
    color: 'text-editorial-gold-600',
    borderColor: 'border-editorial-gold-600',
    stats: 'Treasury Direct',
    updated: 'Monthly',
  },
  {
    name: 'Jobs Report',
    kicker: 'Labor Market',
    description: 'Beyond the headlines: what unemployment data reveals about America.',
    href: '/employment',
    icon: Briefcase,
    color: 'text-editorial-blue-700',
    borderColor: 'border-editorial-blue-700',
    stats: 'BLS Data',
    updated: 'Monthly',
  },
  {
    name: 'National Debt',
    kicker: 'Fiscal Reality',
    description: 'The mounting debt crisis that politicians don\'t want to discuss.',
    href: '/debt',
    icon: Building2,
    color: 'text-editorial-red-600',
    borderColor: 'border-editorial-red-600',
    stats: 'Real-time tracking',
    updated: 'Live',
  },
  {
    name: 'Election Funding',
    kicker: 'Democracy Watch',
    description: 'How money flows through politics and shapes electoral outcomes.',
    href: '/elections',
    icon: Vote,
    color: 'text-editorial-gray-700',
    borderColor: 'border-editorial-gray-700',
    stats: 'FEC Reports',
    updated: 'Quarterly',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b-4 border-editorial-red-600 bg-white">
        <div className="container-editorial py-4">
          <div className="flex items-center justify-between">
            <div className="editorial-byline">
              <span className="text-editorial-red-600">GOVERNMENT DATA</span> • LIVE ANALYSIS
            </div>
            <div className="flex items-center gap-3 text-sm text-editorial-gray-600">
              <Clock className="h-4 w-4" />
              Updated continuously
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="section-editorial bg-editorial-gray-100 border-b border-editorial-gray-300">
        <div className="container-editorial">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <p className="kicker mb-4">OFFICIAL DATA ANALYSIS</p>
            <h1 className="editorial-headline text-editorial-xl mb-8">
              Let's Talk Statistics
            </h1>
            <div className="editorial-deck max-w-3xl mx-auto mb-8">
              Government data without the spin. Raw numbers from official sources, 
              presented with the rigor of investigative journalism and the clarity of data science.
            </div>
            <p className="text-lg text-editorial-gray-600 max-w-2xl mx-auto mb-12">
              From congressional stock trades to immigration flows, we track the metrics 
              that matter to American democracy.
            </p>
            <div className="inline-flex items-center gap-4 bg-white px-6 py-3 shadow-editorial border-l-4 border-editorial-red-600">
              <div className="w-3 h-3 bg-editorial-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Live data feeds • Government verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Grid */}
      <section className="section-editorial bg-white">
        <div className="container-editorial">
          <div className="mb-12">
            <h2 className="editorial-headline text-editorial-lg mb-4">
              Today's Data Stories
            </h2>
            <p className="editorial-deck max-w-2xl">
              Choose a beat to explore the underlying data. Each analysis links directly 
              to government sources and updates in real-time.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isFeature = index === 0; // Make first article featured
              
              return (
                <article key={category.name} className={`group ${isFeature ? 'lg:col-span-2' : ''}`}>
                  <Link href={category.href} className="block">
                    <div className={`editorial-card p-8 hover:shadow-editorial-lg transition-all duration-200 ${category.borderColor}`}>
                      <div className="flex items-start gap-6">
                        <div className={`flex-shrink-0 p-3 bg-editorial-gray-100 rounded ${category.color}`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <p className={`kicker mb-2 ${category.color}`}>
                            {category.kicker}
                          </p>
                          <h3 className={`editorial-headline ${isFeature ? 'text-editorial-lg' : 'text-editorial-md'} mb-3 group-hover:text-editorial-red-600 transition-colors`}>
                            {category.name}
                          </h3>
                          <p className={`editorial-deck mb-4 ${isFeature ? 'text-lg' : ''}`}>
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-editorial-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {category.stats}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {category.updated}
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-editorial-gray-400 group-hover:text-editorial-red-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Principles */}
      <section className="section-editorial bg-editorial-gray-100">
        <div className="container-editorial">
          <div className="text-center mb-16">
            <h2 className="editorial-headline text-editorial-lg mb-6">
              Our Editorial Standards
            </h2>
            <p className="editorial-deck max-w-3xl mx-auto">
              We apply the same rigorous standards as investigative journalism to government data analysis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">1</span>
              </div>
              <h3 className="editorial-headline text-editorial-sm mb-4">Source First</h3>
              <p className="text-editorial-gray-700 leading-relaxed">
                Every statistic traces back to official government APIs and databases. 
                No third-party aggregators, no interpretation layers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">2</span>
              </div>
              <h3 className="editorial-headline text-editorial-sm mb-4">Context Matters</h3>
              <p className="text-editorial-gray-700 leading-relaxed">
                Raw numbers without context mislead. We provide historical trends, 
                per-capita adjustments, and methodological transparency.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">3</span>
              </div>
              <h3 className="editorial-headline text-editorial-sm mb-4">Editorial Independence</h3>
              <p className="text-editorial-gray-700 leading-relaxed">
                We present what the data shows, not what politics demands. 
                Uncomfortable truths included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="section-editorial bg-white border-t border-editorial-gray-300">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="editorial-headline text-editorial-lg mb-8">
                Understanding the Numbers
              </h2>
              <p className="editorial-deck mb-8">
                Behind every statistic is a methodology. We explain ours so you can 
                judge the reliability of our analysis.
              </p>
              
              <div className="pullquote">
                "Population matters more than totals. Per-capita rates reveal 
                the true story behind raw counts."
              </div>
              
              <p className="text-editorial-gray-700 leading-relaxed">
                Throughout our coverage, you'll see per-capita calculations — the most reliable 
                way to compare statistics across jurisdictions of different sizes. It's the difference 
                between reporting and analysis.
              </p>
            </div>
            
            <div className="editorial-card p-10">
              <h3 className="editorial-headline text-editorial-md mb-8">The Formula</h3>
              <div className="bg-editorial-gray-100 p-6 rounded mb-6">
                <p className="font-mono text-xl text-center text-editorial-black font-bold">
                  Rate = (Count ÷ Population) × 100,000
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-editorial-blue-600 pl-6">
                  <h4 className="font-bold text-editorial-black mb-2">Large City</h4>
                  <p className="text-editorial-gray-600 mb-1">10,000 incidents • 10 million people</p>
                  <p className="stat-highlight">100 per 100k</p>
                </div>
                
                <div className="editorial-rule"></div>
                
                <div className="border-l-4 border-editorial-red-600 pl-6">
                  <h4 className="font-bold text-editorial-black mb-2">Small Town</h4>
                  <p className="text-editorial-gray-600 mb-1">500 incidents • 100,000 people</p>
                  <p className="stat-highlight">500 per 100k</p>
                </div>
                
                <div className="bg-editorial-gold-100 p-4 rounded border-l-4 border-editorial-gold-500">
                  <p className="font-bold text-editorial-black">
                    The small town's rate is 5× higher despite having fewer total incidents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-editorial bg-editorial-black text-white">
        <div className="container-editorial">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="editorial-headline text-editorial-lg text-white mb-6">
              Start Your Investigation
            </h2>
            <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Choose your beat from the stories above. Every dataset includes download 
              options for independent verification and analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/debt"
                className="editorial-button-primary px-10 py-4 text-lg"
              >
                Investigate Debt Crisis
              </Link>
              <Link
                href="/about"
                className="editorial-button-secondary px-10 py-4 text-lg border-white text-white hover:bg-white hover:text-editorial-black"
              >
                About Our Methods
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="bg-editorial-gray-800 text-editorial-gray-300 py-12 px-6 text-center border-t-4 border-editorial-red-600">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-3 font-medium">
            Data Sources: FBI • DHS • Treasury • BLS • OMB • FEC
          </p>
          <p className="editorial-byline">
            Published by <a href="https://telep.io" className="text-editorial-red-500 hover:text-editorial-red-400 transition-colors">Telep IO</a> • 
            Making government data accessible to all Americans
          </p>
        </div>
      </section>
    </div>
  );
}
