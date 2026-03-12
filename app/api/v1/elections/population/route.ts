import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '') || new Date().getFullYear() - 1; // Previous year usually has data
    
    // Census Population Estimates API
    const url = `https://api.census.gov/data/${year}/pep/population`;
    const params = new URLSearchParams({
      get: "NAME,POP",
      for: "state:*"
    });
    
    const censusApiKey = process.env.CENSUS_API_KEY;
    if (censusApiKey) {
      params.append("key", censusApiKey);
    }
    
    const data = await fetchWithCache(`${url}?${params}`);
    
    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = {
      source: "U.S. Census Bureau",
      year,
      fetched_at: new Date().toISOString(),
      data: rows.map((row: any[]) => ({
        state: row[0],
        population: parseInt(row[1]),
        fips: row[2]
      }))
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching population data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch population data' },
      { status: 500 }
    );
  }
}