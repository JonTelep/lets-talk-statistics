'use client';

import { FormEvent, useState } from 'react';

export default function StatOfTheWeekForm() {
  const [state, setState] = useState<'form' | 'sending' | 'done' | 'error'>('form');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState('sending');
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: new FormData(form),
        headers: { accept: 'application/json' },
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.ok) {
        setState('done');
        setMessage("You're signed up for the stat of the week.");
        return;
      }
      setState('error');
      setMessage((data && data.error) || 'Something went wrong. Please try again.');
    } catch {
      setState('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <p className="text-sm text-foreground" role="status">
        {message}
      </p>
    );
  }

  return (
    <form action="/api/subscribe" method="post" onSubmit={onSubmit} className="max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grow">
          <label htmlFor="stat-week-email" className="block text-sm text-surface-500">
            Email address
          </label>
          <input
            id="stat-week-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-2 w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <button type="submit" className="btn-secondary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Signing up' : 'Sign up'}
        </button>
      </div>
      <input type="hidden" name="placement" value="footer" />
      <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="mt-3 text-xs text-surface-600">
        Adding your address signs you up. No confirmation email is sent. Unsubscribe any time.
      </p>
      {state === 'error' ? (
        <p className="mt-2 text-sm text-foreground" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
