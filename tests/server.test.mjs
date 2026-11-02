// Locks the backend contract documented in FEATURES.md. The redesign must not change any of this.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { PNG_DATA_URL, json, startServer } from './helpers/server.mjs';

const BOARDS = ['build', 'design', 'terraforming', 'complex', 'map'];
let ipCounter = 0;
const freshIp = () => ({ 'X-Forwarded-For': `10.0.0.${++ipCounter}` });

describe('boards API', () => {
  let srv;
  before(async () => { srv = await startServer(); });
  after(() => srv.stop());

  test('GET /api/boards returns rev and all five boards', async () => {
    const res = await json(srv.base, 'GET', '/api/boards');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const state = await res.json();
    assert.equal(typeof state.rev, 'number');
    assert.deepEqual(Object.keys(state.boards).sort(), [...BOARDS].sort());
  });

  test('POST adds a trimmed item at the top and bumps rev', async () => {
    const h = freshIp();
    const before = await (await json(srv.base, 'GET', '/api/boards')).json();
    await json(srv.base, 'POST', '/api/boards/build/items', { title: 'first', meta: '' }, h);
    const res = await json(srv.base, 'POST', '/api/boards/build/items', { title: '  Dachdetails  ', meta: ' praeditus ' }, h);
    assert.equal(res.status, 200);
    const state = await res.json();
    assert.equal(state.rev, before.rev + 2);
    const [top] = state.boards.build;
    assert.equal(top.title, 'Dachdetails');
    assert.equal(top.meta, 'praeditus');
    assert.equal(top.done, false);
    assert.equal(top.image, null);
    assert.match(top.id, /^[a-f0-9]{12}$/);
    assert.equal(typeof top.created, 'number');
  });

  test('POST truncates title to 200 and meta to 100 chars', async () => {
    const res = await json(srv.base, 'POST', '/api/boards/design/items', { title: 'x'.repeat(300), meta: 'y'.repeat(150) }, freshIp());
    const [top] = (await res.json()).boards.design;
    assert.equal(top.title.length, 200);
    assert.equal(top.meta.length, 100);
  });

  test('POST without a title is rejected with a German error', async () => {
    const res = await json(srv.base, 'POST', '/api/boards/build/items', { title: '   ' }, freshIp());
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Titel fehlt' });
  });

  test('unknown board or path returns 404', async () => {
    assert.equal((await json(srv.base, 'POST', '/api/boards/nope/items', { title: 'a' }, freshIp())).status, 404);
    assert.equal((await json(srv.base, 'GET', '/api/other')).status, 404);
  });

  test('unsupported method returns 405', async () => {
    assert.equal((await json(srv.base, 'PUT', '/api/boards/build/items', { title: 'a' })).status, 405);
  });

  test('invalid JSON returns 400', async () => {
    const res = await fetch(srv.base + '/api/boards/build/items', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...freshIp() }, body: '{nope',
    });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Ungültige Anfrage' });
  });

  test('PATCH toggles done; unknown id is 404', async () => {
    const h = freshIp();
    const created = await (await json(srv.base, 'POST', '/api/boards/terraforming/items', { title: 'Hügel' }, h)).json();
    const id = created.boards.terraforming[0].id;
    const res = await json(srv.base, 'PATCH', `/api/boards/terraforming/items/${id}`, { done: true }, h);
    assert.equal((await res.json()).boards.terraforming.find((i) => i.id === id).done, true);
    const ignored = await json(srv.base, 'PATCH', `/api/boards/terraforming/items/${id}`, { done: 'yes' }, h);
    assert.equal((await ignored.json()).boards.terraforming.find((i) => i.id === id).done, true);
    assert.equal((await json(srv.base, 'PATCH', '/api/boards/terraforming/items/ffffffffffff', { done: true }, h)).status, 404);
  });

  test('DELETE removes the item and is idempotent', async () => {
    const h = freshIp();
    const created = await (await json(srv.base, 'POST', '/api/boards/complex/items', { title: 'Ecke' }, h)).json();
    const id = created.boards.complex[0].id;
    const res = await json(srv.base, 'DELETE', `/api/boards/complex/items/${id}`, undefined, h);
    assert.equal((await res.json()).boards.complex.some((i) => i.id === id), false);
    assert.equal((await json(srv.base, 'DELETE', `/api/boards/complex/items/${id}`, undefined, h)).status, 200);
  });

  test('image upload is stored under /uploads/<board>/ and removed on delete', async () => {
    const h = freshIp();
    const state = await (await json(srv.base, 'POST', '/api/boards/map/items', { title: 'Eisenfarm', meta: '312 64 -1180', image: PNG_DATA_URL }, h)).json();
    const item = state.boards.map[0];
    assert.match(item.image, /^\/uploads\/map\/[a-f0-9]{12}\.png$/);
    const img = await fetch(srv.base + item.image);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get('content-type'), 'image/png');
    await json(srv.base, 'DELETE', `/api/boards/map/items/${item.id}`, undefined, h);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(existsSync(join(srv.webRoot, item.image.slice(1))), false);
  });

  test('non-image data URL is rejected', async () => {
    const res = await json(srv.base, 'POST', '/api/boards/map/items', { title: 'x', image: 'data:text/html;base64,PGI+' }, freshIp());
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Ungültiges Bildformat' });
  });

  test('writes are persisted atomically to db/boards.json', async () => {
    const h = freshIp();
    const state = await (await json(srv.base, 'POST', '/api/boards/build/items', { title: 'persist me' }, h)).json();
    const disk = JSON.parse(readFileSync(join(srv.webRoot, 'db', 'boards.json'), 'utf8'));
    assert.equal(disk.rev, state.rev);
    assert.equal(disk.boards.build[0].title, 'persist me');
    assert.equal(readdirSync(join(srv.webRoot, 'db')).includes('boards.json.tmp'), false);
  });

  test('more than 60 writes per minute from one IP returns 429', async () => {
    const h = freshIp();
    let last;
    for (let i = 0; i < 61; i++) last = await json(srv.base, 'POST', '/api/boards/nope/items', { title: 'a' }, h);
    assert.equal(last.status, 429);
    assert.deepEqual(await last.json(), { error: 'Zu viele Änderungen — kurz warten.' });
  });
});

describe('static files', () => {
  let srv;
  before(async () => { srv = await startServer(); });
  after(() => srv.stop());

  test('/ serves index.html with no-cache', async () => {
    const res = await fetch(srv.base + '/');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.equal(res.headers.get('cache-control'), 'no-cache');
  });

  test('css and js are revalidated on every load so deploys never mix versions', async () => {
    const css = await fetch(srv.base + '/css/tokens.css');
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type'), /text\/css/);
    assert.equal(css.headers.get('cache-control'), 'no-cache');
    const js = await fetch(srv.base + '/js/main.js');
    assert.match(js.headers.get('content-type'), /text\/javascript/);
    assert.equal(js.headers.get('cache-control'), 'no-cache');
  });

  test('images keep the 1h cache', async () => {
    const img = await fetch(srv.base + '/favicon.png');
    assert.equal(img.headers.get('cache-control'), 'public, max-age=3600');
  });

  test('db folder, dotfiles and traversal are blocked', async () => {
    assert.equal((await fetch(srv.base + '/db/boards.json')).status, 404);
    assert.equal((await fetch(srv.base + '/.secret')).status, 404);
    assert.equal((await fetch(srv.base + '/%2e%2e/server/server.js')).status, 404);
  });
});

describe('storage recovery', () => {
  test('corrupt boards.json is backed up and the server starts empty', async () => {
    const srv = await startServer({ seed: '{not json' });
    try {
      const state = await (await json(srv.base, 'GET', '/api/boards')).json();
      assert.equal(state.rev, 0);
      assert.ok(readdirSync(join(srv.webRoot, 'db')).some((f) => f.startsWith('boards.json.corrupt-')));
    } finally {
      await srv.stop();
    }
  });
});
