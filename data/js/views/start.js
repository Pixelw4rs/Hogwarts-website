// Start view: banner rail (one pennant per board) and the latest entries across the hub.
import { BOARDS, RECENT_LIMIT, boardByKey } from '../config.js';
import { $, el } from '../lib/dom.js';
import { countItems, recentItems, timeAgo } from '../lib/format.js';
import { toHash } from '../lib/route.js';

function pennant(board) {
  return el('li', {},
    el('a', { class: 'pennant', href: toHash({ view: 'hub', board: board.key }), dataset: { tincture: board.tincture, board: board.key, loading: '' } },
      el('span', { class: 'pennant-count', 'data-field': 'count', text: '–' }),
      el('span', { class: 'pennant-unit', 'data-field': 'unit', text: board.coordinates ? 'Orte' : 'offen' }),
      el('span', { class: 'pennant-name', text: board.shortLabel ?? board.label }),
      el('span', { class: 'pennant-latest', 'data-field': 'latest' }),
    ),
  );
}

function paintPennant(link, board, items) {
  delete link.dataset.loading;
  const { open, done, total } = countItems(items);
  const n = board.coordinates ? total : open;
  const unit = board.coordinates ? (total === 1 ? 'Ort' : 'Orte') : `offen · ${done} erledigt`;
  link.querySelector('[data-field="count"]').textContent = String(n);
  link.querySelector('[data-field="unit"]').textContent = unit;
  const latest = items[0]?.title;
  link.querySelector('[data-field="latest"]').textContent = latest ? `Zuletzt: ${latest}` : 'Noch leer';
  link.setAttribute('aria-label', `${board.label}: ${n} ${unit}. Board öffnen`);
}

function recentRow(item) {
  const board = boardByKey(item.board);
  const sub = [board.shortLabel ?? board.label, item.meta, timeAgo(item.created)].filter(Boolean).join(' · ');
  return el('li', {},
    el('a', { class: `recent-link${item.done ? ' is-done' : ''}`, href: toHash({ view: 'hub', board: item.board }), dataset: { tincture: board.tincture } },
      el('span', { class: 'recent-shield', 'aria-hidden': 'true' }),
      el('span', { class: 'recent-title', text: item.title }),
      el('span', { class: 'recent-sub', text: sub }),
    ),
  );
}

/** @param {ReturnType<typeof import('../hub/store.js').createHubStore>} store */
export function mountStart(store) {
  const rail = $('#pennants');
  const recent = $('#recent');
  rail.replaceChildren(...BOARDS.map(pennant));
  const links = new Map(BOARDS.map((b) => [b.key, rail.querySelector(`[data-board="${b.key}"]`)]));

  store.subscribe((snap) => {
    if (snap.rev < 0) {
      recent.replaceChildren(el('li', { class: 'recent-empty', text: snap.error || 'Wird geladen…' }));
      return;
    }
    const visible = Object.fromEntries(BOARDS.map((b) => [b.key, store.visibleItems(b.key)]));
    for (const board of BOARDS) paintPennant(links.get(board.key), board, visible[board.key]);
    const rows = recentItems(visible, RECENT_LIMIT);
    recent.replaceChildren(...(rows.length
      ? rows.map(recentRow)
      : [el('li', { class: 'recent-empty', text: 'Noch keine Einträge — fang im Community Hub an.' })]));
  });
}
