// "Wunsch einreichen" form: kind (Plugin/Datapack), name, optional link, reason and author.
import { MESSAGES, REQUEST_KINDS } from '../config.js';
import { announce } from '../components/announcer.js';
import { el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

const LINK_OK = /^https?:\/\/\S+$/i;

/**
 * @param {(fields: { kind: string, name: string, link: string, reason: string, by: string }) => Promise<{ ok: boolean, error: string }>} submit
 * @returns {HTMLFormElement}
 */
export function createWishForm(submit) {
  const kinds = REQUEST_KINDS.map((k, i) => el('label', { class: 'seg-option' },
    el('input', { type: 'radio', name: 'kind', value: k.key, checked: i === 0 }),
    el('span', { text: k.label }),
  ));
  const name = el('input', { id: 'wish-name', name: 'name', required: true, maxlength: 80, autocomplete: 'off', placeholder: 'z. B. „WorldEdit“…', 'aria-describedby': 'wish-error' });
  const link = el('input', { id: 'wish-link', name: 'link', type: 'url', inputmode: 'url', maxlength: 300, autocomplete: 'off', spellcheck: 'false', placeholder: 'https://modrinth.com/…' });
  const reason = el('textarea', { id: 'wish-reason', name: 'reason', rows: 3, maxlength: 600, placeholder: 'Was würde es dem Server bringen?…' });
  const by = el('input', { id: 'wish-by', name: 'by', maxlength: 32, autocomplete: 'off', spellcheck: 'false', placeholder: 'Dein Minecraft-Name…' });
  const error = el('p', { id: 'wish-error', class: 'field-error', role: 'alert' });
  const label = el('span', { text: 'Wunsch einreichen' });
  const button = el('button', { class: 'btn btn-or', type: 'submit' }, icon('plus'), label);

  const form = /** @type {HTMLFormElement} */ (el('form', { class: 'wish-form', novalidate: true, 'aria-labelledby': 'wish-form-title' },
    el('h2', { class: 'section-title', id: 'wish-form-title', text: 'Wunsch einreichen' }),
    el('fieldset', { class: 'segmented-field' }, el('legend', { text: 'Art' }), el('div', { class: 'seg' }, ...kinds)),
    el('div', { class: 'field' }, el('label', { for: 'wish-name', text: 'Name' }), name),
    el('div', { class: 'field' }, el('label', { for: 'wish-link' }, 'Link ', el('span', { class: 'optional', text: '(optional)' })), link),
    el('div', { class: 'field' }, el('label', { for: 'wish-reason' }, 'Warum? ', el('span', { class: 'optional', text: '(optional)' })), reason),
    el('div', { class: 'field' }, el('label', { for: 'wish-by' }, 'Von ', el('span', { class: 'optional', text: '(optional)' })), by),
    error,
    button,
  ));

  const fail = (msg, field) => {
    error.textContent = msg;
    for (const f of [name, link]) f.setAttribute('aria-invalid', String(f === field));
    field?.focus();
  };
  for (const f of [name, link]) f.addEventListener('input', () => { if (error.textContent) fail('', null); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = {
      kind: /** @type {HTMLInputElement} */ (form.querySelector('[name="kind"]:checked')).value,
      name: name.value.trim(),
      link: link.value.trim(),
      reason: reason.value.trim(),
      by: by.value.trim(),
    };
    if (!fields.name) return fail(MESSAGES.nameMissing, name);
    if (fields.link && !LINK_OK.test(fields.link)) return fail(MESSAGES.linkInvalid, link);
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    label.textContent = 'Wird gesendet…';
    const result = await submit(fields);
    button.disabled = false;
    form.removeAttribute('aria-busy');
    label.textContent = 'Wunsch einreichen';
    if (!result.ok) return fail(result.error, null);
    fail('', null);
    name.value = ''; link.value = ''; reason.value = '';
    announce(`Wunsch „${fields.name}“ eingereicht. Danke!`);
    name.focus();
  });

  return form;
}
