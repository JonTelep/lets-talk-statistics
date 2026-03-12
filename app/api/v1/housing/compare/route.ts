import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Placeholder implementation - would compare multiple housing series from FRED
    const result = {
      source: "FRED (Federal Reserve Economic Data) - Series Comparison (Placeholder)",
      fetched_at: new Date().toISOString(),
      note: "This endpoint would compare multiple FRED housing series",
      data: []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching housing comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch housing comparison data' },
      { status: 500 }
    );
  }
}