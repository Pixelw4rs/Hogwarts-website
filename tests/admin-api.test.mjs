// Contract for the admin login, editable content (rules, staff, news) and public plugin/datapack requests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { json, startServer } from './helpers/server.mjs';

const ADMIN = { ADMIN_USER: 'Pixel_wars', ADMIN_PASSWORD: 'richtig-langes-passwort' };
let ipCounter = 0;
const freshIp = () => ({ 'X-Forwarded-For': `10.1.0.${++ipCounter}` });

/** @returns {Promise<string>} the session cookie pair "ardet_session=…" */
async function login(base, headers = freshIp()) {
  const res = await json(base, 'POST', '/api/auth/login', { username: ADMIN.ADMIN_USER, password: ADMIN.ADMIN_PASSWORD }, headers);
  assert.equal(res.status, 200);
  return res.headers.get('set-cookie').split(';')[0];
}

describe('auth', () => {
  let srv;
  before(async () => { srv = await startServer({ env: ADMIN }); });
  after(() => srv.stop());

  test('me is anonymous by default and reports that admin is configured', async () => {
    const res = await json(srv.base, 'GET', '/api/auth/me');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { user: null, configured: true });
  });

  test('a correct login sets an HttpOnly SameSite=Strict session cookie', async () => {
    const res = await json(srv.base, 'POST', '/api/auth/login', { username: ADMIN.ADMIN_USER, password: ADMIN.ADMIN_PASSWORD }, freshIp());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { user: 'Pixel_wars' });
    const cookie = res.headers.get('set-cookie');
    assert.match(cookie, /^ardet_session=[a-f0-9]{64};/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    const me = await (await json(srv.base, 'GET', '/api/auth/me', undefined, { Cookie: cookie.split(';')[0] })).json();
    assert.equal(me.user, 'Pixel_wars');
  });

  test('a wrong password is rejected without saying which field was wrong', async () => {
    const res = await json(srv.base, 'POST', '/api/auth/login', { username: ADMIN.ADMIN_USER, password: 'falsch' }, freshIp());
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'Benutzername oder Passwort ist falsch.' });
    assert.equal(res.headers.get('set-cookie'), null);
  });

  test('five failed logins from one IP lock further attempts', async () => {
    const h = freshIp();
    for (let i = 0; i < 5; i++) await json(srv.base, 'POST', '/api/auth/login', { username: 'x', password: 'y' }, h);
    const res = await json(srv.base, 'POST', '/api/auth/login', { username: ADMIN.ADMIN_USER, password: ADMIN.ADMIN_PASSWORD }, h);
    assert.equal(res.status, 429);
  });

  test('logout ends the session', async () => {
    const cookie = await login(srv.base);
    const out = await json(srv.base, 'POST', '/api/auth/logout', {}, { Cookie: cookie });
    assert.equal(out.status, 200);
    assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
    const me = await (await json(srv.base, 'GET', '/api/auth/me', undefined, { Cookie: cookie })).json();
    assert.equal(me.user, null);
  });

  test('admin writes from a foreign Origin are refused', async () => {
    const cookie = await login(srv.base);
    const res = await json(srv.base, 'PUT', '/api/content/rules', { rules: [{ text: 'x' }] }, { Cookie: cookie, Origin: 'https://evil.example' });
    assert.equal(res.status, 403);
  });
});

describe('auth hardening', () => {
  test('rotating X-Forwarded-For does not buy unlimited guesses', async () => {
    const srv = await startServer({ env: ADMIN });
    try {
      for (let i = 0; i < 20; i++) await json(srv.base, 'POST', '/api/auth/login', { username: 'x', password: 'y' }, freshIp());
      const res = await json(srv.base, 'POST', '/api/auth/login', { username: ADMIN.ADMIN_USER, password: ADMIN.ADMIN_PASSWORD }, freshIp());
      assert.equal(res.status, 429);
    } finally {
      await srv.stop();
    }
  });

  test('text endpoints refuse bodies over 16 KB', async () => {
    const srv = await startServer({ env: ADMIN });
    try {
      const res = await json(srv.base, 'POST', '/api/requests', { kind: 'plugin', name: 'x', reason: 'y'.repeat(20_000) }, freshIp());
      assert.equal(res.status, 413);
    } finally {
      await srv.stop();
    }
  });
});

describe('auth without configuration', () => {
  test('login answers 503 when no admin password is set', async () => {
    const srv = await startServer();
    try {
      assert.deepEqual(await (await json(srv.base, 'GET', '/api/auth/me')).json(), { user: null, configured: false });
      const res = await json(srv.base, 'POST', '/api/auth/login', { username: 'admin', password: '' }, freshIp());
      assert.equal(res.status, 503);
    } finally {
      await srv.stop();
    }
  });
});

describe('content', () => {
  let srv;
  let cookie;
  before(async () => {
    srv = await startServer({ env: ADMIN });
    cookie = await login(srv.base);
  });
  after(() => srv.stop());
  const admin = () => ({ Cookie: cookie, ...freshIp() });

  test('GET starts with the original rules and staff and no news', async () => {
    const res = await json(srv.base, 'GET', '/api/content');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const c = await res.json();
    assert.equal(c.rules.length, 2);
    assert.match(c.rules[0].text, /Redstone/);
    assert.deepEqual(c.staff.map((s) => s.role), ['Owner', 'Admin', 'Bauleitung']);
    assert.deepEqual(c.staff[2].names, ['praeditus']);
    assert.deepEqual(c.news, []);
  });

  test('writes need a session', async () => {
    assert.equal((await json(srv.base, 'PUT', '/api/content/rules', { rules: [] }, freshIp())).status, 401);
    assert.equal((await json(srv.base, 'POST', '/api/content/news', { title: 'x', body: 'y' }, freshIp())).status, 401);
  });

  test('PUT rules replaces the list in order, trims and drops empty rules', async () => {
    const res = await json(srv.base, 'PUT', '/api/content/rules', { rules: [{ text: '  Eins  ' }, { text: '' }, { text: 'Zwei' }] }, admin());
    assert.equal(res.status, 200);
    const c = await res.json();
    assert.deepEqual(c.rules.map((r) => r.text), ['Eins', 'Zwei']);
    assert.match(c.rules[0].id, /^[a-f0-9]{12}$/);
  });

  test('PUT staff validates the tincture and splits names', async () => {
    const bad = await json(srv.base, 'PUT', '/api/content/staff', { staff: [{ role: 'Owner', tincture: 'pink', names: ['a'] }] }, admin());
    assert.equal(bad.status, 400);
    const res = await json(srv.base, 'PUT', '/api/content/staff', { staff: [{ role: ' Owner ', tincture: 'gules', names: [' Pixel_wars ', '', 'praeditus'] }] }, admin());
    const c = await res.json();
    assert.deepEqual(c.staff.map(({ role, tincture, names }) => ({ role, tincture, names })), [{ role: 'Owner', tincture: 'gules', names: ['Pixel_wars', 'praeditus'] }]);
  });

  test('news can be created, edited and deleted; pinned posts sort first', async () => {
    const h = admin();
    const first = await (await json(srv.base, 'POST', '/api/content/news', { title: 'Wartung', body: 'Heute Abend.', tag: 'wartung' }, h)).json();
    const second = await (await json(srv.base, 'POST', '/api/content/news', { title: 'Event', body: 'Bauwettbewerb', tag: 'event', pinned: true }, h)).json();
    assert.deepEqual(second.news.map((n) => n.title), ['Event', 'Wartung']);
    const post = first.news[0];
    assert.equal(post.author, 'Pixel_wars');
    assert.equal(typeof post.created, 'number');

    const edited = await (await json(srv.base, 'PATCH', `/api/content/news/${post.id}`, { title: 'Wartung verschoben', pinned: false }, h)).json();
    const found = edited.news.find((n) => n.id === post.id);
    assert.equal(found.title, 'Wartung verschoben');
    assert.equal(typeof found.updated, 'number');

    const gone = await (await json(srv.base, 'DELETE', `/api/content/news/${post.id}`, undefined, h)).json();
    assert.equal(gone.news.some((n) => n.id === post.id), false);
  });

  test('news needs a title and a known tag', async () => {
    assert.equal((await json(srv.base, 'POST', '/api/content/news', { title: ' ', body: 'x' }, admin())).status, 400);
    assert.equal((await json(srv.base, 'POST', '/api/content/news', { title: 'x', body: 'y', tag: 'spam' }, admin())).status, 400);
  });

  test('content is persisted to db/content.json', async () => {
    await json(srv.base, 'PUT', '/api/content/rules', { rules: [{ text: 'gespeichert' }] }, admin());
    const disk = JSON.parse(readFileSync(join(srv.webRoot, 'db', 'content.json'), 'utf8'));
    assert.equal(disk.rules[0].text, 'gespeichert');
  });
});

describe('requests', () => {
  let srv;
  let cookie;
  before(async () => {
    srv = await startServer({ env: ADMIN });
    cookie = await login(srv.base);
  });
  after(() => srv.stop());

  test('anyone can submit a plugin or datapack request', async () => {
    const res = await json(srv.base, 'POST', '/api/requests', { kind: 'plugin', name: ' WorldEdit ', link: 'https://modrinth.com/plugin/worldedit', reason: 'Schneller bauen', by: 'Steve' }, freshIp());
    assert.equal(res.status, 200);
    const { requests } = await res.json();
    const r = requests[0];
    assert.equal(r.name, 'WorldEdit');
    assert.equal(r.status, 'open');
    assert.equal(r.votes, 0);
    assert.equal(r.voted, false);
    assert.equal('voters' in r, false);
  });

  test('invalid requests are rejected with German errors', async () => {
    const noName = await json(srv.base, 'POST', '/api/requests', { kind: 'plugin', name: '' }, freshIp());
    assert.equal(noName.status, 400);
    assert.deepEqual(await noName.json(), { error: 'Name fehlt' });
    assert.equal((await json(srv.base, 'POST', '/api/requests', { kind: 'mod', name: 'x' }, freshIp())).status, 400);
    const badLink = await json(srv.base, 'POST', '/api/requests', { kind: 'datapack', name: 'x', link: 'javascript:alert(1)' }, freshIp());
    assert.equal(badLink.status, 400);
  });

  test('a visitor can vote once and take the vote back', async () => {
    const created = await (await json(srv.base, 'POST', '/api/requests', { kind: 'datapack', name: 'Vanilla Tweaks' }, freshIp())).json();
    const id = created.requests.find((r) => r.name === 'Vanilla Tweaks').id;
    const h = freshIp();
    const first = await json(srv.base, 'POST', `/api/requests/${id}/vote`, { vote: true }, h);
    const voter = first.headers.get('set-cookie').split(';')[0];
    assert.match(voter, /^ardet_voter=[a-f0-9]{32}$/);
    const again = await (await json(srv.base, 'POST', `/api/requests/${id}/vote`, { vote: true }, { ...h, Cookie: voter })).json();
    const r = again.requests.find((x) => x.id === id);
    assert.equal(r.votes, 1);
    assert.equal(r.voted, true);
    const undone = await (await json(srv.base, 'POST', `/api/requests/${id}/vote`, { vote: false }, { ...h, Cookie: voter })).json();
    assert.equal(undone.requests.find((x) => x.id === id).votes, 0);
  });

  test('only an admin can change status or delete', async () => {
    const created = await (await json(srv.base, 'POST', '/api/requests', { kind: 'plugin', name: 'CoreProtect' }, freshIp())).json();
    const id = created.requests.find((r) => r.name === 'CoreProtect').id;
    assert.equal((await json(srv.base, 'PATCH', `/api/requests/${id}`, { status: 'done' }, freshIp())).status, 401);
    const h = { Cookie: cookie, ...freshIp() };
    assert.equal((await json(srv.base, 'PATCH', `/api/requests/${id}`, { status: 'weird' }, h)).status, 400);
    const ok = await (await json(srv.base, 'PATCH', `/api/requests/${id}`, { status: 'accepted', note: 'Kommt am Wochenende' }, h)).json();
    const r = ok.requests.find((x) => x.id === id);
    assert.equal(r.status, 'accepted');
    assert.equal(r.note, 'Kommt am Wochenende');
    const gone = await (await json(srv.base, 'DELETE', `/api/requests/${id}`, undefined, h)).json();
    assert.equal(gone.requests.some((x) => x.id === id), false);
  });

  test('more than five new requests in ten minutes from one IP are refused', async () => {
    const h = freshIp();
    let last;
    for (let i = 0; i < 6; i++) last = await json(srv.base, 'POST', '/api/requests', { kind: 'plugin', name: `p${i}` }, h);
    assert.equal(last.status, 429);
  });
});

describe('boards stay public', () => {
  test('boards keep working without any admin configuration', async () => {
    const srv = await startServer();
    try {
      const res = await json(srv.base, 'POST', '/api/boards/build/items', { title: 'ohne Login' }, freshIp());
      assert.equal(res.status, 200);
    } finally {
      await srv.stop();
    }
  });
});
