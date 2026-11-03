// Entry point: routing (with direction-aware view transitions), polling and wiring of every view.
import { API_AUTH, API_CONTENT, API_REQUESTS, HUB_POLL_MS, REQUESTS_POLL_MS, SERVER_ADDRESS, VIEWS } from './config.js';
import { mountAdmin } from './admin/admin-view.js';
import { bindCopyButton } from './components/copy-button.js';
import { attachIndicator } from './components/indicator.js';
import { reveal } from './components/reveal.js';
import { startServerStatus } from './components/server-status.js';
import { bindThemeToggle } from './components/theme-toggle.js';
import { createHubStore } from './hub/store.js';
import { mountHub } from './hub/hub-view.js';
import { $, $$, prefersReducedMotion } from './lib/dom.js';
import { icon } from './lib/icons.js';
import { createResource } from './lib/resource.js';
import { parseHash, toHash, viewIndex } from './lib/route.js';
import { mountContentViews } from './views/content.js';
import { createMapView } from './views/map.js';
import { mountStart } from './views/start.js';
import { mountWishes } from './views/wishes.js';

/** Views that show live board data and keep polling the hub. */
const HUB_VIEWS = new Set(['hub', 'start', 'map']);
/** Views that read /api/content and refetch it when opened. */
const CONTENT_VIEWS = new Set(['start', 'neuigkeiten', 'regeln', 'staff', 'admin']);
const root = document.documentElement;

for (const node of $$('[data-address]')) node.textContent = SERVER_ADDRESS;
for (const btn of $$('[data-copy-address]')) bindCopyButton(/** @type {HTMLButtonElement} */ (btn), SERVER_ADDRESS, { announceAs: `Server-Adresse ${SERVER_ADDRESS} kopiert` });
bindThemeToggle(/** @type {HTMLButtonElement} */ ($('[data-theme-toggle]')));
$('[data-admin-link]').append(icon('key'));

const status = startServerStatus();
const store = createHubStore();
const content = createResource(API_CONTENT);
const requests = createResource(API_REQUESTS);
const auth = createResource(API_AUTH, { readPath: '/me' });

mountStart(store);
mountContentViews(content);
const map = createMapView(store);
const wishes = mountWishes(requests, auth);
const admin = mountAdmin(auth, content, { onAuthChange: () => requests.refresh() });
const hub = mountHub($('#hub-root'), store, {
  onSelect(board) {
    history.replaceState(null, '', toHash({ view: 'hub', board }));
    hub.select(board);
  },
});

const navLinks = $$('[data-nav]');
const navIndicator = attachIndicator($('#nav-list'), () => navLinks.find((l) => l.hasAttribute('aria-current')) ?? null, { class: 'indicator-or' });

let current = null;

/**
 * Runs a DOM update inside a View Transition when the browser has one; the CSS slides
 * the page in from the side the visitor is heading to. Without it, a CSS keyframe does the same.
 * @param {() => void} update
 */
function transition(update) {
  if (!document.startViewTransition || prefersReducedMotion()) { update(); return; }
  document.startViewTransition(update);
}

function paintNav(view) {
  for (const link of navLinks) {
    if (link.dataset.nav === view) {
      link.setAttribute('aria-current', 'page');
      link.scrollIntoView({ block: 'nearest', inline: 'nearest' }); // keep the active tab visible on phones
    } else {
      link.removeAttribute('aria-current');
    }
  }
  navIndicator.update();
}

/** @param {{ focus: boolean }} opts focus the view heading after in-page navigation */
function applyRoute({ focus }) {
  const route = parseHash(location.hash);
  const changed = route.view !== current;
  const from = current;
  current = route.view;

  const update = () => {
    if (changed) root.dataset.navDir = from === null || viewIndex(route.view) >= viewIndex(from) ? 'forward' : 'back';
    root.dataset.view = route.view;
    paintNav(route.view);
    const meta = VIEWS.find((v) => v.id === route.view);
    document.title = route.view === 'start' ? 'ARDET — Minecraft Server' : `${meta.title} — ARDET`;

    if (route.view === 'hub' && route.board) hub.select(route.board);
    if (route.view === 'map') map.show(route.sub);
    if (route.view === 'wuensche') wishes.show(route.sub);
    if (route.view === 'admin') admin.show(route.sub);
    if (changed && focus) {
      window.scrollTo({ top: 0 });
      $(`#view-${route.view} h1`).focus({ preventScroll: true });
    }
    reveal($(`#view-${route.view}`));
  };
  if (changed && from !== null) transition(update); else update();

  if (HUB_VIEWS.has(route.view)) store.refresh();
  if (CONTENT_VIEWS.has(route.view)) content.refresh();
  if (route.view === 'wuensche') requests.refresh();
  if (route.view === 'start') status.refresh();
  if (route.view === 'admin' && changed && focus) requestAnimationFrame(() => admin.focusLogin());
}

addEventListener('hashchange', () => applyRoute({ focus: true }));
applyRoute({ focus: false });
if (!HUB_VIEWS.has(current)) store.refresh();
if (!CONTENT_VIEWS.has(current)) content.refresh();
if (current !== 'wuensche') requests.refresh();
auth.refresh();
reveal();

setInterval(() => {
  if (!document.hidden && HUB_VIEWS.has(current)) store.refresh();
}, HUB_POLL_MS);
setInterval(() => {
  if (!document.hidden && current === 'wuensche') requests.refresh();
}, REQUESTS_POLL_MS);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { store.flushDeletes(); return; }
  if (HUB_VIEWS.has(current)) store.refresh();
  if (current === 'wuensche') requests.refresh();
});
addEventListener('pagehide', () => store.flushDeletes());

// Sub-panel slide-ins ([data-enter]) clean up after themselves so they replay next time.
document.addEventListener('animationend', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  if (target.dataset?.enter !== undefined && e.animationName.startsWith('enter-')) delete target.dataset.enter;
});

// Warn before leaving with a typed but unsent entry or unsaved admin edits.
addEventListener('beforeunload', (e) => {
  const typed = $$('.add-form input[name="title"], .wish-form input[name="name"]').some((i) => /** @type {HTMLInputElement} */ (i).value.trim());
  if (typed || admin.dirty) e.preventDefault();
});
