import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const CAPITOL_TRADES_API = process.env.CAPITOL_TRADES_API || "https://trades.telep.io";

function parseAmountRange(amountText: string): [number, number] {
  if (!amountText) return [0, 0];
  try {
    const cleaned = amountText.replace(/[\$,]/g, '');
    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ');
      return [parseInt(parts[0].trim()), parseInt(parts[1].trim())];
    }
    return [0, 0];
  } catch {
    return [0, 0];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Fetch all trades to calculate top tickers
    const params = new URLSearchParams({
      limit: "2000" // Get more data to calculate accurate rankings
    });
    
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 2 });
    
    const trades = data.trades || [];
    
    // Aggregate by ticker
    const tickerStats: Record<string, {
      ticker: string;
      company_name: string;
      trade_count: number;
      total_volume: number;
      buy_count: number;
      sell_count: number;
      unique_politicians: Set<string>;
      avg_amount_per_trade: number;
    }> = {};
    
    for (const trade of trades) {
      const ticker = trade.ticker || "Unknown";
      const [minAmt, maxAmt] = parseAmountRange(trade.amount_text || "");
      const volume = (minAmt + maxAmt) / 2;
      const txType = (trade.transaction_type || "").toLowerCase();
      
      if (!tickerStats[ticker]) {
        tickerStats[ticker] = {
          ticker,
          company_name: trade.company_name || "",
          trade_count: 0,
          total_volume: 0,
          buy_count: 0,
          sell_count: 0,
          unique_politicians: new Set(),
          avg_amount_per_trade: 0
        };
      }
      
      tickerStats[ticker].trade_count++;
      tickerStats[ticker].total_volume += volume;
      if (txType.includes('purchase') || txType.includes('buy')) {
        tickerStats[ticker].buy_count++;
      } else if (txType.includes('sale') || txType.includes('sell')) {
        tickerStats[ticker].sell_count++;
      }
      if (trade.politician) {
        tickerStats[ticker].unique_politicians.add(trade.politician);
      }
    }
    
    // Convert to array and sort by trade count
    const topTickers = Object.values(tickerStats)
      .map(stats => ({
        ticker: stats.ticker,
        company_name: stats.company_name,
        trade_count: stats.trade_count,
        total_volume: stats.total_volume,
        total_volume_formatted: formatVolume(stats.total_volume),
        buy_count: stats.buy_count,
        sell_count: stats.sell_count,
        unique_politicians: stats.unique_politicians.size,
        avg_trade_size: stats.trade_count > 0 ? Math.round(stats.total_volume / stats.trade_count) : 0,
        avg_trade_size_formatted: formatVolume(stats.trade_count > 0 ? stats.total_volume / stats.trade_count : 0),
        buy_percentage: stats.trade_count > 0 ? Math.round((stats.buy_count / stats.trade_count) * 100) : 0
      }))
      .filter(t => t.ticker !== "Unknown" && t.ticker)
      .sort((a, b) => b.trade_count - a.trade_count)
      .slice(0, limit);
    
    function formatVolume(vol: number): string {
      if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(1)}B`;
      if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
      if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
      return `$${vol.toLocaleString()}`;
    }
    
    const result = {
      source: "Capitol Trades API (STOCK Act Disclosures)",
      fetched_at: new Date().toISOString(),
      summary: {
        total_unique_tickers: Object.keys(tickerStats).filter(t => t !== "Unknown" && t).length,
        showing: topTickers.length
      },
      tickers: topTickers
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching congress tickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch congress tickers' },
      { status: 500 }
    );
  }
}