import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const CAPITOL_TRADES_API = process.env.CAPITOL_TRADES_API || "https://trades.telep.io";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const days = parseInt(searchParams.get('days') || '30');
    
    // Build query parameters for Capitol Trades API
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort: 'date_filed',
      order: 'desc'
    });
    
    // Calculate date filter if days specified
    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      params.append('since', cutoffDate.toISOString().split('T')[0]);
    }
    
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 0.5 }); // Refresh every 30 minutes
    
    const trades = data.trades || [];
    
    // Calculate some summary stats for recent trades
    const uniquePoliticians = new Set(trades.map((t: any) => t.politician).filter(Boolean)).size;
    const uniqueTickers = new Set(trades.map((t: any) => t.ticker).filter(Boolean)).size;
    const totalTrades = trades.length;
    
    const result = {
      source: "Capitol Trades API (STOCK Act Disclosures)",
      fetched_at: new Date().toISOString(),
      filters: {
        limit,
        days: days > 0 ? days : null
      },
      summary: {
        total_recent_trades: totalTrades,
        unique_politicians: uniquePoliticians,
        unique_tickers: uniqueTickers,
        period: days > 0 ? `Last ${days} days` : 'All time'
      },
      trades
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching recent congress trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent congress trades' },
      { status: 500 }
    );
  }
}