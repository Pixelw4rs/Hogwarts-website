// Sternkarte: the coordinate board drawn as an astronomy-tower star chart (Impeccable option
// "challenger-star-atlas"). Places are stars on an X/Z plot around spawn; the picked one is lit
// in torch amber with a leader line to its name. The list beside it stays the accessible interface:
// the SVG is one labelled image, and stars are a pointer shortcut to the same selection.
import { el } from '../lib/dom.js';
import { plotPlaces } from '../lib/atlas.js';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 560;
const MARGIN = 28;
const C = SIZE / 2;
const LABEL_ALL_MAX = 14;
const DUST = 70;

/** @param {string} tag @param {Record<string, string|number>} [attrs] @param {...Node} kids */
function svg(tag, attrs = {}, ...kids) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  node.append(...kids);
  return node;
}
const text = (attrs, value) => { const t = svg('text', attrs); t.textContent = value; return t; };

/** Seeded PRNG so the background dust is the same on every visit. */
function prng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

const fmt = new Intl.NumberFormat('de-DE');

function staticLayer() {
  const rand = prng(1337);
  const dust = Array.from({ length: DUST }, () => svg('circle', {
    cx: (rand() * SIZE).toFixed(1), cy: (rand() * SIZE).toFixed(1), r: (0.4 + rand() * 0.8).toFixed(2),
    class: 'atlas-dust', style: `--d:${(rand() * 6).toFixed(2)}s`,
  }));
  return svg('g', { 'aria-hidden': 'true' },
    svg('defs', {},
      svg('pattern', { id: 'atlas-fine', width: 14, height: 14, patternUnits: 'userSpaceOnUse', x: C, y: C },
        svg('path', { d: 'M14 0H0V14', class: 'atlas-grid-fine' })),
    ),
    svg('rect', { width: SIZE, height: SIZE, fill: 'url(#atlas-fine)' }),
    svg('g', { class: 'atlas-dust-layer' }, ...dust),
    svg('path', { d: `M${C} 0V${SIZE}M0 ${C}H${SIZE}`, class: 'atlas-axis' }),
    text({ x: C + 6, y: 16, class: 'atlas-tick' }, 'N · −Z'),
    text({ x: SIZE - 26, y: C - 6, class: 'atlas-tick' }, '+X'),
    text({ x: 6, y: C - 6, class: 'atlas-tick' }, '−X'),
    text({ x: C + 6, y: SIZE - 8, class: 'atlas-tick' }, 'S · +Z'),
  );
}

/**
 * @param {{ onPick?: (id: string) => void, compact?: boolean }} [opts]
 * @returns {{ el: HTMLElement, render: (items: ReadonlyArray<{ id: string, title: string, meta: string }>) => void, select: (id: string|null) => void, highlight: (id: string|null) => void }}
 */
export function createStarChart({ onPick, compact = false } = {}) {
  const titleId = `atlas-t-${Math.random().toString(36).slice(2, 8)}`;
  const label = svg('title', { id: titleId });
  const rings = svg('g', { class: 'atlas-rings', 'aria-hidden': 'true' });
  const stars = svg('g', { class: 'atlas-stars', 'aria-hidden': 'true' });
  const callout = svg('g', { class: 'atlas-callout', 'aria-hidden': 'true' });
  const chart = svg('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, role: 'img', 'aria-labelledby': titleId, class: 'atlas-svg' },
    label, staticLayer(), rings, stars,
    svg('g', { class: 'atlas-spawn', 'aria-hidden': 'true' },
      svg('circle', { cx: C, cy: C, r: 5.5 }),
      svg('circle', { cx: C, cy: C, r: 10, class: 'atlas-spawn-ring' }),
      text({ x: C + 14, y: C + 18, class: 'atlas-name' }, 'Spawn'),
    ),
    callout,
  );
  const scaleNote = el('span', { class: 'atlas-eyebrow' });
  const missing = el('p', { class: 'atlas-missing' });
  const root = el('figure', { class: `atlas-plate${compact ? ' is-compact' : ''}` },
    el('div', { class: 'atlas-head' }, el('span', { class: 'atlas-title', text: 'Sternkarte X / Z' }), scaleNote),
    el('div', { class: 'atlas-frame' }, chart),
    el('figcaption', { class: 'atlas-legend' },
      el('span', {}, el('i', { class: 'lg lg-spawn' }), 'Spawn'),
      el('span', {}, el('i', { class: 'lg lg-star' }), 'Oberwelt'),
      el('span', {}, el('i', { class: 'lg lg-nether' }), 'Nether (×8)'),
      el('span', { class: 'lg-torch' }, el('i', { class: 'lg lg-picked' }), 'Ausgewählt'),
    ),
    missing,
  );

  /** @type {Map<string, import('../lib/atlas.js').Star>} */
  let byId = new Map();
  let picked = null;
  let hovered = null;

  stars.addEventListener('click', (e) => {
    const g = /** @type {Element} */ (e.target).closest('[data-id]');
    if (g) onPick?.(g.getAttribute('data-id'));
  });

  function paintCallout() {
    const id = hovered ?? picked;
    const p = id ? byId.get(id) : null;
    for (const g of stars.querySelectorAll('[data-id]')) {
      g.classList.toggle('is-picked', g.getAttribute('data-id') === picked);
      g.classList.toggle('is-hover', g.getAttribute('data-id') === hovered);
    }
    if (!p) { callout.replaceChildren(); return; }
    // the name goes to the quadrant opposite the star so it never covers it
    const left = p.px > C;
    const top = p.py > C;
    const ax = left ? 48 : SIZE - 48;
    const ay = top ? 92 : SIZE - 92;
    const anchor = left ? 'start' : 'end';
    callout.replaceChildren(
      svg('circle', { cx: p.px, cy: p.py, r: 13, class: 'atlas-pick-ring' }),
      svg('circle', { cx: p.px, cy: p.py, r: 19, class: 'atlas-pick-ring is-dashed' }),
      svg('path', { d: `M${p.px} ${p.py} L${ax + (left ? 90 : -90)} ${ay - 34} H${ax}`, class: 'atlas-leader' }),
      text({ x: ax, y: ay - 2, 'text-anchor': anchor, class: 'atlas-pick-name' }, p.title),
      text({ x: ax, y: ay + 20, 'text-anchor': anchor, class: 'atlas-pick-coords' },
        `${p.text}${p.dimension ? `  ·  ${p.dimension}` : ''}`),
    );
  }

  function render(items) {
    const plot = plotPlaces(items, { size: SIZE, margin: MARGIN });
    byId = new Map(plot.points.map((p) => [p.id, p]));
    if (picked && !byId.has(picked)) picked = null;
    const unit = plot.step;
    scaleNote.textContent = `Spawn = 0 / 0 · 1 Ring = ${fmt.format(unit)} Blöcke`;
    label.textContent = `Sternkarte mit ${plot.points.length} ${plot.points.length === 1 ? 'Ort' : 'Orten'} rund um den Spawn. Alle Orte stehen auch in der Liste.`;

    rings.replaceChildren(...plot.rings.map((r, i) => svg('circle', {
      cx: C, cy: C, r: r.toFixed(1), class: i === plot.rings.length - 1 ? 'atlas-ring is-outer' : 'atlas-ring', style: `--i:${i}`,
    })), ...plot.rings.map((r, i) => text({ x: (C + r + 4).toFixed(1), y: C + 14, class: 'atlas-tick' }, fmt.format(unit * (i + 1)))));

    const showAll = plot.points.length <= LABEL_ALL_MAX;
    stars.replaceChildren(...plot.points.map((p, i) => svg('g', {
      'data-id': p.id, class: `atlas-star is-${p.dim}`, style: `--i:${Math.min(i, 20)};--d:${(p.mag * 4).toFixed(2)}s`,
    },
      svg('circle', { cx: p.px, cy: p.py, r: 14, class: 'atlas-hit' }),
      svg('circle', { cx: p.px, cy: p.py, r: (2.4 + p.mag * 2.2).toFixed(2), class: 'atlas-dot' }),
      showAll ? text({ x: p.px + 9, y: p.py + 4, class: 'atlas-name' }, p.title) : svg('g'),
    )));

    const off = plot.unplotted;
    missing.textContent = off.length ? `Nicht auf der Karte: ${off.map((o) => `${o.title} (${o.reason})`).join(', ')}.` : '';
    paintCallout();
  }

  return {
    el: root,
    render,
    /** @param {string|null} id */
    select(id) { picked = id && byId.has(id) ? id : null; paintCallout(); },
    /** @param {string|null} id temporary highlight while a list row is hovered or focused */
    highlight(id) { hovered = id && byId.has(id) ? id : null; paintCallout(); },
  };
}
