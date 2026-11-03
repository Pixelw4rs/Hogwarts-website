// Sliding underline for a row of tabs or nav links (pattern ported from 21st.dev "Tabs" by ddoemonn:
// measured offsetLeft/offsetWidth, kept fresh with a ResizeObserver). Moves with transform only.
import { el } from '../lib/dom.js';

/**
 * @param {HTMLElement} row the positioned container holding the tabs
 * @param {() => HTMLElement|null} getActive returns the current tab
 * @param {{ class?: string }} [opts]
 * @returns {{ update: () => void }}
 */
export function attachIndicator(row, getActive, { class: cls = '' } = {}) {
  // inside a <ul> the bar must itself be a list item to keep the list valid
  const tag = row.tagName === 'UL' || row.tagName === 'OL' ? 'li' : 'span';
  const bar = el(tag, { class: `indicator ${cls}`.trim(), 'aria-hidden': 'true', role: tag === 'li' ? 'presentation' : null });
  row.append(bar);
  let frame = 0;

  function paint() {
    frame = 0;
    const active = getActive();
    if (!active || !active.offsetWidth) { bar.dataset.hidden = ''; return; }
    delete bar.dataset.hidden;
    // the row is the offsetParent and the bar scrolls with it, so offsetLeft is all we need
    bar.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth})`;
    if (!bar.dataset.ready) requestAnimationFrame(() => { bar.dataset.ready = ''; });
  }

  const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
  new ResizeObserver(update).observe(row);
  document.fonts?.ready.then(update);
  return { update };
}
