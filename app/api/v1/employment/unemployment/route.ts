import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '5');
    
    // BLS Public Data API
    const url = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
    
    const endYear = new Date().getFullYear();
    const startYear = endYear - years;
    
    const payload: any = {
      seriesid: ["LNS14000000"], // Unemployment rate
      startyear: startYear.toString(),
      endyear: endYear.toString(),
    };
    
    // Add API key if available for higher rate limits
    const blsApiKey = process.env.BLS_API_KEY;
    if (blsApiKey) {
      payload.registrationkey = blsApiKey;
    }
    
    // POST request to BLS
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`BLS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse BLS response format
    const seriesData = data.Results?.series?.[0]?.data || [];
    
    const result = {
      source: "Bureau of Labor Statistics",
      series: "LNS14000000",
      fetched_at: new Date().toISOString(),
      data: seriesData
        .filter((item: any) => item.period?.startsWith("M") && item.value !== "-")
        .map((item: any) => ({
          year: parseInt(item.year),
          month: parseInt(item.period.replace("M", "")),
          rate: parseFloat(item.value)
        }))
        .sort((a: any, b: any) => {
          // Sort chronologically
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching unemployment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unemployment data' },
      { status: 500 }
    );
  }
}