'use client';

import { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, FileSpreadsheet, FileJson } from 'lucide-react';

type ExportFormat = 'json' | 'csv';

interface DataEndpoint {
  label: string;
  url: string;
  filename?: string;
  /** Optional: path into the response JSON to find the array for CSV export (e.g. "data" or "trades") */
  csvArrayPath?: string;
}

interface DownloadRawDataProps {
  endpoints: DataEndpoint[];
  title?: string;
  description?: string;
}

/**
 * Flatten a JSON array into CSV text.
 * Handles nested objects by dot-joining keys (one level deep).
 */
function jsonToCsv(data: unknown): string {
  // Find the array to convert
  let rows: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === 'object') {
    // Try common keys that hold the main data array
    const obj = data as Record<string, unknown>;
    for (const key of ['data', 'trades', 'records', 'results', 'items', 'entries']) {
      if (Array.isArray(obj[key])) {
        rows = obj[key] as Record<string, unknown>[];
        break;
      }
    }
    // Fallback: if no array found, wrap the object itself
    if (rows.length === 0) {
      rows = [obj];
    }
  }

  if (rows.length === 0) return '';

  // Collect all unique column names (flatten one level of nesting)
  const colSet = new Set<string>();
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const subKey of Object.keys(value as Record<string, unknown>)) {
          colSet.add(`${key}.${subKey}`);
        }
      } else {
        colSet.add(key);
      }
    }
  }
  const columns = [...colSet];

  // Escape a CSV cell value
  const escapeCell = (val: unknown): string => {
    if (val == null) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Header row
  const header = columns.map(c => escapeCell(c)).join(',');

  // Data rows
  const lines = rows.map(row => {
    return columns.map(col => {
      if (col.includes('.')) {
        const [parent, child] = col.split('.');
        const parentVal = row[parent!];
        if (parentVal && typeof parentVal === 'object') {
          return escapeCell((parentVal as Record<string, unknown>)[child!]);
        }
        return '';
      }
      return escapeCell(row[col]);
    }).join(',');
  });

  return [header, ...lines].join('\n');
}

export function DownloadRawData({ 
  endpoints, 
  title = "Download Raw Data",
  description = "Get the raw data used on this page. JSON for developers, CSV for spreadsheets."
}: DownloadRawDataProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (endpoint: DataEndpoint, format: ExportFormat = 'json') => {
    const key = `${endpoint.url}:${format}`;
    setDownloading(key);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();

      let blob: Blob;
      let extension: string;

      if (format === 'csv') {
        // If a specific path was given, extract that array first
        let csvData = data;
        if (endpoint.csvArrayPath) {
          const pathParts = endpoint.csvArrayPath.split('.');
          let current = data;
          for (const part of pathParts) {
            if (current && typeof current === 'object') {
              current = current[part];
            }
          }
          if (current) csvData = current;
        }

        const csvText = jsonToCsv(csvData);
        if (!csvText) throw new Error('No tabular data found for CSV export');
        blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
        extension = 'csv';
      } else {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        extension = 'json';
      }

      const baseName = endpoint.filename
        ? endpoint.filename.replace(/\.\w+$/, '')
        : endpoint.label.toLowerCase().replace(/\s+/g, '_');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.${extension}`;
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
        {endpoints.map((endpoint) => {
          const jsonKey = `${endpoint.url}:json`;
          const csvKey = `${endpoint.url}:csv`;

          const jsonDownloading = downloading === jsonKey;
          const csvDownloading = downloading === csvKey;
          const jsonSuccess = success === jsonKey;
          const csvSuccess = success === csvKey;
          const jsonError = error === jsonKey;
          const csvError = error === csvKey;

          const getButtonState = (isLoading: boolean, isOk: boolean, isErr: boolean) => {
            if (isOk) return 'bg-green-500/10 border-green-500/30 text-green-400';
            if (isErr) return 'bg-red-500/10 border-red-500/30 text-red-400';
            return 'bg-surface-800 border-border hover:border-border-medium text-surface-300';
          };

          return (
            <div key={endpoint.url} className="flex items-center gap-2">
              <span className="text-sm font-medium text-surface-300 flex-1 truncate">
                {endpoint.label}
              </span>
              <button
                onClick={() => handleDownload(endpoint, 'json')}
                disabled={jsonDownloading}
                title="Download as JSON"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all text-xs font-medium ${getButtonState(jsonDownloading, jsonSuccess, jsonError)} ${jsonDownloading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
              >
                {jsonDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : jsonSuccess ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : jsonError ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <FileJson className="h-3.5 w-3.5" />
                )}
                JSON
              </button>
              <button
                onClick={() => handleDownload(endpoint, 'csv')}
                disabled={csvDownloading}
                title="Download as CSV (spreadsheet)"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all text-xs font-medium ${getButtonState(csvDownloading, csvSuccess, csvError)} ${csvDownloading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
              >
                {csvDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : csvSuccess ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : csvError ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                )}
                CSV
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-surface-600 mt-4">
        Data fetched live from government APIs. JSON for developers, CSV for Excel/Google Sheets.
      </p>
    </div>
  );
}

export default DownloadRawData;
