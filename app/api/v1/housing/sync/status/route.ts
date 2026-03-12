import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Since we're using direct FRED API access, no sync needed
    const result = {
      source: "FRED Direct API Access",
      fetched_at: new Date().toISOString(),
      sync_status: "not_applicable",
      note: "Direct FRED API access - no database sync required",
      last_api_call: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching housing sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch housing sync status' },
      { status: 500 }
    );
  }
}