// STATIC_ROOT: the built React site is served from its own folder while uploads and the database
// stay in WEB_ROOT. Without STATIC_ROOT the server serves data/ exactly as before.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { startServer } from './helpers/server.mjs';

describe('STATIC_ROOT', () => {
  let srv;
  let site;
  before(async () => {
    site = mkdtempSync(join(tmpdir(), 'ardet-site-'));
    mkdirSync(join(site, 'assets'));
    writeFileSync(join(site, 'index.html'), '<!doctype html><title>built</title>');
    writeFileSync(join(site, 'assets', 'app-1a2b.js'), 'export {};');
    srv = await startServer({ env: { STATIC_ROOT: site } });
    mkdirSync(join(srv.webRoot, 'uploads', 'build'), { recursive: true });
    writeFileSync(join(srv.webRoot, 'uploads', 'build', 'abc123.png'), 'png');
  });
  after(async () => { await srv.stop(); rmSync(site, { recursive: true, force: true }); });

  test('pages and assets come from STATIC_ROOT', async () => {
    const page = await fetch(`${srv.base}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<title>built<\/title>/);
    const js = await fetch(`${srv.base}/assets/app-1a2b.js`);
    assert.equal(js.status, 200);
    assert.equal(js.headers.get('content-type'), 'text/javascript; charset=utf-8');
  });

  test('uploads are still served from WEB_ROOT', async () => {
    const res = await fetch(`${srv.base}/uploads/build/abc123.png`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'png');
  });

  test('the old client files in WEB_ROOT are no longer served', async () => {
    assert.equal((await fetch(`${srv.base}/js/main.js`)).status, 404);
  });

  test('the database stays private and paths cannot escape', async () => {
    assert.equal((await fetch(`${srv.base}/db/boards.json`)).status, 404);
    assert.equal((await fetch(`${srv.base}/uploads/../db/boards.json`)).status, 404);
    assert.equal((await fetch(`${srv.base}/%2e%2e/etc/passwd`)).status, 404);
  });

  test('the API keeps working', async () => {
    assert.equal((await fetch(`${srv.base}/api/boards`)).status, 200);
  });
});
