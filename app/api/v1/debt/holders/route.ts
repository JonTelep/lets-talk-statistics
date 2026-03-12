import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

// FRED series IDs for debt holder composition (all quarterly)
const FRED_SERIES = {
  "federal_reserve": "FDHBFRBN",          // Fed Reserve Banks (billions $)
  "foreign": "FDHBFIN",                    // Foreign & International (billions $)
  "pension_funds": "BOGZ1FL593061105Q",    // Pension Funds (millions $)
  "state_local": "BOGZ1FL213061103Q",      // State & Local Govts (millions $)
  "mutual_funds": "BOGZ1LM653061105Q",     // Mutual Funds (millions $)
  "total_debt": "GFDEBTN",                 // Total Federal Debt (millions $)
  "debt_held_public": "FYGFDPUN",          // Debt Held by Public (millions $)
};

const FRED_BASE = "https://api.stlouisfed.org/fred";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

async function fetchFredLatest(seriesId: string): Promise<{ date: string; value: number } | null> {
  try {
    const url = `${FRED_BASE}/series/observations`;
    const params = new URLSearchParams({
      api_key: FRED_API_KEY,
      file_type: "json",
      series_id: seriesId,
      sort_order: "desc",
      limit: "1"
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    const obs = data.observations?.[0];
    
    if (!obs || obs.value === ".") {
      return null;
    }
    
    return {
      date: obs.date,
      value: parseFloat(obs.value)
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all FRED series in parallel
    const promises = Object.entries(FRED_SERIES).map(async ([key, seriesId]) => {
      const result = await fetchFredLatest(seriesId);
      return [key, result];
    });
    
    const results = await Promise.all(promises);
    const seriesData = Object.fromEntries(results);
    
    function getValue(key: string, divisor: number = 1.0): number {
      const result = seriesData[key];
      if (!result) return 0.0;
      return result.value / divisor;
    }

    const fedReserve = getValue("federal_reserve");              // already billions
    const foreign = getValue("foreign");                        // already billions
    const pension = getValue("pension_funds", 1000);            // millions → billions
    const stateLocal = getValue("state_local", 1000);           // millions → billions
    const mutualFunds = getValue("mutual_funds", 1000);         // millions → billions
    const totalDebt = getValue("total_debt", 1000);             // millions → billions
    const debtHeldPublic = getValue("debt_held_public", 1000);   // millions → billions

    const intragov = totalDebt && debtHeldPublic ? totalDebt - debtHeldPublic : 0.0;
    const known = fedReserve + foreign + pension + stateLocal + mutualFunds + intragov;
    const other = Math.max(0, totalDebt - known);

    const holders = [];
    const holderData: Array<[string, number]> = [
      ["Federal Reserve", fedReserve],
      ["Foreign & International", foreign],
      ["Intragovernmental", intragov],
      ["Mutual Funds", mutualFunds],
      ["Pension Funds", pension],
      ["State & Local Govts", stateLocal],
      ["Other", other],
    ];

    for (const [name, amount] of holderData) {
      if (amount > 0) {
        holders.push({
          name,
          amount_billions: Math.round(amount * 100) / 100,
          percent: totalDebt ? Math.round(amount / totalDebt * 1000) / 10 : 0,
        });
      }
    }

    // Get as_of_date from the first successful result
    let asOfDate = null;
    for (const [, result] of results) {
      if (result && typeof result === 'object' && 'date' in result) {
        asOfDate = result.date;
        break;
      }
    }

    const result = {
      holders,
      total_billions: Math.round(totalDebt * 100) / 100,
      as_of_date: asOfDate,
      source: "FRED (Federal Reserve Economic Data)",
      fetched_at: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching debt holders data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt holders data' },
      { status: 500 }
    );
  }
}