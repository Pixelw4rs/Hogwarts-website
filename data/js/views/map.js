// Map view: the star chart of the coordinate board (#map) and the live map iframe (#map/live).
// The iframe is still lazy: its src is set only the first time Live-Karte is opened.
import { bindCopyButton } from '../components/copy-button.js';
import { attachIndicator } from '../components/indicator.js';
import { reveal } from '../components/reveal.js';
import { createStarChart } from '../components/star-chart.js';
import { $, $$, el } from '../lib/dom.js';
import { parseCoordinates } from '../lib/format.js';

const MAP_BOARD = 'map';

function placeRow(item, onPick, animate) {
  const c = parseCoordinates(item.meta);
  const pick = el('button', { class: 'atlas-place', type: 'button', text: item.title });
  pick.addEventListener('click', () => onPick(item.id));
  const copy = c ? el('button', { class: 'btn btn-xs btn-atlas', type: 'button', 'aria-label': `Koordinaten von ${item.title} kopieren` }, el('span', { 'data-label': '', text: 'Kopieren' })) : null;
  if (copy) bindCopyButton(/** @type {HTMLButtonElement} */ (copy), c.text, { copied: 'Kopiert', announceAs: `Koordinaten ${c.text} kopiert` });
  return el('tr', { 'data-id': item.id, 'data-reveal': animate ? 'rise' : null },
    el('th', { scope: 'row' }, pick),
    el('td', { class: 'num', text: c ? String(c.x) : '—' }),
    el('td', { class: 'num', text: c ? String(c.y) : '—' }),
    el('td', { class: 'num', text: c ? String(c.z) : '—' }),
    el('td', { class: 'dim', text: c ? c.dimension || 'Oberwelt' : 'ohne Koordinaten' }),
    el('td', { class: 'act' }, copy),
  );
}

/** @param {ReturnType<typeof import('../hub/store.js').createHubStore>} store */
export function createMapView(store) {
  const frame = /** @type {HTMLIFrameElement} */ ($('#mapFrame'));
  const box = /** @type {HTMLElement} */ (frame.parentElement);
  const tabs = $$('[data-map-tab]');
  const panels = { sterne: $('#map-sterne'), live: $('#map-live') };
  const body = $('#atlas-places');
  const empty = $('#atlas-empty');
  let picked = null;
  let current = null;
  let rendered = false;

  function pick(id) {
    picked = picked === id ? null : id;
    chart.select(picked);
    for (const row of $$('tr[data-id]', body)) row.classList.toggle('is-picked', row.dataset.id === picked);
    if (picked) body.querySelector(`tr[data-id="${picked}"]`)?.scrollIntoView({ block: 'nearest' });
  }
  const chart = createStarChart({ onPick: pick });
  $('#atlas-chart').replaceWith(chart.el);

  const indicator = attachIndicator($('#map-tabs'), () => tabs.find((t) => t.getAttribute('aria-current') === 'page') ?? null);

  const rowId = (e) => /** @type {HTMLElement} */ (e.target).closest('tr')?.dataset.id ?? null;
  body.addEventListener('pointerover', (e) => chart.highlight(rowId(e)));
  body.addEventListener('pointerleave', () => chart.highlight(null));
  body.addEventListener('focusin', (e) => chart.highlight(rowId(e)));
  body.addEventListener('focusout', () => chart.highlight(null));

  store.subscribe((snap) => {
    if (snap.rev < 0) return;
    const items = store.visibleItems(MAP_BOARD);
    chart.render(items);
    const keep = picked;
    body.replaceChildren(...items.map((i) => placeRow(i, pick, !rendered)));
    empty.hidden = items.length > 0;
    picked = null;
    if (keep && items.some((i) => i.id === keep)) pick(keep);
    if (!rendered) reveal(body);
    rendered = true;
  });

  function loadLive() {
    if (frame.getAttribute('src')) return;
    box.dataset.state = 'loading';
    frame.addEventListener('load', () => { box.dataset.state = 'ready'; }, { once: true });
    frame.src = frame.dataset.src;
  }

  return {
    /** @param {string|null} sub 'live' or null for the star chart */
    show(sub) {
      const next = sub === 'live' ? 'live' : 'sterne';
      if (current && next !== current) panels[next].dataset.enter = next === 'live' ? 'forward' : 'back';
      current = next;
      for (const t of tabs) {
        if (t.dataset.mapTab === next) t.setAttribute('aria-current', 'page');
        else t.removeAttribute('aria-current');
      }
      panels.sterne.hidden = next !== 'sterne';
      panels.live.hidden = next !== 'live';
      if (next === 'live') loadLive();
      indicator.update();
    },
  };
}
