// News editor: write or edit a post (title, category, text, pinned) and manage existing posts.
import { MESSAGES, NEWS_TAGS, newsTag } from '../config.js';
import { announce } from '../components/announcer.js';
import { confirmButton } from '../components/confirm-button.js';
import { el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { timeAgo } from '../lib/format.js';

/** @typedef {import('../views/content.js').Post} Post */

/** @param {ReturnType<typeof import('../lib/resource.js').createResource>} content */
export function createNewsEditor(content) {
  /** @type {string|null} id of the post being edited */
  let editing = null;
  let dirty = false;

  const title = el('input', { id: 'news-title', name: 'title', maxlength: 120, autocomplete: 'off', required: true, placeholder: 'z. B. „Bauwettbewerb am Samstag“…', 'aria-describedby': 'news-error' });
  const tag = el('select', { id: 'news-tag', name: 'tag' }, ...NEWS_TAGS.map((t) => el('option', { value: t.key, text: t.label })));
  const body = el('textarea', { id: 'news-body', name: 'body', rows: 7, maxlength: 5000, placeholder: 'Was gibt es Neues? Leerzeile = neuer Absatz…' });
  const pinned = el('input', { id: 'news-pinned', name: 'pinned', type: 'checkbox' });
  const error = el('p', { id: 'news-error', class: 'field-error', role: 'alert' });
  const heading = el('h2', { class: 'section-title', text: 'Neuen Beitrag schreiben' });
  const submitLabel = el('span', { text: 'Veröffentlichen' });
  const submit = el('button', { class: 'btn btn-or', type: 'submit' }, icon('scroll'), submitLabel);
  const cancel = el('button', { class: 'btn btn-quiet', type: 'button', hidden: true, text: 'Bearbeiten abbrechen' });
  const list = el('ul', { class: 'news-admin-list' });

  const form = el('form', { class: 'editor news-form', novalidate: true },
    heading,
    el('div', { class: 'news-form-grid' },
      el('div', { class: 'field field-wide' }, el('label', { for: 'news-title', text: 'Titel' }), title),
      el('div', { class: 'field' }, el('label', { for: 'news-tag', text: 'Kategorie' }), tag),
      el('div', { class: 'field field-full' }, el('label', { for: 'news-body', text: 'Text' }), body,
        el('p', { class: 'editor-hint' }, 'Links: ', el('code', { text: '[Text](#wuensche)' }), ' oder ', el('code', { text: '[Text](https://…)' }))),
      el('label', { class: 'check-inline', for: 'news-pinned' }, pinned, 'Oben anpinnen'),
    ),
    error,
    el('div', { class: 'editor-actions' }, el('span', { class: 'spacer' }), cancel, submit),
  );

  const markDirty = () => { dirty = Boolean(title.value.trim() || body.value.trim()); };
  for (const f of [title, body]) f.addEventListener('input', () => { markDirty(); if (error.textContent) error.textContent = ''; });

  function fill(post) {
    editing = post?.id ?? null;
    title.value = post?.title ?? '';
    tag.value = post?.tag ?? 'info';
    body.value = post?.body ?? '';
    pinned.checked = post?.pinned ?? false;
    heading.textContent = post ? 'Beitrag bearbeiten' : 'Neuen Beitrag schreiben';
    submitLabel.textContent = post ? 'Änderungen speichern' : 'Veröffentlichen';
    cancel.hidden = !post;
    dirty = false;
    error.textContent = '';
    title.removeAttribute('aria-invalid');
  }
  cancel.addEventListener('click', () => { fill(null); title.focus(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = { title: title.value.trim(), tag: tag.value, body: body.value.trim(), pinned: pinned.checked };
    if (!fields.title) {
      error.textContent = 'Bitte einen Titel eingeben.';
      title.setAttribute('aria-invalid', 'true');
      title.focus();
      return;
    }
    submit.disabled = true;
    const idle = submitLabel.textContent;
    submitLabel.textContent = 'Wird gespeichert…';
    const result = editing ? await content.send('PATCH', `/news/${editing}`, fields) : await content.send('POST', '/news', fields);
    submit.disabled = false;
    submitLabel.textContent = idle;
    if (!result.ok) { error.textContent = result.error; return; }
    announce(editing ? `Beitrag „${fields.title}“ gespeichert` : `Beitrag „${fields.title}“ veröffentlicht`);
    fill(null);
  });

  /** @param {Post} post */
  function postRow(post) {
    const edit = el('button', { class: 'btn btn-quiet btn-xs', type: 'button' }, icon('edit', { size: 16 }), 'Bearbeiten');
    edit.addEventListener('click', () => {
      fill(post);
      form.scrollIntoView({ block: 'start' });
      title.focus({ preventScroll: true });
    });
    const pin = el('button', { class: 'btn btn-quiet btn-xs', type: 'button', 'aria-pressed': String(post.pinned) }, icon('pin', { size: 16 }), post.pinned ? 'Lösen' : 'Anpinnen');
    pin.addEventListener('click', async () => {
      const r = await content.send('PATCH', `/news/${post.id}`, { pinned: !post.pinned });
      announce(r.ok ? (post.pinned ? 'Beitrag gelöst' : 'Beitrag angepinnt') : r.error);
    });
    const remove = confirmButton({
      label: 'Löschen', small: true,
      onConfirm: async () => {
        const r = await content.send('DELETE', `/news/${post.id}`);
        if (editing === post.id) fill(null);
        announce(r.ok ? `Beitrag „${post.title}“ gelöscht` : r.error);
      },
    });
    return el('li', { class: 'news-admin-row', dataset: { tincture: newsTag(post.tag).tincture } },
      el('span', { class: 'tab-shield', 'aria-hidden': 'true' }),
      el('div', { class: 'news-admin-text' },
        el('p', { class: 'item-title', text: post.title }),
        el('p', { class: 'item-meta', text: [newsTag(post.tag).label, timeAgo(post.created), post.pinned ? 'angepinnt' : ''].filter(Boolean).join(' · ') })),
      el('div', { class: 'news-admin-tools' }, pin, edit, remove),
    );
  }

  const root = el('div', { class: 'news-editor' },
    form,
    el('section', { class: 'editor', 'aria-labelledby': 'news-list-title' },
      el('h2', { class: 'section-title', id: 'news-list-title', text: 'Veröffentlichte Beiträge' }),
      list),
  );

  return {
    el: root,
    /** @param {Post[]} news */
    load(news) {
      list.replaceChildren(...(news.length ? news.map(postRow) : [el('li', { class: 'content-state', text: MESSAGES.newsEmpty })]));
    },
    get dirty() { return dirty; },
  };
}
