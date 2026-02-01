'use client';

import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Clock } from 'lucide-react';

type ErrorVariant = 'default' | 'network' | 'server' | 'timeout' | 'inline';

interface ErrorStateProps {
  /** The error message to display */
  message?: string;
  /** Optional error object for additional context */
  error?: Error | null;
  /** Callback function when retry button is clicked */
  onRetry?: () => void;
  /** Visual variant of the error state */
  variant?: ErrorVariant;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
  /** Title text */
  title?: string;
}

/**
 * Reusable error state component with retry functionality.
 * Use this for API failures, network errors, and data loading issues.
 */
export function ErrorState({
  message,
  error,
  onRetry,
  variant = 'default',
  className = '',
  showRetry = true,
  retryText = 'Try again',
  title,
}: ErrorStateProps) {
  // Auto-detect variant from error if not specified
  const effectiveVariant = variant === 'default' && error ? detectVariant(error) : variant;
  
  const config = getVariantConfig(effectiveVariant);
  const Icon = config.icon;
  const displayMessage = message || error?.message || config.defaultMessage;
  const displayTitle = title || config.title;

  // Inline variant for table cells and compact spaces
  if (effectiveVariant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{displayMessage}</span>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline ml-1"
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} mb-4`}>
        <Icon className={`h-6 w-6 ${config.iconColor}`} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {displayTitle}
      </h3>
      
      <p className="text-gray-600 text-center max-w-sm mb-4">
        {displayMessage}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </button>
      )}
    </div>
  );
}

/**
 * Compact error state for inline use in cards or small spaces.
 */
export function ErrorStateCompact({
  message = 'Failed to load',
  onRetry,
  className = '',
}: Pick<ErrorStateProps, 'message' | 'onRetry' | 'className'>) {
  return (
    <div className={`text-center py-4 ${className}`}>
      <p className="text-red-600 text-sm mb-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Error state for table rows when data fails to load.
 */
export function ErrorStateTableRow({
  colSpan,
  message = 'Failed to load data',
  onRetry,
}: {
  colSpan: number;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-gray-600">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Helper to detect error variant from error object
function detectVariant(error: Error): ErrorVariant {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'network';
  }
  if (message.includes('500') || message.includes('server')) {
    return 'server';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }
  
  return 'default';
}

// Configuration for each variant
function getVariantConfig(variant: ErrorVariant) {
  switch (variant) {
    case 'network':
      return {
        icon: WifiOff,
        bgColor: 'bg-amber-100',
        iconColor: 'text-amber-600',
        title: 'Connection Error',
        defaultMessage: 'Unable to connect. Please check your internet connection and try again.',
      };
    case 'server':
      return {
        icon: ServerCrash,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'Server Error',
        defaultMessage: 'The server encountered an error. Please try again in a few moments.',
      };
    case 'timeout':
      return {
        icon: Clock,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
        title: 'Request Timeout',
        defaultMessage: 'The request took too long. Please try again.',
      };
    case 'inline':
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'Error',
        defaultMessage: 'Something went wrong.',
      };
    default:
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'Failed to Load',
        defaultMessage: 'Something went wrong while loading this data. Please try again.',
      };
  }
}

export default ErrorState;
