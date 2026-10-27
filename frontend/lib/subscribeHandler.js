// POST /api/subscribe : single opt-in. A valid submitted email is consent: the contact is added as
// active (unsubscribed:false, lts_status=active) right away.
// Invalid addresses (syntax, disposable domain, no MX) are dropped quietly: the user sees success, no contact is made.
// Unsubscribed contacts are never re-subscribed.
// Pages secrets: RESEND_API_KEY, NEWSLETTER_SECRET, and RESEND_SEGMENT_ID (a segment for this site only).
// This handler never sends email. This repo has no admin notification path, so signup does not mail Jon.
import { ACTIVE, escapeHtml, isActive, page, resend, statusOf } from './newsletter.js';
import { validateEmail } from './validate.js';
import { PLACEMENTS, bump } from './funnel.js';

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function wantsHtml(request) {
  return (request.headers.get('accept') || '').includes('text/html');
}

function finish(request, body, status = 200) {
  if (wantsHtml(request)) {
    if (status === 200 && body.ok) return Response.redirect(new URL('/newsletter/subscribed/', request.url).href, 303);
    return page('Stat of the week', `<p>${escapeHtml(body.error || 'Something went wrong.')}</p>`, status);
  }
  return json(body, status);
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch { return finish(request, { ok: false, error: 'Invalid request.' }, 400); }
  if (data.website) return finish(request, { ok: true }); // honeypot
  const raw = String(data.email || '').trim().toLowerCase();
  if (!raw || !raw.includes('@')) return finish(request, { ok: false, error: 'Please enter a valid email address.' }, 400);
  const placement = PLACEMENTS.includes(String(data.placement)) ? String(data.placement) : 'other';
  const ref = String(data.ref || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'direct';
  const v = await validateEmail(raw);
  if (!v.ok) { await bump(env, 'signup_rejected', placement); return finish(request, { ok: true }); } // quiet reject
  const email = v.email;
  if (data.dryRun) return finish(request, { ok: true, dryRun: true });
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_SECRET) return finish(request, { ok: false, error: 'Signup is not configured yet.' }, 503);

  const api = resend(env.RESEND_API_KEY);
  const seg = env.RESEND_SEGMENT_ID || '';
  const path = `/contacts/${encodeURIComponent(email)}`;
  const got = await api('GET', path);
  if (got.ok && isActive(got.data)) return finish(request, { ok: true, already: true });
  if (got.ok && statusOf(got.data) === 'unsubscribed') return finish(request, { ok: true }); // never re-subscribe
  const props = { lts_status: ACTIVE, ...(got.ok ? {} : { signup_source: placement, lts_ref: ref }) };
  const active = { unsubscribed: false, properties: props };
  const create = { email, ...active };
  if (seg) create.segments = [{ id: seg }];
  const w = got.ok ? await api('PATCH', path, active) : await api('POST', '/contacts', create);
  if (!w.ok) return finish(request, { ok: false, error: 'Could not subscribe right now. Please try again later.' }, 502);
  if (got.ok && seg) await api('POST', `${path}/segments/${seg}`);
  await bump(env, 'signup_active', placement);
  return finish(request, { ok: true });
}
export const onRequest = () => json({ ok: false, error: 'Method not allowed.' }, 405);
