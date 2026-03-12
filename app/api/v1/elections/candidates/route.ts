import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cycle = parseInt(searchParams.get('cycle') || '') || 
      (new Date().getFullYear() % 2 === 0 ? new Date().getFullYear() : new Date().getFullYear() - 1);
    
    // FEC OpenFEC API
    const url = "https://api.open.fec.gov/v1/candidates/totals/";
    const params = new URLSearchParams({
      cycle: cycle.toString(),
      sort: "-receipts",
      per_page: "100",
      is_active_candidate: "true",
    });
    
    const fecApiKey = process.env.FEC_API_KEY || "DEMO_KEY";
    params.append("api_key", fecApiKey);
    
    const data = await fetchWithCache(`${url}?${params}`);
    
    const result = {
      source: "Federal Election Commission",
      cycle,
      fetched_at: new Date().toISOString(),
      data: (data.results || []).map((c: any) => ({
        name: c.name,
        party: c.party,
        office: c.office,
        state: c.state,
        receipts: c.receipts,
        disbursements: c.disbursements,
      }))
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching candidate data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate data' },
      { status: 500 }
    );
  }
}