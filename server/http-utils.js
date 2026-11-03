'use strict';
// Shared HTTP helpers for the API modules: JSON replies, body parsing, cookies, rate limits.

const MAX_BODY = 6 * 1024 * 1024; // base64 images run ~33% bigger than their decoded size

/** An error that carries the HTTP status and a German message safe to show visitors. */
function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function send(res, code, obj, headers = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

/** Text-only endpoints (login, content, wishes) never need more than this. */
const SMALL_BODY = 16 * 1024;

/**
 * @param {import('http').IncomingMessage} req
 * @param {number} [max] byte limit; boards keep 6 MB for images, everything else passes SMALL_BODY
 */
function readJson(req, max = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0, tooBig = false;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (tooBig) return; // keep draining so the 413 reply still reaches the client, but store nothing
      if (size > max) { tooBig = true; chunks.length = 0; reject(httpError(413, 'Anfrage zu groß')); } else chunks.push(c);
    });
    req.on('end', () => {
      if (tooBig) return;
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch (e) {
        reject(httpError(400, 'Ungültige Anfrage'));
      }
    });
    req.on('error', reject);
  });
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
}

/** @returns {Record<string, string>} */
function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/** True when the visitor reached us over https (directly or through a proxy), or COOKIE_SECURE=1 forces it. */
function isSecure(req) {
  return process.env.COOKIE_SECURE === '1' || req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted);
}

function cookie(req, name, value, maxAgeSeconds) {
  return [
    `${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`,
    ...(isSecure(req) ? ['Secure'] : []),
  ].join('; ');
}

/** Refuses state changes sent by another site's page (cookies alone are not proof of intent). */
function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let originHost;
  try { originHost = new URL(origin).host; } catch (e) { originHost = ''; }
  if (originHost !== host) throw httpError(403, 'Anfrage von fremder Seite abgelehnt.');
}

/**
 * Sliding-window counter per key.
 * @param {number} max events allowed per window
 * @param {number} windowMs
 */
function createLimiter(max, windowMs) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  }, windowMs).unref();
  const recent = (key, now) => (hits.get(key) || []).filter(t => now - t < windowMs);
  return {
    /** Records one event; true once the key is over the limit. */
    hit(key) {
      const now = Date.now();
      const a = [...recent(key, now), now];
      hits.set(key, a);
      return a.length > max;
    },
    /** True when the key has used up the window, without recording anything. */
    blocked(key) {
      return recent(key, Date.now()).length >= max;
    },
    reset(key) { hits.delete(key); },
  };
}

/** Trimmed string clipped to `max`, or '' for anything that is not a string. */
const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

module.exports = { MAX_BODY, SMALL_BODY, httpError, send, readJson, clientIp, parseCookies, cookie, assertSameOrigin, createLimiter, cleanText };
