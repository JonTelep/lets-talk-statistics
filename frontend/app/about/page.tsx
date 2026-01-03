import { ExternalLink, Database, Calculator, BookOpen, AlertCircle } from 'lucide-react';
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
            Understanding the methodology behind the data
          </p>
        </div>

        {/* Purpose */}
        <Card className="mb-8">
          <div className="flex items-start mb-4">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Purpose</h2>
            </div>
          </div>
          <div className="prose prose-blue max-w-none text-gray-700">
            <p className="mb-4">
              <strong>Let's Talk Statistics</strong> is an educational platform designed to present
              objective crime data from official US government sources. The goal is simple: provide
              the numbers without opinions, interpretations, or narratives.
            </p>
            <p className="mb-4">
              Crime statistics are often discussed in media and politics, but the raw data can be
              difficult to access and understand. This platform makes government data accessible
              and easy to explore, allowing you to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Browse crime statistics by state and year</li>
              <li>Compare states and time periods</li>
              <li>Analyze trends over multiple years</li>
              <li>Understand the difference between raw numbers and per capita rates</li>
              <li>Draw your own conclusions from the data</li>
            </ul>
            <p>
              <strong>No accounts required. No paywalls. No opinions. Just data.</strong>
            </p>
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
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <a
                  href="https://cde.ucr.cjis.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 flex items-center"
                >
                  FBI Crime Data Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </h3>
              <p className="text-sm text-gray-700">
                The FBI's Uniform Crime Reporting (UCR) Program collects crime statistics from
                law enforcement agencies across the United States. This is the primary source
                for incident counts by crime type, state, and year.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <a
                  href="https://www.census.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 flex items-center"
                >
                  US Census Bureau
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </h3>
              <p className="text-sm text-gray-700">
                Population data used to calculate per capita rates comes from the US Census
                Bureau's annual population estimates.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <a
                  href="https://bjs.ojp.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 flex items-center"
                >
                  Bureau of Justice Statistics
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </h3>
              <p className="text-sm text-gray-700">
                Additional context and methodology information from the Bureau of Justice
                Statistics, part of the US Department of Justice.
              </p>
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
                Per capita rates normalize crime data by population, allowing fair comparisons
                between states of different sizes. The formula is:
              </p>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-2">
                Rate = (Incidents ÷ Population) × 100,000
              </div>
              <p className="text-sm text-gray-700">
                This means the rate represents incidents per 100,000 people, the standard used
                by criminologists and law enforcement agencies.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Crime Categories</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-900 text-sm">Violent Crime</p>
                  <p className="text-xs text-gray-600">
                    Includes murder, rape, robbery, and aggravated assault
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-900 text-sm">Property Crime</p>
                  <p className="text-xs text-gray-600">
                    Includes burglary, larceny, and motor vehicle theft
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Processing</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Data is aggregated at the state level annually</li>
                <li>Missing data is not estimated or filled in</li>
                <li>All calculations use official government figures</li>
                <li>No adjustments or corrections are applied to the source data</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Key Definitions */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Definitions</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
              <p className="text-sm text-gray-700">
                A collection of quantitative data gathered, analyzed, and presented to show
                patterns and trends. In this context, it refers to counts of reported criminal
                incidents.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Incident</h3>
              <p className="text-sm text-gray-700">
                A single occurrence of a crime as reported to law enforcement and recorded in
                the FBI's UCR system.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Reported Crime</h3>
              <p className="text-sm text-gray-700">
                These statistics only include crimes reported to law enforcement. Many crimes go
                unreported, so these numbers represent a subset of total criminal activity.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Per Capita</h3>
              <p className="text-sm text-gray-700">
                "Per capita" means "per person" in Latin. In statistics, it represents a rate
                per unit of population (in this case, per 100,000 people).
              </p>
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
              <strong>Reporting Variations:</strong> Not all crimes are reported to police, and
              reporting rates may vary by crime type, location, and demographic factors.
            </p>
            <p>
              <strong>Definitional Differences:</strong> How crimes are classified and recorded
              can vary between jurisdictions and over time.
            </p>
            <p>
              <strong>Population Estimates:</strong> Population data comes from estimates and
              may not perfectly reflect actual population at the time of data collection.
            </p>
            <p>
              <strong>Missing Data:</strong> Some jurisdictions may not report complete data for
              all years or crime categories.
            </p>
            <p>
              <strong>Context Matters:</strong> Crime statistics alone don't tell the full story.
              Social, economic, and policy factors all play roles in crime trends.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            This is an educational project. All data is sourced from official US government agencies.
          </p>
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
