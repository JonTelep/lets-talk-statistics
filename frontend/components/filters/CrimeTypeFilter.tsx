import Select from '../ui/Select';
import { CRIME_TYPES, CRIME_TYPE_LABELS, CrimeType } from '@/lib/types/api';

interface CrimeTypeFilterProps {
  value: CrimeType;
  onChange: (crimeType: CrimeType) => void;
  label?: string;
}

export default function CrimeTypeFilter({
  value,
  onChange,
  label = 'Crime Type',
}: CrimeTypeFilterProps) {
  const options = Object.values(CRIME_TYPES).map((type) => ({
    value: type,
    label: CRIME_TYPE_LABELS[type],
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as CrimeType)}
      options={options}
      fullWidth
    />
  );
}
