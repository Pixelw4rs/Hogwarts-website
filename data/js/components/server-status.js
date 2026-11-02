// Live server status from mcsrvstat.us. Renders into every [data-status] block on the page.
import { STATUS_POLL_MS, STATUS_URL } from '../config.js';
import { $$ } from '../lib/dom.js';
import { ERROR_STATUS, LOADING_STATUS, interpretStatus } from '../lib/status.js';

/** @param {import('../lib/status.js').ServerStatus} status */
function render(status) {
  for (const root of $$('[data-status]')) {
    root.dataset.state = status.state;
    root.setAttribute('aria-busy', String(status.state === 'loading'));
    for (const field of /** @type {const} */ (['label', 'players', 'version'])) {
      root.querySelectorAll(`[data-status-${field}]`).forEach((n) => { n.textContent = status[field]; });
    }
  }
}

export function startServerStatus() {
  let inFlight = null;

  async function refresh() {
    if (inFlight) return inFlight;
    render(LOADING_STATUS);
    inFlight = fetch(STATUS_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(interpretStatus, () => ERROR_STATUS)
      .then(render)
      .finally(() => { inFlight = null; });
    return inFlight;
  }

  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, STATUS_POLL_MS);
  return { refresh };
}
