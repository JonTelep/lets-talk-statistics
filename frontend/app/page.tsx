import Link from 'next/link';
import { 
  ArrowRight, BarChart3, TrendingUp, Users, DollarSign, 
  Building2, Vote, Clock, ExternalLink, Target, Award,
  FileText, Database, Shield, Check
} from 'lucide-react';

const featuredStories = [
  {
    category: 'Congressional Trading',
    title: 'Real-Time Congressional Stock Disclosures',
    description: 'Track every trade made by members of Congress under the STOCK Act. Complete transaction history with performance analysis and conflict detection.',
    href: '/congress',
    urgent: true,
    stats: '435+ Members • 16,000+ Trades • Live Updates',
    icon: TrendingUp,
  },
  {
    category: 'Federal Spending',
    title: 'Where Your Tax Dollars Go',
    description: 'Direct access to USASpending.gov data. Department-by-department breakdown of federal expenditures with historical trends.',
    href: '/budget',
    urgent: false,
    stats: '$6.8T Federal Budget • 15 Agencies • Monthly Updates',
    icon: DollarSign,
  },
  {
    category: 'National Debt',
    title: 'The Growing Debt Crisis',
    description: 'Treasury data showing debt composition, creditor breakdown, and per-capita impact. Updated daily from official sources.',
    href: '/debt',
    urgent: true,
    stats: '$34T Total Debt • Daily Updates • Creditor Analysis',
    icon: Building2,
  },
];

const dataCategories = [
  {
    name: 'Immigration Data',
    description: 'Department of Homeland Security statistics on legal migration, asylum claims, and border encounters.',
    href: '/immigration',
    icon: Users,
    source: 'DHS',
    updated: '2024-02-10',
  },
  {
    name: 'Employment Statistics',
    description: 'Bureau of Labor Statistics employment data, unemployment rates, and job growth by state.',
    href: '/employment',
    icon: BarChart3,
    source: 'BLS',
    updated: '2024-02-09',
  },
  {
    name: 'Election Finance',
    description: 'Federal Election Commission campaign finance data and public funding analysis.',
    href: '/elections',
    icon: Vote,
    source: 'FEC',
    updated: '2024-02-08',
  },
];

const principles = [
  {
    title: 'Source Verification',
    description: 'Every statistic linked directly to official government databases. No intermediary interpretation.',
    icon: Shield,
  },
  {
    title: 'Methodology Transparency',
    description: 'Complete disclosure of data collection methods, calculations, and any adjustments made.',
    icon: FileText,
  },
  {
    title: 'Real-Time Updates',
    description: 'Automated daily synchronization with government data feeds. Timestamps on every dataset.',
    icon: Clock,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Masthead */}
      <section className="border-b-4 border-editorial-accent bg-editorial-dark text-white">
        <div className="container-editorial py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-editorial-accent flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-byline text-editorial-gold">ESTABLISHED 2024</div>
                <div className="font-display text-2xl font-bold">LET'S TALK STATISTICS</div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-editorial-gold">DATA UPDATED DAILY</div>
              <div className="opacity-90">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="section-hero">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="space-editorial">
                <div className="text-byline text-editorial-accent">
                  GOVERNMENT DATA • UNFILTERED • TRANSPARENT
                </div>
                
                <h1 className="text-display font-display text-editorial-dark mb-8">
                  Government Data
                  <span className="block text-editorial-accent">Without Spin</span>
                </h1>
                
                <p className="text-body-large text-editorial-gray max-w-2xl">
                  Direct access to official U.S. government statistical databases. 
                  No editorial interpretation. No political agenda. Pure data analysis 
                  for informed democratic participation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 pt-8">
                  <Link href="/debt" className="btn-primary group">
                    <Building2 className="h-5 w-5 mr-3" />
                    Explore Debt Data
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/congress" className="btn-secondary group">
                    <TrendingUp className="h-5 w-5 mr-3" />
                    Congressional Trades
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5">
              <div className="card-highlight p-8">
                <div className="text-center mb-6">
                  <div className="text-byline text-editorial-accent mb-2">FEATURED DATASET</div>
                  <h3 className="text-headline-3 font-display text-editorial-dark mb-4">
                    National Debt Tracker
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-data-label">Total Public Debt</div>
                      <div className="text-data-value text-editorial-accent">$34.1T</div>
                    </div>
                    <div className="text-right">
                      <div className="text-data-label">Per Citizen</div>
                      <div className="text-data-value text-editorial-dark">$102,847</div>
                    </div>
                  </div>
                  
                  <div className="divider-thin"></div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-editorial-gray">Last Updated</span>
                    <span className="font-medium text-editorial-dark">2 hours ago</span>
                  </div>
                  
                  <Link href="/debt" className="btn-accent w-full justify-center group">
                    View Full Analysis
                    <ExternalLink className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="section-content bg-paper-cream">
        <div className="container-editorial">
          <div className="text-center mb-16">
            <div className="text-byline text-editorial-accent mb-4">FEATURED INVESTIGATIONS</div>
            <h2 className="text-headline-1 font-display text-editorial-dark">
              Data-Driven Democracy
            </h2>
            <div className="divider-editorial"></div>
            <p className="text-body text-editorial-gray max-w-3xl mx-auto">
              In-depth analysis of critical government data with direct source linking 
              and transparent methodology. Updated in real-time from official databases.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredStories.map((story, index) => {
              const Icon = story.icon;
              
              return (
                <Link key={story.title} href={story.href} className="group block">
                  <article className={`card-editorial h-full p-0 hover-lift ${
                    index === 0 ? 'border-l-4 border-editorial-accent' : ''
                  }`}>
                    {story.urgent && (
                      <div className="bg-editorial-accent text-white px-4 py-2 text-center">
                        <span className="text-sm font-semibold uppercase tracking-wide">
                          Breaking Data
                        </span>
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-editorial-accent/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-editorial-accent" />
                        </div>
                        <span className="text-byline text-editorial-accent">
                          {story.category}
                        </span>
                      </div>
                      
                      <h3 className="text-headline-3 font-serif text-editorial-dark mb-4 group-hover:text-editorial-accent transition-colors">
                        {story.title}
                      </h3>
                      
                      <p className="text-body text-editorial-gray mb-6 leading-relaxed">
                        {story.description}
                      </p>
                      
                      <div className="pt-4 border-t border-border-light">
                        <div className="flex items-center justify-between">
                          <div className="text-caption text-editorial-gray">
                            {story.stats}
                          </div>
                          <ArrowRight className="h-5 w-5 text-editorial-accent group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Categories Grid */}
      <section className="section-content">
        <div className="container-editorial">
          <div className="text-center mb-16">
            <h2 className="text-headline-2 font-display text-editorial-dark mb-6">
              Government Data Feeds
            </h2>
            <p className="text-body text-editorial-gray max-w-2xl mx-auto">
              Complete access to federal statistical databases. 
              Each dataset linked directly to official government sources.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {dataCategories.map((category) => {
              const Icon = category.icon;
              
              return (
                <Link key={category.name} href={category.href} className="group block">
                  <div className="card-data h-full group-hover:shadow-editorial-lg transition-all duration-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-editorial-navy/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-editorial-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl font-semibold text-editorial-dark mb-2 group-hover:text-editorial-accent transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-editorial-gray mb-3">
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            <span className="font-medium">{category.source}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Updated {new Date(category.updated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-editorial-gray leading-relaxed mb-6">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center text-editorial-accent font-medium group-hover:text-editorial-dark transition-colors">
                      <span>View Dataset</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-feature">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-byline text-editorial-accent mb-4">OUR METHODOLOGY</div>
              <h2 className="text-headline-1 font-display text-editorial-dark mb-8">
                Transparent by Design
              </h2>
              <p className="text-body-large text-editorial-gray mb-8">
                Every statistic on this site is verifiable, every source is cited, 
                and every calculation is documented. We believe transparency isn't 
                just an ideal—it's a requirement for democratic accountability.
              </p>
              
              <div className="space-y-6">
                {principles.map((principle) => {
                  const Icon = principle.icon;
                  return (
                    <div key={principle.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-editorial-forest/10 flex items-center justify-center mt-1">
                        <Icon className="h-4 w-4 text-editorial-forest" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-semibold text-editorial-dark mb-2">
                          {principle.title}
                        </h4>
                        <p className="text-editorial-gray">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="card-feature p-8">
              <div className="text-center mb-6">
                <Target className="h-12 w-12 text-editorial-accent mx-auto mb-4" />
                <h3 className="text-headline-3 font-display text-editorial-dark">
                  Editorial Standards
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-editorial-dark">Direct Source Linking</div>
                    <div className="text-sm text-editorial-gray">Every data point links to original government database</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-editorial-dark">Zero Editorial Commentary</div>
                    <div className="text-sm text-editorial-gray">No opinion, interpretation, or political analysis</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-editorial-dark">Open Methodology</div>
                    <div className="text-sm text-editorial-gray">Complete calculation disclosure and audit trail</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-editorial-dark">Real-Time Updates</div>
                    <div className="text-sm text-editorial-gray">Automated daily sync with government feeds</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border-medium mt-6">
                <div className="text-center">
                  <Award className="h-6 w-6 text-editorial-gold mx-auto mb-2" />
                  <div className="text-sm font-medium text-editorial-dark">
                    Committed to Data Integrity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-dark">
        <div className="container-editorial text-center">
          <h2 className="text-headline-1 font-display text-white mb-6">
            Start Exploring Government Data
          </h2>
          <p className="text-body-large text-gray-300 mb-12 max-w-3xl mx-auto">
            No registration required. No cost. No agenda. 
            Just direct access to the data that shapes our democracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/debt" className="btn-primary bg-white text-editorial-dark hover:bg-gray-100">
              <Building2 className="h-5 w-5 mr-3" />
              National Debt Analysis
            </Link>
            <Link href="/congress" className="btn-secondary border-white text-white hover:bg-white hover:text-editorial-dark">
              <TrendingUp className="h-5 w-5 mr-3" />
              Congressional Trading
            </Link>
          </div>
        </div>
      </section>

      {/* Source Attribution */}
      <section className="bg-paper-cream border-t border-border-medium py-12">
        <div className="container-editorial">
          <div className="text-center">
            <h4 className="font-serif text-lg font-semibold text-editorial-dark mb-4">
              Official Data Sources
            </h4>
            <p className="text-editorial-gray max-w-4xl mx-auto mb-6">
              Direct integration with U.S. Treasury, Department of Homeland Security, 
              Bureau of Labor Statistics, Office of Management and Budget, 
              Federal Election Commission, and other federal agencies.
            </p>
            <div className="text-sm text-editorial-gray">
              Data compiled by{' '}
              <a 
                href="https://telep.io" 
                className="text-editorial-accent hover:text-editorial-dark font-medium hover-underline"
              >
                Telep IO
              </a>
              {' '}• Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}