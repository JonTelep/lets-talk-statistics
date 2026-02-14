'use client';

import { useState } from 'react';
import { Download, Lock, FileSpreadsheet, FileText, Loader2, Check, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ExportOption {
  format: 'csv' | 'excel' | 'pdf';
  label: string;
  icon: typeof FileSpreadsheet;
  premium: boolean;
}

interface PremiumExportProps {
  data: any;
  filename: string;
  isPremium?: boolean; // User's subscription status
}

const exportOptions: ExportOption[] = [
  { format: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet, premium: true },
  { format: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, premium: true },
  { format: 'pdf', label: 'PDF Report', icon: FileText, premium: true },
];

export function PremiumExport({ data, filename, isPremium = false }: PremiumExportProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const convertToCSV = (data: any): string => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value ?? '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const handleExport = async (option: ExportOption) => {
    if (!isPremium && option.premium) {
      return; // Will show upgrade prompt
    }

    setDownloading(option.format);

    try {
      let blob: Blob;
      let downloadFilename: string;

      if (option.format === 'csv') {
        const csvContent = convertToCSV(Array.isArray(data) ? data : data.data || [data]);
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFilename = `${filename}.csv`;
      } else if (option.format === 'excel') {
        // For now, use CSV with .xlsx extension (would need xlsx library for real Excel)
        const csvContent = convertToCSV(Array.isArray(data) ? data : data.data || [data]);
        blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadFilename = `${filename}.xlsx`;
      } else {
        // PDF would need jspdf or similar - for now, show as coming soon
        setSuccess('pdf');
        setTimeout(() => setSuccess(null), 2000);
        setDownloading(null);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(option.format);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-white border-2 border-federal-charcoal-200 shadow-brutal p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-federal-gold-600" />
          <h3 className="text-lg font-serif font-semibold text-federal-navy-900">Premium Exports</h3>
        </div>
        {!isPremium && (
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-federal-gold-700 bg-federal-gold-100 px-2 py-1">
            <Sparkles className="h-3 w-3" />
            Pro Feature
          </span>
        )}
      </div>
      
      <p className="text-sm text-federal-charcoal-600 mb-4">
        Export data in professional formats for reports, spreadsheets, and presentations.
      </p>
      
      {/* Export Options */}
      <div className="space-y-2 mb-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isDownloading = downloading === option.format;
          const isSuccess = success === option.format;
          const isLocked = option.premium && !isPremium;

          return (
            <button
              key={option.format}
              onClick={() => isLocked ? undefined : handleExport(option)}
              disabled={isDownloading}
              className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
                isLocked
                  ? 'bg-federal-charcoal-50 border-federal-charcoal-200 cursor-not-allowed opacity-75'
                  : isSuccess
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-federal-charcoal-200 hover:border-federal-navy-900 hover:bg-federal-navy-50 cursor-pointer'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isLocked ? 'text-federal-charcoal-400' : 'text-federal-navy-900'}`} />
                <span className={`text-sm font-medium ${isLocked ? 'text-federal-charcoal-500' : 'text-federal-navy-900'}`}>
                  {option.label}
                </span>
              </span>
              
              <span className="flex items-center gap-2">
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-federal-navy-600" />
                ) : isSuccess ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-federal-charcoal-400" />
                ) : (
                  <Download className="h-4 w-4 text-federal-navy-600" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <div className="border-t-2 border-federal-charcoal-200 pt-4 mt-4">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 w-full py-3 bg-federal-gold-500 text-federal-navy-900 font-bold uppercase tracking-wider text-sm hover:bg-federal-gold-400 transition-colors shadow-brutal-gold"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro — $14/month
          </Link>
          <p className="text-xs text-federal-charcoal-500 text-center mt-2">
            Unlimited exports • Full historical data • API access
          </p>
        </div>
      )}
    </div>
  );
}

export default PremiumExport;
