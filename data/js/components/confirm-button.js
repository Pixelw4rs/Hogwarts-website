// Two-step destructive button: the first press arms it ("Wirklich löschen?"), the second acts.
// It disarms itself after CONFIRM_MS or when focus leaves.
import { CONFIRM_MS } from '../config.js';
import { el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

/**
 * @param {{ label: string, confirmLabel?: string, onConfirm: () => void, small?: boolean }} opts
 * @returns {HTMLButtonElement}
 */
export function confirmButton({ label, confirmLabel = 'Wirklich löschen?', onConfirm, small = false }) {
  const text = el('span', { text: label });
  const button = /** @type {HTMLButtonElement} */ (el('button', { class: `btn btn-quiet btn-danger${small ? ' btn-xs' : ''}`, type: 'button' }, icon('trash', { size: 16 }), text));
  let timer;
  const disarm = () => {
    clearTimeout(timer);
    delete button.dataset.armed;
    text.textContent = label;
  };
  button.addEventListener('click', () => {
    if (button.dataset.armed === undefined) {
      button.dataset.armed = '';
      text.textContent = confirmLabel;
      timer = setTimeout(disarm, CONFIRM_MS);
      return;
    }
    disarm();
    onConfirm();
  });
  button.addEventListener('blur', disarm);
  return button;
}
