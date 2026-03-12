import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const CAPITOL_TRADES_API = process.env.CAPITOL_TRADES_API || "https://trades.telep.io";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const politician = searchParams.get('politician') || '';
    const ticker = searchParams.get('ticker') || '';
    const transactionType = searchParams.get('type') || '';
    const chamber = searchParams.get('chamber') || '';
    const party = searchParams.get('party') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query parameters for Capitol Trades API
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (politician) params.append('politician', politician);
    if (ticker) params.append('ticker', ticker);
    if (transactionType) params.append('transaction_type', transactionType);
    if (chamber) params.append('chamber', chamber);
    if (party) params.append('party', party);
    
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 1 });
    
    const result = {
      source: "Capitol Trades API (STOCK Act Disclosures)",
      fetched_at: new Date().toISOString(),
      filters: {
        politician: politician || null,
        ticker: ticker || null,
        transaction_type: transactionType || null,
        chamber: chamber || null,
        party: party || null,
        limit,
        offset
      },
      pagination: {
        count: data.trades?.length || 0,
        has_more: (data.trades?.length || 0) === limit,
        next_offset: offset + limit
      },
      trades: data.trades || []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching congress trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch congress trades' },
      { status: 500 }
    );
  }
}