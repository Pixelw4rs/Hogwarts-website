// Unit tests for the DOM-free modules behind news, requests, admin and the star atlas.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseRich } from '../data/js/lib/richtext.js';
import { classifyDimension, niceStep, plotPlaces } from '../data/js/lib/atlas.js';
import { createResource } from '../data/js/lib/resource.js';
import { sortRequests, countKinds } from '../data/js/lib/wishes.js';
import { parseHash, toHash } from '../data/js/lib/route.js';
import { MESSAGES } from '../data/js/config.js';

describe('parseRich', () => {
  test('splits paragraphs on blank lines and keeps single line breaks', () => {
    assert.deepEqual(parseRich('Eins\nzwei\n\nDrei'), [[{ text: 'Eins\nzwei' }], [{ text: 'Drei' }]]);
  });
  test('turns [label](href) into links for hashes and http(s) only', () => {
    assert.deepEqual(parseRich('Auf das [Board](#hub/terraforming).'), [[
      { text: 'Auf das ' }, { text: 'Board', href: '#hub/terraforming' }, { text: '.' },
    ]]);
    assert.deepEqual(parseRich('[x](https://map.ardet.de)')[0][0], { text: 'x', href: 'https://map.ardet.de', external: true });
    assert.deepEqual(parseRich('[böse](javascript:alert(1))'), [[{ text: '[böse](javascript:alert(1))' }]]);
  });
  test('empty input gives no paragraphs', () => {
    assert.deepEqual(parseRich(''), []);
    assert.deepEqual(parseRich('  \n\n '), []);
  });
});

describe('atlas', () => {
  test('classifyDimension reads common spellings', () => {
    assert.equal(classifyDimension('Nether'), 'nether');
    assert.equal(classifyDimension('the_end'), 'end');
    assert.equal(classifyDimension('End'), 'end');
    assert.equal(classifyDimension(''), 'overworld');
    assert.equal(classifyDimension('Overworld'), 'overworld');
  });
  test('niceStep rounds to 1, 2 or 5 times a power of ten', () => {
    assert.equal(niceStep(430), 500);
    assert.equal(niceStep(180), 200);
    assert.equal(niceStep(90), 100);
    assert.equal(niceStep(0), 100);
  });
  test('plotPlaces projects X/Z into the chart, nether ×8, and lists the End apart', () => {
    const items = [
      { id: 'a', title: 'Eisenfarm', meta: '312 64 -1180' },
      { id: 'b', title: 'Portal', meta: '40 70 -150 / Nether' },
      { id: 'c', title: 'Endstadt', meta: '1000 60 1000 End' },
      { id: 'd', title: 'Notiz', meta: 'keine Koordinaten' },
    ];
    const { points, unplotted, extent } = plotPlaces(items, { size: 560, margin: 20 });
    assert.deepEqual(points.map((p) => p.id), ['a', 'b']);
    assert.deepEqual(unplotted.map((p) => p.id), ['c', 'd']);
    assert.equal(points[1].wx, 320); // 40 × 8
    assert.equal(points[1].wz, -1200);
    assert.ok(extent >= 1200);
    const center = 280;
    assert.ok(points[0].px > center && points[0].py < center, 'east and north of spawn');
    for (const p of points) assert.ok(p.px >= 20 && p.px <= 540 && p.py >= 20 && p.py <= 540);
  });
  test('an empty list still gives a usable extent', () => {
    const { points, extent, rings } = plotPlaces([], { size: 560, margin: 20 });
    assert.equal(points.length, 0);
    assert.ok(extent > 0);
    assert.ok(rings.length >= 1);
  });
});

function fakeApi(responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body && JSON.parse(init.body) });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return { ok: (next.status ?? 200) < 400, status: next.status ?? 200, json: async () => next.body };
  };
  return { fetchImpl, calls };
}

describe('createResource', () => {
  test('refresh loads data and notifies subscribers', async () => {
    const { fetchImpl } = fakeApi([{ body: { rev: 1, news: [] } }]);
    const res = createResource('/api/content', { fetchImpl });
    const seen = [];
    res.subscribe((s) => seen.push(s.data?.rev ?? null));
    assert.equal(await res.refresh(), true);
    assert.deepEqual(seen, [null, 1]);
  });
  test('send posts JSON to a sub path and keeps the returned state', async () => {
    const { fetchImpl, calls } = fakeApi([{ body: { rev: 2 } }]);
    const res = createResource('/api/content', { fetchImpl });
    const result = await res.send('PUT', '/rules', { rules: [] });
    assert.deepEqual(result, { ok: true, error: '' });
    assert.deepEqual(calls[0], { url: '/api/content/rules', method: 'PUT', body: { rules: [] } });
    assert.equal(res.snapshot.data.rev, 2);
  });
  test('errors keep the old data and surface the server message or the offline text', async () => {
    const { fetchImpl } = fakeApi([{ body: { rev: 1 } }, { status: 401, body: { error: 'Bitte zuerst als Admin anmelden.' } }, new TypeError('offline')]);
    const res = createResource('/api/content', { fetchImpl });
    await res.refresh();
    assert.deepEqual(await res.send('PUT', '/rules', {}), { ok: false, error: 'Bitte zuerst als Admin anmelden.', status: 401 });
    assert.equal(res.snapshot.data.rev, 1);
    assert.equal(await res.refresh(), false);
    assert.equal(res.snapshot.error, MESSAGES.offline);
  });
});

describe('wishes', () => {
  const r = (over) => ({ id: 'x', kind: 'plugin', status: 'open', votes: 0, created: 0, ...over });
  test('sortRequests puts open work first, then by votes, then newest', () => {
    const list = [
      r({ id: 'done', status: 'done', votes: 9 }),
      r({ id: 'low', votes: 1, created: 5 }),
      r({ id: 'high', votes: 4 }),
      r({ id: 'new', votes: 1, created: 9 }),
      r({ id: 'no', status: 'rejected', votes: 20 }),
    ];
    assert.deepEqual(sortRequests(list).map((x) => x.id), ['high', 'new', 'low', 'done', 'no']);
  });
  test('countKinds', () => {
    assert.deepEqual(countKinds([r({}), r({ kind: 'datapack' }), r({})]), { all: 3, plugin: 2, datapack: 1 });
  });
});

describe('routes with sub pages', () => {
  test('map, wishes and admin keep a known sub page', () => {
    assert.deepEqual(parseHash('#map/live'), { view: 'map', board: null, sub: 'live' });
    assert.deepEqual(parseHash('#wuensche/datapack'), { view: 'wuensche', board: null, sub: 'datapack' });
    assert.deepEqual(parseHash('#admin/neuigkeiten'), { view: 'admin', board: null, sub: 'neuigkeiten' });
    assert.deepEqual(parseHash('#admin/nope'), { view: 'admin', board: null, sub: null });
    assert.deepEqual(parseHash('#neuigkeiten'), { view: 'neuigkeiten', board: null, sub: null });
  });
  test('toHash writes the sub page', () => {
    assert.equal(toHash({ view: 'map', sub: 'live' }), '#map/live');
    assert.equal(toHash({ view: 'admin', sub: null }), '#admin');
  });
});
