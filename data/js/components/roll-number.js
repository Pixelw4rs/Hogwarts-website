// Rolling counter: when a number changes, the old value rolls out and the new one rolls in
// (up when it grows, down when it shrinks). Pattern adapted from 21st.dev "Upvote Downvote Counter".
import { el, prefersReducedMotion } from '../lib/dom.js';

/**
 * @param {HTMLElement} host element whose text is the number
 * @param {number|string} value
 */
export function rollNumber(host, value) {
  const next = String(value);
  const current = host.dataset.value;
  if (current === next) return;
  host.dataset.value = next;
  const numeric = Number(next) - Number(current);
  if (current === undefined || Number.isNaN(numeric) || prefersReducedMotion() || !host.isConnected) {
    host.replaceChildren(el('span', { class: 'roll-digit', text: next }));
    return;
  }
  host.classList.add('roll');
  host.dataset.dir = numeric >= 0 ? 'up' : 'down';
  const incoming = el('span', { class: 'roll-digit roll-in', text: next });
  const outgoing = host.querySelector('.roll-digit:not(.roll-out)');
  outgoing?.classList.add('roll-out');
  host.append(incoming);
  incoming.addEventListener('animationend', () => {
    host.querySelectorAll('.roll-out').forEach((n) => n.remove());
    incoming.classList.remove('roll-in');
  }, { once: true });
}
