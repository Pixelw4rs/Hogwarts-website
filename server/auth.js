'use strict';
// Admin login. One account from the environment (ADMIN_USER / ADMIN_PASSWORD), sessions in memory.
// A server restart logs everyone out, which is fine for a single-owner site.
const crypto = require('crypto');
const { SMALL_BODY, httpError, send, readJson, clientIp, parseCookies, cookie, assertSameOrigin, createLimiter, cleanText } = require('./http-utils');

const SESSION_COOKIE = 'ardet_session';
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
/** Across all IPs, so a spoofed X-Forwarded-For per attempt cannot buy unlimited guesses. */
const MAX_FAILED_LOGINS_TOTAL = 20;
const FAILED_WINDOW_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();
const sameSecret = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

function createAuth({ user = process.env.ADMIN_USER || 'admin', password = process.env.ADMIN_PASSWORD || '' } = {}) {
  const configured = password.length > 0;
  if (!configured) console.warn('ADMIN_PASSWORD not set: the admin area is disabled.');
  else if (password.length < MIN_PASSWORD_LENGTH) console.warn(`ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters.`);

  /** @type {Map<string, { user: string, expires: number }>} */
  const sessions = new Map();
  const failed = createLimiter(MAX_FAILED_LOGINS, FAILED_WINDOW_MS);
  const failedTotal = createLimiter(MAX_FAILED_LOGINS_TOTAL, FAILED_WINDOW_MS);
  const ALL = '*';

  setInterval(() => {
    const now = Date.now();
    for (const [token, s] of sessions) if (s.expires <= now) sessions.delete(token);
  }, 60_000).unref();

  /** @returns {string|null} the signed-in admin's name */
  function sessionUser(req) {
    const token = parseCookies(req)[SESSION_COOKIE];
    const s = token && sessions.get(token);
    if (!s) return null;
    if (s.expires <= Date.now()) { sessions.delete(token); return null; }
    return s.user;
  }

  /** Throws 401/403 unless the request carries a valid session from this site. @returns {string} */
  function requireAdmin(req) {
    assertSameOrigin(req);
    const name = sessionUser(req);
    if (!name) throw httpError(401, 'Bitte zuerst als Admin anmelden.');
    return name;
  }

  async function login(req, res) {
    assertSameOrigin(req);
    if (!configured) throw httpError(503, 'Der Admin-Zugang ist nicht eingerichtet (ADMIN_PASSWORD fehlt).');
    const ip = clientIp(req);
    if (failed.blocked(ip) || failedTotal.blocked(ALL)) throw httpError(429, 'Zu viele Fehlversuche — bitte 15 Minuten warten.');
    const body = await readJson(req, SMALL_BODY);
    // both comparisons always run, so the response time does not reveal a valid username
    const userOk = sameSecret(cleanText(body.username, 64), user);
    const passOk = sameSecret(typeof body.password === 'string' ? body.password : '', password);
    if (!(userOk && passOk)) {
      failed.hit(ip);
      failedTotal.hit(ALL);
      throw httpError(401, 'Benutzername oder Passwort ist falsch.');
    }
    failed.reset(ip);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { user, expires: Date.now() + SESSION_MS });
    send(res, 200, { user }, { 'Set-Cookie': cookie(req, SESSION_COOKIE, token, SESSION_MS / 1000) });
  }

  function logout(req, res) {
    assertSameOrigin(req);
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) sessions.delete(token);
    send(res, 200, { user: null }, { 'Set-Cookie': cookie(req, SESSION_COOKIE, '', 0) });
  }

  /** Handles /api/auth/*. */
  async function handle(req, res, parts) {
    const action = parts[2];
    if (req.method === 'GET' && action === 'me') return send(res, 200, { user: sessionUser(req), configured });
    if (req.method === 'POST' && action === 'login') return login(req, res);
    if (req.method === 'POST' && action === 'logout') return logout(req, res);
    return send(res, 404, { error: 'Nicht gefunden' });
  }

  return { handle, sessionUser, requireAdmin, configured };
}

module.exports = { createAuth };
