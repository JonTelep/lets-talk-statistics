import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, Briefcase, Building2, Vote, Home as HomeIcon } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock transactions by members of Congress under STOCK Act disclosure requirements.',
    href: '/congress',
    icon: TrendingUp,
    stat: '435+ Members tracked',
    featured: true,
  },
  {
    name: 'Housing',
    description: 'Homeownership rates, construction metrics, pricing trends, and mortgage data.',
    href: '/housing',
    icon: HomeIcon,
    stat: 'FRED data (60+ series)',
  },
  {
    name: 'Immigration',
    description: 'Legal immigration statistics, deportation records, and border encounter data.',
    href: '/immigration',
    icon: Users,
    stat: 'DHS & CBP data',
  },
  {
    name: 'Federal Budget',
    description: 'Government expenditure, revenue streams, and deficit tracking by department.',
    href: '/budget',
    icon: DollarSign,
    stat: 'Treasury data',
  },
  {
    name: 'Employment',
    description: 'Unemployment statistics, job creation metrics, and labor force participation.',
    href: '/employment',
    icon: Briefcase,
    stat: 'BLS monthly data',
  },
  {
    name: 'National Debt',
    description: 'Federal debt obligations, creditor analysis, and historical debt progression.',
    href: '/debt',
    icon: Building2,
    stat: 'Real-time Treasury',
  },
  {
    name: 'Election Funding',
    description: 'Campaign finance data, ballot access costs, and political party economics.',
    href: '/elections',
    icon: Vote,
    stat: 'FEC data',
  },
];

const principles = [
  {
    number: "01",
    title: "Data First",
    description: "Every statistic sourced directly from official government databases. No interpretation, no selective presentation."
  },
  {
    number: "02", 
    title: "Analytical Neutrality",
    description: "Zero editorial commentary. We present findings and methodology; conclusions remain yours to draw."
  },
  {
    number: "03",
    title: "Methodological Transparency", 
    description: "Complete source attribution with direct links. Every calculation exposed, every assumption documented."
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Editorial Masthead */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-8 border-b border-border-medium">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <p className="section-number">EST. 2024</p>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-medium tracking-display text-text-primary mb-6 fade-in-up">
              Let's Talk
              <br />
              <em className="editorial-emphasis">Statistics</em>
            </h1>
            <div className="w-24 h-px bg-accent mx-auto mb-8"></div>
            <p className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto leading-editorial fade-in-up stagger-2">
              Unvarnished analysis of United States government data.
              <span className="block mt-2 editorial-emphasis">No spin. No agenda. Just numbers.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-surface-50">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="section-number mb-4">FEATURED ANALYSIS</p>
              <h2 className="font-display text-4xl sm:text-5xl font-medium text-text-primary mb-6 tracking-tight">
                Congressional Stock Trading Under Federal Disclosure
              </h2>
              <p className="text-lg text-text-secondary leading-editorial mb-8">
                Complete analysis of STOCK Act filings from all 535 members of Congress. 
                Transaction timing, sector preferences, and portfolio performance data 
                extracted from official House and Senate disclosure reports.
              </p>
              <Link href="/congress" className="btn-primary">
                Examine the Data
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="lg:col-span-5">
              <div className="stat-display">
                <div className="stat-number">$124.3M</div>
                <div className="stat-label">Total Disclosed Trades (2023)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Categories - Magazine Layout */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="section-header">
            <h2>Government Data Categories</h2>
            <p>
              Each category draws exclusively from official United States government sources.
              Raw data, standardized methodology, complete source attribution.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Featured Category */}
            <div className="lg:col-span-8">
              {categories.filter(cat => cat.featured).map((category) => {
                const Icon = category.icon;
                return (
                  <Link key={category.name} href={category.href} className="group block">
                    <article className="card-featured p-10 h-full">
                      <div className="flex items-start justify-between mb-6">
                        <Icon className="h-8 w-8 text-accent" />
                        <ArrowRight className="h-5 w-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-text-primary mb-4">
                        {category.name}
                      </h3>
                      <p className="text-text-secondary mb-6 leading-editorial text-lg">
                        {category.description}
                      </p>
                      <p className="font-mono text-sm text-accent font-semibold tracking-wide">
                        {category.stat}
                      </p>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* Regular Categories */}
            <div className="lg:col-span-4 space-y-4">
              {categories.filter(cat => !cat.featured).map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link key={category.name} href={category.href} className="group block">
                    <article className={`card card-hover p-6 h-full fade-in-up stagger-${index + 1}`}>
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="h-5 w-5 text-text-muted group-hover:text-accent transition-colors" />
                        <ArrowRight className="h-4 w-4 text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      <p className="font-mono text-xs text-text-dim font-medium">
                        {category.stat}
                      </p>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Divider */}
      <div className="editorial-divider-ornate"></div>

      {/* Editorial Principles */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-surface-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="section-number mb-4">OUR METHODOLOGY</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-text-primary mb-6">
              Editorial Standards
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-editorial">
              Three foundational principles guide every analysis published on this platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {principles.map((principle, index) => (
              <div key={principle.number} className={`text-center fade-in-up stagger-${index + 1}`}>
                <div className="section-number text-2xl mb-4">{principle.number}</div>
                <h3 className="font-display text-xl font-semibold text-text-primary mb-4">
                  {principle.title}
                </h3>
                <p className="text-text-secondary leading-editorial">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Quote */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <blockquote className="editorial-quote text-center">
            <p className="font-display text-2xl sm:text-3xl font-medium text-text-primary leading-display mb-6">
              "Numbers don't lie, but their presentation can mislead. 
              Our commitment is to the former, our vigilance against the latter."
            </p>
            <footer className="font-serif text-text-muted">
              — Editorial Philosophy, Let's Talk Statistics
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section className="border-t-2 border-accent px-4 sm:px-6 lg:px-8 py-16 bg-surface">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-text-primary mb-6">
            Begin Your Analysis
          </h2>
          <p className="text-lg text-text-secondary mb-8 leading-editorial max-w-2xl mx-auto">
            Choose any data category to start exploring. Every chart, every table, 
            every statistic links directly to its government source.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/debt" className="btn-primary">
              National Debt Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/about" className="btn-secondary">
              Methodology & Sources
            </Link>
          </div>
        </div>
      </section>

      {/* Publication Footer */}
      <section className="border-t border-border px-4 sm:px-6 lg:px-8 py-12 bg-surface-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-mono text-xs text-text-muted mb-2">DATA SOURCES</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                U.S. Treasury Department • Department of Homeland Security • Bureau of Labor Statistics • 
                Office of Management and Budget • Federal Election Commission • Federal Housing Finance Agency
              </p>
            </div>
            <div className="md:text-right">
              <p className="font-mono text-xs text-text-muted mb-2">PUBLISHED BY</p>
              <p className="text-sm text-text-secondary">
                <a href="https://telep.io" className="editorial-emphasis hover:underline transition-all">
                  Telep IO
                </a>
                <span className="mx-2">•</span>
                <span className="font-mono">Est. 2024</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}