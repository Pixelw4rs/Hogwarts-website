'use strict';
// Public wish list for plugins and datapacks. Anyone submits and votes; the admin sets status or deletes.
// Stored in data/db/requests.json as { rev, requests: Request[] }. Voter ids never leave the server.
const crypto = require('crypto');
const path = require('path');
const { SMALL_BODY, httpError, send, readJson: readAny, clientIp, parseCookies, cookie, createLimiter, cleanText } = require('./http-utils');
const { createJsonStore } = require('./json-store');

const KINDS = ['plugin', 'datapack'];
const STATUSES = ['open', 'review', 'accepted', 'rejected', 'done'];
const LIMITS = { requests: 500, name: 80, link: 300, reason: 600, by: 32, note: 300 };
const VOTER_COOKIE = 'ardet_voter';
const VOTER_MAX_AGE_S = 365 * 24 * 60 * 60;
const CREATE_MAX = 5;
const CREATE_WINDOW_MS = 10 * 60 * 1000;
const CREATE_TOTAL_MAX = 30;
const CREATE_TOTAL_WINDOW_MS = 60 * 60 * 1000;
const MAX_VOTERS = 1000;
const NEW_VOTERS_MAX = 10;
const NEW_VOTERS_WINDOW_MS = 60 * 60 * 1000;
const WRITE_MAX = 60;
const WRITE_WINDOW_MS = 60 * 1000;

const defaults = () => ({ rev: 0, requests: [] });
const readJson = (req) => readAny(req, SMALL_BODY);

/** Repairs a hand-edited or partly corrupt file so one bad entry cannot break the whole list. */
const normalize = (raw) => ({
  rev: Number(raw.rev) || 0,
  requests: (Array.isArray(raw.requests) ? raw.requests : [])
    .filter((r) => r && typeof r.id === 'string')
    .map((r) => ({ ...r, voters: Array.isArray(r.voters) ? r.voters : [] })),
});

/** Only plain http(s) links; anything else (javascript:, data:, relative) is refused. */
function parseLink(value) {
  const text = cleanText(value, LIMITS.link);
  if (!text) return '';
  let url;
  try { url = new URL(text); } catch (e) { throw httpError(400, 'Der Link muss mit https:// beginnen.'); }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw httpError(400, 'Der Link muss mit https:// beginnen.');
  return url.href;
}

function parseNew(body) {
  if (!KINDS.includes(body.kind)) throw httpError(400, 'Bitte Plugin oder Datapack wählen.');
  const name = cleanText(body.name, LIMITS.name);
  if (!name) throw httpError(400, 'Name fehlt');
  return {
    kind: body.kind,
    name,
    link: parseLink(body.link),
    reason: cleanText(body.reason, LIMITS.reason),
    by: cleanText(body.by, LIMITS.by),
  };
}

/** @param {string} webRoot @param {{ requireAdmin: (req: any) => string }} auth */
function createRequests(webRoot, auth) {
  const store = createJsonStore(path.join(webRoot, 'db', 'requests.json'), defaults, normalize);
  const creates = createLimiter(CREATE_MAX, CREATE_WINDOW_MS);
  const writes = createLimiter(WRITE_MAX, WRITE_WINDOW_MS);
  // global caps that a spoofed X-Forwarded-For cannot dodge
  const createsTotal = createLimiter(CREATE_TOTAL_MAX, CREATE_TOTAL_WINDOW_MS);
  const newVoters = createLimiter(NEW_VOTERS_MAX, NEW_VOTERS_WINDOW_MS);

  const voterOf = (req) => {
    const id = parseCookies(req)[VOTER_COOKIE];
    return id && /^[a-f0-9]{32}$/.test(id) ? id : null;
  };

  /** Public shape: vote count and "did I vote", never the voter list. */
  function view(voter) {
    return {
      rev: store.state.rev,
      requests: store.state.requests.map(({ voters, ...r }) => ({ ...r, votes: voters.length, voted: Boolean(voter) && voters.includes(voter) })),
    };
  }

  function save(res, voter, headers) {
    store.persist();
    send(res, 200, view(voter), headers);
  }

  const find = (id) => {
    const r = store.state.requests.find((x) => x.id === id);
    if (!r) throw httpError(404, 'Wunsch nicht gefunden');
    return r;
  };
  const replace = (id, patch) => {
    store.state.requests = store.state.requests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  };

  async function create(req, res) {
    const fields = parseNew(await readJson(req));
    if (creates.hit(clientIp(req))) throw httpError(429, 'Du hast gerade viele Wünsche abgeschickt — bitte später weiter.');
    if (createsTotal.hit('*')) throw httpError(429, 'Gerade kommen sehr viele Wünsche rein — bitte später noch einmal.');
    if (store.state.requests.length >= LIMITS.requests) throw httpError(409, 'Die Wunschliste ist voll.');
    store.state.requests = [{ id: crypto.randomBytes(6).toString('hex'), ...fields, status: 'open', note: '', voters: [], created: Date.now() }, ...store.state.requests];
    save(res, voterOf(req));
  }

  async function vote(req, res, id) {
    const r = find(id);
    const body = await readJson(req);
    const known = voterOf(req);
    if (!known && newVoters.hit(clientIp(req))) throw httpError(429, 'Zu viele Abstimmungen — bitte später noch einmal.');
    const voter = known || crypto.randomBytes(16).toString('hex');
    const others = r.voters.filter((v) => v !== voter);
    if (body.vote === true && others.length >= MAX_VOTERS) throw httpError(409, 'Für diesen Wunsch wurde schon sehr oft abgestimmt.');
    replace(id, { voters: body.vote === true ? [...others, voter] : others });
    save(res, voter, known ? {} : { 'Set-Cookie': cookie(req, VOTER_COOKIE, voter, VOTER_MAX_AGE_S) });
  }

  async function moderate(req, res, id) {
    auth.requireAdmin(req);
    find(id);
    const body = await readJson(req);
    const patch = {};
    if ('status' in body) {
      if (!STATUSES.includes(body.status)) throw httpError(400, 'Unbekannter Status');
      patch.status = body.status;
    }
    if ('note' in body) patch.note = cleanText(body.note, LIMITS.note);
    replace(id, patch);
    save(res, voterOf(req));
  }

  function remove(req, res, id) {
    auth.requireAdmin(req);
    store.state.requests = store.state.requests.filter((r) => r.id !== id);
    save(res, voterOf(req));
  }

  /** Handles /api/requests, /api/requests/:id and /api/requests/:id/vote. */
  async function handle(req, res, parts) {
    const [, , id, action] = parts;
    if (req.method === 'GET' && !id) return send(res, 200, view(voterOf(req)));
    if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Methode nicht erlaubt' });
    if (writes.hit(clientIp(req))) throw httpError(429, 'Zu viele Änderungen — kurz warten.');
    if (req.method === 'POST' && !id) return create(req, res);
    if (req.method === 'POST' && id && action === 'vote') return vote(req, res, id);
    if (req.method === 'PATCH' && id && !action) return moderate(req, res, id);
    if (req.method === 'DELETE' && id && !action) return remove(req, res, id);
    return send(res, 404, { error: 'Nicht gefunden' });
  }

  return { handle };
}

module.exports = { createRequests, KINDS, STATUSES };
