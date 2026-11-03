// Unit tests for the DOM-free client modules in data/js.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { countItems, filterItems, formatBytes, parseCoordinates, recentItems, timeAgo } from '../data/js/lib/format.js';
import { ERROR_STATUS, interpretStatus } from '../data/js/lib/status.js';
import { parseHash, toHash } from '../data/js/lib/route.js';
import { createHubStore } from '../data/js/hub/store.js';
import { MESSAGES } from '../data/js/config.js';

const item = (over = {}) => ({ id: 'a1', title: 'T', meta: '', image: null, done: false, created: 0, ...over });

describe('parseCoordinates', () => {
  test('reads space, comma and slash separated forms', () => {
    assert.deepEqual(parseCoordinates('312 64 -1180 Overworld'), { x: 312, y: 64, z: -1180, dimension: 'Overworld', text: '312 64 -1180' });
    assert.deepEqual(parseCoordinates('40, 70, -150 / Nether'), { x: 40, y: 70, z: -150, dimension: 'Nether', text: '40 70 -150' });
    assert.equal(parseCoordinates('-88 142 36').dimension, '');
  });
  test('returns null without three numbers', () => {
    assert.equal(parseCoordinates('bei der Mühle'), null);
    assert.equal(parseCoordinates(''), null);
    assert.equal(parseCoordinates(undefined), null);
  });
});

describe('board helpers', () => {
  test('countItems splits open and done', () => {
    assert.deepEqual(countItems([item(), item({ done: true }), item()]), { open: 2, done: 1, total: 3 });
    assert.deepEqual(countItems([]), { open: 0, done: 0, total: 0 });
  });
  test('filterItems matches title or meta, case-insensitive, and passes through empty query', () => {
    const items = [item({ title: 'Dachdetails' }), item({ title: 'Brücke', meta: 'praeditus' })];
    assert.equal(filterItems(items, 'DACH').length, 1);
    assert.equal(filterItems(items, 'Praeditus')[0].title, 'Brücke');
    assert.equal(filterItems(items, '   '), items);
  });
  test('recentItems merges boards newest first and tags board', () => {
    const r = recentItems({ build: [item({ id: 'b', created: 5 })], map: [item({ id: 'm', created: 9 })] }, 1);
    assert.deepEqual(r.map((i) => [i.id, i.board]), [['m', 'map']]);
  });
  test('timeAgo uses German relative time, then a date after a week', () => {
    const now = Date.UTC(2026, 10, 2, 12);
    assert.equal(timeAgo(now - 10_000, now), 'gerade eben');
    assert.equal(timeAgo(now - 5 * 60_000, now), 'vor 5 Minuten');
    assert.equal(timeAgo(now - 86_400_000, now), 'gestern');
    assert.match(timeAgo(now - 30 * 86_400_000, now), /^\d{2}\.\d{2}\.2026$/);
  });
  test('formatBytes', () => {
    assert.equal(formatBytes(500), '500 B');
    assert.equal(formatBytes(2048), '2 KB');
    assert.equal(formatBytes(3.5 * 1024 * 1024), '3,5 MB');
  });
});

describe('interpretStatus', () => {
  test('online with players and version', () => {
    assert.deepEqual(interpretStatus({ online: true, players: { online: 7, max: 20 }, version: '1.21.4' }),
      { state: 'online', label: 'Online', players: '7 / 20', version: '1.21.4' });
  });
  test('online with missing fields falls back to dashes', () => {
    const s = interpretStatus({ online: true });
    assert.equal(s.players, '— / —');
    assert.equal(s.version, '—');
  });
  test('offline and garbage', () => {
    assert.equal(interpretStatus({ online: false }).label, 'Offline');
    assert.equal(interpretStatus(null), ERROR_STATUS);
  });
});

describe('routes', () => {
  test('parses known views and hub boards', () => {
    assert.deepEqual(parseHash('#hub/design'), { view: 'hub', board: 'design', sub: null });
    assert.deepEqual(parseHash('#regeln'), { view: 'regeln', board: null, sub: null });
    assert.deepEqual(parseHash('#map/design'), { view: 'map', board: null, sub: null });
  });
  test('unknown or empty hash falls back to start', () => {
    assert.deepEqual(parseHash(''), { view: 'start', board: null, sub: null });
    assert.deepEqual(parseHash('#nope'), { view: 'start', board: null, sub: null });
    assert.deepEqual(parseHash('#hub/nope'), { view: 'hub', board: null, sub: null });
  });
  test('toHash round-trips', () => {
    assert.equal(toHash({ view: 'hub', board: 'map' }), '#hub/map');
    assert.equal(toHash({ view: 'staff', board: null }), '#staff');
  });
});

function fakeApi(responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body && JSON.parse(init.body) });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return { ok: next.status === undefined || next.status < 400, status: next.status ?? 200, json: async () => next.body };
  };
  return { fetchImpl, calls };
}
const state = (rev, boards = {}) => ({ rev, boards: { build: [], ...boards } });

describe('hub store', () => {
  test('refresh applies new state and records lastSync', async () => {
    const { fetchImpl } = fakeApi([{ body: state(3, { build: [item()] }) }]);
    const store = createHubStore({ fetchImpl, now: () => 42 });
    assert.equal(await store.refresh(), true);
    assert.equal(store.snapshot.rev, 3);
    assert.equal(store.snapshot.lastSync, 42);
  });

  test('refresh with an unchanged rev does not notify subscribers', async () => {
    const { fetchImpl } = fakeApi([{ body: state(1) }, { body: state(1) }]);
    const store = createHubStore({ fetchImpl });
    let calls = 0;
    store.subscribe(() => calls++);
    await store.refresh();
    await store.refresh();
    assert.equal(calls, 2); // initial subscribe + first change only
  });

  test('network failure shows the offline message; server error shows its text', async () => {
    const { fetchImpl } = fakeApi([new TypeError('fetch failed'), { status: 400, body: { error: 'Titel fehlt' } }]);
    const store = createHubStore({ fetchImpl });
    await store.refresh();
    assert.equal(store.snapshot.error, MESSAGES.offline);
    assert.equal(await store.add('build', { title: '', meta: '', image: null }), false);
    assert.equal(store.snapshot.error, 'Titel fehlt');
  });

  test('a success clears a previous error', async () => {
    const { fetchImpl } = fakeApi([new TypeError('x'), { body: state(2) }]);
    const store = createHubStore({ fetchImpl });
    await store.refresh();
    await store.refresh();
    assert.equal(store.snapshot.error, '');
  });

  test('add, toggle and delete hit the documented endpoints', async () => {
    const { fetchImpl, calls } = fakeApi([{ body: state(1) }, { body: state(2) }, { body: state(3) }]);
    const store = createHubStore({ fetchImpl, baseUrl: '/api/boards' });
    await store.add('build', { title: 'A', meta: 'b', image: null });
    await store.toggle('build', 'abc', true);
    store.scheduleDelete('build', 'abc', 10_000);
    await store.commitDelete('build', 'abc');
    assert.deepEqual(calls.map((c) => [c.method, c.url]), [
      ['POST', '/api/boards/build/items'],
      ['PATCH', '/api/boards/build/items/abc'],
      ['DELETE', '/api/boards/build/items/abc'],
    ]);
    assert.deepEqual(calls[0].body, { title: 'A', meta: 'b', image: null });
    assert.deepEqual(calls[1].body, { done: true });
  });

  test('scheduled delete hides the item, undo restores it without a request', async () => {
    const { fetchImpl, calls } = fakeApi([{ body: state(1, { build: [item({ id: 'x' })] }) }]);
    const store = createHubStore({ fetchImpl });
    await store.refresh();
    const { undo } = store.scheduleDelete('build', 'x', 10_000);
    assert.equal(store.visibleItems('build').length, 0);
    undo();
    assert.equal(store.visibleItems('build').length, 1);
    assert.equal(calls.length, 1);
  });

  test('scheduled delete fires after the delay', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const { fetchImpl, calls } = fakeApi([{ body: state(1) }]);
    const store = createHubStore({ fetchImpl });
    store.scheduleDelete('build', 'x', 5000);
    t.mock.timers.tick(5000);
    await new Promise((r) => setImmediate(r));
    assert.equal(calls[0].method, 'DELETE');
  });

  test('flushDeletes sends all pending deletes immediately', async () => {
    const { fetchImpl, calls } = fakeApi([{ body: state(1) }, { body: state(2) }]);
    const store = createHubStore({ fetchImpl });
    store.scheduleDelete('build', 'a', 60_000);
    store.scheduleDelete('map', 'b', 60_000);
    await store.flushDeletes();
    assert.equal(calls.filter((c) => c.method === 'DELETE').length, 2);
    assert.equal(store.snapshot.pending.size, 0);
  });
});
