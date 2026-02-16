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

export function DownloadRawData({ 
  endpoints, 
  title = "Download Raw Data",
  description = "Get the raw JSON data used on this page for your own analysis."
}: DownloadRawDataProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (endpoint: DataEndpoint) => {
    const key = endpoint.url;
    setDownloading(key);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = endpoint.filename || `${endpoint.label.toLowerCase().replace(/\s+/g, '_')}.json`;
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
        <h3 className="text-base font-medium text-white">{title}</h3>
      </div>
      <p className="text-sm text-surface-500 mb-4">{description}</p>
      
      <div className="space-y-2">
        {endpoints.map((endpoint) => {
          const isDownloading = downloading === endpoint.url;
          const isSuccess = success === endpoint.url;
          const isError = error === endpoint.url;

          return (
            <button
              key={endpoint.url}
              onClick={() => handleDownload(endpoint)}
              disabled={isDownloading}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition-all ${
                isSuccess 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : isError
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-surface-800 border-border hover:border-border-medium text-surface-300'
              } ${isDownloading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
            >
              <span className="text-sm font-medium">{endpoint.label}</span>
              <span className="flex items-center gap-2">
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : isError ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="text-xs text-surface-600">JSON</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-surface-600 mt-4">
        Data is fetched live from government APIs. No account required.
      </p>
    </div>
  );
}

export default DownloadRawData;
