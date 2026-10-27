'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string; theme: 'auto' }) => string;
  remove: (id: string) => void;
};

function turnstileApi(): TurnstileApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

function TurnstileField() {
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    const el = slot.current;
    if (!el) return undefined;
    let widgetId = '';
    let cancelled = false;

    function mount() {
      const api = turnstileApi();
      if (cancelled || !api || widgetId) return;
      widgetId = api.render(el as HTMLElement, { sitekey: TURNSTILE_SITE_KEY, theme: 'auto' });
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.addEventListener('load', mount);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', mount);
      mount();
    }

    return () => {
      cancelled = true;
      script?.removeEventListener('load', mount);
      const api = turnstileApi();
      if (widgetId && api) api.remove(widgetId);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={slot} className="mt-3" />;
}

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
      <TurnstileField />
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
