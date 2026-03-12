import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const CAPITOL_TRADES_API = process.env.CAPITOL_TRADES_API || "https://trades.telep.io";

interface Params {
  ticker: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { ticker } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }
    
    // Fetch trades for specific ticker
    const queryParams = new URLSearchParams({
      ticker: ticker.toUpperCase(),
      limit: limit.toString(),
      sort: 'date_filed',
      order: 'desc'
    });
    
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const data = await fetchWithCache(`${url}?${queryParams}`, { ttlHours: 1 });
    
    const trades = data.trades || [];
    
    // Calculate summary stats for this ticker
    const uniquePoliticians = new Set(trades.map((t: any) => t.politician).filter(Boolean));
    const buyTrades = trades.filter((t: any) => {
      const txType = (t.transaction_type || "").toLowerCase();
      return txType.includes('purchase') || txType.includes('buy');
    });
    const sellTrades = trades.filter((t: any) => {
      const txType = (t.transaction_type || "").toLowerCase();
      return txType.includes('sale') || txType.includes('sell');
    });
    
    // Get company name from first trade (if available)
    const companyName = trades[0]?.company_name || ticker;
    
    const result = {
      source: "Capitol Trades API (STOCK Act Disclosures)",
      fetched_at: new Date().toISOString(),
      ticker: ticker.toUpperCase(),
      company_name: companyName,
      summary: {
        total_trades: trades.length,
        unique_politicians: uniquePoliticians.size,
        buy_trades: buyTrades.length,
        sell_trades: sellTrades.length,
        buy_percentage: trades.length > 0 ? Math.round((buyTrades.length / trades.length) * 100) : 0
      },
      trades
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching ticker trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker trades' },
      { status: 500 }
    );
  }
}