import Link from 'next/link';
import { BarChart3, TrendingUp, Users, DollarSign, Briefcase, Building2, ArrowRight, Vote, Shield, Target, Eye } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock trades by members of Congress under STOCK Act disclosures.',
    href: '/congress',
    icon: TrendingUp,
    stats: '435+ Members • Real-time Trades • Performance Tracking',
    priority: 'high',
  },
  {
    name: 'Immigration',
    description: 'Legal immigration, deportations, and border encounter statistics.',
    href: '/immigration',
    icon: Users,
    stats: 'DHS Data • Historical Trends • Country Breakdown',
    priority: 'medium',
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue, and deficit tracking by agency.',
    href: '/budget',
    icon: DollarSign,
    stats: 'USASpending.gov • Agency Breakdown • Historical Data',
    priority: 'high',
  },
  {
    name: 'Employment',
    description: 'Unemployment rates, job growth, and labor force statistics.',
    href: '/employment',
    icon: Briefcase,
    stats: 'BLS Data • State Rankings • Monthly Updates',
    priority: 'medium',
  },
  {
    name: 'National Debt',
    description: 'Federal debt tracking, who holds our debt, and historical growth.',
    href: '/debt',
    icon: Building2,
    stats: 'Treasury Data • Real-time • Debt Holders',
    priority: 'high',
  },
  {
    name: 'Election Funding',
    description: 'How the two-party system is rigged against third parties. The data speaks for itself.',
    href: '/elections',
    icon: Vote,
    stats: 'FEC Data • Public Funding • Ballot Access',
    priority: 'medium',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Federal Brutalism Style */}
      <section className="relative bg-federal-gradient text-white overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 border-4 border-white transform -rotate-12 -translate-x-48 -translate-y-48"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 border-4 border-federal-gold-400 transform rotate-45 translate-x-32"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 border-4 border-federal-red-400 transform -rotate-6 translate-y-40"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-federal-gold-400 text-federal-navy-900 px-4 py-2 text-sm font-bold uppercase tracking-wider mb-8 shadow-brutal-gold">
              <Shield className="h-4 w-4" />
              Official Government Data
            </div>
            
            {/* Main heading */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-8 leading-none text-white">
              LET'S TALK
              <br />
              <span className="text-federal-gold-400">STATISTICS</span>
            </h1>
            
            {/* Subtitle with angular design */}
            <div className="relative mb-12">
              <div className="absolute -inset-4 bg-federal-red-600 transform -skew-x-12 -z-10"></div>
              <p className="relative text-xl sm:text-2xl font-sans font-semibold uppercase tracking-wide px-4 py-6 text-white">
                Government data without the spin.
                <br />
                No agenda. Just numbers.
              </p>
            </div>
            
            {/* Description */}
            <p className="text-lg text-federal-navy-100 max-w-2xl mb-12 leading-relaxed">
              Explore congressional trading, federal spending, national debt, employment data, 
              immigration statistics, and election funding — all sourced directly from 
              official U.S. government agencies.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/debt" className="btn-federal-accent">
                <DollarSign className="h-5 w-5 mr-2" />
                National Debt
              </Link>
              <Link href="/congress" className="btn-federal-outline">
                <TrendingUp className="h-5 w-5 mr-2" />
                Congressional Trading
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom geometric accent */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-federal-gold-500 transform -skew-y-1 origin-bottom-left"></div>
      </section>

      {/* Categories Grid - Brutalist Data Sections */}
      <section className="bg-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-1 bg-federal-red-600"></div>
              <h2 className="heading-hero">DATA CATEGORIES</h2>
            </div>
            <p className="text-xl text-federal-charcoal-600 max-w-3xl font-medium">
              Each category represents a direct pipeline to official U.S. government data sources. 
              No interpretation. No manipulation. Pure statistical analysis.
            </p>
          </div>

          {/* Grid of data categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 stagger-children">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isHighPriority = category.priority === 'high';
              
              return (
                <Link key={category.name} href={category.href} className="group block">
                  <div className={`
                    ${isHighPriority ? 'card-federal-accent' : 'card-federal'} 
                    h-full p-0 transition-all duration-300 group-hover:z-10 relative
                    ${index % 2 === 0 ? 'lg:translate-y-4' : ''}
                  `}>
                    {/* Header section with icon */}
                    <div className={`
                      ${isHighPriority 
                        ? 'bg-federal-red-600 text-white' 
                        : 'bg-federal-navy-900 text-white'
                      } 
                      p-6 flex items-center justify-between
                    `}>
                      <Icon className="h-8 w-8" />
                      <div className="text-right">
                        <div className={`
                          w-6 h-6 border-2 
                          ${isHighPriority ? 'border-white' : 'border-federal-gold-400'}
                        `}></div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-serif font-semibold text-federal-navy-900 group-hover:text-federal-red-600 transition-colors leading-tight">
                          {category.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-federal-charcoal-400 group-hover:text-federal-red-600 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                      </div>
                      
                      <p className="text-federal-charcoal-600 text-sm leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Stats with data styling */}
                      <div className="pt-3 border-t border-federal-charcoal-200">
                        <p className="data-label text-xs">
                          {category.stats}
                        </p>
                      </div>
                    </div>
                    
                    {/* Priority indicator */}
                    {isHighPriority && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-federal-gold-500"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Additional info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-white border border-federal-charcoal-300 px-6 py-4 shadow-brutal">
              <Target className="h-5 w-5 text-federal-red-600" />
              <span className="font-sans font-semibold text-federal-charcoal-800 uppercase tracking-wide text-sm">
                All data sourced from official U.S. government agencies
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Government Principles */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Geometric accent */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-federal-gold-500 transform skew-y-1 origin-top-left"></div>
        
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="heading-hero mb-6">OPERATIONAL PRINCIPLES</h2>
            <div className="w-24 h-1 bg-federal-red-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-0">
            {/* Data First */}
            <div className="card-federal p-8 md:p-10 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-federal-navy-900 border-4 border-federal-gold-400 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="data-label">01</span>
                </div>
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-federal-navy-900 mb-4 uppercase tracking-wide">
                Data First
              </h3>
              <p className="text-federal-charcoal-600 leading-relaxed">
                Raw numbers from official government sources. No cherry-picking, 
                no selective framing, no editorial interpretation.
              </p>
              
              <div className="mt-6 pt-4 border-t-2 border-federal-charcoal-200">
                <span className="text-xs font-mono text-federal-charcoal-500 uppercase tracking-widest">
                  Source → Display → Analysis
                </span>
              </div>
            </div>
            
            {/* Unbiased */}
            <div className="card-federal p-8 md:p-10 group md:translate-y-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-federal-red-600 border-4 border-federal-gold-400 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="data-label">02</span>
                </div>
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-federal-navy-900 mb-4 uppercase tracking-wide">
                Unbiased
              </h3>
              <p className="text-federal-charcoal-600 leading-relaxed">
                Zero editorializing. We present statistical findings and 
                let you form your own conclusions based on the evidence.
              </p>
              
              <div className="mt-6 pt-4 border-t-2 border-federal-charcoal-200">
                <span className="text-xs font-mono text-federal-charcoal-500 uppercase tracking-widest">
                  Facts → You → Conclusions
                </span>
              </div>
            </div>
            
            {/* Transparent */}
            <div className="card-federal p-8 md:p-10 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-federal-gold-600 border-4 border-federal-navy-900 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="data-label">03</span>
                </div>
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-federal-navy-900 mb-4 uppercase tracking-wide">
                Transparent
              </h3>
              <p className="text-federal-charcoal-600 leading-relaxed">
                Every statistic links directly to its government source. 
                Full methodology disclosed. Complete verification enabled.
              </p>
              
              <div className="mt-6 pt-4 border-t-2 border-federal-charcoal-200">
                <span className="text-xs font-mono text-federal-charcoal-500 uppercase tracking-widest">
                  Source → Method → Verify
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistical Methodology - Per Capita Explanation */}
      <section className="bg-federal-charcoal-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white transform rotate-45"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-federal-gold-400 transform -rotate-12"></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 border-2 border-federal-red-400"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Methodology */}
            <div>
              <div className="mb-8">
                <div className="inline-block bg-federal-gold-500 text-federal-navy-900 px-4 py-2 text-sm font-bold uppercase tracking-wider mb-6">
                  Statistical Methodology
                </div>
                <h2 className="heading-hero text-white mb-6">
                  Understanding
                  <br />
                  <span className="text-federal-gold-400">Per Capita Rates</span>
                </h2>
              </div>
              
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Critical for fair comparisons between areas with different population sizes. 
                Raw numbers lie. Proportional analysis reveals truth.
              </p>
              
              {/* Formula display */}
              <div className="card-federal bg-white p-6 mb-8">
                <div className="text-center">
                  <p className="data-label text-federal-charcoal-600 mb-3">Standard Formula</p>
                  <div className="font-mono text-2xl font-bold text-federal-navy-900 mb-4">
                    (Count ÷ Population) × 100,000
                  </div>
                  <div className="text-sm text-federal-charcoal-600">
                    = Rate per 100,000 people
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 font-mono">
                <strong className="text-federal-gold-400">EXAMPLE:</strong> California's raw numbers dwarf Wyoming's, 
                but per capita analysis shows relative impact per citizen.
              </p>
            </div>
            
            {/* Right: Comparative Example */}
            <div className="space-y-6">
              <h3 className="heading-section text-white mb-8">Comparative Analysis</h3>
              
              {/* City A */}
              <div className="card-federal bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-federal-navy-900 flex items-center justify-center">
                      <span className="text-xl text-white font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-federal-navy-900">Metropolitan Area</p>
                      <p className="text-sm text-federal-charcoal-600">Large Population Center</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="data-label">Total Incidents</span>
                    <span className="data-value text-federal-navy-900">10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="data-label">Population</span>
                    <span className="data-value text-federal-navy-900">10,000,000</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t-2 border-federal-charcoal-200">
                  <div className="flex justify-between items-center">
                    <span className="data-label">Per Capita Rate</span>
                    <span className="data-value text-lg text-federal-gold-600">100 / 100k</span>
                  </div>
                </div>
              </div>
              
              {/* City B */}
              <div className="card-federal-accent bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-federal-red-600 flex items-center justify-center">
                      <span className="text-xl text-white font-bold">B</span>
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-federal-navy-900">Rural Region</p>
                      <p className="text-sm text-federal-charcoal-600">Smaller Population</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="data-label">Total Incidents</span>
                    <span className="data-value text-federal-navy-900">500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="data-label">Population</span>
                    <span className="data-value text-federal-navy-900">100,000</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t-2 border-federal-red-600">
                  <div className="flex justify-between items-center">
                    <span className="data-label">Per Capita Rate</span>
                    <span className="data-value text-lg text-federal-red-600">500 / 100k</span>
                  </div>
                </div>
              </div>
              
              {/* Conclusion */}
              <div className="bg-federal-gold-500 text-federal-navy-900 p-6 shadow-brutal-gold">
                <p className="font-serif font-semibold text-center">
                  Region B: <span className="text-xl">5× Higher</span> per capita rate
                </p>
                <p className="text-sm text-center mt-2 font-mono uppercase tracking-wide">
                  Fewer total incidents, greater relative impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-federal-red-600 py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Geometric elements */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-federal-gold-500 transform skew-y-1 origin-top-right"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-federal-navy-900 transform -skew-y-1 origin-bottom-left"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="heading-hero text-white mb-8">
            START YOUR
            <br />
            <span className="text-federal-gold-400">ANALYSIS</span>
          </h2>
          
          <p className="text-xl text-red-100 mb-12 max-w-3xl mx-auto font-medium">
            Choose any data category. Full access to government statistics. 
            Download capabilities included. Zero cost.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/debt" className="btn-federal group">
              <span className="bg-white text-federal-red-600 border border-federal-red-600">
                <Building2 className="h-5 w-5 mr-3" />
                National Debt Analysis
              </span>
            </Link>
            
            <div className="text-white font-mono text-sm opacity-75">OR</div>
            
            <Link href="/congress" className="btn-federal group">
              <span className="bg-federal-gold-500 text-federal-navy-900 border border-federal-gold-500">
                <TrendingUp className="h-5 w-5 mr-3" />
                Congressional Trading
              </span>
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-red-500">
            <p className="text-sm text-red-200 font-mono uppercase tracking-widest">
              All data verified • Sources cited • Methods disclosed
            </p>
          </div>
        </div>
      </section>

      {/* Data Source Attribution */}
      <section className="bg-federal-navy-950 text-gray-400 py-12 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left md:text-left">
              <h4 className="text-white font-serif font-semibold mb-3 text-lg">Official Data Sources</h4>
              <p className="text-sm leading-relaxed">
                Direct integration with U.S. Treasury, Department of Homeland Security, 
                Bureau of Labor Statistics, Office of Management and Budget, 
                and Federal Election Commission databases.
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <h4 className="text-white font-serif font-semibold mb-3 text-lg">Built By</h4>
              <p className="text-sm">
                <a 
                  href="https://telep.io" 
                  className="text-federal-gold-400 hover:text-federal-gold-300 font-medium transition-colors"
                >
                  Telep IO
                </a>
                <br />
                <span className="text-gray-500">Making government data accessible</span>
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
              Statistical analysis for democratic transparency
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
