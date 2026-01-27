import { ExternalLink, Database, Calculator, BookOpen, AlertCircle, Scale, TrendingUp, Users, DollarSign, Briefcase, Building2 } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About This Project
          </h1>
          <p className="text-xl text-gray-600">
            Government data, clearly presented. No spin, no agenda — just the numbers.
          </p>
        </div>

        {/* Purpose */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            </div>
          </div>
          <div className="prose prose-blue max-w-none text-gray-700">
            <p className="mb-4">
              <strong>Let's Talk Statistics</strong> is an objective data platform that presents
              government statistics across multiple domains — crime, immigration, federal spending,
              employment, and national debt. No opinions, no narratives, just data from official sources.
            </p>
            <p className="mb-4">
              Government data is often discussed in media and politics, but raw numbers can be 
              difficult to access, understand, or compare. We make this data accessible, letting you:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Explore statistics across multiple categories</li>
              <li>Compare data across states, years, and demographics</li>
              <li>Understand what the numbers actually mean</li>
              <li>Access source citations for every statistic</li>
              <li>Draw your own conclusions</li>
            </ul>
            <p>
              <strong>No accounts. No paywalls. No spin. Just data.</strong>
            </p>
          </div>
        </Card>

        {/* Data Categories */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Categories</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-gray-900">Crime Statistics</h3>
              </div>
              <p className="text-sm text-gray-600">FBI crime data by state, year, and demographics</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Congressional Trading</h3>
              </div>
              <p className="text-sm text-gray-600">Stock trades by members of Congress (STOCK Act)</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">Immigration</h3>
              </div>
              <p className="text-sm text-gray-600">Legal immigration, deportations, and encounters</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Federal Budget</h3>
              </div>
              <p className="text-sm text-gray-600">Government spending, revenue, and deficits</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Employment</h3>
              </div>
              <p className="text-sm text-gray-600">Unemployment rates and job market data</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">National Debt</h3>
              </div>
              <p className="text-sm text-gray-600">Federal debt tracking and debt holders</p>
            </div>
          </div>
        </Card>

        {/* Data Sources */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <Database className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-slate-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Crime Statistics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://cde.ucr.cjis.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">FBI Crime Data Explorer</a></li>
                <li>• <a href="https://bjs.ojp.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Bureau of Justice Statistics</a></li>
                <li>• <a href="https://www.census.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">US Census Bureau (population data)</a></li>
              </ul>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Congressional Trading</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://efdsearch.senate.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Senate Financial Disclosures</a></li>
                <li>• <a href="https://disclosures-clerk.house.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">House Financial Disclosures</a></li>
              </ul>
            </div>

            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Immigration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://www.dhs.gov/immigration-statistics" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">DHS Immigration Statistics</a></li>
                <li>• <a href="https://www.cbp.gov/newsroom/stats" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">CBP Operational Statistics</a></li>
                <li>• <a href="https://www.ice.gov/data" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">ICE Enforcement Data</a></li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Federal Budget</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://www.usaspending.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">USASpending.gov</a></li>
                <li>• <a href="https://fiscaldata.treasury.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Treasury Fiscal Data</a></li>
                <li>• <a href="https://www.whitehouse.gov/omb" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Office of Management & Budget</a></li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Employment</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Bureau of Labor Statistics</a></li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">National Debt</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <a href="https://www.treasurydirect.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">TreasuryDirect.gov</a></li>
                <li>• <a href="https://ticdata.treasury.gov" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Treasury International Capital</a></li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Methodology */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <Calculator className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Methodology</h2>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Per Capita Rates</h3>
              <p className="text-sm text-gray-700 mb-2">
                For fair comparisons across different population sizes, we calculate per capita rates:
              </p>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-2">
                Rate = (Count ÷ Population) × 100,000
              </div>
              <p className="text-sm text-gray-700">
                This standard allows comparisons between states, countries, or time periods.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Presentation Principles</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
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
        <Card className="mb-8 bg-amber-50 border-l-4 border-warning">
          <div className="flex items-start mb-4">
            <AlertCircle className="h-8 w-8 text-warning mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Important Limitations
              </h2>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Crime Data:</strong> Only includes reported crimes. Reporting rates vary by 
              location, crime type, and demographics.
            </p>
            <p>
              <strong>Congressional Trading:</strong> Self-reported by members within 45 days. 
              Returns calculated from trade date — not financial advice.
            </p>
            <p>
              <strong>Immigration:</strong> "Encounters" don't equal entries — many result in 
              expulsions or returns. Visa overstays are estimates.
            </p>
            <p>
              <strong>Budget Data:</strong> Federal spending is complex. Categories may overlap 
              or be categorized differently across sources.
            </p>
            <p>
              <strong>Employment:</strong> Official unemployment only counts those actively seeking 
              work. True joblessness may be higher.
            </p>
            <p>
              <strong>Debt:</strong> "Total public debt" includes intragovernmental holdings. 
              Different measures exist for different purposes.
            </p>
            <p>
              <strong>General:</strong> Statistics alone don't tell the full story. Context matters.
            </p>
          </div>
        </Card>

        {/* Built By */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Built By</h2>
          <p className="text-gray-700 mb-4">
            Let's Talk Statistics is a project by <a href="https://telep.io" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">Telep IO</a>, 
            a software company focused on building tools that make information more accessible.
          </p>
          <p className="text-sm text-gray-600">
            We believe in transparent, unbiased presentation of data. Our goal is to help people 
            understand the numbers behind the headlines — and draw their own conclusions.
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            All data sourced from official US government agencies. This is an educational project.
          </p>
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
