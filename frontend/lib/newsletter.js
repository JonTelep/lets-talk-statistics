// Shared newsletter helpers for Pages Functions.
// Signing secret NEWSLETTER_SECRET is a Pages secret (never in files).
// Signup does not send email. Footer helpers are here for a later send that still needs approval.
export const SITE = 'https://letstalkstatistics.com';
export const FROM = "Let's Talk Statistics <stats@mail.telep.io>";
export const REPLY_TO = 'jon@telep.io';
export const ADDRESS = 'PO Box 187, Valley City, OH 44280';

const enc = new TextEncoder();
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = (s) => b64u(enc.encode(s));
const unb64uStr = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
// Token: base64url(email).issuedMs.sig ; sig = HMAC(secret, action|email|issuedMs)
export async function signToken(secret, action, email, issued = Date.now()) {
  const e = b64uStr(email.toLowerCase());
  return `${e}.${issued}.${await hmac(secret, `${action}|${email.toLowerCase()}|${issued}`)}`;
}
export async function verifyToken(secret, action, token, ttlMs = 0) {
  try {
    const [e, issued, sig] = String(token || '').split('.');
    const email = unb64uStr(e);
    const expect = await hmac(secret, `${action}|${email}|${issued}`);
    if (!sig || sig.length !== expect.length) return null;
    let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expect.charCodeAt(i);
    if (diff) return null;
    if (ttlMs && Date.now() - Number(issued) > ttlMs) return null;
    return email;
  } catch { return null; }
}
export const unsubUrl = async (secret, email) => `${SITE}/api/unsubscribe?t=${await signToken(secret, 'unsub', email, 0)}`;

export function resend(key) {
  return async (method, path, body) => {
    const r = await fetch('https://api.resend.com' + path, {
      method, headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json', 'User-Agent': 'lets-talk-statistics' },
      body: body ? JSON.stringify(body) : undefined,
    });
    let d = null; try { d = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, data: d };
  };
}
// Single opt-in. Status lives in contact property lts_status: active | unsubscribed.
// Only unsubscribed === false AND lts_status === 'active' counts as a subscriber.
export const ACTIVE = 'active';
export const statusOf = (c) => (c && c.properties && c.properties.lts_status && c.properties.lts_status.value) || 'none';
export const isActive = (c) => !!c && c.unsubscribed === false && statusOf(c) === ACTIVE;

export function emailFooterHtml(unsub) {
  return `<hr style="border:0;border-top:1px solid #ddd;margin:28px 0 12px"><p style="font:12px/1.5 Menlo,Consolas,monospace;color:#666;margin:0">Let's Talk Statistics, from Telep IO LLC. ${ADDRESS}.<br>You get this because you signed up at letstalkstatistics.com. <a href="${unsub}" style="color:#666">Unsubscribe</a></p>`;
}
export const emailFooterText = (unsub) => `\n\n--\nLet's Talk Statistics, from Telep IO LLC. ${ADDRESS}.\nUnsubscribe: ${unsub}\n`;
export const listUnsubHeaders = (unsub) => ({ 'List-Unsubscribe': `<${unsub}>, <mailto:${REPLY_TO}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' });

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function page(title, body, status = 200) {
  const safeTitle = escapeHtml(title);
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${safeTitle} | Let's Talk Statistics</title>
<style>body{margin:0;background:#0a0a0a;color:#fff;font:16px/1.5 Inter,system-ui,sans-serif}a{color:#fff}.w{max-width:40rem;margin:0 auto;padding:48px 22px}.m{color:#737373;font-size:12px}</style></head>
<body><div class="w"><p><a href="/">Let's Talk Statistics</a></p><h1>${safeTitle}</h1>${body}<p class="m">Telep IO LLC. ${ADDRESS}.</p></div></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
