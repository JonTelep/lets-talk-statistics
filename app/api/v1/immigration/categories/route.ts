import { NextRequest, NextResponse } from 'next/server';

// Immigration by category (FY2024)
const IMMIGRATION_BY_CATEGORY = [
  {"category": "Family-Based", "count": 556472, "percent": 54.8},
  {"category": "Employment-Based", "count": 204467, "percent": 20.1},
  {"category": "Refugees & Asylees", "count": 154987, "percent": 15.3},
  {"category": "Diversity Lottery", "count": 54872, "percent": 5.4},
  {"category": "Other", "count": 45202, "percent": 4.4},
];

export async function GET(request: NextRequest) {
  try {
    const result = {
      source: "DHS Immigration Statistics (FY2024 Yearbook)",
      fiscal_year: 2024,
      fetched_at: new Date().toISOString(),
      data: IMMIGRATION_BY_CATEGORY,
      total: IMMIGRATION_BY_CATEGORY.reduce((sum, cat) => sum + cat.count, 0),
      note: "Legal permanent resident admissions by category of admission"
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching immigration categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch immigration categories' },
      { status: 500 }
    );
  }
}