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
    const chamber = searchParams.get('chamber') || '';
    const party = searchParams.get('party') || '';
    
    // Fetch all trades to calculate top traders
    const params = new URLSearchParams({
      limit: "2000" // Get more data to calculate accurate rankings
    });
    
    if (chamber) params.append('chamber', chamber);
    if (party) params.append('party', party);
    
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 2 });
    
    const trades = data.trades || [];
    
    // Aggregate by politician
    const traderStats: Record<string, {
      politician: string;
      chamber: string;
      party: string;
      state: string;
      trade_count: number;
      total_volume: number;
      buy_count: number;
      sell_count: number;
      unique_tickers: Set<string>;
    }> = {};
    
    for (const trade of trades) {
      const politician = trade.politician || "Unknown";
      const [minAmt, maxAmt] = parseAmountRange(trade.amount_text || "");
      const volume = (minAmt + maxAmt) / 2;
      const txType = (trade.transaction_type || "").toLowerCase();
      
      if (!traderStats[politician]) {
        traderStats[politician] = {
          politician,
          chamber: trade.chamber || "",
          party: trade.party || "",
          state: trade.state || "",
          trade_count: 0,
          total_volume: 0,
          buy_count: 0,
          sell_count: 0,
          unique_tickers: new Set()
        };
      }
      
      traderStats[politician].trade_count++;
      traderStats[politician].total_volume += volume;
      if (txType.includes('purchase') || txType.includes('buy')) {
        traderStats[politician].buy_count++;
      } else if (txType.includes('sale') || txType.includes('sell')) {
        traderStats[politician].sell_count++;
      }
      if (trade.ticker) {
        traderStats[politician].unique_tickers.add(trade.ticker);
      }
    }
    
    // Convert to array and sort by trade count
    const topTraders = Object.values(traderStats)
      .map(stats => ({
        politician: stats.politician,
        chamber: stats.chamber,
        party: stats.party,
        state: stats.state,
        trade_count: stats.trade_count,
        total_volume: stats.total_volume,
        total_volume_formatted: formatVolume(stats.total_volume),
        buy_count: stats.buy_count,
        sell_count: stats.sell_count,
        unique_tickers: stats.unique_tickers.size,
        avg_trade_size: stats.trade_count > 0 ? Math.round(stats.total_volume / stats.trade_count) : 0
      }))
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
      filters: {
        limit,
        chamber: chamber || null,
        party: party || null
      },
      summary: {
        total_unique_traders: Object.keys(traderStats).length,
        showing: topTraders.length
      },
      traders: topTraders
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching congress traders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch congress traders' },
      { status: 500 }
    );
  }
}