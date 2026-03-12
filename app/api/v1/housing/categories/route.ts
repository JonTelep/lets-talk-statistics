import { NextRequest, NextResponse } from 'next/server';

// Hardcoded housing categories since we're not using the Postgres database
const HOUSING_CATEGORIES = [
  {
    category: "prices",
    title: "Housing Prices",
    description: "Median sales prices, price indices, and affordability metrics",
    series_count: 15
  },
  {
    category: "construction",
    title: "Housing Construction", 
    description: "Housing starts, permits, and new construction activity",
    series_count: 12
  },
  {
    category: "ownership",
    title: "Homeownership",
    description: "Homeownership rates, vacancy rates, and housing tenure",
    series_count: 8
  },
  {
    category: "financing",
    title: "Housing Finance",
    description: "Mortgage rates, lending standards, and housing credit",
    series_count: 10
  },
  {
    category: "inventory", 
    title: "Housing Inventory",
    description: "Housing supply, months of inventory, and market conditions",
    series_count: 7
  },
  {
    category: "rental",
    title: "Rental Market",
    description: "Rent prices, rental vacancy rates, and rental market trends", 
    series_count: 6
  }
];

export async function GET(request: NextRequest) {
  try {
    const result = {
      source: "FRED (Federal Reserve Economic Data) - Direct API Access",
      fetched_at: new Date().toISOString(),
      note: "Categories defined for FRED housing data series",
      categories: HOUSING_CATEGORIES
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching housing categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch housing categories' },
      { status: 500 }
    );
  }
}