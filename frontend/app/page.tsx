import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, Briefcase, Building2, Vote } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    description: 'Stock trades by members of Congress under STOCK Act disclosures.',
    href: '/congress',
    icon: TrendingUp,
    stat: '435+ Members tracked',
  },
  {
    name: 'Immigration',
    description: 'Legal immigration, deportations, and border encounter statistics.',
    href: '/immigration',
    icon: Users,
    stat: 'DHS & CBP data',
  },
  {
    name: 'Federal Budget',
    description: 'Government spending, revenue, and deficit tracking by agency.',
    href: '/budget',
    icon: DollarSign,
    stat: 'Treasury data',
  },
  {
    name: 'Employment',
    description: 'Unemployment rates, job growth, and labor force statistics.',
    href: '/employment',
    icon: Briefcase,
    stat: 'BLS monthly data',
  },
  {
    name: 'National Debt',
    description: 'Federal debt tracking, who holds our debt, and historical growth.',
    href: '/debt',
    icon: Building2,
    stat: 'Real-time Treasury',
  },
  {
    name: 'Election Funding',
    description: 'Campaign finance, ballot access barriers, and the two-party system.',
    href: '/elections',
    icon: Vote,
    stat: 'FEC data',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Government data,
            <br />
            <span className="text-surface-400">without the spin.</span>
          </h1>
          <p className="text-lg text-surface-500 max-w-2xl mb-10 leading-relaxed">
            Objective analysis of U.S. government statistics from official sources.
            No opinions. No narratives. Just data — explore the numbers and draw your own conclusions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/debt" className="btn-primary">
              Explore the data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/about" className="btn-secondary">
              Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Data categories</h2>
            <p className="text-surface-500">
              Each category pulls directly from official U.S. government data sources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <div className="card card-hover h-full p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="h-5 w-5 text-surface-500 group-hover:text-foreground transition-colors" />
                      <ArrowRight className="h-4 w-4 text-surface-600 group-hover:text-surface-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-2 group-hover:text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-surface-500 mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    <p className="text-xs text-surface-600 font-mono">
                      {category.stat}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <p className="text-xs font-mono text-surface-600 mb-3">01</p>
              <h3 className="text-base font-medium text-foreground mb-2">Data first</h3>
              <p className="text-sm text-surface-500 leading-relaxed">
                Raw numbers from official government sources. No cherry-picking, no selective framing.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-surface-600 mb-3">02</p>
              <h3 className="text-base font-medium text-foreground mb-2">Unbiased</h3>
              <p className="text-sm text-surface-500 leading-relaxed">
                Zero editorializing. We present findings and let you form your own conclusions.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-surface-600 mb-3">03</p>
              <h3 className="text-base font-medium text-foreground mb-2">Transparent</h3>
              <p className="text-sm text-surface-500 leading-relaxed">
                Every statistic links to its source. Full methodology disclosed. Verify everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Source attribution */}
      <section className="border-t border-border px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-surface-600">
            All data sourced from U.S. Treasury, DHS, BLS, OMB, and FEC.
            Built by <a href="https://telep.io" className="text-surface-500 hover:text-foreground transition-colors">Telep IO</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
