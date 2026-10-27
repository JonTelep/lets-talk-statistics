// POST /api/subscribe : single opt-in. A valid submitted email is consent: the contact is added as
// active (unsubscribed:false, lts_status=active) right away.
// Invalid addresses (syntax, disposable domain, no MX) are dropped quietly: the user sees success, no contact is made.
// A contact Resend marks unsubscribed account-wide (unsubscribed:true), or with lts_status unsubscribed, is left unchanged.
// Pages secrets: RESEND_API_KEY, NEWSLETTER_SECRET, and RESEND_SEGMENT_ID (a segment for this site only).
// Optional FUNNEL KV: 5 signup attempts per IP per hour. No binding, no limit.
// Optional TURNSTILE_SECRET: require a Turnstile token. The widget site key is NEXT_PUBLIC_TURNSTILE_SITE_KEY.
// Honeypot field: website. dryRun succeeds only under the node test runner.
// This handler never sends email. This repo has no admin notification path, so signup does not mail Jon.
import { ACTIVE, escapeHtml, isActive, page, resend, statusOf } from './newsletter.js';
import { validateEmail } from './validate.js';
import { PLACEMENTS, bump } from './funnel.js';

const SIGNUPS_PER_HOUR = 5;
const enc = new TextEncoder();

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function wantsHtml(request) {
  return (request.headers.get('accept') || '').includes('text/html');
}

function finish(request, body, status = 200) {
  if (wantsHtml(request)) {
    if (status === 200 && body.ok) return Response.redirect(new URL('/newsletter/subscribed', request.url).href, 303);
    return page('Stat of the week', `<p>${escapeHtml(body.error || 'Something went wrong.')}</p>`, status);
  }
  return json(body, status);
}

function clientIp(request) {
  const cf = (request.headers.get('cf-connecting-ip') || '').trim();
  if (cf) return cf;
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fixed hour window in FUNNEL. Fail open if KV errors so a store outage does not block signup.
async function overIpLimit(env, request) {
  if (!env || !env.FUNNEL) return false;
  const ip = clientIp(request);
  if (!ip) return false;
  const bucket = new Date().toISOString().slice(0, 13);
  const key = `rl:${bucket}:${await sha256Hex(ip)}`;
  try {
    const n = (Number(await env.FUNNEL.get(key)) || 0) + 1; // not atomic; fine at this traffic
    await env.FUNNEL.put(key, String(n), { expirationTtl: 2 * 60 * 60 });
    return n > SIGNUPS_PER_HOUR;
  } catch {
    return false;
  }
}

function dryRunInTests(data) {
  if (!data.dryRun) return false;
  return typeof process !== 'undefined' && !!process.env.NODE_TEST_CONTEXT;
}

function segmentId(env) {
  return String((env && env.RESEND_SEGMENT_ID) || '').trim();
}

function accountUnsubscribed(contact) {
  return !!contact && (contact.unsubscribed === true || statusOf(contact) === 'unsubscribed');
}

async function turnstileOk(env, request, data) {
  if (!env || !env.TURNSTILE_SECRET) return true;
  const token = String((data && (data['cf-turnstile-response'] || data.turnstile)) || '');
  if (!token || token.length > 2048) return false;
  try {
    const ip = clientIp(request);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    const body = await r.json();
    return !!(r.ok && body && body.success === true);
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = rawEnv || {};
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch { return finish(request, { ok: false, error: 'Invalid request.' }, 400); }
  if (data.website) return finish(request, { ok: true }); // honeypot
  const raw = String(data.email || '').trim().toLowerCase();
  if (!raw || !raw.includes('@')) return finish(request, { ok: false, error: 'Please enter a valid email address.' }, 400);
  if (!(await turnstileOk(env, request, data))) {
    return finish(request, { ok: false, error: 'Please complete the check and try again.' }, 400);
  }
  if (await overIpLimit(env, request)) {
    return finish(request, { ok: false, error: 'Too many signup attempts from this network. Please try again later.' }, 429);
  }
  const placement = PLACEMENTS.includes(String(data.placement)) ? String(data.placement) : 'other';
  const ref = String(data.ref || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'direct';
  const v = await validateEmail(raw);
  if (!v.ok) { await bump(env, 'signup_rejected', placement); return finish(request, { ok: true }); } // quiet reject
  const email = v.email;
  if (dryRunInTests(data)) return finish(request, { ok: true, dryRun: true });
  const seg = segmentId(env);
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_SECRET || !seg) return finish(request, { ok: false, error: 'Signup is not configured yet.' }, 503);

  const api = resend(env.RESEND_API_KEY);
  const path = `/contacts/${encodeURIComponent(email)}`;
  const got = await api('GET', path);
  if (got.ok && accountUnsubscribed(got.data)) return finish(request, { ok: true }); // never re-subscribe
  if (got.ok && isActive(got.data)) return finish(request, { ok: true, already: true });
  const props = { lts_status: ACTIVE, ...(got.ok ? {} : { signup_source: placement, lts_ref: ref }) };
  const active = { unsubscribed: false, properties: props };
  const create = { email, ...active, segments: [{ id: seg }] };
  const w = got.ok ? await api('PATCH', path, active) : await api('POST', '/contacts', create);
  if (!w.ok) return finish(request, { ok: false, error: 'Could not subscribe right now. Please try again later.' }, 502);
  if (got.ok) await api('POST', `${path}/segments/${seg}`);
  await bump(env, 'signup_active', placement);
  return finish(request, { ok: true });
}
export const onRequest = () => json({ ok: false, error: 'Method not allowed.' }, 405);
