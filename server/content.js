'use strict';
// Editable site content: rules, staff roll and news posts. Everyone reads, only the admin writes.
// Stored in data/db/content.json as { rev, rules: Rule[], staff: Role[], news: Post[] }.
const crypto = require('crypto');
const path = require('path');
const { SMALL_BODY, httpError, send, readJson: readAny, cleanText } = require('./http-utils');

const readJson = (req) => readAny(req, SMALL_BODY);
const { createJsonStore } = require('./json-store');

const TINCTURES = ['gules', 'purpure', 'vert', 'azure', 'sable'];
const NEWS_TAGS = ['info', 'update', 'event', 'wartung'];
const LIMITS = { rules: 50, ruleText: 500, staff: 20, role: 40, names: 20, name: 32, news: 200, title: 120, body: 5000 };

const newId = () => crypto.randomBytes(6).toString('hex');
const keepId = (id) => (typeof id === 'string' && /^[a-f0-9]{12}$/.test(id) ? id : newId());

function defaults() {
  return {
    rev: 0,
    rules: [
      { id: newId(), text: 'Redstone-/Farm-Lag im Blick behalten — Chunks verantwortungsvoll laden.' },
      { id: newId(), text: 'Große Terraforming- oder Gelände-Projekte zuerst auf das [Terraforming-Board](#hub/terraforming).' },
    ],
    staff: [
      { id: newId(), role: 'Owner', tincture: 'gules', names: ['Pixel_wars', 'praeditus'] },
      { id: newId(), role: 'Admin', tincture: 'purpure', names: ['Pixel_wars', 'praeditus'] },
      { id: newId(), role: 'Bauleitung', tincture: 'vert', names: ['praeditus'] },
    ],
    news: [],
  };
}

function normalize(raw) {
  const base = defaults();
  return {
    rev: Number(raw.rev) || 0,
    rules: Array.isArray(raw.rules) ? raw.rules : base.rules,
    staff: Array.isArray(raw.staff) ? raw.staff : base.staff,
    news: Array.isArray(raw.news) ? raw.news : [],
  };
}

/** Pinned first, then newest first. */
const sortNews = (news) => [...news].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created - a.created);

function parseRules(body) {
  if (!Array.isArray(body.rules)) throw httpError(400, 'Regeln fehlen');
  const rules = body.rules
    .map((r) => ({ id: keepId(r && r.id), text: cleanText(r && r.text, LIMITS.ruleText) }))
    .filter((r) => r.text);
  if (rules.length > LIMITS.rules) throw httpError(400, `Höchstens ${LIMITS.rules} Regeln.`);
  return rules;
}

function parseStaff(body) {
  if (!Array.isArray(body.staff)) throw httpError(400, 'Staff-Liste fehlt');
  if (body.staff.length > LIMITS.staff) throw httpError(400, `Höchstens ${LIMITS.staff} Rollen.`);
  return body.staff.map((s) => {
    const role = cleanText(s && s.role, LIMITS.role);
    if (!role) throw httpError(400, 'Jede Rolle braucht einen Namen.');
    if (!TINCTURES.includes(s.tincture)) throw httpError(400, `Unbekannte Farbe für „${role}“.`);
    const names = (Array.isArray(s.names) ? s.names : [])
      .map((n) => cleanText(n, LIMITS.name))
      .filter(Boolean)
      .slice(0, LIMITS.names);
    return { id: keepId(s.id), role, tincture: s.tincture, names };
  });
}

/** Validates the fields of a news post; `partial` allows leaving fields out (PATCH). */
function parsePost(body, partial) {
  const out = {};
  if (!partial || 'title' in body) {
    out.title = cleanText(body.title, LIMITS.title);
    if (!out.title) throw httpError(400, 'Titel fehlt');
  }
  if (!partial || 'body' in body) out.body = cleanText(body.body, LIMITS.body);
  if (!partial || 'tag' in body) {
    out.tag = body.tag === undefined ? 'info' : body.tag;
    if (!NEWS_TAGS.includes(out.tag)) throw httpError(400, 'Unbekannte Kategorie');
  }
  if (!partial || 'pinned' in body) out.pinned = body.pinned === true;
  return out;
}

/** @param {string} webRoot @param {{ requireAdmin: (req: any) => string }} auth */
function createContent(webRoot, auth) {
  const store = createJsonStore(path.join(webRoot, 'db', 'content.json'), defaults, normalize);
  const view = () => ({ ...store.state, news: sortNews(store.state.news) });

  function save(res) {
    store.persist();
    send(res, 200, view());
  }

  /** Handles /api/content and /api/content/{rules|staff|news}[/:id]. */
  async function handle(req, res, parts) {
    if (req.method === 'GET' && parts.length === 2) return send(res, 200, view());
    const author = auth.requireAdmin(req);
    const [, , section, id] = parts;
    const s = store.state;

    if (req.method === 'PUT' && section === 'rules' && !id) {
      s.rules = parseRules(await readJson(req));
      return save(res);
    }
    if (req.method === 'PUT' && section === 'staff' && !id) {
      s.staff = parseStaff(await readJson(req));
      return save(res);
    }
    if (section === 'news') {
      if (req.method === 'POST' && !id) {
        if (s.news.length >= LIMITS.news) throw httpError(409, 'Zu viele Beiträge — bitte alte löschen.');
        s.news = [{ id: newId(), ...parsePost(await readJson(req), false), author, created: Date.now(), updated: null }, ...s.news];
        return save(res);
      }
      const index = s.news.findIndex((n) => n.id === id);
      if (req.method === 'PATCH' && id) {
        if (index === -1) throw httpError(404, 'Beitrag nicht gefunden');
        const patch = parsePost(await readJson(req), true);
        s.news = s.news.map((n, i) => (i === index ? { ...n, ...patch, updated: Date.now() } : n));
        return save(res);
      }
      if (req.method === 'DELETE' && id) {
        if (index === -1) return send(res, 200, view());
        s.news = s.news.filter((n) => n.id !== id);
        return save(res);
      }
    }
    return send(res, 404, { error: 'Nicht gefunden' });
  }

  return { handle };
}

module.exports = { createContent, TINCTURES, NEWS_TAGS };
