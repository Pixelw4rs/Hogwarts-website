// "Add entry" form for one board: labelled fields, image preview, inline errors,
// inputs restored if saving fails (FEATURES.md: keep text on failure).
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_META, MAX_TITLE, MESSAGES } from '../config.js';
import { el } from '../lib/dom.js';
import { formatBytes } from '../lib/format.js';
import { icon } from '../lib/icons.js';

/** @param {File} file @returns {Promise<string>} */
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(MESSAGES.imageUnreadable));
    reader.readAsDataURL(file);
  });
}

/** @param {File|null} file @returns {string} empty when valid */
function validateImage(file) {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) return MESSAGES.imageType;
  if (file.size > MAX_IMAGE_BYTES) return MESSAGES.imageTooBig;
  return '';
}

/**
 * @param {import('../config.js').BOARDS[number]} board
 * @param {(item: { title: string, meta: string, image: string|null }) => Promise<boolean>} submit
 * @returns {HTMLFormElement}
 */
export function createAddForm(board, submit) {
  const id = (name) => `${board.key}-${name}`;
  let file = null;
  let previewUrl = '';

  const title = el('input', { id: id('title'), name: 'title', required: true, maxlength: MAX_TITLE, autocomplete: 'off', placeholder: board.titlePlaceholder, 'aria-describedby': id('error') });
  const meta = el('input', { id: id('meta'), name: 'meta', maxlength: MAX_META, autocomplete: 'off', spellcheck: 'false', placeholder: board.metaPlaceholder, class: board.coordinates ? 'mono' : null, inputmode: board.coordinates ? 'text' : null });
  const fileInput = el('input', { id: id('image'), name: 'image', type: 'file', accept: IMAGE_TYPES.join(','), class: 'file-input' });
  const preview = el('div', { class: 'file-preview', hidden: true });
  const error = el('p', { id: id('error'), class: 'field-error', role: 'alert' });
  const button = el('button', { class: 'btn btn-or', type: 'submit' }, el('span', { 'data-label': '', text: board.submit }));

  const setError = (msg) => { error.textContent = msg; title.setAttribute('aria-invalid', String(Boolean(msg) && !title.value.trim())); };

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    file = null;
    previewUrl = '';
    fileInput.value = '';
    preview.hidden = true;
    preview.replaceChildren();
  }

  function showPreview(f) {
    previewUrl = URL.createObjectURL(f);
    const remove = el('button', { class: 'btn btn-icon btn-xs', type: 'button', 'aria-label': 'Bild entfernen' }, icon('close', { size: 16 }));
    remove.addEventListener('click', () => { clearFile(); fileInput.focus(); });
    preview.replaceChildren(
      el('img', { src: previewUrl, alt: '', width: 40, height: 40 }),
      el('span', { class: 'file-name', text: f.name }),
      el('span', { class: 'file-size', text: formatBytes(f.size) }),
      remove,
    );
    preview.hidden = false;
  }

  fileInput.addEventListener('change', () => {
    const picked = fileInput.files?.[0] ?? null;
    const problem = validateImage(picked);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (problem) { clearFile(); setError(problem); return; }
    file = picked;
    setError('');
    if (file) showPreview(file);
  });
  title.addEventListener('input', () => { if (error.textContent) setError(''); });

  const form = el('form', { class: 'add-form', novalidate: true, 'aria-label': `${board.noun} zu ${board.label} hinzufügen` },
    el('div', { class: 'field field-title' }, el('label', { for: id('title'), text: board.noun }), title),
    el('div', { class: 'field field-meta' }, el('label', { for: id('meta'), text: board.metaLabel }), meta),
    el('div', { class: 'field field-file' },
      el('label', { for: id('image'), class: 'btn btn-quiet file-trigger' }, icon('image'), el('span', { text: 'Bild' }), el('span', { class: 'visually-hidden', text: ' anhängen (optional, max. 4 MB)' })),
      fileInput,
    ),
    button,
    preview,
    error,
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const values = { title: title.value.trim(), meta: meta.value.trim() };
    if (!values.title) { setError(MESSAGES.titleMissing); title.focus(); return; }
    let image = null;
    if (file) {
      try { image = await readAsDataUrl(file); } catch { setError(MESSAGES.imageUnreadable); return; }
    }
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    const label = button.querySelector('[data-label]');
    label.textContent = 'Wird gespeichert…';
    title.value = '';
    meta.value = '';
    const ok = await submit({ ...values, image });
    form.removeAttribute('aria-busy');
    button.disabled = false;
    label.textContent = board.submit;
    if (ok) {
      clearFile();
      title.focus();
    } else {
      title.value = values.title;
      meta.value = values.meta;
    }
  });

  return /** @type {HTMLFormElement} */ (form);
}
