// Tiny text format for admin-written rules and news: blank line = new paragraph, [label](href) = link.
// Pure: returns segments; rendering goes through textContent so nothing becomes markup.

/** @typedef {{ text: string, href?: string, external?: boolean }} Segment */

const LINK_RE = /\[([^\]\n]{1,120})\]\(([^)\s]{1,300})\)/g;
const SAFE_HREF = /^(#[\w/-]*|https?:\/\/[^\s]+)$/;

/** @param {string} line @returns {Segment[]} */
function segments(line) {
  const out = [];
  let last = 0;
  for (const m of line.matchAll(LINK_RE)) {
    const [whole, label, href] = m;
    if (!SAFE_HREF.test(href)) continue;
    if (m.index > last) out.push({ text: line.slice(last, m.index) });
    out.push(href.startsWith('#') ? { text: label, href } : { text: label, href, external: true });
    last = m.index + whole.length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

/**
 * @param {string} text
 * @returns {Segment[][]} one array of segments per paragraph
 */
export function parseRich(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(segments);
}
