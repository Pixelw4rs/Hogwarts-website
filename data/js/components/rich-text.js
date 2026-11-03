// Renders the admin text format (paragraphs + [label](href) links) as safe DOM.
import { el } from '../lib/dom.js';
import { parseRich } from '../lib/richtext.js';

/** @param {import('../lib/richtext.js').Segment} s @returns {Node} */
function segment(s) {
  if (!s.href) return document.createTextNode(s.text);
  return s.external
    ? el('a', { href: s.href, target: '_blank', rel: 'noopener' }, s.text, el('span', { class: 'visually-hidden', text: ' (öffnet in neuem Tab)' }))
    : el('a', { href: s.href, text: s.text });
}

/**
 * @param {string} text
 * @param {{ inline?: boolean }} [opts] inline: one <span> (for list items) instead of <p>s
 * @returns {Node[]}
 */
export function richText(text, { inline = false } = {}) {
  const paragraphs = parseRich(text);
  if (inline) return [el('span', {}, ...paragraphs.flatMap((p, i) => [i ? el('br') : null, ...p.map(segment)]))];
  return paragraphs.map((p) => el('p', {}, ...p.map(segment)));
}
