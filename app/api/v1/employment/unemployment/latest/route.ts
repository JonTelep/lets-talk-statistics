import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // BLS Public Data API
    const url = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
    
    const currentYear = new Date().getFullYear();
    
    const payload: any = {
      seriesid: ["LNS14000000"], // Unemployment rate
      startyear: currentYear.toString(),
      endyear: currentYear.toString(),
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
    
    // Parse BLS response format and get the most recent month
    const seriesData = data.Results?.series?.[0]?.data || [];
    const validData = seriesData
      .filter((item: any) => item.period?.startsWith("M") && item.value !== "-")
      .map((item: any) => ({
        year: parseInt(item.year),
        month: parseInt(item.period.replace("M", "")),
        rate: parseFloat(item.value),
        period: item.period,
        periodName: item.periodName
      }))
      .sort((a: any, b: any) => {
        // Sort by year desc, then month desc to get latest
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    
    const latest = validData[0];
    
    if (!latest) {
      return NextResponse.json(
        { error: 'No unemployment data available' },
        { status: 404 }
      );
    }
    
    const result = {
      source: "Bureau of Labor Statistics",
      series: "LNS14000000",
      fetched_at: new Date().toISOString(),
      data: latest
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching latest unemployment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest unemployment data' },
      { status: 500 }
    );
  }
}