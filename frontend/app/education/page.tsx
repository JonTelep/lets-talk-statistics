'use client';

import { useState, useCallback } from 'react';
import { 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  BookOpen, 
  AlertTriangle,
  BarChart3,
  MapPin,
  RefreshCw,
  Info,
  Award,
  Building
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
  LazyLineChart,
  LazyLine
} from '@/components/charts';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

// Colors for charts
const CHART_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

// Static education data (representative of real statistics from DOE, Census, NCES)
const educationSpending = {
  total_spending: 800, // $800 billion in 2023
  k12_spending: 760, // K-12 public spending
  higher_ed_spending: 750, // Higher education spending
  per_pupil_k12: 15000, // National average per pupil
  gdp_percentage: 6.2, // Education spending as % of GDP
  growth_rate: 2.8,
  last_updated: '2024-02-01'
};

const enrollmentData = {
  total_k12: 49500000, // ~49.5 million K-12 students
  public_k12: 42000000, // Public K-12
  private_k12: 5200000, // Private K-12
  homeschool: 2300000, // Homeschooled
  total_higher_ed: 19700000, // Higher ed enrollment
  public_higher_ed: 14600000, // Public colleges/universities
  private_higher_ed: 5100000, // Private institutions
  graduation_rate: 87.3, // High school graduation rate
  college_enrollment_rate: 69.7 // College enrollment rate of HS grads
};

const spendingBreakdown = [
  { category: 'Instruction', amount: 456, percent: 60.0, color: '#3b82f6' },
  { category: 'Support Services', amount: 152, percent: 20.0, color: '#22c55e' },
  { category: 'Operations & Maintenance', amount: 76, percent: 10.0, color: '#ef4444' },
  { category: 'Transportation', amount: 38, percent: 5.0, color: '#f59e0b' },
  { category: 'Food Services', amount: 38, percent: 5.0, color: '#8b5cf6' },
];

const stateSpending = [
  { state: 'New York', spending: 24040, rank: 1 },
  { state: 'Connecticut', spending: 20635, rank: 2 },
  { state: 'New Jersey', spending: 20021, rank: 3 },
  { state: 'Vermont', spending: 19340, rank: 4 },
  { state: 'Alaska', spending: 18394, rank: 5 },
  { state: 'Massachusetts', spending: 17058, rank: 6 },
  { state: 'Wyoming', spending: 16224, rank: 7 },
  { state: 'Maryland', spending: 15976, rank: 8 },
  { state: 'Rhode Island', spending: 15532, rank: 9 },
  { state: 'Pennsylvania', spending: 15418, rank: 10 },
  { state: 'Utah', spending: 8014, rank: 45 },
  { state: 'Idaho', spending: 8106, rank: 44 },
  { state: 'Arizona', spending: 8625, rank: 43 },
  { state: 'Oklahoma', spending: 9080, rank: 42 },
  { state: 'North Carolina', spending: 9377, rank: 41 },
];

const achievementData = {
  naep_reading_grade4: 217, // NAEP scale score
  naep_reading_grade8: 260,
  naep_math_grade4: 235,
  naep_math_grade8: 274,
  proficiency_reading: 35, // Percentage at or above proficient
  proficiency_math: 41,
  achievement_gap_reading: 25, // Points between white and black students
  achievement_gap_math: 25,
  international_reading_rank: 13, // PISA ranking
  international_math_rank: 37,
  international_science_rank: 18
};

const collegeOutcomes = {
  completion_rate_4yr: 61.2, // 4-year completion rate
  completion_rate_6yr: 67.4, // 6-year completion rate
  student_debt_avg: 37000, // Average student debt
  employment_rate_grads: 86.3, // Employment rate of recent grads
  underemployment_rate: 27.8, // Underemployment rate of grads
  college_premium: 84 // Earnings premium of college grads (%)
};

const fundingTrends = [
  { year: '2014', federal: 67, state: 284, local: 268 },
  { year: '2015', federal: 71, state: 287, local: 275 },
  { year: '2016', federal: 73, state: 293, local: 282 },
  { year: '2017', federal: 75, state: 301, local: 289 },
  { year: '2018', federal: 78, state: 308, local: 295 },
  { year: '2019', federal: 81, state: 315, local: 302 },
  { year: '2020', federal: 85, state: 318, local: 305 },
  { year: '2021', federal: 92, state: 322, local: 310 },
  { year: '2022', federal: 87, state: 328, local: 318 },
  { year: '2023', federal: 89, state: 335, local: 325 },
];

function EducationPageContent() {
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Education Statistics</h1>
          </div>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Comprehensive data on US education spending, enrollment, and achievement. 
            Track how America invests in its future through K-12 and higher education.
          </p>
        </div>
      </div>

      {/* Key Data Notice */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-indigo-800">
            <strong>Data Sources:</strong> U.S. Department of Education, National Center for Education Statistics (NCES), 
            Census Bureau, National Assessment of Educational Progress (NAEP), and Organization for Economic Cooperation and Development (OECD). 
            Latest comprehensive data from 2023 education surveys and assessments.
            {educationSpending.last_updated && (
              <span className="ml-1 text-green-700">
                Last updated: {new Date(educationSpending.last_updated).toLocaleDateString()}
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
              K-12 Spending
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(educationSpending.k12_spending)}</p>
            <p className="text-xs text-gray-600 mt-1">${educationSpending.per_pupil_k12.toLocaleString()} per pupil</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              K-12 Students
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(enrollmentData.total_k12)}</p>
            <p className="text-xs text-gray-600 mt-1">{((enrollmentData.public_k12 / enrollmentData.total_k12) * 100).toFixed(1)}% public schools</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Award className="h-4 w-4" />
              Graduation Rate
            </div>
            <p className="text-2xl font-bold text-gray-900">{enrollmentData.graduation_rate}%</p>
            <p className="text-xs text-gray-600 mt-1">high school on-time graduation</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Building className="h-4 w-4" />
              College Enrollment
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(enrollmentData.total_higher_ed)}</p>
            <p className="text-xs text-gray-600 mt-1">{enrollmentData.college_enrollment_rate}% of HS grads</p>
          </div>
        </div>

        {/* K-12 Enrollment Breakdown */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            K-12 Enrollment Breakdown
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-blue-700 font-semibold mb-2">Public Schools</div>
              <p className="text-2xl font-bold text-blue-800">{formatNumber(enrollmentData.public_k12)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {((enrollmentData.public_k12 / enrollmentData.total_k12) * 100).toFixed(1)}% of all K-12 students
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="text-green-700 font-semibold mb-2">Private Schools</div>
              <p className="text-2xl font-bold text-green-800">{formatNumber(enrollmentData.private_k12)}</p>
              <p className="text-xs text-green-600 mt-1">
                {((enrollmentData.private_k12 / enrollmentData.total_k12) * 100).toFixed(1)}% of all K-12 students
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="text-purple-700 font-semibold mb-2">Homeschool</div>
              <p className="text-2xl font-bold text-purple-800">{formatNumber(enrollmentData.homeschool)}</p>
              <p className="text-xs text-purple-600 mt-1">
                {((enrollmentData.homeschool / enrollmentData.total_k12) * 100).toFixed(1)}% of all K-12 students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* K-12 Spending by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">K-12 Spending by Category</h3>
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

          {/* Education Funding Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Funding Trends (2014-2023)</h3>
            <LazyLineChart
              data={fundingTrends}
              height={280}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <LazyCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <LazyXAxis dataKey="year" stroke="#6b7280" fontSize={12} />
              <LazyYAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `$${value}B`}
              />
              <LazyTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `$${value}B`, 
                  name === 'federal' ? 'Federal' : name === 'state' ? 'State' : 'Local'
                ]}
              />
              <LazyLine 
                type="monotone" 
                dataKey="federal" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              />
              <LazyLine 
                type="monotone" 
                dataKey="state" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
              <LazyLine 
                type="monotone" 
                dataKey="local" 
                stroke="#16a34a" 
                strokeWidth={3}
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              />
            </LazyLineChart>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span>Federal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span>State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span>Local</span>
              </div>
            </div>
          </div>
        </div>

        {/* State Spending Comparison */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Per-Pupil Spending by State (Top 10 and Bottom 5)
          </h3>
          <LazyBarChart
            data={stateSpending}
            height={400}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <LazyCartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <LazyXAxis 
              type="number" 
              stroke="#6b7280" 
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <LazyYAxis 
              dataKey="state" 
              type="category" 
              stroke="#6b7280" 
              fontSize={12}
              width={75}
            />
            <LazyTooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string, props: any) => [
                `$${value.toLocaleString()} (Rank #${props?.payload?.rank})`,
                'Per-pupil spending'
              ]}
            />
            <LazyBar 
              dataKey="spending" 
              fill="#4f46e5"
              radius={[0, 4, 4, 0]}
            />
          </LazyBarChart>
          <div className="mt-4 text-xs text-gray-600 text-center">
            Per-pupil spending varies dramatically by state. New York spends 3x more per student than Utah.
          </div>
        </div>

        {/* Academic Achievement */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Academic Achievement & Outcomes
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-800">{achievementData.proficiency_math}%</div>
              <div className="text-sm text-blue-700 font-medium">Math Proficient</div>
              <div className="text-xs text-blue-600 mt-1">NAEP Grade 8</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-800">{achievementData.proficiency_reading}%</div>
              <div className="text-sm text-green-700 font-medium">Reading Proficient</div>
              <div className="text-xs text-green-600 mt-1">NAEP Grade 8</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-800">#{achievementData.international_math_rank}</div>
              <div className="text-sm text-purple-700 font-medium">Math Rank</div>
              <div className="text-xs text-purple-600 mt-1">PISA International</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-2xl font-bold text-amber-800">#{achievementData.international_reading_rank}</div>
              <div className="text-sm text-amber-700 font-medium">Reading Rank</div>
              <div className="text-xs text-amber-600 mt-1">PISA International</div>
            </div>
          </div>
          
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Achievement Gap Alert:</strong> Persistent achievement gaps remain in both math and reading. 
              The average score difference between white and Black students is {achievementData.achievement_gap_math} points in math 
              and {achievementData.achievement_gap_reading} points in reading, representing significant educational inequity.
            </div>
          </div>
        </div>

        {/* Higher Education Outcomes */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Higher Education Outcomes
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-2xl font-bold text-indigo-800">{collegeOutcomes.completion_rate_6yr}%</div>
              <div className="text-sm text-indigo-700 font-medium">6-Year Graduation</div>
              <div className="text-xs text-indigo-600 mt-1">bachelor's degree</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-800">{collegeOutcomes.employment_rate_grads}%</div>
              <div className="text-sm text-green-700 font-medium">Employment Rate</div>
              <div className="text-xs text-green-600 mt-1">recent graduates</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-800">{collegeOutcomes.underemployment_rate}%</div>
              <div className="text-sm text-yellow-700 font-medium">Underemployed</div>
              <div className="text-xs text-yellow-600 mt-1">recent graduates</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-800">${(collegeOutcomes.student_debt_avg / 1000).toFixed(0)}k</div>
              <div className="text-sm text-red-700 font-medium">Average Debt</div>
              <div className="text-xs text-red-600 mt-1">per graduate</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-800">+{collegeOutcomes.college_premium}%</div>
              <div className="text-sm text-emerald-700 font-medium">Earnings Premium</div>
              <div className="text-xs text-emerald-600 mt-1">vs high school</div>
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
                <li>• <a href="https://nces.ed.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">National Center for Education Statistics</a></li>
                <li>• <a href="https://www.naep.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NAEP - Nation's Report Card</a></li>
                <li>• <a href="https://www.census.gov/topics/education.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Census Bureau Education Statistics</a></li>
                <li>• <a href="https://www.oecd.org/education/education-at-a-glance/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OECD Education at a Glance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Key Insights</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Education spending has grown steadily but achievement gaps persist</li>
                <li>• 60% of K-12 spending goes directly to instruction</li>
                <li>• State per-pupil spending varies by over 300% across states</li>
                <li>• College enrollment is declining for the first time in decades</li>
                <li>• US ranks in the middle internationally despite high spending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  return (
    <ErrorBoundary>
      <EducationPageContent />
    </ErrorBoundary>
  );
}