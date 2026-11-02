// Undo toast with a draining countdown that pauses on hover/focus
// (pattern adapted from 21st.dev "Undo Pill"). The toast owns the countdown and
// calls onExpire exactly once unless the visitor undoes first.
import { el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

/**
 * @param {{ message: string, durationMs: number, onUndo: () => void, onExpire: () => void }} opts
 */
export function showUndoToast({ message, durationMs, onUndo, onExpire }) {
  const host = document.getElementById('toasts');
  if (!host) { onExpire(); return; }

  let remaining = durationMs;
  let startedAt = performance.now();
  let timer = setTimeout(expire, remaining);
  let settled = false;

  const undoBtn = el('button', { class: 'btn btn-quiet toast-undo', type: 'button' }, icon('undo'), 'Rückgängig');
  const toast = el('div', { class: 'toast', role: 'status' },
    el('span', { class: 'toast-ring', 'aria-hidden': 'true' }),
    el('span', { class: 'toast-msg', text: message }),
    undoBtn,
  );
  toast.style.setProperty('--toast-ms', `${durationMs}ms`);

  function close() {
    settled = true;
    clearTimeout(timer);
    toast.dataset.leaving = '';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  }
  function expire() { if (!settled) { close(); onExpire(); } }
  function pause() {
    if (settled || toast.dataset.paused !== undefined) return;
    clearTimeout(timer);
    remaining -= performance.now() - startedAt;
    toast.dataset.paused = '';
  }
  function resume() {
    if (settled || toast.dataset.paused === undefined) return;
    delete toast.dataset.paused;
    startedAt = performance.now();
    timer = setTimeout(expire, Math.max(remaining, 600));
  }

  undoBtn.addEventListener('click', () => { if (!settled) { close(); onUndo(); } });
  toast.addEventListener('pointerenter', pause);
  toast.addEventListener('pointerleave', resume);
  toast.addEventListener('focusin', pause);
  toast.addEventListener('focusout', resume);

  host.append(toast);
  return { dismiss: expire };
}
