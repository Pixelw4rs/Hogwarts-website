// Generic ordered-list editor used for Regeln and Staff: a local draft with add, move,
// remove, "Änderungen speichern" and "Verwerfen". Nothing reaches the server until saved.
import { MESSAGES } from '../config.js';
import { announce } from '../components/announcer.js';
import { el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

/**
 * @template T
 * @typedef {{ el: HTMLElement, read: () => T, focus: () => void }} EditorRow
 */

/**
 * @template T
 * @param {{
 *   title: string, hint?: Node, addLabel: string, itemName: (index: number) => string,
 *   blank: () => T, makeRow: (item: T, index: number, onChange: () => void) => EditorRow<T>,
 *   save: (items: T[]) => Promise<{ ok: boolean, error: string }>,
 * }} cfg
 */
export function createListEditor(cfg) {
  /** @type {T[]} */
  let saved = [];
  /** @type {EditorRow<T>[]} */
  let rows = [];
  let dirty = false;

  const list = el('ol', { class: 'editor-list' });
  const status = el('p', { class: 'editor-status', role: 'status' });
  const saveLabel = el('span', { text: 'Änderungen speichern' });
  const saveBtn = el('button', { class: 'btn btn-or', type: 'submit', disabled: true }, saveLabel);
  const resetBtn = el('button', { class: 'btn btn-quiet', type: 'button', disabled: true, text: 'Verwerfen' });
  const addBtn = el('button', { class: 'btn btn-quiet', type: 'button' }, icon('plus'), cfg.addLabel);

  const setDirty = (value) => {
    dirty = value;
    saveBtn.disabled = !value;
    resetBtn.disabled = !value;
    if (value) status.textContent = 'Ungespeicherte Änderungen';
  };

  function draw(items, focusIndex = -1) {
    rows = items.map((item, i) => cfg.makeRow(item, i, () => setDirty(true)));
    list.replaceChildren(...rows.map((row, i) => el('li', { class: 'editor-row', dataset: { index: String(i) } },
      row.el,
      el('div', { class: 'editor-row-tools' },
        el('button', { class: 'btn btn-icon btn-xs', type: 'button', 'data-move': '-1', disabled: i === 0, 'aria-label': `${cfg.itemName(i)} nach oben` }, icon('arrowUp', { size: 16 })),
        el('button', { class: 'btn btn-icon btn-xs', type: 'button', 'data-move': '1', disabled: i === items.length - 1, 'aria-label': `${cfg.itemName(i)} nach unten` }, icon('arrowDown', { size: 16 })),
        el('button', { class: 'btn btn-icon btn-xs item-delete', type: 'button', 'data-remove': '', 'aria-label': `${cfg.itemName(i)} entfernen` }, icon('trash', { size: 16 })),
      ),
    )));
    if (focusIndex >= 0) rows[Math.min(focusIndex, rows.length - 1)]?.focus();
  }

  const current = () => rows.map((r) => r.read());

  list.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('button');
    const li = btn?.closest('.editor-row');
    if (!btn || !li) return;
    const i = Number(li.dataset.index);
    const items = current();
    if (btn.dataset.move) {
      const j = i + Number(btn.dataset.move);
      const moved = items.map((item, k) => (k === i ? items[j] : k === j ? items[i] : item));
      draw(moved);
      // keep focus on the same arrow of the moved row (or its other arrow at the list ends)
      const tools = list.children[j];
      (tools?.querySelector(`[data-move="${btn.dataset.move}"]:not(:disabled)`) ?? tools?.querySelector('[data-move]:not(:disabled)'))?.focus();
      announce(`${cfg.itemName(j)} verschoben`);
    } else if (btn.dataset.remove !== undefined) {
      draw(items.filter((_, k) => k !== i), i);
      announce('Eintrag entfernt — erst beim Speichern endgültig');
    } else return;
    setDirty(true);
  });

  addBtn.addEventListener('click', () => {
    const items = [...current(), cfg.blank()];
    draw(items, items.length - 1);
    setDirty(true);
  });
  resetBtn.addEventListener('click', () => {
    draw(saved);
    setDirty(false);
    status.textContent = 'Änderungen verworfen.';
  });

  const form = el('form', { class: 'editor', novalidate: true },
    el('div', { class: 'editor-head' }, el('h2', { class: 'section-title', text: cfg.title }), cfg.hint ?? null),
    list,
    el('div', { class: 'editor-actions' }, addBtn, el('span', { class: 'spacer' }), status, resetBtn, saveBtn),
  );
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveLabel.textContent = 'Wird gespeichert…';
    const result = await cfg.save(current());
    saveLabel.textContent = 'Änderungen speichern';
    if (!result.ok) {
      saveBtn.disabled = false;
      status.textContent = result.error;
      return;
    }
    setDirty(false);
    draw(saved); // the server's version (trimmed, empty rows dropped, ids assigned) arrived while we were dirty
    status.textContent = MESSAGES.saved;
    announce(`${cfg.title}: ${MESSAGES.saved}`);
  });

  return {
    el: form,
    /** Takes server data unless the admin has unsaved edits. @param {T[]} items */
    load(items) {
      saved = items;
      if (!dirty) draw(items);
    },
    get dirty() { return dirty; },
  };
}
