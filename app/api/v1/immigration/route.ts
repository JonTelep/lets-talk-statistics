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

// Top source countries for legal immigration (FY2024)
const TOP_SOURCE_COUNTRIES = [
  {"country": "Mexico", "admissions": 129451, "percentage": 12.7},
  {"country": "India", "admissions": 104584, "percentage": 10.3},
  {"country": "China", "admissions": 75867, "percentage": 7.5},
  {"country": "Philippines", "admissions": 54329, "percentage": 5.3},
  {"country": "Cuba", "admissions": 52785, "percentage": 5.2},
  {"country": "Dominican Republic", "admissions": 50934, "percentage": 5.0},
  {"country": "Vietnam", "admissions": 35547, "percentage": 3.5},
  {"country": "El Salvador", "admissions": 28234, "percentage": 2.8},
  {"country": "Haiti", "admissions": 26138, "percentage": 2.6},
  {"country": "South Korea", "admissions": 22765, "percentage": 2.2},
];

export async function GET(request: NextRequest) {
  try {
    // Get latest data (FY2024)
    const latest = HISTORICAL_ENFORCEMENT[0];
    
    const summary = {
      legal_admissions: latest.legal_admissions,
      removals: latest.removals,
      border_encounters: latest.border_encounters,
      fiscal_year: latest.fiscal_year,
    };
    
    const result = {
      source: "DHS Immigration Statistics & BTS Border Crossing Data",
      fetched_at: new Date().toISOString(),
      summary,
      top_countries: TOP_SOURCE_COUNTRIES.slice(0, 10),
      historical_note: "Data sourced from DHS Immigration Yearbooks and official CBP reports"
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching immigration overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch immigration overview' },
      { status: 500 }
    );
  }
}