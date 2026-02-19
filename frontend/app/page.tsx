import Link from 'next/link';
import { ArrowUpRight, TrendingUp, Users, DollarSign, Briefcase, Building2, Vote, Home as HomeIcon, ChevronDown } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock trades by members of Congress under STOCK Act disclosures.',
    href: '/congress',
    icon: TrendingUp,
    stat: '435+ Members tracked',
    color: 'editorial-red',
    featured: true,
  },
  {
    name: 'Housing Markets', 
    description: 'Homeownership, construction, prices, vacancies, and mortgage rates.',
    href: '/housing',
    icon: HomeIcon,
    stat: 'FRED data (60+ series)',
    color: 'editorial-gold',
  },
  {
    name: 'Immigration Data',
    description: 'Legal immigration, deportations, and border encounter statistics.',
    href: '/immigration',
    icon: Users,
    stat: 'DHS & CBP data',
    color: 'text-primary',
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue, and deficit tracking by agency.',
    href: '/budget',
    icon: DollarSign,
    stat: 'Treasury data',
    color: 'text-primary',
  },
  {
    name: 'Labor Statistics',
    description: 'Unemployment rates, job growth, and labor force statistics.',
    href: '/employment',
    icon: Briefcase,
    stat: 'BLS monthly data',
    color: 'text-primary',
  },
  {
    name: 'National Debt',
    description: 'Federal debt tracking, creditor breakdown, and historical growth.',
    href: '/debt',
    icon: Building2,
    stat: 'Real-time Treasury',
    color: 'text-primary',
  },
  {
    name: 'Election Finance',
    description: 'Campaign finance, ballot access barriers, and electoral data.',
    href: '/elections',
    icon: Vote,
    stat: 'FEC data',
    color: 'text-primary',
  },
];

export default function Home() {
  const featuredCategory = categories.find(cat => cat.featured);
  const otherCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-12 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="editorial-accent-line animate-fade-in-up"></div>
          <h1 className="headline-1 animate-fade-in-up animate-stagger-1 mb-8 max-w-4xl">
            Government data,
            <br />
            <em className="text-editorial-red not-italic">without the spin.</em>
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-16 mt-16">
            <div className="lg:col-span-2">
              <p className="body-large animate-fade-in-up animate-stagger-2 max-w-3xl mb-8">
                We present U.S. government statistics with the rigor of financial journalism. 
                Every number sourced from official agencies. Every claim backed by data. 
                No opinions. No narratives. Just the facts — because in democracy, 
                informed citizens make better decisions.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-fade-in-up animate-stagger-3">
                <Link href="/debt" className="btn-editorial-primary">
                  Explore the Data
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/about" className="btn-editorial-secondary">
                  Our Methodology
                </Link>
              </div>
            </div>
            
            <div className="animate-fade-in-up animate-stagger-4">
              <div className="editorial-card editorial-card-elevated p-8">
                <div className="caption mb-3">LATEST UPDATE</div>
                <div className="stat-display">
                  <div className="stat-value stat-accent">$34.2T</div>
                  <div className="stat-label">National Debt</div>
                </div>
                <p className="body-small mt-4">
                  Updated daily from U.S. Treasury data. Track the numbers that matter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Category - Large Treatment */}
      {featuredCategory && (
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-surface-50">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3">
                <div className="caption mb-4 text-editorial-red animate-fade-in-up">FEATURED ANALYSIS</div>
                <h2 className="headline-2 animate-fade-in-up animate-stagger-1 mb-6">
                  {featuredCategory.name}
                </h2>
                <p className="body-large animate-fade-in-up animate-stagger-2 mb-8">
                  {featuredCategory.description} Track every disclosure, 
                  analyze trading patterns, and follow the money in real-time. 
                  Our database includes every STOCK Act filing since 2012.
                </p>
                <div className="flex items-center gap-6 animate-fade-in-up animate-stagger-3">
                  <Link href={featuredCategory.href} className="btn-editorial-accent">
                    View Congressional Trades
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Link>
                  <div className="stat-display">
                    <div className="stat-value text-2xl">{featuredCategory.stat.split(' ')[0]}</div>
                    <div className="stat-label">{featuredCategory.stat.split(' ').slice(1).join(' ')}</div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 animate-fade-in-up animate-stagger-4">
                <div className="editorial-card editorial-card-elevated p-8 bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <featuredCategory.icon className="h-6 w-6 text-editorial-red" />
                    <span className="caption">LIVE DATA</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="stat-display">
                      <div className="stat-value text-3xl">1,247</div>
                      <div className="stat-label">Total Trades This Year</div>
                    </div>
                    
                    <div className="stat-display">
                      <div className="stat-value text-3xl stat-accent">$89.4M</div>
                      <div className="stat-label">Volume Disclosed</div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <p className="body-small">
                        Data updated daily from congressional disclosure forms. 
                        Last updated: Today, 6:00 AM EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Categories - Editorial Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <div className="caption mb-4 animate-fade-in-up">DATA CATEGORIES</div>
            <h2 className="headline-3 animate-fade-in-up animate-stagger-1 mb-6 max-w-2xl">
              Seven areas of government statistics, analyzed with editorial rigor.
            </h2>
            <p className="body-text animate-fade-in-up animate-stagger-2 max-w-3xl">
              Each category draws from official U.S. government sources: Treasury, 
              Department of Homeland Security, Bureau of Labor Statistics, 
              Federal Election Commission, and congressional disclosure offices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={category.name} 
                  href={category.href} 
                  className={`group animate-fade-in-up animate-stagger-${Math.min(index + 3, 6)}`}
                >
                  <article className="editorial-card editorial-card-hover h-full p-8 bg-white">
                    <header className="flex items-start justify-between mb-6">
                      <Icon className="h-6 w-6 text-text-muted group-hover:text-editorial-red transition-colors duration-300" />
                      <ArrowUpRight className="h-5 w-5 text-text-subtle group-hover:text-text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </header>
                    
                    <h3 className="subheading mb-4 group-hover:text-editorial-red transition-colors duration-300">
                      {category.name}
                    </h3>
                    
                    <p className="body-text mb-6 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <footer className="pt-4 border-t border-border-subtle">
                      <div className="caption">{category.stat}</div>
                    </footer>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Principles */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-surface-50 border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="caption mb-4 animate-fade-in-up">EDITORIAL STANDARDS</div>
            <h2 className="headline-3 animate-fade-in-up animate-stagger-1 mb-6">
              Our principles of statistical journalism.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up animate-stagger-1">
              <div className="w-12 h-12 bg-editorial-red rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-mono font-bold text-lg">01</span>
              </div>
              <h3 className="subheading mb-4">Source Integrity</h3>
              <p className="body-text">
                Every statistic traces directly to official government sources. 
                No secondary interpretations, no aggregated summaries. 
                Raw data, properly contextualized.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up animate-stagger-2">
              <div className="w-12 h-12 bg-editorial-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-mono font-bold text-lg">02</span>
              </div>
              <h3 className="subheading mb-4">Editorial Independence</h3>
              <p className="body-text">
                Zero political commentary, zero opinion pieces. 
                We present findings neutrally and let citizens 
                draw their own conclusions from the data.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up animate-stagger-3">
              <div className="w-12 h-12 bg-text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-mono font-bold text-lg">03</span>
              </div>
              <h3 className="subheading mb-4">Methodological Transparency</h3>
              <p className="body-text">
                Complete disclosure of data processing methods, 
                statistical techniques, and analytical limitations. 
                Every chart and table is fully reproducible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="headline-2 animate-fade-in-up mb-8">
            Democracy requires informed citizens.
          </h2>
          <p className="body-large animate-fade-in-up animate-stagger-1 mb-12 max-w-3xl mx-auto">
            Access the same government data that influences policy decisions, 
            shapes markets, and affects millions of Americans. No subscription required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-stagger-2">
            <Link href="/debt" className="btn-editorial-primary">
              Start with National Debt
            </Link>
            <Link href="/congress" className="btn-editorial-secondary">
              View Congressional Trades
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Attribution */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="caption">
            Data sourced from U.S. Treasury, DHS, BLS, OMB, and FEC. 
            Built by{' '}
            <a 
              href="https://telep.io" 
              className="text-editorial-red hover:text-editorial-red-dark transition-colors duration-200"
            >
              Telep IO
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}