'use client';

import { useMemo, useState } from 'react';
import ChartCard from '@/components/charts/ChartCard';
import Select from '@/components/ui/Select';
import type { ChartSpec, Series, SourceRecord, Term } from '@/lib/site';

export type CountryBundle = {
  code: string;
  name: string;
  populationStatus?: string;
  generation: ChartSpec;
  generationSeries: Series[];
  perPerson?: ChartSpec;
  perPersonSeries: Series[];
};

export default function CountryEnergy({
  countries,
  terms,
  presidentNote,
  sources,
}: {
  countries: CountryBundle[];
  terms: Term[];
  presidentNote: string;
  sources: SourceRecord[];
}) {
  const initial = countries.some((country) => country.code === 'USA') ? 'USA' : countries[0]?.code ?? '';
  const [code, setCode] = useState(initial);
  const selected = useMemo(
    () => countries.find((country) => country.code === code) ?? countries[0],
    [countries, code]
  );
  if (!selected) return null;

  let populationNote = '';
  if (!selected.perPerson && selected.populationStatus === 'no_world_bank_country') {
    populationNote = `World Bank SP.POP.TOTL has no country row for ${selected.code}, so kilowatthours per person is omitted.`;
  } else if (!selected.perPerson && selected.populationStatus === 'no_overlapping_year') {
    populationNote = 'No year has both an EIA generation value and a World Bank population value, so kilowatthours per person is omitted.';
  }

  return (
    <div>
      <div className="max-w-md">
        <Select
          label="Country"
          fullWidth
          value={selected.code}
          onChange={(event) => setCode(event.target.value)}
          options={countries.map((country) => ({ value: country.code, label: country.name }))}
        />
      </div>
      {populationNote && <p className="mt-4 max-w-3xl text-sm">{populationNote}</p>}
      <div className="mt-8">
        <ChartCard
          chart={selected.generation}
          series={selected.generationSeries}
          terms={terms}
          presidentNote={presidentNote}
          sources={sources}
        />
      </div>
      {selected.perPerson && (
        <div className="mt-8">
          <ChartCard
            chart={selected.perPerson}
            series={selected.perPersonSeries}
            terms={terms}
            presidentNote={presidentNote}
            sources={sources}
          />
        </div>
      )}
    </div>
  );
}
