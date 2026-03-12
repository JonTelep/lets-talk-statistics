import { NextRequest, NextResponse } from 'next/server';

// Common FRED housing series
const FRED_HOUSING_SERIES = [
  {
    series_id: "MSPUS",
    title: "Median Sales Price of Houses Sold for the United States",
    category: "prices",
    units: "Dollars",
    frequency: "Quarterly"
  },
  {
    series_id: "HOUST",
    title: "Housing Starts: Total: New Privately-Owned Housing Units Started",
    category: "construction", 
    units: "Thousands of Units",
    frequency: "Monthly"
  },
  {
    series_id: "RHORUSQ156N",
    title: "Homeownership Rate in the United States",
    category: "ownership",
    units: "Percent",
    frequency: "Quarterly"
  },
  {
    series_id: "MORTGAGE30US",
    title: "30-Year Fixed Rate Mortgage Average in the United States",
    category: "financing",
    units: "Percent",
    frequency: "Weekly"
  },
  {
    series_id: "MSACSR", 
    title: "Monthly Supply of New Houses in the United States",
    category: "inventory",
    units: "Months",
    frequency: "Monthly"
  },
  {
    series_id: "RRVRUSQ156N",
    title: "Rental Vacancy Rate in the United States",
    category: "rental",
    units: "Percent", 
    frequency: "Quarterly"
  },
  {
    series_id: "PERMIT",
    title: "New Private Housing Units Authorized by Building Permits",
    category: "construction",
    units: "Thousands of Units",
    frequency: "Monthly"
  },
  {
    series_id: "CSUSHPISA",
    title: "S&P/Case-Shiller U.S. National Home Price Index",
    category: "prices",
    units: "Index Jan 2000=100",
    frequency: "Monthly"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let filteredSeries = FRED_HOUSING_SERIES;
    if (category) {
      filteredSeries = FRED_HOUSING_SERIES.filter(s => s.category === category);
    }
    
    const result = {
      source: "FRED (Federal Reserve Economic Data)",
      fetched_at: new Date().toISOString(),
      filter: category ? { category } : null,
      series_count: filteredSeries.length,
      series: filteredSeries
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching housing series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch housing series' },
      { status: 500 }
    );
  }
}