// Routing (direction-aware page slides), polling and wiring of every view, as in data/js/main.js.
import { useEffect, useRef, useState } from 'react';
import { API_AUTH, API_CONTENT, API_REQUESTS, DISCORD_URL, HUB_POLL_MS, REQUESTS_POLL_MS, SERVER_ADDRESS, VIEWS } from '@legacy/config.js';
import { mountAdmin } from '@legacy/admin/admin-view.js';
import { startAmbient } from '@legacy/components/ambient.js';
import { reveal } from '@legacy/components/reveal.js';
import { createHubStore } from '@legacy/hub/store.js';
import { mountHub } from '@legacy/hub/hub-view.js';
import { createResource } from '@legacy/lib/resource.js';
import { parseHash, toHash, viewIndex } from '@legacy/lib/route.js';
import { createMapView } from '@legacy/views/map.js';
import { mountWishes } from '@legacy/views/wishes.js';
import { SiteHeader } from '@/components/site-header';
import { useServerStatus } from '@/hooks/use-server-status';
import { JoinView, NewsView, RulesView, StaffView } from '@/views/content';
import { AdminHost, HubHost, MapHost, WishesHost } from '@/views/hosts';
import { StartView } from '@/views/start';

/** Views that show live board data and keep polling the hub. */
const HUB_VIEWS = new Set(['hub', 'start', 'map']);
/** Views that read /api/content and refetch it when opened. */
const CONTENT_VIEWS = new Set(['start', 'neuigkeiten', 'regeln', 'staff', 'admin']);

const store = createHubStore();
const content = createResource(API_CONTENT);
const requests = createResource(API_REQUESTS);
const auth = createResource(API_AUTH, { readPath: '/me' });
const root = document.documentElement;
const views = VIEWS as Array<{ id: string; title: string }>;

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Modules { hub: any; map: any; wishes: any; admin: any }
let modules: Modules | null = null;
let started = false;

/** Mounts the data/js modules into their host markup, once per page load. */
function mountModules(): Modules {
  modules ??= {
    map: createMapView(store),
    wishes: mountWishes(requests, auth),
    admin: mountAdmin(auth, content, { onAuthChange: () => requests.refresh() }),
    hub: mountHub(document.getElementById('hub-root')!, store, {
      onSelect(board: string) {
        history.replaceState(null, '', toHash({ view: 'hub', board }));
        modules!.hub.select(board);
      },
    }),
  };
  return modules;
}

export function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  const current = useRef<string | null>(null);
  const { status, refresh: refreshStatus } = useServerStatus();

  useEffect(() => {
    mountModules();
    if (started) return;
    started = true;
    startAmbient();

    const view = () => current.current ?? '';
    addEventListener('hashchange', () => setRoute(parseHash(location.hash)));
    if (!HUB_VIEWS.has(view())) store.refresh();
    if (!CONTENT_VIEWS.has(view())) content.refresh();
    if (view() !== 'wuensche') requests.refresh();
    auth.refresh();
    reveal();

    setInterval(() => { if (!document.hidden && HUB_VIEWS.has(view())) store.refresh(); }, HUB_POLL_MS);
    setInterval(() => { if (!document.hidden && view() === 'wuensche') requests.refresh(); }, REQUESTS_POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { store.flushDeletes(); return; }
      if (HUB_VIEWS.has(view())) store.refresh();
      if (view() === 'wuensche') requests.refresh();
    });
    addEventListener('pagehide', () => store.flushDeletes());

    // Sub-panel slide-ins ([data-enter]) clean up after themselves so they replay next time.
    document.addEventListener('animationend', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset?.enter !== undefined && e.animationName.startsWith('enter-')) delete target.dataset.enter;
    });

    // Warn before leaving with a typed but unsent entry or unsaved admin edits.
    addEventListener('beforeunload', (e) => {
      const typed = [...document.querySelectorAll<HTMLInputElement>('.add-form input[name="title"], .wish-form input[name="name"]')].some((i) => i.value.trim());
      if (typed || modules?.admin.dirty) e.preventDefault();
    });
  }, []);

  useEffect(() => {
    const m = mountModules();
    const from = current.current;
    const changed = route.view !== from;
    current.current = route.view;

    if (changed) root.dataset.navDir = from === null || viewIndex(route.view) >= viewIndex(from) ? 'forward' : 'back';
    root.dataset.view = route.view;
    const meta = views.find((v) => v.id === route.view);
    document.title = route.view === 'start' ? 'ARDET — Minecraft Server' : `${meta?.title} — ARDET`;

    if (route.view === 'hub' && route.board) m.hub.select(route.board);
    if (route.view === 'map') m.map.show(route.sub);
    if (route.view === 'wuensche') m.wishes.show(route.sub);
    if (route.view === 'admin') m.admin.show(route.sub);
    if (changed && from !== null) {
      window.scrollTo({ top: 0 });
      document.querySelector<HTMLElement>(`#view-${route.view} h1`)?.focus({ preventScroll: true });
    }
    const viewEl = document.getElementById(`view-${route.view}`);
    if (viewEl) reveal(viewEl);

    if (HUB_VIEWS.has(route.view)) store.refresh();
    if (CONTENT_VIEWS.has(route.view)) content.refresh();
    if (route.view === 'wuensche') requests.refresh();
    if (route.view === 'start') refreshStatus();
    if (route.view === 'admin' && changed && from !== null) requestAnimationFrame(() => m.admin.focusLogin());
  }, [route.view, route.board, route.sub, refreshStatus]);

  return (
    <>
      <a className="skip-link btn btn-or" href="#main">Zum Inhalt springen</a>
      <SiteHeader view={route.view} status={status} />
      <main id="main">
        <StartView store={store} content={content} status={status} />
        <NewsView content={content} />
        <RulesView content={content} />
        <JoinView />
        <HubHost />
        <WishesHost />
        <MapHost />
        <StaffView content={content} />
        <AdminHost />
      </main>
      <footer className="mx-auto max-w-[var(--page-max)] px-[var(--gutter)] pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6 text-sm text-ink-dim">
          <span className="font-display text-base font-bold text-ink" translate="no">ARDET</span>
          <code className="font-mono" translate="no">{SERVER_ADDRESS}</code>
          <a href={DISCORD_URL} target="_blank" rel="noopener">Discord<span className="visually-hidden"> (öffnet in neuem Tab)</span></a>
          <a href="#admin">Admin</a>
        </div>
      </footer>
      <div id="announcer" className="visually-hidden" aria-live="polite" aria-atomic="true" />
      <div id="toasts" className="toasts" />
    </>
  );
}
