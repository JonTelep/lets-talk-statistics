import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '365');
    
    // Treasury Fiscal Data API
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny";
    const params = new URLSearchParams({
      sort: "-record_date",
      "page[size]": Math.min(days, 10000).toString(),
      fields: "record_date,tot_pub_debt_out_amt"
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    
    // Simplify response
    const result = {
      source: "U.S. Treasury Fiscal Data",
      fetched_at: new Date().toISOString(),
      data: data.data?.map((record: any) => ({
        date: record.record_date,
        total_debt: parseFloat(record.tot_pub_debt_out_amt)
      })) || []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching debt data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt data' },
      { status: 500 }
    );
  }
}