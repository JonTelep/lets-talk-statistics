import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    // Treasury Fiscal Data API - just get the most recent record
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny";
    const params = new URLSearchParams({
      sort: "-record_date",
      "page[size]": "1",
      fields: "record_date,tot_pub_debt_out_amt"
    });
    
    const data = await fetchWithCache(`${url}?${params}`, { ttlHours: 6 }); // Refresh more frequently
    
    const latestRecord = data.data?.[0];
    if (!latestRecord) {
      return NextResponse.json(
        { error: 'No debt data available' },
        { status: 404 }
      );
    }
    
    const result = {
      source: "U.S. Treasury Fiscal Data",
      fetched_at: new Date().toISOString(),
      data: {
        date: latestRecord.record_date,
        total_debt: parseFloat(latestRecord.tot_pub_debt_out_amt)
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching latest debt data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest debt data' },
      { status: 500 }
    );
  }
}