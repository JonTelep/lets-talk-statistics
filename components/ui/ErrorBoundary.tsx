'use client';

import React, { Component, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-800 mb-6">
              <AlertOctagon className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
            <p className="text-surface-400 mb-6">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left bg-surface-900 rounded-lg p-4 border border-border">
                <summary className="text-sm text-surface-500 cursor-pointer hover:text-surface-300">Error details</summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={this.handleReset} className="btn-primary inline-flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
