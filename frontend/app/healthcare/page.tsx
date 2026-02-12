'use client';

import { useState, useCallback } from 'react';
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Shield, 
  AlertTriangle,
  BarChart3,
  MapPin,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  LazyBarChart,
  LazyBar,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyResponsiveContainer,
  LazyPieChart,
  LazyPie,
  LazyCell,
} from '@/components/charts';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

// Colors for charts
const CHART_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

// Static healthcare data (representative of real statistics)
const healthcareSpending = {
  total_spending: 4300, // $4.3 trillion in 2023
  gdp_percentage: 17.3,
  per_capita: 13000,
  growth_rate: 4.1,
  last_updated: '2024-02-01'
};

const coverageData = {
  total_covered: 304000000, // ~304 million Americans have coverage
  uninsured: 26000000, // ~26 million uninsured
  coverage_rate: 92.1,
  employer_coverage: 156000000,
  medicare: 66000000,
  medicaid: 82000000,
  individual_market: 14500000
};

const spendingBreakdown = [
  { category: 'Hospital Care', amount: 1380, percent: 32.1, color: '#3b82f6' },
  { category: 'Physician Services', amount: 829, percent: 19.3, color: '#22c55e' },
  { category: 'Prescription Drugs', amount: 603, percent: 14.0, color: '#ef4444' },
  { category: 'Nursing Home Care', amount: 200, percent: 4.7, color: '#f59e0b' },
  { category: 'Other', amount: 1288, percent: 29.9, color: '#8b5cf6' },
];

const ageGroupSpending = [
  { age: '0-18', spending: 4500, percent: 13.5 },
  { age: '19-34', spending: 3200, percent: 9.6 },
  { age: '35-54', spending: 6800, percent: 20.4 },
  { age: '55-64', spending: 13200, percent: 22.8 },
  { age: '65+', spending: 18400, percent: 33.7 },
];

const healthOutcomes = {
  life_expectancy: 76.4,
  infant_mortality: 5.6, // per 1,000 births
  maternal_mortality: 23.8, // per 100,000 births
  preventable_deaths: 112000
};

const internationalComparison = [
  { country: 'United States', spending: 17.3, life_expectancy: 76.4 },
  { country: 'Switzerland', spending: 11.1, life_expectancy: 83.4 },
  { country: 'Germany', spending: 10.9, life_expectancy: 81.2 },
  { country: 'France', spending: 10.8, life_expectancy: 82.5 },
  { country: 'Canada', spending: 10.8, life_expectancy: 82.4 },
  { country: 'Japan', spending: 11.0, life_expectancy: 84.8 },
  { country: 'United Kingdom', spending: 10.0, life_expectancy: 81.2 },
  { country: 'Australia', spending: 9.6, life_expectancy: 83.3 },
];

function HealthcarePageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number, inBillions: boolean = false) => {
    if (inBillions) {
      return `$${(amount / 1000).toFixed(1)}T`;
    }
    return amount >= 1000 ? `$${(amount / 1000).toFixed(1)}T` : `$${amount}B`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState 
          title="Data Unavailable"
          message={error}
          onRetry={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Healthcare Statistics</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Comprehensive data on US healthcare spending, coverage, and outcomes. 
            Track where healthcare dollars go and how America compares globally.
          </p>
        </div>
      </div>

      {/* Key Data Notice */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Data Sources:</strong> Centers for Medicare & Medicaid Services (CMS), 
            Bureau of Economic Analysis (BEA), Census Bureau, CDC, and OECD Health Statistics. 
            Latest comprehensive data from 2023 National Health Expenditure Accounts.
            {healthcareSpending.last_updated && (
              <span className="ml-1 text-green-700">
                Last updated: {new Date(healthcareSpending.last_updated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Total Spending
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(healthcareSpending.total_spending)}</p>
            <p className="text-xs text-gray-600 mt-1">{healthcareSpending.gdp_percentage}% of GDP</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              Per Capita
            </div>
            <p className="text-2xl font-bold text-gray-900">${healthcareSpending.per_capita.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">per person annually</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Shield className="h-4 w-4" />
              Coverage Rate
            </div>
            <p className="text-2xl font-bold text-gray-900">{coverageData.coverage_rate}%</p>
            <p className="text-xs text-gray-600 mt-1">{formatNumber(coverageData.total_covered)} covered</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Heart className="h-4 w-4" />
              Life Expectancy
            </div>
            <p className="text-2xl font-bold text-gray-900">{healthOutcomes.life_expectancy}</p>
            <p className="text-xs text-gray-600 mt-1">years at birth</p>
          </div>
        </div>

        {/* Coverage Breakdown */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Health Insurance Coverage
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-blue-700 font-semibold mb-2">Employer-Sponsored</div>
              <p className="text-2xl font-bold text-blue-800">{formatNumber(coverageData.employer_coverage)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {((coverageData.employer_coverage / coverageData.total_covered) * 100).toFixed(1)}% of covered
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="text-red-700 font-semibold mb-2">Medicare</div>
              <p className="text-2xl font-bold text-red-800">{formatNumber(coverageData.medicare)}</p>
              <p className="text-xs text-red-600 mt-1">Seniors & disabled</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="text-green-700 font-semibold mb-2">Medicaid</div>
              <p className="text-2xl font-bold text-green-800">{formatNumber(coverageData.medicaid)}</p>
              <p className="text-xs text-green-600 mt-1">Low-income families</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="text-purple-700 font-semibold mb-2">Individual Market</div>
              <p className="text-2xl font-bold text-purple-800">{formatNumber(coverageData.individual_market)}</p>
              <p className="text-xs text-purple-600 mt-1">ACA & private plans</p>
            </div>
          </div>
          
          {/* Uninsured callout */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>{formatNumber(coverageData.uninsured)} Americans remain uninsured</strong> ({(100 - coverageData.coverage_rate).toFixed(1)}% of population). 
              This represents families and individuals without access to employer coverage, 
              Medicare, Medicaid, or marketplace plans.
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Healthcare Spending by Category</h3>
            <LazyPieChart height={280}>
              <LazyPie
                data={spendingBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
              >
                {spendingBreakdown.map((entry, index) => (
                  <LazyCell key={`cell-${index}`} fill={entry.color} />
                ))}
              </LazyPie>
              <LazyTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `$${value}B (${spendingBreakdown.find(s => s.amount === value)?.percent}%)`,
                  name
                ]}
              />
            </LazyPieChart>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {spendingBreakdown.map((item) => (
                <div key={item.category} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-gray-700">{item.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spending by Age Group */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Capita Spending by Age</h3>
            <LazyBarChart
              data={ageGroupSpending}
              height={280}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <LazyCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <LazyXAxis 
                dataKey="age" 
                stroke="#6b7280" 
                fontSize={12}
              />
              <LazyYAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <LazyTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Per capita spending']}
              />
              <LazyBar 
                dataKey="spending" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
              />
            </LazyBarChart>
            <div className="mt-4 text-xs text-gray-600 text-center">
              Healthcare spending increases dramatically with age. Adults 65+ account for 33.7% of total healthcare spending.
            </div>
          </div>
        </div>

        {/* International Comparison */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            International Comparison: Healthcare Spending vs. Life Expectancy
          </h3>
          <LazyBarChart
            data={internationalComparison}
            height={320}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 100, bottom: 5 }}
          >
            <LazyCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <LazyXAxis 
              type="number" 
              stroke="#6b7280" 
              fontSize={12}
              label={{ value: '% of GDP spent on healthcare', position: 'insideBottom', offset: -10 }}
            />
            <LazyYAxis 
              dataKey="country" 
              type="category" 
              stroke="#6b7280" 
              fontSize={12}
              width={90}
            />
            <LazyTooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'spending') {
                  return [
                    `${value}% of GDP | Life Expectancy: ${props?.payload?.life_expectancy} years`,
                    props?.payload?.country
                  ];
                }
                return [value, name];
              }}
            />
            <LazyBar 
              dataKey="spending" 
              fill={(data: any) => data.country === 'United States' ? '#ef4444' : '#6366f1'}
              radius={[0, 4, 4, 0]}
            />
          </LazyBarChart>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Key Insight:</strong> The US spends significantly more on healthcare (17.3% of GDP) 
              than other developed nations, but achieves lower life expectancy outcomes. Countries like 
              Japan and Switzerland achieve better health outcomes with lower per-capita spending.
            </div>
          </div>
        </div>

        {/* Health Outcomes */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Key Health Outcomes
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-800">{healthOutcomes.life_expectancy}</div>
              <div className="text-sm text-blue-700 font-medium">Life Expectancy</div>
              <div className="text-xs text-blue-600 mt-1">years at birth</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-800">{healthOutcomes.infant_mortality}</div>
              <div className="text-sm text-red-700 font-medium">Infant Mortality</div>
              <div className="text-xs text-red-600 mt-1">per 1,000 births</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-800">{healthOutcomes.maternal_mortality}</div>
              <div className="text-sm text-purple-700 font-medium">Maternal Mortality</div>
              <div className="text-xs text-purple-600 mt-1">per 100,000 births</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-2xl font-bold text-amber-800">{formatNumber(healthOutcomes.preventable_deaths)}</div>
              <div className="text-sm text-amber-700 font-medium">Preventable Deaths</div>
              <div className="text-xs text-amber-600 mt-1">annually (CDC est.)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Data Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources & Further Reading</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Official Data Sources</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <a href="https://www.cms.gov/Research-Statistics-Data-and-Systems/Statistics-Trends-and-Reports/NationalHealthExpendData" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CMS National Health Expenditure Data</a></li>
                <li>• <a href="https://www.census.gov/topics/health/health-insurance.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Census Bureau Health Insurance Coverage</a></li>
                <li>• <a href="https://www.cdc.gov/nchs/fastats/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CDC National Center for Health Statistics</a></li>
                <li>• <a href="https://www.oecd.org/health/health-data.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OECD Health Statistics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Key Insights</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• US healthcare spending has grown from 5% of GDP in 1960 to 17.3% today</li>
                <li>• Hospital care accounts for nearly 1/3 of all healthcare spending</li>
                <li>• Adults 65+ represent 16% of population but 34% of healthcare spending</li>
                <li>• The US spends 2x more per capita than most developed nations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthcarePage() {
  return (
    <ErrorBoundary>
      <HealthcarePageContent />
    </ErrorBoundary>
  );
}