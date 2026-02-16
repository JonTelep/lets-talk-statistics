import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

export default function Select({
  label,
  options,
  error,
  fullWidth = false,
  className = '',
  ...props
}: SelectProps) {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-400 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          ${widthClass}
          block rounded-md bg-surface-900 border-border text-white
          focus:border-accent focus:ring-accent
          disabled:bg-surface-800 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-border'}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
