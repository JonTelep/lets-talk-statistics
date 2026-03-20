'use client';

import { useState, useCallback } from 'react';
import { Download, Loader2, Check, AlertCircle, FileText, Table } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface DataEndpoint {
  label: string;
  url: string;
  filename?: string;
  /** Optional function to transform API response into flat rows for CSV */
  csvTransform?: (data: any) => Record<string, string | number | boolean | null>[];
}

interface DownloadRawDataProps {
  endpoints: DataEndpoint[];
  title?: string;
  description?: string;
}

type ExportFormat = 'json' | 'csv';

// ============================================================================
// CSV Conversion Utilities
// ============================================================================

/** Convert an array of flat objects to a CSV string */
function objectsToCsv(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';

  const headers = new Set<string>();
  for (const row of data) {
    Object.keys(row).forEach(key => headers.add(key));
  }
  const headerArray = Array.from(headers);

  const csvRows = [
    headerArray.join(','),
    ...data.map(row =>
      headerArray.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
}

/** Auto-flatten nested JSON into CSV-friendly rows */
function autoFlatten(data: any): Record<string, any>[] {
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      return data.map(item => flattenObject(item));
    }
    return data.map((item, i) => ({ index: i, value: item }));
  }

  if (typeof data === 'object' && data !== null) {
    for (const key of ['data', 'results', 'items', 'records', 'rows', 'trades', 'entries', 'historical']) {
      if (Array.isArray(data[key])) {
        return data[key].map((item: any) => flattenObject(item));
      }
    }
    return [flattenObject(data)];
  }

  return [{ value: data }];
}

/** Flatten a nested object into dot-notation keys */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) {
      result[newKey] = '';
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

// ============================================================================
// Component
// ============================================================================

export function DownloadRawData({
  endpoints,
  title = 'Download Raw Data',
  description = 'Get the raw data used on this page. Available as JSON (raw) or CSV (spreadsheet-ready).',
}: DownloadRawDataProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async (endpoint: DataEndpoint, format: ExportFormat) => {
    const key = `${endpoint.url}_${format}`;
    setDownloading(key);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = await response.json();

      let blob: Blob;
      let ext: string;

      if (format === 'csv') {
        const rows = endpoint.csvTransform ? endpoint.csvTransform(data) : autoFlatten(data);
        const csvString = objectsToCsv(rows);
        blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        ext = 'csv';
      } else {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        ext = 'json';
      }

      const baseName = endpoint.filename
        ? endpoint.filename.replace(/\.[^.]+$/, '')
        : endpoint.label.toLowerCase().replace(/\s+/g, '_');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(key);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Download error:', err);
      setError(key);
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloading(null);
    }
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Download className="h-5 w-5 text-surface-500" />
        <h3 className="text-base font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-surface-500 mb-4">{description}</p>

      <div className="space-y-3">
        {endpoints.map((endpoint) => (
          <div key={endpoint.url}>
            <p className="text-sm font-medium text-surface-300 mb-1.5">
              {endpoint.label}
            </p>
            <div className="flex gap-2">
              <FormatButton
                endpoint={endpoint}
                format="json"
                icon={<FileText className="h-3.5 w-3.5" />}
                downloading={downloading}
                success={success}
                error={error}
                onDownload={handleDownload}
              />
              <FormatButton
                endpoint={endpoint}
                format="csv"
                icon={<Table className="h-3.5 w-3.5" />}
                downloading={downloading}
                success={success}
                error={error}
                onDownload={handleDownload}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-surface-600 mt-4">
        Data is fetched live from government APIs. No account required.
      </p>
    </div>
  );
}

// ============================================================================
// Sub-component
// ============================================================================

function FormatButton({
  endpoint,
  format,
  icon,
  downloading,
  success,
  error,
  onDownload,
}: {
  endpoint: DataEndpoint;
  format: ExportFormat;
  icon: React.ReactNode;
  downloading: string | null;
  success: string | null;
  error: string | null;
  onDownload: (endpoint: DataEndpoint, format: ExportFormat) => void;
}) {
  const key = `${endpoint.url}_${format}`;
  const isDownloading = downloading === key;
  const isSuccess = success === key;
  const isError = error === key;

  return (
    <button
      onClick={() => onDownload(endpoint, format)}
      disabled={isDownloading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
        isSuccess
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : isError
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-surface-800 border-border hover:border-border-medium text-surface-300'
      } ${isDownloading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
    >
      {isDownloading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : isError ? (
        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
      ) : (
        icon
      )}
      <span>{format.toUpperCase()}</span>
    </button>
  );
}

export default DownloadRawData;