'use client';

import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Clock } from 'lucide-react';

type ErrorVariant = 'default' | 'network' | 'server' | 'timeout' | 'inline';

interface ErrorStateProps {
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  variant?: ErrorVariant;
  className?: string;
  showRetry?: boolean;
  retryText?: string;
  title?: string;
}

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
  const effectiveVariant = variant === 'default' && error ? detectVariant(error) : variant;
  const config = getVariantConfig(effectiveVariant);
  const Icon = config.icon;
  const displayMessage = message || error?.message || config.defaultMessage;
  const displayTitle = title || config.title;

  if (effectiveVariant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{displayMessage}</span>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="text-sm text-accent hover:text-accent-muted hover:underline ml-1">
            {retryText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-800 mb-4`}>
        <Icon className={`h-6 w-6 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{displayTitle}</h3>
      <p className="text-surface-400 text-center max-w-sm mb-4">{displayMessage}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </button>
      )}
    </div>
  );
}

export function ErrorStateCompact({
  message = 'Failed to load',
  onRetry,
  className = '',
}: Pick<ErrorStateProps, 'message' | 'onRetry' | 'className'>) {
  return (
    <div className={`text-center py-4 ${className}`}>
      <p className="text-red-400 text-sm mb-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-accent hover:text-accent-muted hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}

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
          <AlertCircle className="h-8 w-8 text-red-400/50" />
          <p className="text-surface-400">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-muted">
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function detectVariant(error: Error): ErrorVariant {
  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) return 'network';
  if (message.includes('500') || message.includes('server')) return 'server';
  if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
  return 'default';
}

function getVariantConfig(variant: ErrorVariant) {
  switch (variant) {
    case 'network':
      return { icon: WifiOff, iconColor: 'text-amber-400', title: 'Connection Error', defaultMessage: 'Unable to connect. Please check your internet connection.' };
    case 'server':
      return { icon: ServerCrash, iconColor: 'text-red-400', title: 'Server Error', defaultMessage: 'The server encountered an error. Please try again.' };
    case 'timeout':
      return { icon: Clock, iconColor: 'text-orange-400', title: 'Request Timeout', defaultMessage: 'The request took too long. Please try again.' };
    case 'inline':
      return { icon: AlertCircle, iconColor: 'text-red-400', title: 'Error', defaultMessage: 'Something went wrong.' };
    default:
      return { icon: AlertCircle, iconColor: 'text-red-400', title: 'Failed to Load', defaultMessage: 'Something went wrong. Please try again.' };
  }
}

export default ErrorState;
