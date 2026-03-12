import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const BTS_BASE_URL = "https://data.bts.gov/resource/keg4-3bc2.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const border = searchParams.get('border') || '';
    const measure = searchParams.get('measure') || '';
    const state = searchParams.get('state') || '';
    const year = searchParams.get('year') || '';
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // Build Socrata query
    const params = new URLSearchParams({
      "$limit": limit.toString(),
      "$order": "date DESC"
    });
    
    // Add filters
    const filters = [];
    if (border) filters.push(`border='${border}'`);
    if (measure) filters.push(`measure='${measure}'`);
    if (state) filters.push(`state='${state}'`);
    if (year) filters.push(`date_extract_y(date)=${year}`);
    
    if (filters.length > 0) {
      params.append("$where", filters.join(" AND "));
    }
    
    const data = await fetchWithCache(`${BTS_BASE_URL}?${params}`);
    
    // Aggregate data if we have it
    const totalCrossings = data.reduce((sum: number, record: any) => {
      return sum + (parseInt(record.value || 0) || 0);
    }, 0);
    
    // Get unique values for metadata
    const uniqueBorders = [...new Set(data.map((r: any) => r.border).filter(Boolean))];
    const uniqueMeasures = [...new Set(data.map((r: any) => r.measure).filter(Boolean))];
    const uniqueStates = [...new Set(data.map((r: any) => r.state).filter(Boolean))];
    
    const result = {
      source: "Bureau of Transportation Statistics (BTS)",
      fetched_at: new Date().toISOString(),
      filters: {
        border: border || null,
        measure: measure || null,
        state: state || null,
        year: year || null
      },
      summary: {
        total_crossings: totalCrossings,
        total_records: data.length,
        date_range: data.length > 0 ? {
          earliest: data[data.length - 1]?.date,
          latest: data[0]?.date
        } : null
      },
      available_filters: {
        borders: uniqueBorders,
        measures: uniqueMeasures,
        states: uniqueStates
      },
      data: data
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching border crossings data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch border crossings data' },
      { status: 500 }
    );
  }
}