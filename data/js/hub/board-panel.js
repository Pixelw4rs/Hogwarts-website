// One board's tab panel: tincture banner, add form, search, keyed list and its states.
import { MESSAGES } from '../config.js';
import { el } from '../lib/dom.js';
import { countItems, filterItems } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { createAddForm } from './add-form.js';
import { createItemRow, updateItemRow } from './item-row.js';

const SKELETON_ROWS = 3;

/** @param {number} n @param {string} one @param {string} many */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * @param {import('../config.js').BOARDS[number]} board
 * @param {{ add: (item: object) => Promise<boolean>, onToggle: (id: string, done: boolean) => void, onDelete: (id: string, row: HTMLElement) => void }} actions
 */
export function createBoardPanel(board, actions) {
  const rows = new Map();
  let query = '';
  let hideDone = false;

  const counts = el('p', { class: 'banner-counts', 'aria-live': 'polite' });
  const search = el('input', { type: 'search', id: `${board.key}-search`, placeholder: 'Durchsuchen…', autocomplete: 'off' });
  const hideDoneBox = el('input', { type: 'checkbox', id: `${board.key}-hide-done` });
  const list = el('ul', { class: 'items', 'aria-label': `Einträge in ${board.label}` });
  const state = el('div', { class: 'board-state' });

  const panel = el('section', {
    class: 'board-panel', id: `panel-${board.key}`, role: 'tabpanel',
    'aria-labelledby': `tab-${board.key}`, dataset: { tincture: board.tincture }, hidden: true,
  },
    el('header', { class: 'banner' },
      el('h2', { class: 'banner-title', text: board.label }),
      counts,
    ),
    createAddForm(board, actions.add),
    el('div', { class: 'board-tools' },
      el('div', { class: 'search' },
        el('label', { for: search.id, class: 'visually-hidden', text: `${board.label} durchsuchen` }),
        icon('search', { size: 18 }),
        search,
      ),
      board.coordinates ? null : el('div', { class: 'check-inline' }, hideDoneBox, el('label', { for: hideDoneBox.id, text: 'Erledigte ausblenden' })),
    ),
    list,
    state,
  );

  list.addEventListener('change', (e) => {
    const input = /** @type {HTMLInputElement} */ (e.target);
    if (input.dataset.act !== 'toggle') return;
    actions.onToggle(input.closest('.item').dataset.id, input.checked);
  });
  list.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('[data-act="delete"]');
    if (!btn) return;
    const row = btn.closest('.item');
    actions.onDelete(row.dataset.id, row);
  });

  let lastItems = null;
  let loaded = false;

  function showState(kind) {
    state.dataset.kind = kind;
    if (kind === 'loading') {
      state.replaceChildren(...Array.from({ length: SKELETON_ROWS }, () => el('div', { class: 'skeleton-row', 'aria-hidden': 'true' })),
        el('span', { class: 'visually-hidden', text: MESSAGES.loading }));
    } else if (kind === 'empty') {
      state.replaceChildren(el('div', { class: 'empty' }, icon('shield', { size: 40 }), el('p', { text: MESSAGES.empty })));
    } else if (kind === 'nomatch') {
      state.replaceChildren(el('div', { class: 'empty' }, icon('search', { size: 32 }), el('p', { text: MESSAGES.noMatches })));
    } else {
      state.replaceChildren();
    }
  }

  /** Reorders/creates/removes rows to match `items` without rebuilding unchanged ones. */
  function reconcile(items) {
    const keep = new Set(items.map((i) => i.id));
    for (const [id, row] of rows) if (!keep.has(id)) { row.remove(); rows.delete(id); }
    items.forEach((item, index) => {
      const row = rows.get(item.id) ?? createItemRow(item, board);
      if (!rows.has(item.id)) rows.set(item.id, row);
      else updateItemRow(row, item);
      if (list.children[index] !== row) list.insertBefore(row, list.children[index] ?? null);
    });
  }

  function paint() {
    if (!loaded) { showState('loading'); return; }
    const all = lastItems ?? [];
    const { open, done } = countItems(all);
    counts.textContent = board.coordinates ? plural(all.length, 'Ort', 'Orte') : `${open} offen · ${done} erledigt`;
    const shown = filterItems(hideDone ? all.filter((i) => !i.done) : all, query);
    reconcile(shown);
    showState(all.length === 0 ? 'empty' : shown.length === 0 ? 'nomatch' : 'none');
  }

  search.addEventListener('input', () => { query = search.value; paint(); });
  hideDoneBox.addEventListener('change', () => { hideDone = hideDoneBox.checked; paint(); });

  return {
    panel,
    /** @param {import('../lib/format.js').Item[]|null} items null while the first load is pending */
    render(items) {
      loaded = items !== null;
      lastItems = items;
      paint();
    },
    /** Moves focus to a sensible neighbour after `row` disappears. */
    focusAfterRemoval(row) {
      const next = row.nextElementSibling ?? row.previousElementSibling;
      (next?.querySelector('.item-delete') ?? search).focus();
    },
  };
}
