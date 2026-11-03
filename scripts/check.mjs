// Lint without dependencies: JS syntax, local asset references, inline handlers, and CSS brace balance.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DATA = join(ROOT, 'data');
const SKIP_DIRS = new Set(['db', 'uploads']);
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return SKIP_DIRS.has(name) ? [] : walk(full);
    return [full];
  });
}

const files = [...walk(DATA), ...walk(join(ROOT, 'server')), ...walk(join(ROOT, 'scripts')), ...walk(join(ROOT, 'tests'))];
const rel = (f) => relative(ROOT, f);

for (const file of files.filter((f) => ['.js', '.mjs'].includes(extname(f)))) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (e) {
    problems.push(`${rel(file)}: syntax error\n${e.stderr}`);
  }
  const src = readFileSync(file, 'utf8');
  if (file.startsWith(DATA) && /console\.(log|debug)\(/.test(src)) problems.push(`${rel(file)}: console.log left in client code`);
  for (const m of src.matchAll(/^\s*import\s[^'"]*['"](\.[^'"]+)['"]/gm)) {
    if (!existsSync(resolve(dirname(file), m[1]))) problems.push(`${rel(file)}: missing import ${m[1]}`);
  }
}

for (const file of files.filter((f) => extname(f) === '.css')) {
  const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) problems.push(`${rel(file)}: unbalanced braces (${open} { vs ${close} })`);
}

for (const file of files.filter((f) => extname(f) === '.html')) {
  const src = readFileSync(file, 'utf8');
  if (/\son[a-z]+=["']/i.test(src)) problems.push(`${rel(file)}: inline event handler`);
  for (const m of src.matchAll(/\s(?:src|href)=["']([^"'#:]+?)["']/g)) {
    const target = m[1].split('?')[0];
    if (target.startsWith('/') || target === '') continue;
    if (!existsSync(join(dirname(file), target))) problems.push(`${rel(file)}: missing asset ${target}`);
  }
  for (const m of src.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(m[0])) problems.push(`${rel(file)}: <img> without alt`);
  }
  const ids = [...src.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`${rel(file)}: duplicate ids ${[...new Set(dupes)].join(', ')}`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`check ok (${files.length} files)`);
