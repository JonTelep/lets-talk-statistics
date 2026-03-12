import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const FRED_BASE = "https://api.stlouisfed.org/fred";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

interface Params {
  seriesId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { seriesId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    if (!seriesId) {
      return NextResponse.json(
        { error: 'Series ID is required' },
        { status: 400 }
      );
    }
    
    // First, get series metadata
    const seriesUrl = `${FRED_BASE}/series`;
    const seriesParams = new URLSearchParams({
      api_key: FRED_API_KEY,
      file_type: "json",
      series_id: seriesId
    });
    
    const seriesData = await fetchWithCache(`${seriesUrl}?${seriesParams}`);
    const seriesInfo = seriesData.seriess?.[0] || {};
    
    // Then get observations
    const obsUrl = `${FRED_BASE}/series/observations`;
    const obsParams = new URLSearchParams({
      api_key: FRED_API_KEY,
      file_type: "json",
      series_id: seriesId,
      sort_order: "desc",
      limit: limit.toString()
    });
    
    if (startDate) obsParams.append('observation_start', startDate);
    if (endDate) obsParams.append('observation_end', endDate);
    
    const obsData = await fetchWithCache(`${obsUrl}?${obsParams}`);
    const observations = (obsData.observations || [])
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({
        date: o.date,
        value: parseFloat(o.value)
      }))
      .reverse(); // Chronological order
    
    const result = {
      source: "FRED (Federal Reserve Economic Data)",
      fetched_at: new Date().toISOString(),
      series_id: seriesId,
      title: seriesInfo.title || seriesId,
      units: seriesInfo.units || "",
      frequency: seriesInfo.frequency || "",
      last_updated: seriesInfo.last_updated || "",
      observation_count: observations.length,
      latest_observation: observations[observations.length - 1] || null,
      observations
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching housing observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch housing observations' },
      { status: 500 }
    );
  }
}