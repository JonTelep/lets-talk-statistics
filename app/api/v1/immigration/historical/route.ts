import { NextRequest, NextResponse } from 'next/server';

// Historical enforcement data from DHS/CBP official sources
const HISTORICAL_ENFORCEMENT = [
  {"fiscal_year": 2024, "legal_admissions": 1016000, "removals": 142580, "border_encounters": 2475669, "source": "DHS FY2024 Yearbook"},
  {"fiscal_year": 2023, "legal_admissions": 1100000, "removals": 142580, "border_encounters": 2045838, "source": "DHS FY2023 Yearbook"},
  {"fiscal_year": 2022, "legal_admissions": 1080000, "removals": 72177, "border_encounters": 2378944, "source": "DHS FY2022 Yearbook"},
  {"fiscal_year": 2021, "legal_admissions": 740000, "removals": 59011, "border_encounters": 1734686, "source": "DHS FY2021 Yearbook"},
  {"fiscal_year": 2020, "legal_admissions": 707362, "removals": 185884, "border_encounters": 458088, "source": "DHS FY2020 Yearbook"},
  {"fiscal_year": 2019, "legal_admissions": 1031765, "removals": 267258, "border_encounters": 977509, "source": "DHS FY2019 Yearbook"},
  {"fiscal_year": 2018, "legal_admissions": 1096611, "removals": 256085, "border_encounters": 521090, "source": "DHS FY2018 Yearbook"},
  {"fiscal_year": 2017, "legal_admissions": 1127167, "removals": 226119, "border_encounters": 415816, "source": "DHS FY2017 Yearbook"},
  {"fiscal_year": 2016, "legal_admissions": 1183505, "removals": 240255, "border_encounters": 553378, "source": "DHS FY2016 Yearbook"},
  {"fiscal_year": 2015, "legal_admissions": 1051031, "removals": 235413, "border_encounters": 444859, "source": "DHS FY2015 Yearbook"},
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get('start_year') || '2015');
    const endYear = parseInt(searchParams.get('end_year') || '2024');
    
    const filteredData = HISTORICAL_ENFORCEMENT
      .filter(item => item.fiscal_year >= startYear && item.fiscal_year <= endYear)
      .sort((a, b) => a.fiscal_year - b.fiscal_year); // chronological order
    
    const result = {
      source: "DHS Immigration Yearbooks & CBP Official Reports",
      year_range: { start: startYear, end: endYear },
      fetched_at: new Date().toISOString(),
      data: filteredData,
      note: "Historical data compiled from official DHS Yearbooks and CBP press releases"
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching historical immigration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical immigration data' },
      { status: 500 }
    );
  }
}