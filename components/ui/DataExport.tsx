'use client';

import { useState } from 'react';
import { Download, FileText, Database, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface DataExportProps {
  data: any[];
  filename: string;
  title: string;
  description?: string;
  includeMetadata?: boolean;
}

type ExportFormat = 'csv' | 'json' | 'txt';

interface ExportStatus {
  status: 'idle' | 'preparing' | 'downloading' | 'success' | 'error';
  message?: string;
}

export function DataExport({ 
  data, 
  filename, 
  title, 
  description,
  includeMetadata = true 
}: DataExportProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ status: 'idle' });
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const handleExport = async (format: ExportFormat) => {
    setExportStatus({ status: 'preparing', message: 'Preparing download...' });
    
    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;
      
      // Prepare metadata if requested
      const metadata = includeMetadata ? {
        exported_at: new Date().toISOString(),
        source: 'letstalkstatistics.com',
        title,
        description: description || `${title} data export`,
        total_records: data.length,
        data_sources: 'Official US Government APIs'
      } : null;

      switch (format) {
        case 'csv':
          content = await convertToCSV(data, metadata);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          content = JSON.stringify({
            ...(metadata && { metadata }),
            data
          }, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'txt':
          content = await convertToText(data, metadata);
          mimeType = 'text/plain';
          fileExtension = 'txt';
          break;
        default:
          throw new Error('Unsupported format');
      }

      setExportStatus({ status: 'downloading', message: 'Starting download...' });

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus({ 
        status: 'success', 
        message: `${format.toUpperCase()} file downloaded successfully` 
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus({ status: 'idle' });
      }, 3000);

    } catch (error) {
      setExportStatus({ 
        status: 'error', 
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      
      setTimeout(() => {
        setExportStatus({ status: 'idle' });
      }, 5000);
    }
  };

  const convertToCSV = async (data: any[], metadata?: any): Promise<string> => {
    if (data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convert data to CSV rows
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape and quote values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    let csv = [csvHeaders, ...csvRows].join('\n');

    // Add metadata as comments at the top if requested
    if (metadata) {
      const metadataComments = [
        `# Data Export: ${metadata.title}`,
        `# Exported: ${metadata.exported_at}`,
        `# Source: ${metadata.source}`,
        `# Records: ${metadata.total_records}`,
        `# Description: ${metadata.description}`,
        '#',
        ''
      ].join('\n');
      csv = metadataComments + csv;
    }

    return csv;
  };

  const convertToText = async (data: any[], metadata?: any): Promise<string> => {
    let content = '';

    // Add metadata header
    if (metadata) {
      content += `${metadata.title}\n`;
      content += '='.repeat(metadata.title.length) + '\n\n';
      content += `Exported: ${metadata.exported_at}\n`;
      content += `Source: ${metadata.source}\n`;
      content += `Total Records: ${metadata.total_records}\n`;
      content += `Description: ${metadata.description}\n\n`;
    }

    // Add data in readable format
    data.forEach((item, index) => {
      content += `Record ${index + 1}:\n`;
      Object.entries(item).forEach(([key, value]) => {
        content += `  ${key}: ${value}\n`;
      });
      content += '\n';
    });

    return content;
  };

  const formatOptions = [
    { 
      value: 'csv' as ExportFormat, 
      label: 'CSV', 
      icon: FileText, 
      description: 'Spreadsheet format (Excel, Google Sheets)' 
    },
    { 
      value: 'json' as ExportFormat, 
      label: 'JSON', 
      icon: Database, 
      description: 'Structured data format (APIs, programming)' 
    },
    { 
      value: 'txt' as ExportFormat, 
      label: 'Text', 
      icon: FileText, 
      description: 'Human-readable plain text' 
    }
  ];

  const getStatusIcon = () => {
    switch (exportStatus.status) {
      case 'preparing':
      case 'downloading':
        return <Download className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const isLoading = exportStatus.status === 'preparing' || exportStatus.status === 'downloading';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Export Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download {title.toLowerCase()} in multiple formats for analysis and research.
          </p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {formatOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedFormat === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setSelectedFormat(option.value)}
              disabled={isLoading}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <IconComponent className={`w-5 h-5 ${
                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                }`} />
                <span className={`font-medium ${
                  isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </span>
              </div>
              <p className={`text-xs ${
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Export Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {data.length.toLocaleString()} records • 
            Exported on {new Date().toLocaleDateString()} • 
            Official government sources
          </span>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={() => handleExport(selectedFormat)}
        disabled={isLoading || data.length === 0}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          isLoading || data.length === 0
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {getStatusIcon()}
        {isLoading 
          ? exportStatus.message 
          : `Download ${selectedFormat.toUpperCase()}`
        }
      </button>

      {/* Status Message */}
      {exportStatus.status !== 'idle' && !isLoading && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          exportStatus.status === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {exportStatus.message}
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Data Usage Guidelines
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Data sourced from official US government APIs</li>
          <li>• Attribution to Let's Talk Statistics appreciated</li>
          <li>• Check data freshness and update frequency</li>
          <li>• Verify data accuracy for critical applications</li>
        </ul>
      </div>
    </div>
  );
}