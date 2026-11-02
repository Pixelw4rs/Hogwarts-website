// One board entry. Rows are created once per id and patched in place, so focus and images survive syncs.
import { bindCopyButton } from '../components/copy-button.js';
import { el } from '../lib/dom.js';
import { parseCoordinates, timeAgo } from '../lib/format.js';
import { icon } from '../lib/icons.js';

const fullDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
const SAFE_IMAGE = /^\/uploads\/[a-z]+\/[a-f0-9]+\.(png|jpg|gif|webp)$/;

/** @typedef {import('../lib/format.js').Item} Item */

function metaLine(item, coordinates) {
  if (!item.meta) return null;
  const coords = coordinates ? parseCoordinates(item.meta) : null;
  if (!coords) return el('span', { class: 'item-meta-text', text: item.meta });
  const copy = el('button', {
    class: 'btn btn-quiet btn-xs btn-icon', type: 'button',
    'aria-label': `Koordinaten ${coords.text} kopieren`, title: 'Koordinaten kopieren',
  }, el('span', { 'data-label': '', class: 'visually-hidden', text: 'Kopieren' }));
  bindCopyButton(copy, coords.text, { copied: 'Kopiert', announceAs: `Koordinaten ${coords.text} kopiert` });
  return el('span', { class: 'item-coords' },
    icon('pin', { size: 16 }),
    el('code', { text: coords.text }),
    coords.dimension ? el('span', { class: 'item-dim', text: coords.dimension }) : null,
    copy,
  );
}

/**
 * @param {Item} item
 * @param {{ coordinates?: boolean }} board
 * @returns {HTMLLIElement}
 */
export function createItemRow(item, board) {
  const checkId = `done-${String(item.id).replace(/[^a-z0-9]/gi, '')}`;
  const check = el('input', { type: 'checkbox', id: checkId, class: 'shield-input', 'data-act': 'toggle' });
  const thumb = item.image && SAFE_IMAGE.test(item.image)
    ? el('a', { class: 'item-thumb', href: item.image, target: '_blank', rel: 'noopener', 'aria-label': `Bild zu „${item.title}“ in neuem Tab öffnen` },
        el('img', { src: item.image, alt: '', width: 56, height: 56, loading: 'lazy', decoding: 'async' }))
    : null;

  const row = el('li', { class: 'item', dataset: { id: item.id } },
    el('span', { class: 'shield-check' },
      check,
      el('label', { for: checkId },
        el('span', { class: 'shield', 'aria-hidden': 'true' }, icon('shield', { size: 24 }), icon('charge', { size: 24, class: 'shield-charge' })),
        el('span', { class: 'visually-hidden' }, 'Erledigt: ', el('span', { 'data-field': 'title-sr' })),
      ),
    ),
    thumb,
    el('div', { class: 'item-body' },
      el('p', { class: 'item-title', 'data-field': 'title' }),
      el('p', { class: 'item-meta' },
        el('span', { 'data-field': 'meta' }),
        el('time', { class: 'item-time', 'data-field': 'time' }),
      ),
    ),
    el('button', { class: 'btn btn-icon item-delete', type: 'button', 'data-act': 'delete', 'aria-label': `„${item.title}“ entfernen` }, icon('trash')),
  );
  row.querySelector('[data-field="meta"]').replaceWith(metaLine(item, board.coordinates) ?? el('span'));
  return updateItemRow(/** @type {HTMLLIElement} */ (row), item);
}

/**
 * Patches only what can change after creation: done state, title text (defensive) and relative time.
 * @param {HTMLLIElement} row
 * @param {Item} item
 * @returns {HTMLLIElement}
 */
export function updateItemRow(row, item) {
  row.classList.toggle('is-done', item.done);
  const check = /** @type {HTMLInputElement} */ (row.querySelector('.shield-input'));
  if (check.checked !== item.done) check.checked = item.done;
  for (const field of row.querySelectorAll('[data-field="title"], [data-field="title-sr"]')) {
    if (field.textContent !== item.title) field.textContent = item.title;
  }
  const time = row.querySelector('[data-field="time"]');
  time.dateTime = new Date(item.created).toISOString();
  time.title = fullDate.format(item.created);
  time.textContent = timeAgo(item.created);
  return row;
}
