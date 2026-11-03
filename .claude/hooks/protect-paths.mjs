// PreToolUse hook: refuse edits to secrets and live data.
// .env holds the admin password; data/db/ and data/uploads/ hold real user data that git cannot restore.
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const target = input.tool_input?.file_path;
if (!target) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const rel = relative(root, resolve(root, target)).split('\\').join('/');

const BLOCKED = [
  [/^\.env$/, '.env holds the admin password. Edit it by hand; .env.example is fine to change.'],
  [/^data\/(db|uploads)\//, 'data/db/ and data/uploads/ are live user data, never tracked by git. Change them through the API or by hand.'],
];

for (const [pattern, reason] of BLOCKED) {
  if (pattern.test(rel)) {
    console.error(`Blocked edit to ${rel}: ${reason}`);
    process.exit(2);
  }
}
