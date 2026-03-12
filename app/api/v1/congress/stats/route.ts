import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const CAPITOL_TRADES_API = process.env.CAPITOL_TRADES_API || "https://trades.telep.io";

function normalizeTransactionType(txType: string): string {
  if (!txType) return "Unknown";
  const txLower = txType.toLowerCase();
  if (txLower.includes("purchase") || txLower.includes("buy")) return "Buy";
  if (txLower.includes("sale") || txLower.includes("sell")) return "Sell";
  if (txLower.includes("exchange")) return "Exchange";
  return txType;
}

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
    // Fetch recent trades to calculate stats
    const url = `${CAPITOL_TRADES_API}/api/trades`;
    const params = new URLSearchParams({
      limit: "1000"
    });
    
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 1 });
    const transactions = data.trades || [];
    
    let totalTrades = transactions.length;
    let totalVolume = 0;
    let buyCount = 0;
    let sellCount = 0;
    let uniqueMembers = new Set();
    let uniqueTickers = new Set();
    
    const partyStats = {
      "R": { trades: 0, volume: 0, buys: 0, sells: 0 },
      "D": { trades: 0, volume: 0, buys: 0, sells: 0 },
      "I": { trades: 0, volume: 0, buys: 0, sells: 0 }
    };
    
    for (const tx of transactions) {
      const party = (tx.party || "Unknown") as string;
      const txType = normalizeTransactionType(tx.transaction_type || "");
      const [minAmt, maxAmt] = parseAmountRange(tx.amount_text || "");
      const volume = (minAmt + maxAmt) / 2;
      
      totalVolume += volume;
      uniqueMembers.add(tx.politician || "");
      uniqueTickers.add(tx.ticker || "");
      
      if (txType === "Buy") buyCount++;
      if (txType === "Sell") sellCount++;
      
      if (party in partyStats) {
        partyStats[party as keyof typeof partyStats].trades++;
        partyStats[party as keyof typeof partyStats].volume += volume;
        if (txType === "Buy") partyStats[party as keyof typeof partyStats].buys++;
        if (txType === "Sell") partyStats[party as keyof typeof partyStats].sells++;
      }
    }
    
    // Format volume
    function formatVolume(vol: number): string {
      if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(1)}B`;
      if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
      return `$${vol.toLocaleString()}`;
    }
    
    const result = {
      source: "Capitol Trades API (STOCK Act Disclosures)",
      fetched_at: new Date().toISOString(),
      summary: {
        total_trades: totalTrades,
        total_volume: totalVolume,
        total_volume_formatted: formatVolume(totalVolume),
        unique_members: uniqueMembers.size,
        unique_tickers: uniqueTickers.size,
        buy_count: buyCount,
        sell_count: sellCount,
        buy_percentage: totalTrades ? Math.round((buyCount / totalTrades) * 100) : 0
      },
      party_breakdown: Object.entries(partyStats).map(([party, stats]) => ({
        party,
        trades: stats.trades,
        volume: stats.volume,
        volume_formatted: formatVolume(stats.volume),
        buys: stats.buys,
        sells: stats.sells,
        percentage: totalTrades ? Math.round((stats.trades / totalTrades) * 100) : 0
      })).filter(p => p.trades > 0)
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching congress stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch congress trading stats' },
      { status: 500 }
    );
  }
}