import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const FRED_GDP_SERIES = "GFDGDPA188S"; // Federal Debt to GDP Percent (annual)
const FRED_BASE = "https://api.stlouisfed.org/fred";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const url = `${FRED_BASE}/series/observations`;
    const params = new URLSearchParams({
      api_key: FRED_API_KEY,
      file_type: "json",
      series_id: FRED_GDP_SERIES,
      sort_order: "desc",
      limit: "60"
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    const observations = data.observations || [];
    
    const history = observations
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({
        date: o.date,
        percent: Math.round(parseFloat(o.value) * 10) / 10
      }));
    
    const latest = history[0] || null;
    
    const result = {
      latest: latest ? {
        date: latest.date,
        percent: latest.percent,
      } : null,
      history: history.reverse(), // Chronological order
      source: "FRED (Federal Reserve Economic Data)",
      fetched_at: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching debt-to-GDP ratio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt-to-GDP ratio' },
      { status: 500 }
    );
  }
}