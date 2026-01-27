import { Scale, TrendingUp, TrendingDown, MapPin, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

// This page serves as the landing page for crime statistics
// The actual data comes from the existing explore/compare/trends pages

export default function CrimePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Crime Statistics</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl">
            Explore U.S. crime data from the FBI's Uniform Crime Reporting (UCR) Program 
            and Bureau of Justice Statistics. Compare states, analyze trends, and understand 
            the data behind the headlines.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Sources:</strong> FBI Crime Data Explorer, Bureau of Justice Statistics, 
            and U.S. Census Bureau population data. Per capita rates are calculated per 100,000 population.
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore Crime Data</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Explore Card */}
          <Link href="/explore" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full border-2 border-transparent hover:border-primary-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  Explore Data
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Browse crime statistics with filters for state, year, and crime type. 
                View raw numbers and per capita rates.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Filter by state and year</li>
                <li>• View by crime type</li>
                <li>• Sortable data tables</li>
                <li>• Export to CSV</li>
              </ul>
            </div>
          </Link>

          {/* Compare Card */}
          <Link href="/compare" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full border-2 border-transparent hover:border-primary-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  Compare States
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Compare crime rates between states side-by-side. See which states have 
                higher or lower rates for specific crimes.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• State vs state comparison</li>
                <li>• Per capita normalization</li>
                <li>• Visual bar charts</li>
                <li>• Multiple crime types</li>
              </ul>
            </div>
          </Link>

          {/* Trends Card */}
          <Link href="/trends" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full border-2 border-transparent hover:border-primary-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  View Trends
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Analyze crime trends over time with interactive line charts. 
                See year-over-year changes and long-term patterns.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Multi-year trend lines</li>
                <li>• Interactive charts</li>
                <li>• Year-over-year change</li>
                <li>• National & state level</li>
              </ul>
            </div>
          </Link>
        </div>
      </div>

      {/* Crime Types Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Crime Categories</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Violent Crimes</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Murder & Non-negligent Manslaughter</li>
                <li>• Rape</li>
                <li>• Robbery</li>
                <li>• Aggravated Assault</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Property Crimes</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Burglary</li>
                <li>• Larceny-Theft</li>
                <li>• Motor Vehicle Theft</li>
                <li>• Arson</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Demographics</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• By Age Group</li>
                <li>• By Race/Ethnicity</li>
                <li>• By Sex</li>
                <li>• By Region</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Data Metrics</h4>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Total Incidents</li>
                <li>• Per Capita Rates</li>
                <li>• Year-over-Year Change</li>
                <li>• State Rankings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding the Data Section */}
      <div className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Understanding the Data</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What is Per Capita?</h3>
              <p className="text-gray-600 mb-4">
                Per capita rates express incidents per 100,000 people, allowing fair 
                comparisons between areas with different populations.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-mono text-gray-700">
                  Per Capita = (Incidents ÷ Population) × 100,000
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Example: 500 crimes in a city of 250,000 = 200 per 100,000
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Limitations</h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Not all crimes are reported to police</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Reporting practices vary by jurisdiction</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>FBI transitioned from UCR to NIBRS in 2021</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Population estimates affect per capita calculations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
