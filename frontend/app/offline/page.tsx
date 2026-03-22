'use client';

import Link from 'next/link';
import { ArrowLeft, Wifi, RefreshCw, Database } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mx-auto w-24 h-24 mb-8 relative">
          <div className="w-full h-full rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
            <Wifi className="w-10 h-10 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✕</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          You&apos;re Offline
        </h1>

        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          No internet connection detected. Some cached government data may still be
          available, but you&apos;ll need to reconnect for the latest statistics.
        </p>

        {/* Available Offline */}
        <div className="card p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Available Offline</h2>
          </div>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>Previously viewed pages (if cached)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>Recently loaded government data</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>Basic site navigation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--text-tertiary)]">
          Government statistics from official sources
        </p>
      </div>
    </div>
  );
}
