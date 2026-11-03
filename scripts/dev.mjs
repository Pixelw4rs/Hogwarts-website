// Runs the production server against ./data on http://localhost:8080 (PORT overrides).
// Reads ./.env (ADMIN_USER, ADMIN_PASSWORD …) when present; real environment variables win.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_FILE = join(ROOT, '.env');
const QUOTED = /^(['"])(.*)\1$/;

/** @returns {Record<string, string>} KEY=value lines; # comments and blank lines ignored */
function readEnvFile() {
  if (!existsSync(ENV_FILE)) return {};
  const pairs = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(QUOTED, '$2')];
    });
  return Object.fromEntries(pairs);
}

const child = spawn(process.execPath, [join(ROOT, 'server', 'server.js')], {
  env: { ...readEnvFile(), ...process.env, PORT: process.env.PORT || '8080', WEB_ROOT: join(ROOT, 'data') },
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
