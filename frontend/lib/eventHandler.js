// POST /api/event {event, placement} : increments a daily funnel counter (see lib/funnel.js). No cookies, no IDs stored.
import { bump, EVENTS } from './funnel.js';
const BOT = /bot|crawl|spider|slurp|preview|headless/i;
export async function onRequestPost({ request, env, waitUntil }) {
  let d = {};
  try { d = JSON.parse(await request.text()); } catch {}
  const ev = String(d.event || ''), pl = String(d.placement || '');
  // Only client side events here; signup_* events are counted server side by /api/subscribe.
  if (!ev.startsWith('signup_') && EVENTS.includes(ev) && !BOT.test(request.headers.get('user-agent') || '')) {
    const task = bump(env, ev, pl);
    if (typeof waitUntil === 'function') waitUntil(task);
    else await task;
  }
  return new Response(null, { status: 204, headers: { 'x-funnel': env && env.FUNNEL ? 'on' : 'off', 'cache-control': 'no-store' } });
}
export const onRequest = () => new Response(null, { status: 405 });
