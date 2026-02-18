import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, Briefcase, Building2, Vote, Home as HomeIcon, Star } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Comprehensive tracking of stock trades by members of Congress under STOCK Act disclosure requirements.',
    href: '/congress',
    icon: TrendingUp,
    stat: '435+ Members Tracked',
    featured: true,
    summary: 'Real-time analysis of Congressional portfolio positions and trading patterns.'
  },
  {
    name: 'Housing Market',
    description: 'Complete housing market analysis including homeownership rates, construction data, price indices, and mortgage trends.',
    href: '/housing',
    icon: HomeIcon,
    stat: '60+ FRED Series',
    featured: false,
    summary: 'Federal Reserve Economic Data covering all aspects of the U.S. housing market.'
  },
  {
    name: 'Immigration Statistics',
    description: 'Legal immigration flows, deportation statistics, border encounters, and asylum case processing data.',
    href: '/immigration',
    icon: Users,
    stat: 'DHS & CBP Data',
    featured: false,
    summary: 'Official Department of Homeland Security and Customs data analysis.'
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue collection, and deficit tracking with granular agency-level breakdowns.',
    href: '/budget',
    icon: DollarSign,
    stat: 'Treasury Data',
    featured: false,
    summary: 'Real-time federal financial data from the U.S. Treasury Department.'
  },
  {
    name: 'Employment Data',
    description: 'Labor force statistics, unemployment rates, job creation, and wage growth analysis from Bureau of Labor Statistics.',
    href: '/employment',
    icon: Briefcase,
    stat: 'BLS Monthly Data',
    featured: false,
    summary: 'Official employment metrics updated monthly by the Department of Labor.'
  },
  {
    name: 'National Debt',
    description: 'Federal debt analysis including holder composition, historical growth patterns, and debt-to-GDP ratios.',
    href: '/debt',
    icon: Building2,
    stat: 'Real-time Treasury',
    featured: true,
    summary: 'Live tracking of the federal debt with detailed holder breakdown analysis.'
  },
  {
    name: 'Election Funding',
    description: 'Campaign finance disclosures, political spending analysis, and ballot access barriers across electoral systems.',
    href: '/elections',
    icon: Vote,
    stat: 'FEC Filings',
    featured: false,
    summary: 'Federal Election Commission data covering campaign contributions and expenditures.'
  },
];

export default function Home() {
  const featuredCategories = categories.filter(cat => cat.featured);
  const regularCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Masthead */}
      <section className="border-b-2 border-editorial-burgundy bg-surface-paper">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-8 bg-editorial-burgundy"></div>
                <h1 className="font-serif text-2xl font-bold text-editorial-navy">Let's Talk Statistics</h1>
              </div>
              <div className="text-xs font-sans text-fg-muted tracking-wide">
                EST. 2024 • INDEPENDENT DATA ANALYSIS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Editorial */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 bg-surface-paper">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="mb-6">
                <span className="editorial-badge">TODAY'S LEAD STORY</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-editorial-navy mb-8 leading-tight">
                Government Data,
                <br />
                <span className="text-editorial-burgundy italic">Without the Spin</span>
              </h1>
              <div className="prose prose-lg max-w-none">
                <p className="drop-cap text-fg-secondary">
                  Objective analysis of United States government statistics from official federal sources. 
                  No editorial opinions. No partisan narratives. No selective interpretation. 
                  Just comprehensive data analysis that empowers you to draw your own informed conclusions.
                </p>
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <Link href="/congress" className="btn-primary group">
                  <span>Begin Analysis</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about" className="btn-secondary">
                  Our Methodology
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="stat-highlight">
                <div className="text-center">
                  <div className="data-label mb-2">TOTAL DATA POINTS ANALYZED</div>
                  <div className="data-value">2,847,329</div>
                  <p className="text-sm text-fg-muted mt-3">
                    Across seven major government statistical categories, updated daily from official federal sources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Featured Stories */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-surface-cream">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-serif text-3xl font-semibold text-editorial-navy mb-4">Featured Analysis</h2>
            <p className="text-fg-secondary text-lg leading-relaxed max-w-3xl">
              In-depth examination of the most significant trends in federal data, 
              highlighted for their importance to understanding current American governance and policy impact.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 stagger-animation">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <article className="card card-hover p-8 h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-editorial-burgundy rounded flex items-center justify-center">
                          <Icon className="h-6 w-6 text-surface-paper" />
                        </div>
                        <Star className="h-5 w-5 text-editorial-gold" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-fg-muted group-hover:text-editorial-burgundy group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-editorial-navy mb-3 group-hover:text-editorial-burgundy transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-fg-secondary mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    <p className="text-sm text-editorial-burgundy font-medium mb-4">
                      {category.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="data-label">{category.stat}</span>
                      <span className="text-xs text-fg-muted font-sans tracking-wide">FEATURED ANALYSIS</span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* All Categories */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-serif text-3xl font-semibold text-editorial-navy mb-4">Complete Data Categories</h2>
            <p className="text-fg-secondary text-lg leading-relaxed">
              Comprehensive coverage of federal statistical data across all major government departments and agencies.
            </p>
          </div>

          <div className="editorial-grid stagger-animation">
            {regularCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <article className="card card-hover p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-editorial-slate/10 rounded flex items-center justify-center group-hover:bg-editorial-burgundy/10 transition-colors">
                        <Icon className="h-5 w-5 text-editorial-slate group-hover:text-editorial-burgundy transition-colors" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-fg-dim group-hover:text-editorial-burgundy group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-serif text-xl font-medium text-editorial-navy mb-3 group-hover:text-editorial-burgundy transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-fg-secondary mb-4 text-sm leading-relaxed">
                      {category.summary}
                    </p>
                    <div className="data-label">
                      {category.stat}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Principles */}
      <section className="border-t-2 border-editorial-navy bg-surface-accent px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-editorial-navy mb-4">Editorial Standards</h2>
            <p className="text-fg-secondary text-lg max-w-3xl mx-auto">
              Our commitment to objective, transparent, and verifiable statistical analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-burgundy rounded mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-surface-paper">01</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-3">Data Primacy</h3>
              <p className="text-fg-secondary leading-relaxed">
                Raw statistical data from official federal sources takes precedence over all interpretation. 
                No selective presentation or cherry-picked timeframes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-forest rounded mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-surface-paper">02</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-3">Editorial Independence</h3>
              <p className="text-fg-secondary leading-relaxed">
                Zero political editorializing. We present comprehensive findings and statistical context 
                without partisan interpretation or policy recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-editorial-gold rounded mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-editorial-navy">03</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-3">Complete Transparency</h3>
              <p className="text-fg-secondary leading-relaxed">
                Every statistic includes direct source attribution with methodology disclosure. 
                All data processing steps are documented and reproducible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Source Attribution Footer */}
      <section className="border-t border-border bg-surface-paper px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm text-fg-muted leading-relaxed mb-4">
              <strong>Official Data Sources:</strong> U.S. Treasury Department, Department of Homeland Security, 
              Bureau of Labor Statistics, Office of Management and Budget, Federal Election Commission, 
              Federal Reserve Economic Data (FRED), and Congressional Disclosure Offices.
            </p>
            <p className="text-xs text-fg-dim">
              Published by <a href="https://telep.io" className="text-editorial-burgundy hover:text-editorial-navy transition-colors font-medium">Telep IO</a> • 
              Independent Statistical Analysis • Est. 2024
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
