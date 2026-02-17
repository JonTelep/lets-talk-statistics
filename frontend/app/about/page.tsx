import { ExternalLink, Database, Calculator, BookOpen, AlertCircle, Scale, TrendingUp, Users, DollarSign, Briefcase, Building2 } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-foreground mb-4">About This Project</h1>
          <p className="text-lg text-surface-400">
            Government data, clearly presented. No spin, no agenda — just the numbers.
          </p>
        </div>

        {/* Purpose */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <BookOpen className="h-8 w-8 text-surface-500 mr-3 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
          </div>
          <div className="text-surface-400 space-y-4">
            <p>
              <strong className="text-foreground">Let&apos;s Talk Statistics</strong> is an objective data platform that presents
              government statistics across multiple domains. No opinions, no narratives, just data from official sources.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Explore statistics across multiple categories</li>
              <li>Compare data across states, years, and demographics</li>
              <li>Understand what the numbers actually mean</li>
              <li>Access source citations for every statistic</li>
              <li>Draw your own conclusions</li>
            </ul>
            <p><strong className="text-foreground">No accounts. No paywalls. No spin. Just data.</strong></p>
          </div>
        </Card>

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

        {/* Data Sources */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <Database className="h-8 w-8 text-surface-500 mr-3 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Crime Statistics', color: 'border-surface-600', links: [
                { name: 'FBI Crime Data Explorer', url: 'https://cde.ucr.cjis.gov' },
                { name: 'Bureau of Justice Statistics', url: 'https://bjs.ojp.gov' },
                { name: 'US Census Bureau', url: 'https://www.census.gov' },
              ]},
              { label: 'Congressional Trading', color: 'border-blue-500/50', links: [
                { name: 'Senate Financial Disclosures', url: 'https://efdsearch.senate.gov' },
                { name: 'House Financial Disclosures', url: 'https://disclosures-clerk.house.gov' },
              ]},
              { label: 'Immigration', color: 'border-green-500/50', links: [
                { name: 'DHS Immigration Statistics', url: 'https://www.dhs.gov/immigration-statistics' },
                { name: 'CBP Operational Statistics', url: 'https://www.cbp.gov/newsroom/stats' },
                { name: 'ICE Enforcement Data', url: 'https://www.ice.gov/data' },
              ]},
              { label: 'Federal Budget', color: 'border-emerald-500/50', links: [
                { name: 'USASpending.gov', url: 'https://www.usaspending.gov' },
                { name: 'Treasury Fiscal Data', url: 'https://fiscaldata.treasury.gov' },
                { name: 'Office of Management & Budget', url: 'https://www.whitehouse.gov/omb' },
              ]},
              { label: 'Employment', color: 'border-blue-400/50', links: [
                { name: 'Bureau of Labor Statistics', url: 'https://www.bls.gov' },
              ]},
              { label: 'National Debt', color: 'border-red-500/50', links: [
                { name: 'TreasuryDirect.gov', url: 'https://www.treasurydirect.gov' },
                { name: 'Treasury International Capital', url: 'https://ticdata.treasury.gov' },
              ]},
            ].map(({ label, color, links }) => (
              <div key={label} className={`border-l-2 ${color} pl-4`}>
                <h3 className="font-medium text-foreground mb-1">{label}</h3>
                <ul className="text-sm text-surface-500 space-y-1">
                  {links.map(l => (
                    <li key={l.url}>• <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{l.name}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Methodology */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <Calculator className="h-8 w-8 text-surface-500 mr-3 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Methodology</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-foreground mb-2">Per Capita Rates</h3>
              <p className="text-sm text-surface-400 mb-2">
                For fair comparisons across different population sizes, we calculate per capita rates:
              </p>
              <div className="bg-surface-800 border border-border p-4 rounded-md font-mono text-sm text-surface-300 mb-2">
                Rate = (Count ÷ Population) × 100,000
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Data Presentation Principles</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-surface-400">
                <li>Raw data presented without adjustment or correction</li>
                <li>Missing data noted, never estimated</li>
                <li>Source citations for every statistic</li>
                <li>Clear definitions for all terms</li>
                <li>Context provided without editorial commentary</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Limitations */}
        <Card className="mb-8 border-amber-500/20">
          <div className="flex items-start mb-4">
            <AlertCircle className="h-8 w-8 text-amber-400 mr-3 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Important Limitations</h2>
          </div>
          <div className="space-y-3 text-sm text-surface-400">
            <p><strong className="text-surface-300">Crime Data:</strong> Only includes reported crimes. Reporting rates vary.</p>
            <p><strong className="text-surface-300">Congressional Trading:</strong> Self-reported within 45 days. Not financial advice.</p>
            <p><strong className="text-surface-300">Immigration:</strong> &quot;Encounters&quot; don&apos;t equal entries — many result in expulsions.</p>
            <p><strong className="text-surface-300">Budget Data:</strong> Federal spending is complex. Categories may overlap.</p>
            <p><strong className="text-surface-300">Employment:</strong> Official unemployment only counts those actively seeking work.</p>
            <p><strong className="text-surface-300">Debt:</strong> &quot;Total public debt&quot; includes intragovernmental holdings.</p>
            <p><strong className="text-surface-300">General:</strong> Statistics alone don&apos;t tell the full story. Context matters.</p>
          </div>
        </Card>

        {/* Built By */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Built By</h2>
          <p className="text-surface-400 mb-4">
            Let&apos;s Talk Statistics is a project by <a href="https://telep.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Telep IO</a>.
          </p>
          <p className="text-sm text-surface-500">
            We believe in transparent, unbiased presentation of data.
          </p>
        </Card>

        <div className="text-center text-sm text-surface-600">
          <p className="mb-2">All data sourced from official US government agencies.</p>
        </div>
      </div>
    </div>
  );
}
