// Copy-to-clipboard with idle / copied / failed states (pattern adapted from 21st.dev "Copy Button").
import { COPY_FEEDBACK_MS } from '../config.js';
import { icon } from '../lib/icons.js';
import { announce } from './announcer.js';

/** @param {string} text @returns {Promise<void>} */
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  // Fallback for http:// origins where the async clipboard API is unavailable.
  const area = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
  area.style.cssText = 'position:fixed;opacity:0';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

/**
 * Wires an existing <button> to copy `text`. The button keeps its own label element ([data-label]).
 * @param {HTMLButtonElement} button
 * @param {string} text
 * @param {{ copied?: string, failed?: string, announceAs?: string }} [labels]
 */
export function bindCopyButton(button, text, { copied = 'Kopiert!', failed = 'Nicht kopiert', announceAs } = {}) {
  const label = button.querySelector('[data-label]') || button;
  const idle = label.textContent;
  let timer;
  if (!button.querySelector('.icon')) button.prepend(icon('copy'), icon('check', { class: 'icon-done' }));

  button.addEventListener('click', async () => {
    clearTimeout(timer);
    try {
      await writeClipboard(text);
      button.dataset.state = 'copied';
      label.textContent = copied;
      announce(announceAs ?? `${text} kopiert`);
    } catch {
      button.dataset.state = 'failed';
      label.textContent = failed;
      announce(`Kopieren fehlgeschlagen. Adresse: ${text}`);
    }
    timer = setTimeout(() => {
      delete button.dataset.state;
      label.textContent = idle;
    }, COPY_FEEDBACK_MS);
  });
}
