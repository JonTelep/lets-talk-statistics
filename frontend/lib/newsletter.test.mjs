import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { request as httpRequest } from 'node:http';
import { afterEach, test } from 'node:test';
import { onRequestPost as eventPost } from './eventHandler.js';
import { ADDRESS, emailFooterHtml, emailFooterText, listUnsubHeaders, signToken, verifyToken } from './newsletter.js';
import { otherSiteLinks } from './otherSites.js';
import { onRequestPost as subscribe } from './subscribeHandler.js';
import { onRequestGet, onRequestPost as unsubscribe } from './unsubscribeHandler.js';
import { isDisposable, validateEmail } from './validate.js';
import { onRequestPost as subscribeFromFrontendFunctions } from '../functions/api/subscribe.js';
import { onRequestPost as subscribeFromRootFunctions } from '../../functions/api/subscribe.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function installFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    const call = {
      url: String(url),
      method: opts.method || 'GET',
      body: opts.body ? JSON.parse(opts.body) : null,
    };
    calls.push(call);
    return handler(call);
  };
  return calls;
}

function mxAnswer(call, payload) {
  if (call.url.includes('cloudflare-dns.com')) return jsonResponse(payload);
  throw new Error(`unexpected ${call.method} ${call.url}`);
}

const env = { RESEND_API_KEY: 're_test', NEWSLETTER_SECRET: 'secret', RESEND_SEGMENT_ID: 'seg-lts' };

function postJson(body, headers = {}) {
  return new Request('https://letstalkstatistics.com/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

test('other sites keep telep.io and drop this site', () => {
  const links = otherSiteLinks();
  assert.deepEqual(links.map((site) => site.label), [
    'telep.io websites for small businesses',
    'Bloomer News, positive AI news',
    'StarterLoot, free AI tools for game devs',
    'Publaish, AI search visibility tracker',
    'OpenMedina, open government for Medina County',
    'minesSwept, shared giant minesweeper',
    'telep.io memes',
    'white.telep.io, filming light and camera test',
    'AskMentions, see if AI answers mention you',
  ]);
  assert.equal(links.some((site) => site.host === 'letstalkstatistics.com' || site.href.includes('letstalkstatistics.com')), false);
  assert.equal(links[0].href, 'https://telep.io/');
});

test('mail footer carries the postal address and one-click headers', () => {
  assert.equal(ADDRESS, 'PO Box 187, Valley City, OH 44280');
  assert.match(emailFooterHtml('https://letstalkstatistics.com/api/unsubscribe?t=abc'), /PO Box 187, Valley City, OH 44280/);
  assert.match(emailFooterText('https://letstalkstatistics.com/api/unsubscribe?t=abc'), /PO Box 187, Valley City, OH 44280/);
  const headers = listUnsubHeaders('https://letstalkstatistics.com/api/unsubscribe?t=abc');
  assert.equal(headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(headers['List-Unsubscribe'], /<https:\/\/letstalkstatistics.com\/api\/unsubscribe\?t=abc>/);
  assert.match(headers['List-Unsubscribe'], /<mailto:jon@telep.io\?subject=unsubscribe>/);
});

test('signed unsubscribe token round trips and rejects tampering', async () => {
  const token = await signToken('secret', 'unsub', 'Person@Example.com', 0);
  assert.equal(await verifyToken('secret', 'unsub', token), 'person@example.com');
  assert.equal(await verifyToken('secret', 'unsub', `${token}x`), null);
  assert.equal(await verifyToken('other', 'unsub', token), null);
});

test('validation rejects syntax and disposable domains', async () => {
  assert.equal((await validateEmail('not-an-email')).reason, 'syntax');
  assert.equal((await validateEmail('a@b')).reason, 'syntax');
  assert.equal((await validateEmail('person@mailinator.com')).reason, 'disposable');
  assert.equal(isDisposable('foo.guerrillamail.com'), true);
  assert.equal((await validateEmail('user.name+tag@example.com', async () => jsonResponse({ Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] }))).ok, true);
});

test('validation rejects a missing mail host and fails open when DNS errors', async () => {
  assert.equal((await validateEmail('a@example.com', async () => jsonResponse({ Status: 3, Answer: [] }))).reason, 'no-mx');
  assert.equal((await validateEmail('a@example.com', async () => jsonResponse({ Status: 0, Answer: [{ type: 15, data: '0 .' }] }))).reason, 'no-mx');
  const open = await validateEmail('a@example.com', async () => { throw new Error('dns down'); });
  assert.equal(open.ok, true);
  assert.equal(open.reason, 'mx-unknown');
});

test('honeypot and invalid addresses do not create a contact', async () => {
  const calls = installFetch(() => { throw new Error('fetch should not run'); });
  const honey = await subscribe({ request: postJson({ email: 'person@example.com', website: 'https://spam.test' }), env });
  assert.equal((await honey.json()).ok, true);
  const bad = await subscribe({ request: postJson({ email: 'nope' }), env });
  assert.equal(bad.status, 400);
  const quiet = await subscribe({ request: postJson({ email: 'person@mailinator.com', placement: 'footer' }), env });
  assert.deepEqual(await quiet.json(), { ok: true });
  assert.equal(calls.length, 0);
});

test('signup adds an active contact and does not send email', async () => {
  const calls = installFetch((call) => {
    if (call.url.includes('cloudflare-dns.com')) return mxAnswer(call, { Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] });
    if (call.method === 'GET') return jsonResponse({ message: 'not found' }, 404);
    if (call.method === 'POST' && call.url === 'https://api.resend.com/contacts') return jsonResponse({ id: 'c1' });
    throw new Error(`unexpected ${call.method} ${call.url}`);
  });
  const res = await subscribe({ request: postJson({ email: 'Person@Example.com', placement: 'footer' }), env });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  const create = calls.find((call) => call.method === 'POST');
  assert.deepEqual(create.body, {
    email: 'person@example.com',
    unsubscribed: false,
    properties: { lts_status: 'active', signup_source: 'footer', lts_ref: 'direct' },
    segments: [{ id: 'seg-lts' }],
  });
  assert.equal(calls.some((call) => call.url.includes('/emails')), false);
});

test('resend.dev test address is stored and still does not send email', async () => {
  const calls = installFetch((call) => {
    if (call.method === 'GET') return jsonResponse({}, 404);
    if (call.method === 'POST') return jsonResponse({ id: 'c1' });
    throw new Error(`unexpected ${call.method} ${call.url}`);
  });
  const res = await subscribe({ request: postJson({ email: 'delivered@resend.dev', placement: 'footer' }), env });
  assert.equal((await res.json()).ok, true);
  assert.equal(calls.some((call) => call.url.includes('cloudflare-dns.com') || call.url.includes('/emails')), false);
});

test('an active contact is not written again and an unsubscribed contact stays unsubscribed', async () => {
  const activeCalls = installFetch((call) => {
    if (call.url.includes('cloudflare-dns.com')) return mxAnswer(call, { Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] });
    if (call.method === 'GET') return jsonResponse({ unsubscribed: false, properties: { lts_status: { value: 'active' } } });
    throw new Error(`unexpected ${call.method} ${call.url}`);
  });
  const active = await subscribe({ request: postJson({ email: 'person@example.com' }), env });
  assert.deepEqual(await active.json(), { ok: true, already: true });
  assert.equal(activeCalls.some((call) => call.method !== 'GET' && !call.url.includes('cloudflare-dns.com')), false);

  const unsubCalls = installFetch((call) => {
    if (call.url.includes('cloudflare-dns.com')) return mxAnswer(call, { Status: 0, Answer: [{ type: 15, data: '10 mx.example.com.' }] });
    if (call.method === 'GET') return jsonResponse({ unsubscribed: true, properties: { lts_status: { value: 'unsubscribed' } } });
    throw new Error(`unexpected ${call.method} ${call.url}`);
  });
  const again = await subscribe({ request: postJson({ email: 'person@example.com' }), env });
  assert.deepEqual(await again.json(), { ok: true });
  assert.equal(unsubCalls.some((call) => call.method === 'PATCH' || call.method === 'POST'), false);
});

test('html form posts redirect and missing secrets do not send', async () => {
  const res = await subscribe({
    request: postJson({ email: 'a@resend.dev', dryRun: true }, { accept: 'text/html' }),
    env: {},
  });
  assert.equal(res.status, 303);
  assert.equal(new URL(res.headers.get('location')).pathname, '/newsletter/subscribed');

  const missing = await subscribe({ request: postJson({ email: 'a@resend.dev' }), env: {} });
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).error, 'Signup is not configured yet.');
});

test('pages function entry points re-export the same subscribe handler', () => {
  assert.equal(subscribeFromFrontendFunctions, subscribe);
  assert.equal(subscribeFromRootFunctions, subscribe);
});

test('one-click unsubscribe POST returns 200 and marks the contact unsubscribed', async () => {
  const email = 'person@example.com';
  const token = await signToken(env.NEWSLETTER_SECRET, 'unsub', email, 0);
  const calls = installFetch((call) => {
    assert.equal(call.method, 'PATCH');
    assert.equal(call.url, `https://api.resend.com/contacts/${encodeURIComponent(email)}`);
    assert.deepEqual(call.body, { unsubscribed: true, properties: { lts_status: 'unsubscribed' } });
    return jsonResponse({ id: 'c1' });
  });
  const res = await unsubscribe({
    request: new Request(`https://letstalkstatistics.com/api/unsubscribe?t=${encodeURIComponent(token)}`, { method: 'POST' }),
    env,
  });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'Unsubscribed');
  assert.equal(res.headers.get('List-Unsubscribe-Post'), 'List-Unsubscribe=One-Click');
  assert.match(res.headers.get('List-Unsubscribe'), /api\/unsubscribe\?t=/);
  assert.equal(calls.length, 1);
});

test('unsubscribe POST still returns 200 when the contact is already gone', async () => {
  const token = await signToken(env.NEWSLETTER_SECRET, 'unsub', 'gone@example.com', 0);
  installFetch(() => jsonResponse({ message: 'not found' }, 404));
  const res = await unsubscribe({
    request: new Request(`https://letstalkstatistics.com/api/unsubscribe?t=${token}`, { method: 'POST' }),
    env,
  });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'Unsubscribed');
});

test('a bad unsubscribe link does not change a contact', async () => {
  const calls = installFetch(() => { throw new Error('fetch should not run'); });
  const post = await unsubscribe({
    request: new Request('https://letstalkstatistics.com/api/unsubscribe?t=bad', { method: 'POST' }),
    env,
  });
  assert.equal(post.status, 400);
  assert.equal(await post.text(), 'Error');
  const get = await onRequestGet({
    request: new Request('https://letstalkstatistics.com/api/unsubscribe?t=bad'),
    env,
  });
  assert.equal(get.status, 200);
  const html = await get.text();
  assert.match(html, /That link did not work/);
  assert.match(html, /PO Box 187, Valley City, OH 44280/);
  assert.equal(calls.length, 0);
});

test('a valid unsubscribe link redirects after the contact is updated', async () => {
  const token = await signToken(env.NEWSLETTER_SECRET, 'unsub', 'person@example.com', 0);
  installFetch(() => jsonResponse({ id: 'c1' }));
  const res = await onRequestGet({
    request: new Request(`https://letstalkstatistics.com/api/unsubscribe?t=${token}`),
    env,
  });
  assert.equal(res.status, 303);
  assert.equal(new URL(res.headers.get('location')).pathname, '/newsletter/unsubscribed');
});

test('HTTP POST unsubscribe returns 200 and marks the contact unsubscribed', async () => {
  const email = 'curl@example.com';
  const token = await signToken(env.NEWSLETTER_SECRET, 'unsub', email, 0);
  const calls = installFetch((call) => {
    assert.equal(call.method, 'PATCH');
    assert.deepEqual(call.body, { unsubscribed: true, properties: { lts_status: 'unsubscribed' } });
    return jsonResponse({ id: 'c1' });
  });
  const server = createServer(async (req, res) => {
    const request = new Request(`https://letstalkstatistics.com${req.url}`, { method: req.method });
    const response = await unsubscribe({ request, env });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const result = await new Promise((resolve, reject) => {
      const req = httpRequest({
        hostname: '127.0.0.1',
        port,
        path: `/api/unsubscribe?t=${encodeURIComponent(token)}`,
        method: 'POST',
      }, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(result.status, 200);
    assert.equal(result.body, 'Unsubscribed');
    assert.equal(calls.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('footer funnel events count and signup events stay on the subscribe handler', async () => {
  const store = new Map();
  const funnel = {
    async get(key) { return store.get(key) ?? null; },
    async put(key, value) { store.set(key, value); },
  };
  const res = await eventPost({
    request: new Request('https://letstalkstatistics.com/api/event', {
      method: 'POST',
      headers: { 'user-agent': 'Mozilla/5.0' },
      body: JSON.stringify({ event: 'form_submit', placement: 'footer' }),
    }),
    env: { FUNNEL: funnel },
  });
  assert.equal(res.status, 204);
  assert.deepEqual([...store.values()], ['1']);
  store.clear();
  await eventPost({
    request: new Request('https://letstalkstatistics.com/api/event', {
      method: 'POST',
      headers: { 'user-agent': 'Mozilla/5.0' },
      body: JSON.stringify({ event: 'signup_active', placement: 'footer' }),
    }),
    env: { FUNNEL: funnel },
  });
  assert.equal(store.size, 0);
});
