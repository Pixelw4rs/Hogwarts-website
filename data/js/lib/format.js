// Pure helpers (no DOM) so they run in Node tests as well as the browser.

/** @typedef {{ id: string, title: string, meta: string, image: string|null, done: boolean, created: number }} Item */
/** @typedef {{ x: number, y: number, z: number, dimension: string, text: string }} Coordinates */

const COORDS_RE = /(-?\d+)\s*[,;\s]\s*(-?\d+)\s*[,;\s]\s*(-?\d+)/;
const relative = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const UNITS = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];
const RELATIVE_MAX_DAYS = 7;

/**
 * Pull "X Y Z" plus an optional dimension out of free text like "312 64 -1180 / Nether".
 * @param {string} meta
 * @returns {Coordinates|null}
 */
export function parseCoordinates(meta) {
  const m = COORDS_RE.exec(meta || '');
  if (!m) return null;
  const [x, y, z] = [m[1], m[2], m[3]].map(Number);
  const dimension = (meta.slice(0, m.index) + meta.slice(m.index + m[0].length))
    .replace(/^[\s/,;:|–—-]+|[\s/,;:|–—-]+$/g, '')
    .trim();
  return { x, y, z, dimension, text: `${x} ${y} ${z}` };
}

/**
 * @param {readonly Item[]} items
 * @returns {{ open: number, done: number, total: number }}
 */
export function countItems(items) {
  const done = items.filter((i) => i.done).length;
  return { open: items.length - done, done, total: items.length };
}

/**
 * Case-insensitive match on title and meta. Empty query returns the input.
 * @param {readonly Item[]} items
 * @param {string} query
 * @returns {readonly Item[]}
 */
export function filterItems(items, query) {
  const q = (query || '').trim().toLocaleLowerCase('de');
  if (!q) return items;
  return items.filter((i) => `${i.title} ${i.meta}`.toLocaleLowerCase('de').includes(q));
}

/**
 * "gerade eben", "vor 5 Minuten", "gestern", or a date once older than a week.
 * @param {number} then epoch ms
 * @param {number} [now]
 * @returns {string}
 */
export function timeAgo(then, now = Date.now()) {
  const diff = then - now;
  if (Math.abs(diff) < 60_000) return 'gerade eben';
  if (Math.abs(diff) > RELATIVE_MAX_DAYS * 86_400_000) return dateFmt.format(then);
  const [unit, ms] = UNITS.find(([, size]) => Math.abs(diff) >= size);
  return relative.format(Math.round(diff / ms), unit);
}

/**
 * Newest items across boards, each tagged with its board key.
 * @param {Record<string, readonly Item[]>} boards
 * @param {number} limit
 * @returns {Array<Item & { board: string }>}
 */
export function recentItems(boards, limit) {
  return Object.entries(boards)
    .flatMap(([board, items]) => items.map((item) => ({ ...item, board })))
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
}

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
