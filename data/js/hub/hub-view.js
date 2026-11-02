// Community Hub: board tabs (ARIA tabs with arrow keys), error banner, sync line, panels.
import { BOARDS, UNDO_MS, boardByKey } from '../config.js';
import { announce } from '../components/announcer.js';
import { showUndoToast } from '../components/undo-toast.js';
import { $, el } from '../lib/dom.js';
import { countItems, timeAgo } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { createBoardPanel } from './board-panel.js';

const SYNC_TICK_MS = 30_000;

/**
 * @param {HTMLElement} root container inside #view-hub
 * @param {ReturnType<typeof import('./store.js').createHubStore>} store
 * @param {{ onSelect: (board: string) => void }} hooks called when the visitor picks a board
 */
export function mountHub(root, store, { onSelect }) {
  let active = BOARDS[0].key;

  const banner = el('div', { class: 'notice notice-error', role: 'alert', hidden: true },
    el('p', { class: 'notice-text' }),
    el('button', { class: 'btn btn-quiet btn-on-field', type: 'button', 'data-act': 'retry' }, icon('refresh'), 'Erneut versuchen'),
  );
  const sync = el('p', { class: 'sync-line' });
  const tablist = el('div', { class: 'board-tabs', role: 'tablist', 'aria-label': 'Boards' });

  const panels = new Map(BOARDS.map((board) => [board.key, createBoardPanel(board, {
    add: (item) => store.add(board.key, item),
    onToggle: (id, done) => store.toggle(board.key, id, done),
    onDelete: (id, row) => removeWithUndo(board.key, id, row),
  })]));

  const tabs = BOARDS.map((board) => el('button', {
    class: 'board-tab', type: 'button', role: 'tab', id: `tab-${board.key}`,
    'aria-controls': `panel-${board.key}`, 'aria-selected': 'false', tabindex: '-1',
    dataset: { board: board.key, tincture: board.tincture },
  },
    el('span', { class: 'tab-shield', 'aria-hidden': 'true' }),
    el('span', { class: 'tab-label', text: board.shortLabel ?? board.label }),
    el('span', { class: 'tab-count', 'data-count': '' }),
  ));
  tablist.append(...tabs);

  root.replaceChildren(
    el('div', { class: 'hub-head' }, el('h1', { class: 'view-title', text: 'Community Hub' }), sync),
    banner,
    tablist,
    ...[...panels.values()].map((p) => p.panel),
  );

  function removeWithUndo(board, id, row) {
    const title = row.querySelector('.item-title')?.textContent ?? 'Eintrag';
    panels.get(board).focusAfterRemoval(row);
    const pending = store.scheduleDelete(board, id);
    announce(`„${title}“ entfernt. Rückgängig ist 5 Sekunden lang möglich.`);
    showUndoToast({
      message: `„${title}“ entfernt`,
      durationMs: UNDO_MS,
      onUndo: () => { pending.undo(); announce(`„${title}“ wiederhergestellt`); },
      onExpire: () => { pending.commit(); },
    });
  }

  /** @param {string} key @param {{ focus?: boolean }} [opts] */
  function select(key, { focus = false } = {}) {
    if (!boardByKey(key)) return;
    active = key;
    for (const tab of tabs) {
      const on = tab.dataset.board === key;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    for (const [k, p] of panels) {
      const show = k === key;
      if (show && p.panel.hidden) p.panel.dataset.unfurl = '';
      p.panel.hidden = !show;
    }
    root.dataset.tincture = boardByKey(key).tincture;
  }

  tablist.addEventListener('click', (e) => {
    const tab = /** @type {HTMLElement} */ (e.target).closest('[role="tab"]');
    if (tab) onSelect(tab.dataset.board);
  });
  tablist.addEventListener('keydown', (e) => {
    const i = tabs.findIndex((t) => t.dataset.board === active);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const key = tabs[(next + tabs.length) % tabs.length].dataset.board;
    onSelect(key);
    select(key, { focus: true });
  });
  banner.addEventListener('click', (e) => {
    if (/** @type {HTMLElement} */ (e.target).closest('[data-act="retry"]')) store.refresh();
  });
  root.addEventListener('animationend', (e) => {
    const p = /** @type {HTMLElement} */ (e.target);
    if (p.classList.contains('board-panel')) delete p.dataset.unfurl;
  });

  function paintSync(snap) {
    sync.textContent = snap.lastSync ? `Für alle synchron · aktualisiert ${timeAgo(snap.lastSync)}` : '';
  }

  store.subscribe((snap) => {
    $('.notice-text', banner).textContent = snap.error;
    banner.hidden = !snap.error;
    paintSync(snap);
    for (const board of BOARDS) {
      const items = snap.rev < 0 ? null : store.visibleItems(board.key);
      panels.get(board.key).render(items);
      const tab = tabs.find((t) => t.dataset.board === board.key);
      const { open, total } = countItems(items ?? []);
      const n = board.coordinates ? total : open;
      tab.querySelector('[data-count]').textContent = items ? String(n) : '';
      tab.setAttribute('aria-label', items ? `${board.label}, ${n} ${board.coordinates ? 'Orte' : 'offen'}` : board.label);
    }
  });
  setInterval(() => paintSync(store.snapshot), SYNC_TICK_MS);

  select(active);
  return { select };
}
