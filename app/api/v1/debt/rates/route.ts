import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    // Treasury Fiscal Data API
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates";
    const params = new URLSearchParams({
      sort: "-record_date",
      "page[size]": "50",
      format: "json"
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    const records = data.data || [];
    
    if (!records.length) {
      return NextResponse.json({
        rates: [],
        as_of_date: null,
        source: "Treasury Fiscal Data API",
        fetched_at: new Date().toISOString()
      });
    }
    
    // Get the latest month's records
    const latestDate = records[0].record_date;
    const latestRecords = records.filter((r: any) => r.record_date === latestDate);
    
    const rates = [];
    for (const r of latestRecords) {
      const rate = r.avg_interest_rate_amt;
      if (rate && rate !== "null") {
        rates.push({
          security_type: r.security_type_desc || "",
          rate: parseFloat(rate),
        });
      }
    }
    
    // Sort by rate descending
    rates.sort((a, b) => b.rate - a.rate);
    
    const result = {
      rates,
      as_of_date: latestDate,
      source: "Treasury Fiscal Data API",
      fetched_at: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching average interest rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch average interest rates' },
      { status: 500 }
    );
  }
}