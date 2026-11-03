// PostToolUse hook: run the dependency-free lint (npm run check) after Claude edits a lintable file.
// Exit 2 feeds the problems back to Claude so it fixes them right away.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const target = input.tool_input?.file_path || '';
if (!['.js', '.mjs', '.css', '.html'].includes(extname(target))) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
try {
  execFileSync(process.execPath, [join(root, 'scripts', 'check.mjs')], { cwd: root, stdio: 'pipe' });
} catch (e) {
  console.error(`npm run check failed after editing ${target}:\n${e.stderr || e.stdout}`);
  process.exit(2);
}
