'use client';

import { useState } from 'react';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';

interface DataEndpoint {
  label: string;
  url: string;
  filename?: string;
}

interface DownloadRawDataProps {
  endpoints: DataEndpoint[];
  title?: string;
  description?: string;
}

type Format = 'json' | 'csv';

/**
 * Flatten a nested object/array response into an array of flat row objects
 * suitable for CSV conversion. Handles common API response shapes:
 *   { data: [...] }
 *   { items: [...] }
 *   [...] (direct array)
 *   { key: value, ... } (single object → one-row table)
 */
function extractRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.map(item => flattenObject(item));

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Try common wrapper keys
    for (const key of ['data', 'items', 'results', 'records', 'trades', 'rows']) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as unknown[]).map(item => flattenObject(item));
      }
    }
    // Single object → one row
    return [flattenObject(obj)];
  }

  return [];
}

/** Recursively flatten { a: { b: 1 } } → { "a.b": 1 } */
function flattenObject(
  obj: unknown,
  prefix = '',
  acc: Record<string, unknown> = {}
): Record<string, unknown> {
  if (obj === null || obj === undefined) {
    if (prefix) acc[prefix] = '';
    return acc;
  }
  if (Array.isArray(obj)) {
    acc[prefix] = obj.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('; ');
    return acc;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flattenObject(v, prefix ? `${prefix}.${k}` : k, acc);
    }
    return acc;
  }
  acc[prefix] = obj;
  return acc;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = [...new Set(rows.flatMap(r => Object.keys(r)))];

  const escape = (val: unknown): string => {
    const s = val === null || val === undefined ? '' : String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export function DownloadRawData({ 
  endpoints, 
  title = "Download Raw Data",
  description = "Get the raw data used on this page for your own analysis."
}: DownloadRawDataProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (endpoint: DataEndpoint, format: Format) => {
    const key = `${endpoint.url}:${format}`;
    setDownloading(key);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();

      let blob: Blob;
      let filename: string;

      if (format === 'csv') {
        const rows = extractRows(data);
        const csv = toCsv(rows);
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const baseName = endpoint.filename
          ? endpoint.filename.replace(/\.json$/i, '')
          : endpoint.label.toLowerCase().replace(/\s+/g, '_');
        filename = `${baseName}.csv`;
      } else {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = endpoint.filename || `${endpoint.label.toLowerCase().replace(/\s+/g, '_')}.json`;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
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
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Download className="h-5 w-5 text-surface-500" />
        <h3 className="text-base font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-surface-500 mb-4">{description}</p>
      
      <div className="space-y-2">
        {endpoints.map((endpoint) => (
          <div key={endpoint.url} className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-300 flex-1 truncate">
              {endpoint.label}
            </span>
            {(['json', 'csv'] as Format[]).map((fmt) => {
              const key = `${endpoint.url}:${fmt}`;
              const isDownloading = downloading === key;
              const isSuccess = success === key;
              const isError = error === key;

              return (
                <button
                  key={fmt}
                  onClick={() => handleDownload(endpoint, fmt)}
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
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isSuccess ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : isError ? (
                    <AlertCircle className="h-3 w-3 text-red-400" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {fmt.toUpperCase()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-surface-600 mt-4">
        Data is fetched live from government APIs. No account required.
      </p>
    </div>
  );
}

export default DownloadRawData;
