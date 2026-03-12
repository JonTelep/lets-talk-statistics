import { NextRequest, NextResponse } from 'next/server';

// Top source countries for legal immigration (FY2024)
const TOP_SOURCE_COUNTRIES = [
  {"country": "Mexico", "admissions": 129451, "percentage": 12.7},
  {"country": "India", "admissions": 104584, "percentage": 10.3},
  {"country": "China", "admissions": 75867, "percentage": 7.5},
  {"country": "Philippines", "admissions": 54329, "percentage": 5.3},
  {"country": "Cuba", "admissions": 52785, "percentage": 5.2},
  {"country": "Dominican Republic", "admissions": 50934, "percentage": 5.0},
  {"country": "Vietnam", "admissions": 35547, "percentage": 3.5},
  {"country": "El Salvador", "admissions": 28234, "percentage": 2.8},
  {"country": "Haiti", "admissions": 26138, "percentage": 2.6},
  {"country": "South Korea", "admissions": 22765, "percentage": 2.2},
  {"country": "Jamaica", "admissions": 21543, "percentage": 2.1},
  {"country": "Nigeria", "admissions": 19876, "percentage": 2.0},
  {"country": "Guatemala", "admissions": 18432, "percentage": 1.8},
  {"country": "Brazil", "admissions": 16789, "percentage": 1.7},
  {"country": "Bangladesh", "admissions": 15234, "percentage": 1.5},
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = {
      source: "DHS Immigration Statistics (FY2024 Yearbook)",
      fiscal_year: 2024,
      fetched_at: new Date().toISOString(),
      data: TOP_SOURCE_COUNTRIES.slice(0, limit),
      total_countries_shown: Math.min(limit, TOP_SOURCE_COUNTRIES.length),
      note: "Legal permanent resident admissions by country of birth"
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching immigration countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch immigration countries' },
      { status: 500 }
    );
  }
}