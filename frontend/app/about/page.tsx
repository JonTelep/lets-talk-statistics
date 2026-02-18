import { ExternalLink, Database, Calculator, BookOpen, AlertCircle, Scale, TrendingUp, Users, DollarSign, Briefcase, Building2, Scroll, Award, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-cream">
      {/* Editorial Header */}
      <section className="bg-surface-paper border-b-2 border-editorial-burgundy py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="editorial-badge">EDITORIAL STANDARDS</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-editorial-navy mb-8">
              About This Publication
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="drop-cap text-fg-secondary max-w-3xl mx-auto">
                Let's Talk Statistics represents an independent editorial commitment to objective statistical analysis. 
                Our mission is the transparent presentation of United States government data without partisan interpretation, 
                selective framing, or editorial commentary that might influence reader conclusions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Editorial Mission */}
            <article className="card p-8 mb-8">
              <div className="flex items-center mb-6">
                <Scroll className="h-8 w-8 text-editorial-burgundy mr-4" />
                <h2 className="font-serif text-2xl font-semibold text-editorial-navy">Editorial Mission Statement</h2>
              </div>
              <div className="space-y-6 text-fg-secondary leading-loose">
                <p>
                  <strong className="text-editorial-navy font-serif">Let's Talk Statistics</strong> operates as an independent 
                  statistical publication committed to the objective presentation of United States federal government data. 
                  We maintain strict editorial independence from political organizations, advocacy groups, and commercial interests.
                </p>
                
                <div className="pullquote my-8">
                  No editorial opinions. No partisan narratives. No selective interpretation. 
                  Just comprehensive federal statistical analysis.
                </div>
                
                <p>
                  Our editorial commitment encompasses seven core principles: comprehensive data coverage, 
                  source verification, methodological transparency, statistical accuracy, contextual clarity, 
                  partisan neutrality, and public accessibility. Every statistic published carries direct 
                  source attribution to official federal agencies.
                </p>
                
                <div className="bg-surface-accent p-6 border-l-4 border-editorial-burgundy my-6">
                  <h3 className="font-serif text-lg font-semibold text-editorial-navy mb-3">Our Standards</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Comprehensive federal data coverage across all major statistical categories</li>
                    <li>• Direct source citation for every published statistic</li>
                    <li>• Transparent methodology documentation</li>
                    <li>• Partisan-neutral presentation of all findings</li>
                    <li>• Public accessibility without registration or payment barriers</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Data Coverage */}
            <article className="card p-8 mb-8">
              <div className="flex items-center mb-6">
                <Database className="h-8 w-8 text-editorial-forest mr-4" />
                <h2 className="font-serif text-2xl font-semibold text-editorial-navy">Statistical Coverage</h2>
              </div>
              
              <p className="text-fg-secondary mb-6 leading-relaxed">
                Our publication covers seven major categories of federal statistical data, 
                each sourced directly from the responsible government agencies.
              </p>

              <div className="editorial-grid gap-6">
                {[
                  { 
                    icon: TrendingUp, 
                    name: 'Congressional Trading Analysis', 
                    desc: 'Comprehensive tracking of federal legislative financial disclosures under STOCK Act requirements. Complete transaction histories, portfolio analysis, and disclosure timing evaluation.',
                    sources: 'Senate Ethics, House Clerk'
                  },
                  { 
                    icon: Building2, 
                    name: 'Federal Debt Analysis', 
                    desc: 'Complete federal debt composition, holder analysis, and historical growth patterns. Real-time treasury data with debt-to-GDP contextual analysis.',
                    sources: 'Treasury Direct, Federal Reserve'
                  },
                  { 
                    icon: Users, 
                    name: 'Immigration Statistics', 
                    desc: 'Official immigration flows, border encounter data, deportation statistics, and asylum processing metrics from Department of Homeland Security.',
                    sources: 'DHS, CBP, ICE'
                  },
                  { 
                    icon: DollarSign, 
                    name: 'Federal Budget Analysis', 
                    desc: 'Government spending analysis, revenue collection, deficit tracking, and agency-level expenditure breakdowns from Treasury Department.',
                    sources: 'Treasury, OMB'
                  },
                  { 
                    icon: Briefcase, 
                    name: 'Employment Data', 
                    desc: 'Labor force statistics, unemployment analysis, job creation metrics, and wage growth data from Bureau of Labor Statistics monthly releases.',
                    sources: 'Bureau of Labor Statistics'
                  },
                  { 
                    icon: Scale, 
                    name: 'Election Funding', 
                    desc: 'Federal election campaign finance data, political contribution analysis, and electoral spending patterns from Federal Election Commission filings.',
                    sources: 'Federal Election Commission'
                  }
                ].map(({ icon: Icon, name, desc, sources }) => (
                  <div key={name} className="card p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-editorial-burgundy/10 rounded flex items-center justify-center mr-4">
                        <Icon className="h-6 w-6 text-editorial-burgundy" />
                      </div>
                      <h3 className="font-serif text-lg font-medium text-editorial-navy">{name}</h3>
                    </div>
                    <p className="text-fg-secondary text-sm leading-relaxed mb-3">{desc}</p>
                    <div className="data-label text-xs">{sources}</div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Quick Facts */}
            <div className="stat-highlight mb-8">
              <h3 className="font-serif text-lg font-semibold text-editorial-navy mb-4">Publication Facts</h3>
              <div className="space-y-4">
                <div>
                  <div className="data-label">ESTABLISHED</div>
                  <div className="font-serif text-2xl font-bold text-editorial-burgundy">2024</div>
                </div>
                <div>
                  <div className="data-label">DATA SOURCES</div>
                  <div className="font-serif text-2xl font-bold text-editorial-burgundy">12+</div>
                  <div className="text-xs text-fg-muted">Federal Agencies</div>
                </div>
                <div>
                  <div className="data-label">UPDATE FREQUENCY</div>
                  <div className="font-serif text-xl font-bold text-editorial-burgundy">Daily</div>
                </div>
              </div>
            </div>

            {/* Standards */}
            <div className="card p-6 mb-8">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-editorial-gold mr-3" />
                <h3 className="font-serif text-lg font-semibold text-editorial-navy">Editorial Standards</h3>
              </div>
              <div className="space-y-3 text-sm text-fg-secondary">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-editorial-forest mr-2 mt-0.5 flex-shrink-0" />
                  <span>Source verification for all published statistics</span>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-editorial-forest mr-2 mt-0.5 flex-shrink-0" />
                  <span>Transparent methodology documentation</span>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-editorial-forest mr-2 mt-0.5 flex-shrink-0" />
                  <span>Partisan-neutral data presentation</span>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-editorial-forest mr-2 mt-0.5 flex-shrink-0" />
                  <span>Complete accessibility without barriers</span>
                </div>
              </div>
            </div>
          </div>

        {/* Data Categories */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Data Categories</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Scale, color: 'text-surface-400', name: 'Crime Statistics', desc: 'FBI crime data by state, year, and demographics' },
              { icon: TrendingUp, color: 'text-blue-400', name: 'Congressional Trading', desc: 'Stock trades by members of Congress (STOCK Act)' },
              { icon: Users, color: 'text-green-400', name: 'Immigration', desc: 'Legal immigration, deportations, and encounters' },
              { icon: DollarSign, color: 'text-emerald-400', name: 'Federal Budget', desc: 'Government spending, revenue, and deficits' },
              { icon: Briefcase, color: 'text-blue-400', name: 'Employment', desc: 'Unemployment rates and job market data' },
              { icon: Building2, color: 'text-red-400', name: 'National Debt', desc: 'Federal debt tracking and debt holders' },
            ].map(({ icon: Icon, color, name, desc }) => (
              <div key={name} className="p-4 bg-surface-800 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <h3 className="font-medium text-foreground">{name}</h3>
                </div>
                <p className="text-sm text-surface-500">{desc}</p>
              </div>
            ))}
          </div>
        </Card>

        </div>

        <div className="section-divider"></div>

        {/* Official Data Sources Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-editorial-navy mb-4">Official Data Sources</h2>
            <p className="text-fg-secondary text-lg max-w-3xl mx-auto">
              All statistical data is sourced directly from official United States federal government agencies. 
              No third-party aggregators or commercial data providers are utilized.
            </p>
          </div>

          <div className="editorial-grid gap-8">
            {[
              { 
                label: 'Congressional Financial Disclosures', 
                color: 'border-editorial-burgundy', 
                links: [
                  { name: 'Senate Ethics Committee Financial Disclosure Database', url: 'https://efdsearch.senate.gov' },
                  { name: 'House Clerk Financial Disclosure Repository', url: 'https://disclosures-clerk.house.gov' },
                ]
              },
              { 
                label: 'Federal Debt & Treasury Operations', 
                color: 'border-editorial-forest', 
                links: [
                  { name: 'TreasuryDirect.gov Debt Analytics', url: 'https://www.treasurydirect.gov' },
                  { name: 'Treasury International Capital System', url: 'https://ticdata.treasury.gov' },
                  { name: 'Federal Reserve Economic Data (FRED)', url: 'https://fred.stlouisfed.org' },
                ]
              },
              { 
                label: 'Immigration & Border Statistics', 
                color: 'border-editorial-gold', 
                links: [
                  { name: 'Department of Homeland Security Statistical Yearbook', url: 'https://www.dhs.gov/immigration-statistics' },
                  { name: 'Customs & Border Protection Operational Data', url: 'https://www.cbp.gov/newsroom/stats' },
                  { name: 'Immigration & Customs Enforcement Statistics', url: 'https://www.ice.gov/data' },
                ]
              },
              { 
                label: 'Federal Budget & Expenditures', 
                color: 'border-editorial-slate', 
                links: [
                  { name: 'USASpending.gov Federal Spending Database', url: 'https://www.usaspending.gov' },
                  { name: 'Treasury Fiscal Data Repository', url: 'https://fiscaldata.treasury.gov' },
                  { name: 'Office of Management & Budget Reports', url: 'https://www.whitehouse.gov/omb' },
                ]
              },
              { 
                label: 'Employment & Labor Statistics', 
                color: 'border-editorial-burgundy', 
                links: [
                  { name: 'Bureau of Labor Statistics National Database', url: 'https://www.bls.gov' },
                  { name: 'Employment Situation Monthly Reports', url: 'https://www.bls.gov/news.release/empsit.toc.htm' },
                ]
              },
              { 
                label: 'Election Finance Data', 
                color: 'border-editorial-forest', 
                links: [
                  { name: 'Federal Election Commission Filing Database', url: 'https://www.fec.gov/data/' },
                  { name: 'Campaign Finance Disclosure Portal', url: 'https://www.fec.gov/data/browse-data/' },
                ]
              },
            ].map(({ label, color, links }) => (
              <article key={label} className="card p-6">
                <div className={`border-l-4 ${color} pl-4 mb-4`}>
                  <h3 className="font-serif text-lg font-semibold text-editorial-navy">{label}</h3>
                </div>
                <div className="space-y-2">
                  {links.map(l => (
                    <div key={l.url} className="flex items-start">
                      <ExternalLink className="h-3 w-3 text-editorial-burgundy mr-2 mt-1 flex-shrink-0" />
                      <a 
                        href={l.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-editorial-burgundy hover:text-editorial-navy transition-colors leading-relaxed"
                      >
                        {l.name}
                      </a>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="section-divider"></div>

        {/* Statistical Methodology Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-8">
                <Calculator className="h-8 w-8 text-editorial-forest mr-4" />
                <h2 className="font-serif text-3xl font-semibold text-editorial-navy">Statistical Methodology</h2>
              </div>

              <div className="space-y-8">
                <div className="card p-6">
                  <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-4">Per Capita Analysis</h3>
                  <p className="text-fg-secondary mb-4 leading-relaxed">
                    Population-adjusted rates provide meaningful comparisons across jurisdictions of different sizes:
                  </p>
                  <div className="bg-editorial-navy/5 border-2 border-editorial-navy/20 p-6 rounded font-mono text-editorial-navy mb-4">
                    <div className="text-center">
                      <div className="text-sm mb-2">STANDARDIZED RATE CALCULATION</div>
                      <div className="text-lg font-bold">Rate = (Count ÷ Population) × 100,000</div>
                    </div>
                  </div>
                  <p className="text-sm text-fg-muted">
                    This methodology enables direct statistical comparison between states, regions, 
                    and time periods regardless of population differences.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-4">Data Processing Standards</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-editorial-burgundy rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-editorial-navy">Raw Data Preservation</div>
                        <div className="text-sm text-fg-secondary">
                          Original federal data presented without adjustment, correction, or modification
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-editorial-burgundy rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-editorial-navy">Missing Data Protocols</div>
                        <div className="text-sm text-fg-secondary">
                          Data gaps explicitly noted, never estimated or interpolated
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-editorial-burgundy rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-editorial-navy">Source Attribution</div>
                        <div className="text-sm text-fg-secondary">
                          Direct citation links to original federal agency databases
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-8">
                <AlertCircle className="h-8 w-8 text-editorial-gold mr-4" />
                <h2 className="font-serif text-3xl font-semibold text-editorial-navy">Data Limitations</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-accent border-l-4 border-editorial-gold p-6">
                  <p className="text-sm text-fg-secondary leading-relaxed">
                    <strong className="text-editorial-navy">Statistical Disclaimer:</strong> All federal statistics carry inherent limitations 
                    based on collection methodologies, reporting requirements, and definitional constraints. 
                    These limitations do not invalidate the data but require contextual understanding.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      category: 'Congressional Trading Analysis',
                      limitation: 'Self-reported financial disclosures with 45-day filing deadlines. Transaction timing may not reflect actual execution dates. Analysis is informational, not investment advice.'
                    },
                    {
                      category: 'Immigration Statistics',
                      limitation: 'Border "encounters" include expulsions and do not represent permanent entries. Deportation statistics reflect enforcement priorities and resource allocation.'
                    },
                    {
                      category: 'Federal Budget Data',
                      limitation: 'Complex categorization systems with potential overlapping classifications. Spending authorization differs from actual expenditure timing.'
                    },
                    {
                      category: 'Employment Statistics',
                      limitation: 'Official unemployment rates exclude discouraged workers and underemployment. Labor force participation affects headline statistics.'
                    },
                    {
                      category: 'National Debt Analysis',
                      limitation: 'Total public debt includes intragovernmental holdings. Foreign holder data reported with geographic attribution complexity.'
                    },
                    {
                      category: 'Election Finance Data',
                      limitation: 'Reporting requirements vary by contribution type and amount. Independent expenditure attribution may be incomplete.'
                    }
                  ].map(({ category, limitation }) => (
                    <div key={category} className="card p-4">
                      <div className="font-medium text-editorial-navy text-sm mb-2">{category}</div>
                      <div className="text-xs text-fg-secondary leading-relaxed">{limitation}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-editorial-burgundy/10 border border-editorial-burgundy/20 p-6">
                  <p className="text-sm text-editorial-navy font-medium text-center">
                    Statistical context and methodological understanding remain essential 
                    for accurate interpretation of all federal data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* Publication Information */}
        <section className="py-16 bg-surface-accent">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-editorial-navy mb-8">Publication Information</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card p-8">
                <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-4">Editorial Independence</h3>
                <p className="text-fg-secondary leading-relaxed">
                  Let's Talk Statistics operates with complete editorial independence from political organizations, 
                  advocacy groups, and commercial interests. Our statistical analysis follows established 
                  journalistic principles of objectivity and accuracy.
                </p>
              </div>
              
              <div className="card p-8">
                <h3 className="font-serif text-xl font-semibold text-editorial-navy mb-4">Technical Infrastructure</h3>
                <p className="text-fg-secondary leading-relaxed">
                  This publication is developed and maintained by{' '}
                  <a href="https://telep.io" target="_blank" rel="noopener noreferrer" 
                     className="text-editorial-burgundy hover:text-editorial-navy transition-colors font-medium">
                    Telep IO
                  </a>
                  , specializing in federal data analysis and statistical visualization systems.
                </p>
              </div>
            </div>

            <div className="border-t-2 border-editorial-burgundy pt-8">
              <p className="text-fg-muted text-sm leading-relaxed">
                <strong>Data Verification:</strong> All statistics sourced from official United States federal government agencies. 
                Source attribution provided for independent verification. Updated daily from official federal databases.
              </p>
              
              <p className="text-fg-dim text-xs mt-4">
                Published 2024 • Independent Statistical Analysis • Editorial Standards Maintained
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
