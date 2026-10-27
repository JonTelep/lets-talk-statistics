// GET or POST /api/unsubscribe?t=<signed token> : unsubscribes the contact. POST supports List-Unsubscribe one-click.
import { listUnsubHeaders, page, resend, unsubUrl, verifyToken } from './newsletter.js';

async function unsub(request, env) {
  const t = new URL(request.url).searchParams.get('t');
  const email = env.NEWSLETTER_SECRET && await verifyToken(env.NEWSLETTER_SECRET, 'unsub', t);
  if (!email) return { ok: false, code: 400 };
  if (!env.RESEND_API_KEY) return { ok: false, code: 503, email };
  const r = await resend(env.RESEND_API_KEY)('PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true, properties: { lts_status: 'unsubscribed' } });
  return { ok: r.ok || r.status === 404, code: r.ok || r.status === 404 ? 200 : 502, email };
}
export async function onRequestGet({ request, env }) {
  const r = await unsub(request, env);
  if (!r.ok) {
    const badLink = r.code === 400;
    const title = badLink ? 'That link did not work' : 'Unsubscribe';
    const message = badLink
      ? 'The unsubscribe link is missing or does not match. The address was not changed.'
      : 'Could not unsubscribe right now. The address was not changed.';
    return page(title, `<p>${message}</p>`, badLink ? 200 : r.code);
  }
  return Response.redirect(new URL('/newsletter/unsubscribed', request.url).href, 303);
}
export async function onRequestPost({ request, env }) {
  const r = await unsub(request, env);
  const headers = { 'cache-control': 'no-store' };
  if (r.ok && r.email && env.NEWSLETTER_SECRET) Object.assign(headers, listUnsubHeaders(await unsubUrl(env.NEWSLETTER_SECRET, r.email)));
  return new Response(r.ok ? 'Unsubscribed' : 'Error', { status: r.code, headers });
}
