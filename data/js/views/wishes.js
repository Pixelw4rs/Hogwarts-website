// Wünsche view: everyone proposes plugins/datapacks and votes; the admin answers inline.
// Vote button pattern from 21st.dev "Upvotable Roadmap" (aria-pressed chevron + count).
import { REQUEST_KINDS, REQUEST_STATUSES, MESSAGES, requestKind, requestStatus } from '../config.js';
import { announce } from '../components/announcer.js';
import { confirmButton } from '../components/confirm-button.js';
import { attachIndicator } from '../components/indicator.js';
import { reveal } from '../components/reveal.js';
import { rollNumber } from '../components/roll-number.js';
import { $, $$, el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { timeAgo } from '../lib/format.js';
import { countKinds, sortRequests } from '../lib/wishes.js';
import { createWishForm } from './wish-form.js';

/** @typedef {import('../lib/wishes.js').Wish} Wish */

function adminTools(wish, actions) {
  const status = el('select', { 'aria-label': `Status von „${wish.name}“`, class: 'select-sm' },
    ...REQUEST_STATUSES.map((s) => el('option', { value: s.key, text: s.label, selected: s.key === wish.status })));
  const note = el('input', { value: wish.note, maxlength: 300, autocomplete: 'off', placeholder: 'Antwort an alle (optional)…', 'aria-label': `Antwort zu „${wish.name}“` });
  const save = el('button', { class: 'btn btn-quiet btn-xs', type: 'button', text: 'Speichern' });
  save.addEventListener('click', () => actions.moderate(wish.id, { status: status.value, note: note.value }));
  return el('div', { class: 'wish-admin' }, status, note, save,
    confirmButton({ label: 'Löschen', small: true, onConfirm: () => actions.remove(wish.id, wish.name) }));
}

/** @param {Wish} wish */
function wishRow(wish, actions) {
  const count = el('span', { class: 'vote-count' });
  const vote = el('button', { class: 'vote', type: 'button', 'data-act': 'vote' }, icon('chevronUp', { size: 18 }), count);
  vote.addEventListener('click', () => actions.vote(wish.id, vote.getAttribute('aria-pressed') !== 'true'));
  const row = el('li', { class: 'wish', dataset: { id: wish.id }, 'data-reveal': 'rise' },
    vote,
    el('div', { class: 'wish-body' },
      el('div', { class: 'wish-head' }, el('span', { 'data-field': 'name' }), el('span', { class: 'wish-kind', 'data-field': 'kind' }), el('span', { class: 'wish-status', 'data-field': 'status' })),
      el('p', { class: 'wish-reason', 'data-field': 'reason' }),
      el('p', { class: 'wish-meta', 'data-field': 'meta' }),
      el('p', { class: 'wish-note', 'data-field': 'note' }),
      el('div', { 'data-field': 'admin' }),
    ),
  );
  return row;
}

/** Patches a row in place so the vote count can roll instead of the row being rebuilt. */
function paintRow(row, wish, isAdmin, actions) {
  const vote = $('[data-act="vote"]', row);
  vote.setAttribute('aria-pressed', String(wish.voted));
  vote.setAttribute('aria-label', `${wish.voted ? 'Stimme zurücknehmen' : 'Dafür stimmen'}: „${wish.name}“, ${wish.votes} ${wish.votes === 1 ? 'Stimme' : 'Stimmen'}`);
  rollNumber($('.vote-count', row), wish.votes);
  row.dataset.status = wish.status;
  // the server only stores http(s) links; re-check anyway before making anonymous input clickable
  const name = /^https?:\/\//i.test(wish.link)
    ? el('a', { class: 'wish-name', href: wish.link, target: '_blank', rel: 'noopener noreferrer nofollow ugc' }, wish.name, icon('external', { size: 14 }), el('span', { class: 'visually-hidden', text: ' (öffnet in neuem Tab)' }))
    : el('span', { class: 'wish-name', text: wish.name });
  $('[data-field="name"]', row).replaceChildren(name);
  $('[data-field="kind"]', row).textContent = requestKind(wish.kind).label;
  $('[data-field="status"]', row).textContent = requestStatus(wish.status).label;
  $('[data-field="reason"]', row).textContent = wish.reason;
  $('[data-field="meta"]', row).textContent = [wish.by && `von ${wish.by}`, timeAgo(wish.created)].filter(Boolean).join(' · ');
  $('[data-field="note"]', row).textContent = wish.note ? `Antwort vom Team: ${wish.note}` : '';
  const admin = $('[data-field="admin"]', row);
  if (!isAdmin) admin.replaceChildren();
  else if (!admin.firstChild || admin.dataset.for !== `${wish.status}|${wish.note}`) admin.replaceChildren(adminTools(wish, actions));
  admin.dataset.for = `${wish.status}|${wish.note}`;
}

/**
 * @param {ReturnType<typeof import('../lib/resource.js').createResource>} requests
 * @param {ReturnType<typeof import('../lib/resource.js').createResource>} auth
 */
export function mountWishes(requests, auth) {
  const list = $('#wish-list');
  const state = $('#wish-state');
  const notice = $('#wish-notice');
  const filters = $$('[data-wish-filter]');
  const indicator = attachIndicator($('#wish-filters'), () => filters.find((f) => f.getAttribute('aria-current') === 'page') ?? null, { class: 'indicator-or' });
  $('#wish-form-slot').replaceWith(createWishForm((fields) => requests.send('POST', '', fields)));

  let kind = null;
  const rows = new Map();
  const isAdmin = () => Boolean(auth.snapshot.data?.user);
  const report = (result, ok) => {
    notice.textContent = result.ok ? '' : result.error;
    notice.hidden = result.ok;
    if (result.ok && ok) announce(ok);
  };
  const actions = {
    vote: async (id, on) => report(await requests.send('POST', `/${id}/vote`, { vote: on }), on ? 'Stimme gezählt' : 'Stimme zurückgenommen'),
    moderate: async (id, patch) => report(await requests.send('PATCH', `/${id}`, patch), 'Wunsch aktualisiert'),
    remove: async (id, name) => report(await requests.send('DELETE', `/${id}`), `„${name}“ gelöscht`),
  };

  function paint() {
    const snap = requests.snapshot;
    if (!snap.data) {
      state.textContent = snap.loading ? MESSAGES.loading : snap.error;
      return;
    }
    /** @type {Wish[]} */
    const all = snap.data.requests;
    const counts = countKinds(all);
    for (const f of filters) $('.filter-count', f).textContent = String(counts[f.dataset.wishFilter || 'all']);
    const shown = sortRequests(kind ? all.filter((r) => r.kind === kind) : all);
    const keep = new Set(shown.map((r) => r.id));
    for (const [id, row] of rows) if (!keep.has(id)) { row.remove(); rows.delete(id); }
    shown.forEach((wish, i) => {
      const row = rows.get(wish.id) ?? wishRow(wish, actions);
      rows.set(wish.id, row);
      paintRow(row, wish, isAdmin(), actions);
      if (list.children[i] !== row) list.insertBefore(row, list.children[i] ?? null);
    });
    state.textContent = all.length === 0 ? MESSAGES.requestsEmpty : shown.length === 0 ? MESSAGES.requestsNoMatch : '';
    if (snap.error) { notice.textContent = snap.error; notice.hidden = false; }
    reveal(list);
  }

  requests.subscribe(paint);
  auth.subscribe(paint);

  return {
    /** @param {string|null} sub 'plugin' | 'datapack' | null for all */
    show(sub) {
      kind = REQUEST_KINDS.some((k) => k.key === sub) ? sub : null;
      for (const f of filters) {
        if ((f.dataset.wishFilter || null) === kind) f.setAttribute('aria-current', 'page');
        else f.removeAttribute('aria-current');
      }
      paint();
      indicator.update();
    },
  };
}
