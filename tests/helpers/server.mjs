// Starts server/server.js on a free port against a throwaway copy of data/.
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = resolve(import.meta.dirname, '..', '..');
const DATA = join(ROOT, 'data');
const STARTUP_TIMEOUT_MS = 5000;
const SKIP = [join(DATA, 'db') + sep, join(DATA, 'uploads') + sep];

function freePort() {
  return new Promise((ok, fail) => {
    const srv = createServer();
    srv.once('error', fail);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => ok(port));
    });
  });
}

export async function startServer({ seed, env = {} } = {}) {
  const webRoot = mkdtempSync(join(tmpdir(), 'ardet-'));
  cpSync(DATA, webRoot, { recursive: true, filter: (src) => !SKIP.some((p) => (src + sep).startsWith(p)) });
  if (seed !== undefined) {
    mkdirSync(join(webRoot, 'db'), { recursive: true });
    writeFileSync(join(webRoot, 'db', 'boards.json'), typeof seed === 'string' ? seed : JSON.stringify(seed));
  }
  const port = await freePort();
  const child = spawn(process.execPath, [join(ROOT, 'server', 'server.js')], {
    env: { ...process.env, ADMIN_USER: '', ADMIN_PASSWORD: '', ...env, PORT: String(port), WEB_ROOT: webRoot },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (c) => { stderr += c; });

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  for (;;) {
    try {
      await fetch(`${base}/api/boards`);
      break;
    } catch {
      if (Date.now() > deadline) throw new Error(`server did not start: ${stderr}`);
      await delay(50);
    }
  }

  return {
    base,
    webRoot,
    get stderr() { return stderr; },
    async stop() {
      const exited = new Promise((r) => child.once('exit', r));
      child.kill();
      await exited;
      rmSync(webRoot, { recursive: true, force: true });
    },
  };
}

export function json(base, method, path, body, headers = {}) {
  return fetch(base + path, {
    method,
    headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// 1x1 transparent PNG
export const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
