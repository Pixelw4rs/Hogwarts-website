'use strict';
// Tiny dependency-free server: serves ./data as the website, stores the Community Hub
// boards in data/db/boards.json (shared by everyone), plus editable content, the
// plugin/datapack wish list and the admin login (see auth.js, content.js, requests.js).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { send, readJson, clientIp, createLimiter } = require('./http-utils');
const { createAuth } = require('./auth');
const { createContent } = require('./content');
const { createRequests } = require('./requests');

const PORT = Number(process.env.PORT) || 8080;
const WEB_ROOT = path.resolve(process.env.WEB_ROOT || '/data');
const DB_DIR = path.join(WEB_ROOT, 'db');
const DB_FILE = path.join(DB_DIR, 'boards.json');

const BOARDS = ['build', 'design', 'terraforming', 'complex', 'map'];
const MAX_ITEMS = 500, MAX_TITLE = 200, MAX_META = 100;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB decoded
const IMAGE_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

fs.mkdirSync(DB_DIR, { recursive: true });

// ---------- storage ----------
function load() {
  let s = { rev: 0, boards: {} };
  if (fs.existsSync(DB_FILE)) {
    try {
      s = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      const bak = DB_FILE + '.corrupt-' + Date.now();
      fs.copyFileSync(DB_FILE, bak);
      console.error('boards.json unreadable, backed up to', bak);
      s = { rev: 0, boards: {} };
    }
  }
  s.rev = Number(s.rev) || 0;
  s.boards = s.boards || {};
  for (const b of BOARDS) if (!Array.isArray(s.boards[b])) s.boards[b] = [];
  return s;
}
let state = load();

function persist() {
  state.rev++;
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, DB_FILE); // atomic replace
}

// ---------- helpers ----------
// simple write rate limit for the boards: 60 changes / minute / IP
const boardWrites = createLimiter(60, 60000);
const limited = (ip) => boardWrites.hit(ip);

const auth = createAuth();
const content = createContent(WEB_ROOT, auth);
const requests = createRequests(WEB_ROOT, auth);

// ---------- image uploads ----------
// Accepts a data: URL (what FileReader.readAsDataURL produces in the browser),
// decodes it and writes it under data/uploads/<board>/<id>.<ext>.
function saveImage(board, id, dataUrl) {
  const m = /^data:(image\/(?:png|jpeg|gif|webp));base64,([a-zA-Z0-9+/]+=*)$/.exec(dataUrl || '');
  if (!m) throw Object.assign(new Error('Ungültiges Bildformat'), { status: 400 });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length === 0) throw Object.assign(new Error('Ungültiges Bildformat'), { status: 400 });
  if (buf.length > MAX_IMAGE_BYTES) throw Object.assign(new Error('Bild zu groß (max. 4 MB)'), { status: 413 });
  const ext = IMAGE_EXT[m[1]];
  const dir = path.join(WEB_ROOT, 'uploads', board);
  fs.mkdirSync(dir, { recursive: true });
  const file = id + '.' + ext;
  fs.writeFileSync(path.join(dir, file), buf);
  return '/uploads/' + board + '/' + file;
}
function deleteImage(imagePath) {
  if (!imagePath) return;
  // only ever remove files we ourselves served under /uploads/
  if (!/^\/uploads\/[a-z]+\/[a-f0-9]+\.(png|jpg|gif|webp)$/.test(imagePath)) return;
  fs.unlink(path.join(WEB_ROOT, imagePath.slice(1)), () => {});
}

// ---------- API ----------
async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // api, boards, :board, items, :id
  if (parts[1] === 'auth') return auth.handle(req, res, parts);
  if (parts[1] === 'content') return content.handle(req, res, parts);
  if (parts[1] === 'requests') return requests.handle(req, res, parts);
  if (parts[1] !== 'boards') return send(res, 404, { error: 'Nicht gefunden' });

  if (req.method === 'GET' && parts.length === 2) return send(res, 200, state);

  if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Methode nicht erlaubt' });
  if (limited(clientIp(req))) return send(res, 429, { error: 'Zu viele Änderungen — kurz warten.' });

  const board = parts[2];
  if (!BOARDS.includes(board) || parts[3] !== 'items') return send(res, 404, { error: 'Nicht gefunden' });
  const list = state.boards[board];
  const id = parts[4];

  if (req.method === 'POST' && parts.length === 4) {
    const body = await readJson(req);
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, MAX_TITLE) : '';
    const meta = typeof body.meta === 'string' ? body.meta.trim().slice(0, MAX_META) : '';
    if (!title) return send(res, 400, { error: 'Titel fehlt' });
    if (list.length >= MAX_ITEMS) return send(res, 409, { error: 'Dieses Board ist voll.' });
    const id = crypto.randomBytes(6).toString('hex');
    let image = null;
    if (typeof body.image === 'string' && body.image) image = saveImage(board, id, body.image);
    list.unshift({ id, title, meta, image, done: false, created: Date.now() });
    persist();
    return send(res, 200, state);
  }

  if (req.method === 'PATCH' && parts.length === 5) {
    const item = list.find(i => i.id === id);
    if (!item) return send(res, 404, { error: 'Eintrag nicht gefunden' });
    const body = await readJson(req);
    if (typeof body.done === 'boolean') item.done = body.done;
    persist();
    return send(res, 200, state);
  }

  if (req.method === 'DELETE' && parts.length === 5) {
    const i = list.findIndex(x => x.id === id);
    if (i !== -1) {
      const [removed] = list.splice(i, 1);
      deleteImage(removed.image);
      persist();
    }
    return send(res, 200, state);
  }

  return send(res, 404, { error: 'Nicht gefunden' });
}

// ---------- static files ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg', '.pdf': 'application/pdf',
};

function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let p;
  try { p = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (p.endsWith('/')) p += 'index.html';
  const full = path.join(WEB_ROOT, p);
  const rel = path.relative(WEB_ROOT, full);
  const segs = rel.split(path.sep);
  // no path escapes, no hidden files, and never expose the database folder
  if (rel.startsWith('..') || path.isAbsolute(rel) || segs[0] === 'db' || segs.some(s => s.startsWith('.'))) {
    res.writeHead(404); return res.end('Not found');
  }
  fs.stat(full, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': ['.html', '.css', '.js'].includes(ext) ? 'no-cache' : 'public, max-age=3600',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(full).pipe(res);
  });
}

// ---------- server ----------
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    serveStatic(req, res, url);
  } catch (e) {
    if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'Serverfehler' });
    else res.end();
    if (!e.status) console.error(e);
  }
}).listen(PORT, '0.0.0.0', () => console.log(`Hogwarts site on :${PORT}, root ${WEB_ROOT}`));
