import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const TIC_URL = "https://ticdata.treasury.gov/resource-center/data-chart-center/tic/Documents/mfh.txt";

function parseTicText(text: string): Array<{ country: string; holdings_billions: number }> {
  const lines = text.trim().split('\n');
  
  // Find the header row that starts with "Country"
  let headerIdx = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().toLowerCase().startsWith('country')) {
      headerIdx = i;
      break;
    }
  }
  
  if (headerIdx === null) {
    console.warn('Could not find header row in TIC data');
    return [];
  }
  
  // Skip known aggregate/label rows
  const skipPrefixes = new Set([
    'grand total', 'total', 'of which', 'europe', 'asia',
    'south and central america', 'caribbean', 'africa',
    'other', 'all other', 'international', 'country',
    'memo:', 'canada', 'middle east', 'western hemisphere',
  ]);
  
  const countries: Array<{ country: string; holdings_billions: number }> = [];
  
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split on tab or multiple spaces
    const parts = line.split(/\t+|\s{2,}/);
    if (parts.length < 2) continue;
    
    const name = parts[0].trim();
    if (!name || skipPrefixes.has(name.toLowerCase())) continue;
    
    // Find the latest non-empty numeric value (rightmost)
    let value = null;
    for (let j = parts.length - 1; j >= 1; j--) {
      const col = parts[j].trim().replace(/,/g, '');
      if (col && !['n/a', '--', '*'].includes(col)) {
        try {
          value = parseFloat(col);
          break;
        } catch {
          continue;
        }
      }
    }
    
    if (value !== null && value > 0) {
      countries.push({
        country: name,
        holdings_billions: Math.round(value * 10) / 10,
      });
    }
  }
  
  // Sort by holdings descending
  countries.sort((a, b) => b.holdings_billions - a.holdings_billions);
  return countries;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch TIC data (Treasury International Capital)
    const response = await fetch(TIC_URL, {
      headers: { Accept: "text/plain" }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    const countries = parseTicText(text);
    
    const result = {
      countries: countries.slice(0, 20), // Top 20
      total_countries: countries.length,
      source: "Treasury International Capital (TIC) System",
      fetched_at: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching foreign holders data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch foreign holders data' },
      { status: 500 }
    );
  }
}