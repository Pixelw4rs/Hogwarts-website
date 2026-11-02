// Entry point: routing, polling and wiring of every view.
import { HUB_POLL_MS, SERVER_ADDRESS, VIEWS } from './config.js';
import { bindCopyButton } from './components/copy-button.js';
import { startServerStatus } from './components/server-status.js';
import { bindThemeToggle } from './components/theme-toggle.js';
import { createHubStore } from './hub/store.js';
import { mountHub } from './hub/hub-view.js';
import { $, $$ } from './lib/dom.js';
import { parseHash, toHash } from './lib/route.js';
import { createMapView } from './views/map.js';
import { mountStart } from './views/start.js';

const LIVE_VIEWS = new Set(['hub', 'start']);
const root = document.documentElement;

for (const node of $$('[data-address]')) node.textContent = SERVER_ADDRESS;
for (const btn of $$('[data-copy-address]')) bindCopyButton(/** @type {HTMLButtonElement} */ (btn), SERVER_ADDRESS, { announceAs: `Server-Adresse ${SERVER_ADDRESS} kopiert` });
bindThemeToggle(/** @type {HTMLButtonElement} */ ($('[data-theme-toggle]')));

const status = startServerStatus();
const store = createHubStore();
const map = createMapView();
mountStart(store);
const hub = mountHub($('#hub-root'), store, {
  onSelect(board) {
    history.replaceState(null, '', toHash({ view: 'hub', board }));
    hub.select(board);
  },
});

let current = null;

/** @param {{ focus: boolean }} opts focus the view heading after in-page navigation */
function applyRoute({ focus }) {
  const route = parseHash(location.hash);
  const changed = route.view !== current;
  current = route.view;
  root.dataset.view = route.view;

  for (const link of $$('[data-nav]')) {
    if (link.dataset.nav === route.view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const meta = VIEWS.find((v) => v.id === route.view);
  document.title = route.view === 'start' ? 'ARDET — Minecraft Server' : `${meta.title} — ARDET`;

  if (route.view === 'hub') {
    if (route.board) hub.select(route.board);
    store.refresh();
  }
  if (route.view === 'map') map.load();
  if (route.view === 'start') status.refresh();

  if (changed && focus) {
    window.scrollTo({ top: 0 });
    $(`#view-${route.view} h1`).focus({ preventScroll: true });
  }
}

addEventListener('hashchange', () => applyRoute({ focus: true }));
applyRoute({ focus: false });
if (current !== 'hub') store.refresh();

setInterval(() => {
  if (!document.hidden && LIVE_VIEWS.has(current)) store.refresh();
}, HUB_POLL_MS);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) store.flushDeletes();
  else if (LIVE_VIEWS.has(current)) store.refresh();
});
addEventListener('pagehide', () => store.flushDeletes());

// Warn before leaving with a typed but unsent entry.
addEventListener('beforeunload', (e) => {
  if ($$('.add-form input[name="title"]').some((i) => /** @type {HTMLInputElement} */ (i).value.trim())) e.preventDefault();
});
