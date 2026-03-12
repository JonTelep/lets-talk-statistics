import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

// FRED series IDs for debt holder composition (all quarterly)
const FRED_SERIES = {
  "federal_reserve": "FDHBFRBN",          // Fed Reserve Banks (billions $)
  "foreign": "FDHBFIN",                    // Foreign & International (billions $)
  "pension_funds": "BOGZ1FL593061105Q",    // Pension Funds (millions $)
  "state_local": "BOGZ1FL213061103Q",      // State & Local Govts (millions $)
  "mutual_funds": "BOGZ1LM653061105Q",     // Mutual Funds (millions $)
};

const FRED_BASE = "https://api.stlouisfed.org/fred";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

async function fetchFredHistory(seriesId: string, limit: number = 40): Promise<Array<{ date: string; value: number }>> {
  try {
    const url = `${FRED_BASE}/series/observations`;
    const params = new URLSearchParams({
      api_key: FRED_API_KEY,
      file_type: "json",
      series_id: seriesId,
      sort_order: "desc",
      limit: limit.toString()
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    
    return (data.observations || [])
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({
        date: o.date,
        value: parseFloat(o.value)
      }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const limit = 40; // ~10 years quarterly
    
    // Fetch all FRED series in parallel
    const promises = Object.entries(FRED_SERIES).map(async ([key, seriesId]) => {
      const result = await fetchFredHistory(seriesId, limit);
      return [key, result];
    });
    
    const results = await Promise.all(promises);
    const seriesData = Object.fromEntries(results);
    
    function processSeries(key: string, divisor: number = 1.0): Array<{ date: string; value: number }> {
      const data = seriesData[key] || [];
      return data.map((o: any) => ({
        date: o.date,
        value: Math.round(o.value / divisor * 100) / 100
      }));
    }

    const result = {
      series: {
        federal_reserve: processSeries("federal_reserve"),
        foreign: processSeries("foreign"),
        pension_funds: processSeries("pension_funds", 1000),
        state_local: processSeries("state_local", 1000),
        mutual_funds: processSeries("mutual_funds", 1000),
      },
      units: "billions_usd",
      source: "FRED (Federal Reserve Economic Data)",
      fetched_at: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching debt holders history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt holders history' },
      { status: 500 }
    );
  }
}