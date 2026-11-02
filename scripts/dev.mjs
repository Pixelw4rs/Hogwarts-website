// Runs the production server against ./data on http://localhost:8080 (PORT overrides).
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const child = spawn(process.execPath, [join(ROOT, 'server', 'server.js')], {
  env: { ...process.env, PORT: process.env.PORT || '8080', WEB_ROOT: join(ROOT, 'data') },
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
