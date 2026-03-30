/**
 * Data Export Component
 * 
 * Provides functionality to export chart data and statistics in various formats
 * including CSV, JSON, and Excel for users who want to analyze the data themselves.
 */

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileCode, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportDataProps {
  data: any[];
  filename: string;
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Create header row
  const headers = allKeys.join(',');

  // Create data rows
  const rows = data.map(item =>
    allKeys.map(key => {
      const value = item[key];
      // Handle special characters and wrap in quotes if needed
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',')
  ).join('\n');

  return `${headers}\n${rows}`;
}

/**
 * Convert data to JSON format with metadata
 */
function convertToJSON(data: any[], metadata: { title: string; description?: string; filename: string }): string {
  return JSON.stringify({
    metadata: {
      ...metadata,
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      source: 'Let\'s Talk Statistics (letstalkstatistics.com)'
    },
    data
  }, null, 2);
}

/**
 * Generate filename with timestamp
 */
function generateFilename(base: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${base}_${timestamp}.${format}`;
}

/**
 * Download file with given content
 */
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Export Options Configuration
// ============================================================================

const exportOptions: ExportOption[] = [
  {
    format: 'csv',
    label: 'CSV',
    icon: FileSpreadsheet,
    description: 'Comma-separated values for Excel, Google Sheets'
  },
  {
    format: 'json',
    label: 'JSON',
    icon: FileCode,
    description: 'Structured data for developers and APIs'
  }
  // Note: Excel export (xlsx) would require additional dependencies like SheetJS
  // Leaving it out for now to keep bundle size minimal
];

// ============================================================================
// Main Component
// ============================================================================

export default function ExportData({ 
  data, 
  filename, 
  title, 
  description,
  className = '',
  compact = false
}: ExportDataProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * Handle export for a specific format
   */
  const handleExport = async (format: ExportFormat) => {
    if (!data.length) {
      alert('No data available to export');
      return;
    }

    setIsExporting(format);
    setIsDropdownOpen(false);

    try {
      let content: string;
      let contentType: string;
      
      switch (format) {
        case 'csv':
          content = convertToCSV(data);
          contentType = 'text/csv;charset=utf-8;';
          break;
        
        case 'json':
          content = convertToJSON(data, { title, description, filename });
          contentType = 'application/json;charset=utf-8;';
          break;
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const downloadFilename = generateFilename(filename, format);
      downloadFile(content, downloadFilename, contentType);
      
      // Track export event (if analytics is implemented)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'data_export', {
          format,
          filename: downloadFilename,
          record_count: data.length
        });
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  // Compact mode - single button dropdown
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          disabled={isExporting !== null}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            {exportOptions.map(option => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                disabled={isExporting !== null}
              >
                <option.icon className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    );
  }

  // Full mode - expanded export section
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Download this data for offline analysis or integration with other tools.
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {data.length.toLocaleString()} records
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exportOptions.map(option => (
          <button
            key={option.format}
            onClick={() => handleExport(option.format)}
            disabled={isExporting !== null}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting === option.format ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <option.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
            
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Export as {option.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Data Source:</strong> {title}
          {description && <span> - {description}</span>}
          <br />
          <strong>Note:</strong> Data is provided as-is for informational purposes. Please verify critical information independently.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Utility Hooks (Optional)
// ============================================================================

/**
 * Hook for exporting data programmatically
 */
export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    data: any[],
    filename: string,
    format: ExportFormat,
    metadata?: { title: string; description?: string; filename?: string }
  ) => {
    if (!data.length || isExporting) return;

    setIsExporting(true);

    try {
      let content: string;
      let contentType: string;
      
      switch (format) {
        case 'csv':
          content = convertToCSV(data);
          contentType = 'text/csv;charset=utf-8;';
          break;
        
        case 'json':
          content = convertToJSON(data, { 
            title: metadata?.title || filename, 
            description: metadata?.description,
            filename: metadata?.filename || filename 
          });
          contentType = 'application/json;charset=utf-8;';
          break;
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const downloadFilename = generateFilename(filename, format);
      downloadFile(content, downloadFilename, contentType);
      
      return downloadFilename;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
}